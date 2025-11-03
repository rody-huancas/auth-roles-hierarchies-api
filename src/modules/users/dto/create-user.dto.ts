import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'johndoe', description: 'Username del usuario' })
  @IsNotEmpty({ message: 'El username es requerido' })
  @IsString({ message: 'El username debe ser una cadena de texto' })
  @MinLength(3, { message: 'El username debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El username no puede tener más de 50 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'El username solo puede contener letras, números y guiones bajos' })
  username: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email del usuario' })
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @MaxLength(255, { message: 'El email no puede tener más de 255 caracteres' })
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'Contraseña del usuario', minLength: 8 })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(255, { message: 'La contraseña no puede tener más de 255 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener al menos una letra minúscula, una mayúscula y un número',
  })
  password: string;

  @ApiProperty({ example: 'John', description: 'Nombre del usuario' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Apellido del usuario' })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El apellido no puede tener más de 100 caracteres' })
  lastName: string;

  @ApiProperty({ example: true, description: 'Estado activo del usuario', required: false, default: true })
  isActive?: boolean;

  @ApiProperty({ 
    example: ['123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001'], 
    description: 'Array de IDs de roles a asignar al usuario',
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray({ message: 'Los roles deben ser un array' })
  @IsUUID(undefined, { each: true, message: 'Cada ID de rol debe ser un UUID válido' })
  roleIds?: string[];
}
