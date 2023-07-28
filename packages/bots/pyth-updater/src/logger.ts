import pino from 'pino';

import config from './config/service';

export const logger = pino({
  level: config.logLevel,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: config.environment === 'development' ? true : false,
      levelFirst: true,
      translateTime: 'yyyy-dd-mm, h:MM:ss TT',
    },
  },
});
