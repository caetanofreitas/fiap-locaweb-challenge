import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsUUID } from 'class-validator';
import { UserModel } from './User';

@Entity('TBL_EVENT')
export class EventModel {
  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  occurence_date: string;

  @Column({ default: false })
  repeat_all_days: boolean;

  @ManyToOne(() => UserModel, (user: UserModel) => user.events)
  user: UserModel;

  @CreateDateColumn()
  created_at: Date | string;

  @UpdateDateColumn()
  updated_at: Date | string;

  @DeleteDateColumn()
  deleted_at: Date | string;
}
