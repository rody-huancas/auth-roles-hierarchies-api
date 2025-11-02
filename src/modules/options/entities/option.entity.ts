import { ModuleRegistry } from 'src/modules/module-registry/entities/module-registry.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'options' })
export class Option {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'module_id' })
  moduleId: string;

  @Column({ type: 'varchar', length: 150 })
  key: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ModuleRegistry, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: ModuleRegistry;
}
