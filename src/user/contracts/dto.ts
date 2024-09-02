import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { UserPreferencesModel } from 'models/Preferences';

export class UserPreferencesBody {
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  is_not_read_active: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  is_favorites_active: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  is_importants_active: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  is_archived_active: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  color_mode: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ each: true })
  markers: string[];

  @ApiProperty()
  @IsOptional()
  @IsString({ each: true })
  important_addr: string[];

  static ToModel(value: UserPreferencesBody): UserPreferencesModel {
    const v = new UserPreferencesModel();
    v.is_not_read_active = value?.is_not_read_active ?? false;
    v.is_favorites_active = value?.is_favorites_active ?? false;
    v.is_importants_active = value?.is_importants_active ?? false;
    v.is_archived_active = value?.is_archived_active ?? false;
    v.color_mode = value?.color_mode ?? 'ligth';
    v.markers = value?.markers ?? [];
    v.important_addr = value?.important_addr ?? [];
    return v;
  }
}
