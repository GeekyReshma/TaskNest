import { IsString, IsNotEmpty, IsArray, IsOptional, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateColumnDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateColumnDto)
  columns?: CreateColumnDto[];
}

export class UpdateColumnDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateBoardDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateColumnDto)
  columns?: UpdateColumnDto[];
}
