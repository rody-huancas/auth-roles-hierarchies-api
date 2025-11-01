import { ConfigService } from '@nestjs/config';
import { getConfigNumber, getConfigString } from '../../utils/env.utils';

let configService: ConfigService;

export const initializeEnvs = (config: ConfigService) => {
  configService = config;
};

export const envs = {
  // DATABASE
  get DATABASE_HOST()     { return getConfigString(configService, 'DATABASE_HOST');       },
  get DATABASE_PORT()     { return getConfigNumber(configService, 'DATABASE_PORT', 5432); },
  get DATABASE_USERNAME() { return getConfigString(configService, 'DATABASE_USERNAME');   },
  get DATABASE_PASSWORD() { return getConfigString(configService, 'DATABASE_PASSWORD');   },
  get DATABASE_NAME()     { return getConfigString(configService, 'DATABASE_NAME');       },

  // JWT
  get JWT_SECRET()             { return getConfigString(configService, 'JWT_SECRET');                   },
  get JWT_EXPIRES_IN()         { return getConfigString(configService, 'JWT_EXPIRES_IN', '1h');         },
  get JWT_REFRESH_SECRET()     { return getConfigString(configService, 'JWT_REFRESH_SECRET');           },
  get JWT_REFRESH_EXPIRES_IN() { return getConfigString(configService, 'JWT_REFRESH_EXPIRES_IN', '7d'); },
};