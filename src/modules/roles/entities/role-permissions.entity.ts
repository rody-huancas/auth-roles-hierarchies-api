import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Role } from './role.entity';
import { Option } from '../../options/entities/option.entity';
import { ModuleRegistry } from '../../module-registry/entities/module-registry.entity';

@Entity({ name: 'role_permissions' })
export class RolePermissions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'role_id' })
  roleId: string;

  @Column({ type: 'uuid', name: 'module_id' })
  moduleId: string;

  @Column({ type: 'uuid', name: 'option_id', nullable: true })
  optionId: string | null;

  @ManyToOne(() => Role, (role) => role.rolePermissions, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => ModuleRegistry, (module) => module.rolePermissions, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: ModuleRegistry;

  @ManyToOne(() => Option, (option) => option.rolePermissions, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'option_id' })
  option: Option | null;

  @Column({ type: 'boolean', name: 'allow_children' })
  allowChildren: boolean;

  @Column({ type: 'boolean', name: 'granted' })
  granted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
