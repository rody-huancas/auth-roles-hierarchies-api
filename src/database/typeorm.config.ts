import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig = async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
  type            : 'postgres',
  host            : configService.get('DATABASE_HOST'),
  port            : configService.get('DATABASE_PORT'),
  username        : configService.get('DATABASE_USERNAME'),
  password        : configService.get('DATABASE_PASSWORD'),
  database        : configService.get('DATABASE_NAME'),
  autoLoadEntities: true,
  synchronize     : true,
});
