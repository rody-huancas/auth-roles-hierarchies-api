import { IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'ADMIN', description: 'Nombre del rol (debe ser único)' })
  @IsNotEmpty({ message: 'El nombre del rol es requerido' })
  @IsString({ message: 'El nombre del rol debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre del rol debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre del rol no puede tener más de 50 caracteres' })
  @Matches(/^[A-Z_][A-Z0-9_]*$/, {
    message: 'El nombre del rol debe estar en mayúsculas y solo contener letras, números y guiones bajos',
  })
  name: string;

  @ApiProperty({ example: 'Rol administrador con acceso amplio', description: 'Descripción del rol' })
  @IsNotEmpty({ message: 'La descripción es requerida' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MinLength(5, { message: 'La descripción debe tener al menos 5 caracteres' })
  @MaxLength(255, { message: 'La descripción no puede tener más de 255 caracteres' })
  description: string;
}
