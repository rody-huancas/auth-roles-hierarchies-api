import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RolePermissions } from '../../roles/entities/role-permissions.entity';

@Entity({ name: 'module_registry' })
export class ModuleRegistry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  key: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'uuid', nullable: true, name: 'parent_module_id' })
  parentModuleId: string | null;

  @ManyToOne(() => ModuleRegistry, (module) => module.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_module_id' })
  parent: ModuleRegistry | null;

  @OneToMany(() => ModuleRegistry, (module) => module.parent)
  children: ModuleRegistry[];

  @OneToMany(() => RolePermissions, (rolePermission) => rolePermission.module)
  rolePermissions: RolePermissions[];

  @Column({ type: 'int', name: 'order_index', default: 0 })
  orderIndex: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'varchar', length: 255 })
  route: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
