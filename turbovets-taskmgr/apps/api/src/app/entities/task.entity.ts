import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';
import { TaskStatus } from '@turbovets-taskmgr/data';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', default: TaskStatus.TODO })
  status!: TaskStatus;

  @Column({ nullable: true })
  category?: string;

  @ManyToOne(() => Organization, { eager: true })
  organization!: Organization;

  @ManyToOne(() => User, { eager: true })
  owner!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
