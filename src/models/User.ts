import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsUUID } from 'class-validator';

import { UserPreferencesModel } from './Preferences';
import { MessageModel } from './Message';
import { EventModel } from './Event';

@Entity('TBL_USER')
export class UserModel {
  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ name: 'profile_picture', nullable: true })
  profile_picture?: string;

  @OneToOne(() => UserPreferencesModel, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn()
  preferences?: string | UserPreferencesModel;

  @OneToMany(() => MessageModel, (message: MessageModel) => message.sender_id, {
    nullable: true,
  })
  sent_messages?: MessageModel[];

  @OneToMany(
    () => MessageModel,
    (message: MessageModel) => message.receiver_id,
    {
      nullable: true,
    },
  )
  received_messages?: MessageModel[];

  @OneToMany(() => EventModel, (event: EventModel) => event.user, {
    nullable: true,
  })
  events?: EventModel[];

  @CreateDateColumn()
  created_at?: Date | string;

  @UpdateDateColumn()
  updated_at?: Date | string;

  @DeleteDateColumn()
  deleted_at?: Date | string;
}
