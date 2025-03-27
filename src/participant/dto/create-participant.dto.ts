import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsPhoneNumber,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateParticipantDto {
  @IsNotEmpty()
  contestId: number;

  @IsNotEmpty()
  @IsString()
  babyName: string;

  @IsNotEmpty()
  @Type(() => Date) // Ensures string is transformed into a Date object
  @IsDate()
  babyDob: Date;

  @IsNotEmpty()
  @IsEnum(['boy', 'girl', 'other']) // Restrict values
  babyGender: 'boy' | 'girl' | 'other';

  @IsNotEmpty()
  @IsString()
  babyImage: string; // S3 image URL

  @IsNotEmpty()
  @IsString()
  parentName: string;

  @IsNotEmpty()
  parentContactNumber: string;

  @IsNotEmpty()
  @IsString()
  city: string;
}
