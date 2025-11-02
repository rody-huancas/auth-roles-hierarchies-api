import { IsNotEmpty, IsString, MaxLength, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuditLogDto {
  @ApiProperty({ example: 'CREATE', description: 'Acción realizada (CREATE, UPDATE, DELETE)' })
  @IsNotEmpty({ message: 'La acción es requerida' })
  @IsString({ message: 'La acción debe ser una cadena de texto' })
  @MaxLength(50, { message: 'La acción no puede tener más de 50 caracteres' })
  action: string;

  @ApiProperty({ example: 'User', description: 'Tipo de entidad afectada' })
  @IsNotEmpty({ message: 'El tipo de entidad es requerido' })
  @IsString({ message: 'El tipo de entidad debe ser una cadena de texto' })
  @MaxLength(50, { message: 'El tipo de entidad no puede tener más de 50 caracteres' })
  entityType: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID de la entidad afectada' })
  @IsNotEmpty({ message: 'El ID de la entidad es requerido' })
  @IsString({ message: 'El ID de la entidad debe ser una cadena de texto' })
  entityId: string;

  @ApiProperty({ 
    example    : { name: 'Old Name', email: 'old@example.com' },
    description: 'Valores anteriores (JSON)',
    required   : false
  })
  @IsOptional()
  @IsObject({ message: 'Los valores anteriores deben ser un objeto' })
  oldValues?: Record<string, any>;

  @ApiProperty({ 
    example    : { name: 'New Name', email: 'new@example.com' },
    description: 'Valores nuevos (JSON)',
    required   : false
  })
  @IsOptional()
  @IsObject({ message: 'Los valores nuevos deben ser un objeto' })
  newValues?: Record<string, any>;

  @ApiProperty({ example: '192.168.1.1', description: 'Dirección IP del cliente' })
  @IsNotEmpty({ message: 'La dirección IP es requerida' })
  @IsString({ message: 'La dirección IP debe ser una cadena de texto' })
  @MaxLength(50, { message: 'La dirección IP no puede tener más de 50 caracteres' })
  ipAddress: string;

  @ApiProperty({ 
    example    : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    description: 'User Agent del cliente'
  })
  @IsNotEmpty({ message: 'El user agent es requerido' })
  @IsString({ message: 'El user agent debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El user agent no puede tener más de 255 caracteres' })
  userAgent: string;
}
