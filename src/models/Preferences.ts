import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsUUID } from 'class-validator';

@Entity('TBL_USER_PREFERENCES')
export class UserPreferencesModel {
  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  is_not_read_active: boolean;

  @Column({ default: false })
  is_favorites_active: boolean;

  @Column({ default: false })
  is_importants_active: boolean;

  @Column({ default: false })
  is_archived_active: boolean;

  @Column({ default: 'light' })
  color_mode: string;

  @Column({
    type: 'varchar',
    transformer: {
      from: (value: string) => value?.split(',') ?? [],
      to: (value: string[]) => value?.join() ?? null,
    },
  })
  markers: string[];

  @Column({
    type: 'varchar',
    transformer: {
      from: (value: string) => value?.split(',') ?? [],
      to: (value: string[]) => value?.join() ?? null,
    },
  })
  important_addr: string[];

  @CreateDateColumn()
  created_at: Date | string;

  @UpdateDateColumn()
  updated_at: Date | string;

  @DeleteDateColumn()
  deleted_at: Date | string;
}
