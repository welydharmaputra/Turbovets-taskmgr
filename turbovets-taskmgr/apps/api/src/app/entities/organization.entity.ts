import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @ManyToOne(() => Organization, (o) => o.children, { nullable: true })
  parent?: Organization | null;

  @OneToMany(() => Organization, (o) => o.parent)
  children!: Organization[];
}
