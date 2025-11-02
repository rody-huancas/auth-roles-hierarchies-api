import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUserByEmail = await queryRunner.manager.findOne(User, {
        where: { email: createUserDto.email },
      });

      if (existingUserByEmail) {
        throw new ConflictException('El email ya está en uso');
      }

      const existingUserByUsername = await queryRunner.manager.findOne(User, {
        where: { username: createUserDto.username },
      });

      if (existingUserByUsername) {
        throw new ConflictException('El username ya está en uso');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, this.SALT_ROUNDS);

      const newUser = queryRunner.manager.create(User, {
        ...createUserDto,
        password: hashedPassword,
        isActive: createUserDto.isActive ?? true,
      });

      const savedUser = await queryRunner.manager.save(User, newUser);

      const { password, ...userWithoutPassword } = savedUser;

      await queryRunner.commitTransaction();

      return userWithoutPassword;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al crear el usuario');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(options?: { skip?: number; take?: number; isActive?: boolean }): Promise<{ data: Omit<User, 'password'>[]; total: number }> {
    try {
      const { skip = 0, take = 10, isActive } = options || {};

      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .select([
          'user.id',
          'user.username',
          'user.email',
          'user.firstName',
          'user.lastName',
          'user.isActive',
          'user.createdAt',
          'user.updatedAt',
        ]);

      if (isActive !== undefined) {
        queryBuilder.where('user.isActive = :isActive', { isActive });
      }

      const [data, total] = await queryBuilder
        .skip(skip)
        .take(take)
        .orderBy('user.createdAt', 'DESC')
        .getManyAndCount();

      return { data, total };
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los usuarios');
    }
  }

  async findOne(id: string): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        select: [
          'id',
          'username',
          'email',
          'firstName',
          'lastName',
          'isActive',
          'createdAt',
          'updatedAt',
        ],
      });

      if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al obtener el usuario');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al buscar el usuario por email',
      );
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await queryRunner.manager.findOne(User, { where: { id } });

      if (!existingUser) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
        const emailExists = await queryRunner.manager.findOne(User, {
          where: { email: updateUserDto.email },
        });

        if (emailExists) {
          throw new ConflictException('El email ya está en uso');
        }
      }

      if (
        updateUserDto.username &&
        updateUserDto.username !== existingUser.username
      ) {
        const usernameExists = await queryRunner.manager.findOne(User, {
          where: { username: updateUserDto.username },
        });

        if (usernameExists) {
          throw new ConflictException('El username ya está en uso');
        }
      }

      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, this.SALT_ROUNDS);
      }

      await queryRunner.manager.update(User, { id }, updateUserDto);

      const updatedUser = await queryRunner.manager.findOne(User, {
        where: { id },
        select: [
          'id',
          'username',
          'email',
          'firstName',
          'lastName',
          'isActive',
          'createdAt',
          'updatedAt',
        ],
      });

      await queryRunner.commitTransaction();

      return updatedUser!;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error al actualizar el usuario');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      await queryRunner.manager.update(User, { id }, { isActive: false });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al eliminar el usuario');
    } finally {
      await queryRunner.release();
    }
  }

  async hardDelete(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, { where: { id } });

      if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      await queryRunner.manager.remove(User, user);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al eliminar permanentemente el usuario');
    } finally {
      await queryRunner.release();
    }
  }
}
