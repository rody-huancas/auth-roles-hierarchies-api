import { ConfigService } from '@nestjs/config';

/**
 * Obtiene un string desde ConfigService con valor por defecto
 * @param configService - Instancia de ConfigService
 * @param key - Clave de la variable de entorno
 * @param defaultValue - Valor por defecto si no existe
 * @returns Valor string
 */
export const getConfigString = (configService: ConfigService, key: string, defaultValue: string = ''): string => {
  return configService?.get<string>(key) ?? defaultValue;
};

/**
 * Obtiene un número desde ConfigService con valor por defecto
 * @param configService - Instancia de ConfigService
 * @param key - Clave de la variable de entorno
 * @param defaultValue - Valor por defecto si no existe
 * @returns Valor numérico
 */
export const getConfigNumber = (configService: ConfigService, key: string, defaultValue: number): number => {
  const value = configService?.get<string>(key);
  return value ? Number(value) : defaultValue;
};

/**
 * Obtiene un boolean desde ConfigService con valor por defecto
 * @param configService - Instancia de ConfigService
 * @param key - Clave de la variable de entorno
 * @param defaultValue - Valor por defecto si no existe
 * @returns Valor booleano
 */
export const getConfigBoolean = (configService: ConfigService, key: string, defaultValue: boolean = false): boolean => {
  const value = configService?.get<string>(key);
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
};

/**
 * Obtiene un array desde ConfigService (separado por comas)
 * @param configService - Instancia de ConfigService
 * @param key - Clave de la variable de entorno
 * @param defaultValue - Valor por defecto si no existe
 * @returns Array de strings
 */
export const getConfigArray = (configService: ConfigService, key: string, defaultValue: string[] = []): string[] => {
  const value = configService?.get<string>(key);
  if (!value) return defaultValue;
  return value.split(',').map(item => item.trim());
};