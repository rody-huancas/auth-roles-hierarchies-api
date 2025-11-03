import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserRoles } from '../../users/entities/user-roles.entity';
import { RolePermissions } from './role-permissions.entity';

@Entity({ name: 'roles' })
@Index(['name'], { unique: true })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @OneToMany(() => UserRoles, (userRole) => userRole.role)
  userRoles: UserRoles[];

  @OneToMany(() => RolePermissions, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermissions[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
