import { SupportedChains } from '@ionicprotocol/types';

export const bscFlywheels = [
  '0xD09b27B5EA296A901D2113c374A28f02Cd46010D',
  '0x851Cc0037B6923e60dC81Fa79Ac0799cC983492c', // jarvis, 2brl, DDD Flywheel
  '0xC6431455AeE17a08D6409BdFB18c4bc73a4069E4', // jarvis, 2brl, EPX Flywheel
];
export const moonbeamFlywheels = ['0xF57b2bD963F61C556F89e6dCb590A758eAd2F37B'];
export const polygonFlywheels = [];

type ChainToFlywheels = Partial<Record<SupportedChains, string[]>>;
export const flywheelsOfChain: ChainToFlywheels = {
  [SupportedChains.bsc]: bscFlywheels,
  [SupportedChains.moonbeam]: moonbeamFlywheels,
  [SupportedChains.polygon]: polygonFlywheels,
};
