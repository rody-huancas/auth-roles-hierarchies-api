import { IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsInt, IsBoolean, IsUUID, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModuleRegistryDto {
  @ApiProperty({ example: 'productos', description: 'Clave única del módulo (identificador)' })
  @IsNotEmpty({ message: 'La clave del módulo es requerida' })
  @IsString({ message: 'La clave debe ser una cadena de texto' })
  @MinLength(2, { message: 'La clave debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'La clave no puede tener más de 50 caracteres' })
  @Matches(/^[a-z][a-z0-9._]*$/, {
    message: 'La clave debe estar en minúsculas y solo contener letras, números, puntos y guiones bajos',
  })
  key: string;

  @ApiProperty({ example: 'Productos', description: 'Nombre del módulo' })
  @IsNotEmpty({ message: 'El nombre del módulo es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  name: string;

  @ApiProperty({
    example: '770e8400-e29b-41d4-a716-446655441001',
    description: 'ID del módulo padre (opcional, null para módulos raíz)',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del módulo padre debe ser un UUID válido' })
  parentModuleId?: string | null;

  @ApiProperty({ example: 1, description: 'Índice de ordenamiento', required: false, default: 0 })
  @IsOptional()
  @IsInt({ message: 'El índice de orden debe ser un número entero' })
  orderIndex?: number;

  @ApiProperty({ example: true, description: 'Estado activo del módulo', required: false, default: true })
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  isActive?: boolean;

  @ApiProperty({ example: '/productos', description: 'Ruta del módulo' })
  @IsNotEmpty({ message: 'La ruta es requerida' })
  @IsString({ message: 'La ruta debe ser una cadena de texto' })
  @MinLength(1, { message: 'La ruta debe tener al menos 1 carácter' })
  @MaxLength(255, { message: 'La ruta no puede tener más de 255 caracteres' })
  route: string;
}
