import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRoles } from './entities/user-roles.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditService } from '../../common/services/audit.service';

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
  ) {}

  async create(createUserDto: CreateUserDto, request?: any, userId?: string): Promise<Omit<User, 'password'>> {
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

      let roles: Role[] = [];

      // Validar que los roles existan si se proporcionaron
      if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
        roles = await queryRunner.manager.find(Role, {
          where: { id: In(createUserDto.roleIds) },
        });

        if (roles.length !== createUserDto.roleIds.length) {
          const foundIds = roles.map(r => r.id);
          const missingIds = createUserDto.roleIds.filter(id => !foundIds.includes(id));
          throw new BadRequestException(`Los siguientes roles no existen: ${missingIds.join(', ')}`);
        }
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, this.SALT_ROUNDS);

      const newUser = queryRunner.manager.create(User, {
        username : createUserDto.username,
        email    : createUserDto.email,
        password : hashedPassword,
        firstName: createUserDto.firstName,
        lastName : createUserDto.lastName,
        isActive : createUserDto.isActive ?? true,
      });

      const savedUser = await queryRunner.manager.save(User, newUser);

      // Asignar roles si se proporcionaron
      if (roles.length > 0) {
        const userRoles = roles.map(role =>
          queryRunner.manager.create(UserRoles, {
            user      : savedUser,
            role      : role,
            assignedBy: null,
          })
        );

        await queryRunner.manager.save(UserRoles, userRoles);
      }

      const { password, ...userWithoutPassword } = savedUser;

      await queryRunner.commitTransaction();

      // Registrar en audit log (sin await para no bloquear)
      this.auditService.logCreate(
        'User',
        savedUser.id,
        {
          username: savedUser.username,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          isActive: savedUser.isActive,
          roleIds: createUserDto.roleIds || [],
        },
        request,
        userId,
      ).catch(() => {}); // Ignorar errores de audit log

      return userWithoutPassword;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
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
        relations: ['userRoles', 'userRoles.role'],
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

  async update(id: string, updateUserDto: UpdateUserDto, request?: any, userId?: string): Promise<Omit<User, 'password'>> {
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

      // Registrar en audit log
      const oldValues = {
        username: existingUser.username,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        isActive: existingUser.isActive,
      };

      const newValues = {
        ...oldValues,
        ...updateUserDto,
        password: updateUserDto.password ? '[REDACTED]' : undefined,
      };
      delete newValues.password;

      this.auditService.logUpdate(
        'User',
        id,
        oldValues,
        newValues,
        request,
        userId,
      ).catch(() => {});

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

  async remove(id: string, request?: any, userId?: string): Promise<void> {
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

      // Registrar en audit log
      const oldValues = {
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
      };

      this.auditService.logDelete(
        'User',
        id,
        oldValues,
        request,
        userId,
      ).catch(() => {});
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

  async hardDelete(id: string, request?: any, userId?: string): Promise<void> {
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

      // Registrar en audit log
      const oldValues = {
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
      };

      this.auditService.logDelete(
        'User',
        id,
        oldValues,
        request,
        userId,
      ).catch(() => {});
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
