import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsUUID } from 'class-validator';

@Entity('TBL_EMAIL')
export class EmailModel {
  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'blob' })
  content: string;

  @Column()
  subject: string;

  @Column()
  preview: string;

  @CreateDateColumn()
  created_at: Date | string;

  @UpdateDateColumn()
  updated_at: Date | string;

  @DeleteDateColumn()
  deleted_at: Date | string;
}
