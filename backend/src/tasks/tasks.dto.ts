import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsInt,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubtaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsUUID()
  columnId: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSubtaskDto)
  subtasks?: CreateSubtaskDto[];
}

export class UpdateSubtaskDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsBoolean()
  isCompleted: boolean;
}

export class UpdateTaskDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsUUID()
  @IsOptional()
  columnId?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  position?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateSubtaskDto)
  subtasks?: UpdateSubtaskDto[];
}

export class MoveTaskDto {
  @IsUUID()
  columnId: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  position: number;
}

export class ToggleSubtaskDto {
  @IsBoolean()
  isCompleted: boolean;
}
