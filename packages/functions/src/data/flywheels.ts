import { SupportedChains } from '@ionicprotocol/types';

type ChainToFlywheels = Partial<Record<SupportedChains, string[]>>;
export const flywheelsOfChain: ChainToFlywheels = {};
