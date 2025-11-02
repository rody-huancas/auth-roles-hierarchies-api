import { IsNotEmpty, IsString, MinLength, MaxLength, IsUUID, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOptionDto {
  @ApiProperty({
    example: '770e8400-e29b-41d4-a716-446655441002',
    description: 'ID del módulo al que pertenece la opción',
  })
  @IsNotEmpty({ message: 'El ID del módulo es requerido' })
  @IsUUID('4', { message: 'El ID del módulo debe ser un UUID válido' })
  moduleId: string;

  @ApiProperty({ example: 'create', description: 'Clave única de la opción (identificador)' })
  @IsNotEmpty({ message: 'La clave de la opción es requerida' })
  @IsString({ message: 'La clave debe ser una cadena de texto' })
  @MinLength(2, { message: 'La clave debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'La clave no puede tener más de 50 caracteres' })
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: 'La clave debe estar en minúsculas y solo contener letras, números y guiones bajos',
  })
  key: string;

  @ApiProperty({ example: 'Crear producto', description: 'Nombre de la opción' })
  @IsNotEmpty({ message: 'El nombre de la opción es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  name: string;

  @ApiProperty({ example: 'Crear nuevo producto', description: 'Descripción de la opción' })
  @IsNotEmpty({ message: 'La descripción es requerida' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MinLength(5, { message: 'La descripción debe tener al menos 5 caracteres' })
  @MaxLength(255, { message: 'La descripción no puede tener más de 255 caracteres' })
  description: string;
}
