import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsUUID } from 'class-validator';
import { UserModel } from './User';
import { EmailModel } from './Email';

@Entity('TBL_MESSAGE')
export class MessageModel {
  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  send_date: string;

  @Column({
    type: 'varchar',
    transformer: {
      from: (value: string) => value?.split(',') ?? [],
      to: (value: string[]) => value?.join() ?? null,
    },
  })
  markers: string[];

  @Column({ default: false })
  read: boolean;

  @Column({ default: false })
  favorite: boolean;

  @Column({ default: false })
  archived: boolean;

  @Column({ default: false })
  importants: boolean;

  @ManyToOne(() => UserModel, (user: UserModel) => user.sent_messages)
  sender_id: UserModel;

  @ManyToOne(() => UserModel, (user: UserModel) => user.received_messages)
  receiver_id: UserModel;

  @OneToOne(() => EmailModel)
  @JoinColumn()
  content: EmailModel;

  @CreateDateColumn()
  created_at: Date | string;

  @UpdateDateColumn()
  updated_at: Date | string;

  @DeleteDateColumn()
  deleted_at: Date | string;
}
