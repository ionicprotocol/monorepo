import { pythConfig as commonPythConfig } from './common';
import { PythAssetConfig } from '../types';

export const pythConfig: PythAssetConfig[] = [...commonPythConfig];

/*
  address neonPyth = 0x7f2dB085eFC3560AFF33865dD727225d91B4f9A5;
  address lineaPyth = 0xA2aa501b19aff244D90cc15a4Cf739D2725B5729;
  address polygonPyth = 0xff1a0f4744e8582DF1aE09D5611b887B6a12925C;

  bytes32 ethUsdTokenPriceFeed = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace;
  bytes32 btcUsdTokenPriceFeed = 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43;
  bytes32 neonUsdTokenPriceFeed = 0xd82183dd487bef3208a227bb25d748930db58862c5121198e723ed0976eb92b7;
  bytes32 maticUsdTokenPriceFeed = 0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52;
  bytes32 usdcUsdTokenPriceFeed = 0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a;
*/
