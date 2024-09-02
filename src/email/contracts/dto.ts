import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Like, MoreThanOrEqual } from 'typeorm';

export class EmailBody {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sendDate: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  for: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ each: true })
  cc: string[];
}

export class ListFilter {
  page?: number;
  limit?: number;
  date?: string;
  markers?: string[];
  read?: boolean;
  favorite?: boolean;
  importants?: boolean;
  archived?: boolean;
  search?: string;

  getFilters() {
    const filter = {};

    if (this.limit <= 0) {
      this.limit = 20;
    }

    if (this.page != undefined) {
      this.page = (this.page - 1) * this.limit;
    } else {
      this.page = 0;
    }

    if (this.date) {
      Object.assign(filter, { send_date: MoreThanOrEqual(this.date) });
    }

    if (this.markers) {
      const markers = this.markers.map((value) =>
        Like(`%${value.toLowerCase()}%`),
      );
      Object.assign(filter, { markers: markers });
    }

    if (this.read !== undefined) {
      Object.assign(filter, { read: this.read });
    }

    if (this.favorite !== undefined) {
      Object.assign(filter, { favorite: this.favorite });
    }

    if (this.importants !== undefined) {
      Object.assign(filter, { importants: this.importants });
    }

    if (this.archived !== undefined) {
      Object.assign(filter, { archived: this.archived });
    }

    if (this.search) {
      Object.assign(filter, {
        content: {
          content: Like(`%${this.search}%`),
        },
      });
    }

    return filter;
  }
}
