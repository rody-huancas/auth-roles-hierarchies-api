import { ConfigModule } from '@nestjs/config';

export const UseEnvironmentVariables = ConfigModule.forRoot({
  cache      : true,
  isGlobal   : true,
  envFilePath: ['.env'],
});
