export { default as updateCumulativePrices } from './updateCumulativePrices';
export { default as tryUpdateCumulativePrices } from './tryUpdateCumulativePrices';
export { default as setUpSdk } from './setUpSdk';
export { default as setPriceAndRepeat } from './setPriceAndRepeat';
import pino from 'pino';

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: true,
    },
  },
});
