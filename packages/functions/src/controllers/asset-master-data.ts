import { SupportedChains } from '@ionicprotocol/types';
import { Handler } from '@netlify/functions';
import { Chain, createPublicClient, http, formatEther, getContract, formatUnits, type Abi } from 'viem';
import { chainIdtoChain, chainIdToConfig } from '@ionicprotocol/chains';
import { IonicSdk } from '@ionicprotocol/sdk';
import axios from 'axios';
import CTokenABI from '../abi/CToken.json';
import FlywheelABI from '../abi/FlywheelCore.json';
import FlywheelRewardsABI from '../abi/FlywheelCore.json';
import { environment, supabase } from '../config';
const FLYWHEEL_TYPE_MAP: Record<number, { supply?: string[], borrow?: string[] }> = {
  [SupportedChains.mode]: {
    supply: [],
    borrow: []
  }
};
// merge in main branch
interface AssetMasterData {
  // Key identifiers
  chain_id: SupportedChains;
  ctoken_address: string;
  underlying_address: string;
  pool_address: string;
  
  // Asset basic info
  underlying_name: string;
  underlying_symbol: string;
  decimals: number;
  // Price data
  underlying_price: number;
  usd_price: number;
  exchange_rate: number;
  // TVL and supply data
  total_supply: string;
  total_supply_usd: number;
  total_borrow: string;
  total_borrow_usd: number;
  utilization_rate: number;
  // APY/APR data
  supply_apy: number;
  borrow_apy: number;
  reward_apy: number;
  total_apy: number;
  // Market status
  is_listed: boolean;
  collateral_factor: number;
  reserve_factor: number;
  borrow_cap: string;
  supply_cap: string;
  is_borrow_paused: boolean;
  is_mint_paused: boolean;
  // Metadata
  updated_at: string;
  block_number: number;
  timestamp: string;
  reward_apy_supply: number;
  reward_apy_borrow: number;
  reward_tokens: string[];
}
const fetchTokenPrice = async (cgId: string): Promise<number> => {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=usd`);
    return response.data[cgId]?.usd || 0;
  } catch (e) {
    console.error('Error fetching token price:', e);
    return 0;
  }
};
const validateAssetData = (data: any) => {
  const requiredFields = [
    'underlying_price',
    'usd_price',
    'exchange_rate',
    'supply_apy',
    'borrow_apy'
  ];
  requiredFields.forEach(field => {
    if (typeof data[field] !== 'number' || isNaN(data[field])) {
      throw new Error(`Invalid ${field}: ${data[field]}`);
    }
  });
  return data;
};
const formatBigIntValue = (value: string | number | bigint, decimals: number): number => {
  const valueStr = value.toString();
  const valueBigInt = BigInt(valueStr);
  const divisor = BigInt(10) ** BigInt(decimals);
  return Number(valueBigInt) / Number(divisor);
};
const calculateRewardApy = (rewardRate: bigint, index: bigint): number => {
  const annualRewardRate = (rewardRate * BigInt(365 * 24 * 60 * 60)) / index;
  return Number(annualRewardRate) / 1e18 * 100;
};
export const updateAssetMasterData = async (chainId: SupportedChains) => {
  try {
    const config = chainIdToConfig[chainId];
    let publicClient;
    
    // Special handling for Base chain
    if (chainId === SupportedChains.base) {
      const rpcUrls = config.specificParams.metadata.rpcUrls.default.http;
      
      for (const rpcUrl of rpcUrls) {
        try {
          publicClient = createPublicClient({
            chain: chainIdtoChain[chainId] as Chain,
            transport: http(rpcUrl, {
              timeout: 60000,
              retryCount: 5,
              retryDelay: 2000,
            }),
          });
          await publicClient.getBlockNumber();
          console.log(`Connected to Base RPC: ${rpcUrl}`);
          break;
        } catch (e) {
          console.log(`Failed to connect to Base RPC ${rpcUrl}, trying next...`);
          continue;
        }
      }
    } else {
      // For other chains, use default RPC
      publicClient = createPublicClient({
        chain: chainIdtoChain[chainId] as Chain,
        transport: http(config.specificParams.metadata.rpcUrls.default.http[0])
      });
    }

    if (!publicClient) {
      throw new Error(`All RPC endpoints failed for ${chainIdtoChain[chainId].name}`);
    }
    const sdk = new IonicSdk(publicClient as any, undefined, config);
    
    // Get pools and their assets
    const [poolIndexes, pools] = await sdk.contracts.PoolDirectory.read.getActivePools();
    
    if (!pools.length) {
      throw new Error('No pools found');
    }
    // Get native token price for USD conversion
    const cgId = config.specificParams.cgId;
    const nativeTokenPrice = await fetchTokenPrice(cgId).catch(() => 0);
    
    const masterEntries = [];
    const mpo = sdk.createMasterPriceOracle();
    // Process assets in parallel batches to avoid timeout
    const processAssetBatch = async (assets: any[], pool: any) => {
      return Promise.all(assets.map(async (asset) => {
        try {
          // Get underlying price
          const underlyingPrice = await mpo.read.price([asset.underlyingToken]);
          const underlyingPriceNum = Number(formatEther(underlyingPrice as bigint));
          const usdPrice = underlyingPriceNum * nativeTokenPrice;
          // Get exchange rate with proper decimal handling
          let exchangeRateNum = 1;
          try {
            const exchangeRate = await publicClient.readContract({
              address: asset.cToken as `0x${string}`,
              abi: CTokenABI as Abi,
              functionName: 'exchangeRateCurrent'
            });
            exchangeRateNum = Number(formatEther(exchangeRate as bigint));
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (err) {
            console.log(`Falling back to exchangeRateStored for ${asset.cToken}`);
            const exchangeRate = await publicClient.readContract({
              address: asset.cToken as `0x${string}`,
              abi: CTokenABI as Abi,
              functionName: 'exchangeRateStored'
            });
            exchangeRateNum = Number(formatEther(exchangeRate as bigint));
          }
          // Calculate APYs
          const supplyApy = sdk.ratePerBlockToAPY(
            asset.supplyRatePerBlock,
            Number(config.specificParams.blocksPerYear / BigInt(24 * 365 * 60))
          );
          
          const borrowApy = sdk.ratePerBlockToAPY(
            asset.borrowRatePerBlock,
            Number(config.specificParams.blocksPerYear / BigInt(24 * 365 * 60))
          );
          // Calculate total supply USD and borrow USD using parseFloat like in total-tvl.ts
          const totalSupplyUSD = formatBigIntValue(asset.totalSupply, asset.underlyingDecimals) *  
            usdPrice;
          const totalBorrowUSD = formatBigIntValue(asset.totalBorrow, asset.underlyingDecimals) * 
            usdPrice;
          const utilizationRate = !asset.totalBorrow || !asset.totalSupply ? 0 :
            formatBigIntValue(asset.totalBorrow, asset.underlyingDecimals) /
            (formatBigIntValue(asset.totalSupply, asset.underlyingDecimals) * exchangeRateNum);
          // Calculate rewards
          const rewardTokens = new Set<string>();
          let rewardApySupply = 0;
          let rewardApyBorrow = 0;
          
          try {
            const flywheelRewards = await sdk.getFlywheelMarketRewardsByPoolWithAPR(pool.comptroller);
            
            if (flywheelRewards) {
              const marketRewards = flywheelRewards.find(r => r.market === asset.cToken);
              if (marketRewards?.rewardsInfo) {
                for (const reward of marketRewards.rewardsInfo) {
                  if (reward.formattedAPR) {
                    const apyForMarket = Number(formatUnits(reward.formattedAPR, 18));
                    const boosterAddress = await publicClient.readContract({
                      address: reward.flywheel as `0x${string}`,
                      abi: FlywheelABI as Abi,
                      functionName: 'flywheelBooster'
                    });
                    
                    if (boosterAddress === '0x0000000000000000000000000000000000000000') {
                      rewardApySupply += Math.min(apyForMarket * 100, 1000);
                    } else {
                      rewardApyBorrow += Math.min(apyForMarket * 100, 1000);
                    }
                    rewardTokens.add(reward.rewardToken.toLowerCase());
                  }
                }
              }
            }
          } catch (e) {
            console.error(`Error calculating rewards for ${asset.cToken}:`, e);
            // Continue with zero rewards rather than failing the entire asset
          }
          const totalSupplyApy = supplyApy + rewardApySupply;
          const totalBorrowApy = (-1 * borrowApy) + rewardApyBorrow;
          const comptroller = sdk.createComptroller(pool.comptroller);
          const [borrowCap, supplyCap] = await Promise.all([
            comptroller.read.borrowCaps([asset.cToken]),
            comptroller.read.supplyCaps([asset.cToken])
          ]);
          return {
            chain_id: chainId,
            ctoken_address: asset.cToken.toLowerCase(),
            underlying_address: asset.underlyingToken.toLowerCase(),
            pool_address: pool.comptroller.toLowerCase(),
            underlying_name: asset.underlyingName || '',
            underlying_symbol: asset.underlyingSymbol || '',
            decimals: asset.underlyingDecimals,
            underlying_price: underlyingPriceNum,
            usd_price: usdPrice,
            exchange_rate: exchangeRateNum,
            total_supply: asset.totalSupply.toString(),
            total_supply_usd: totalSupplyUSD,
            total_borrow: asset.totalBorrow.toString(),
            total_borrow_usd: totalBorrowUSD,
            utilization_rate: utilizationRate,
            supply_apy: supplyApy,
            borrow_apy: borrowApy,
            reward_apy: rewardApySupply + rewardApyBorrow,
            reward_apy_supply: rewardApySupply,
            reward_apy_borrow: rewardApyBorrow,
            total_supply_apy: totalSupplyApy,
            total_borrow_apy: totalBorrowApy,
            is_listed: true,
            collateral_factor: Number(formatEther(asset.collateralFactor)),
            reserve_factor: Number(formatEther(asset.reserveFactor)),
            borrow_cap: borrowCap.toString(),
            supply_cap: supplyCap.toString(),
            is_borrow_paused: asset.borrowGuardianPaused,
            is_mint_paused: asset.mintGuardianPaused,
            updated_at: new Date(),
            block_number: Number(await publicClient.getBlockNumber()),
            timestamp: new Date().toISOString(),
            reward_tokens: Array.from(rewardTokens),
          };
        } catch (e) {
          console.error(`Error processing asset ${asset.cToken}:`, e);
          return null;
        }
      }));
    };
    // Process pools
    for (const pool of pools) {
      try {
        const assets = await sdk.contracts.PoolLens.simulate
          .getPoolAssetsWithData([pool.comptroller])
          .then(r => r.result)
          .catch(() => []);
        const processedAssets = await processAssetBatch([...assets] as any[], pool);
        masterEntries.push(...processedAssets.filter(Boolean));
      } catch (e) {
        console.error(`Error processing pool ${pool.comptroller}:`, e);
      }
    }

    // Insert into database with fallback to insert if upsert fails
    try {
      const { error } = await supabase
        .from(environment.supabaseAssetMasterDataTableName)
        .upsert(masterEntries, {
          onConflict: 'chain_id,ctoken_address',
          ignoreDuplicates: false
        });

      if (error) {
        // If upsert fails due to missing constraint, fall back to insert
        if (error.code === '42P10') {
          console.log('Falling back to insert due to missing constraint');
          const { error: insertError } = await supabase
            .from(environment.supabaseAssetMasterDataTableName)
            .insert(masterEntries);
          
          if (insertError) {
            throw insertError;
          }
        } else {
          throw error;
        }
      }
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      throw dbError;
    }
    return masterEntries;
  } catch (err) {
    console.error('Error in updateAssetMasterData:', err);
    throw err;
  }
};
export const createAssetMasterDataHandler =
  (chain: SupportedChains): Handler =>
  async () => {
    try {
      const result = await updateAssetMasterData(chain);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Master data collection completed',
          count: result.length
        }),
      };
    } catch (err) {
      console.error('Handler error:', err);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined
        }),
      };
    }
  };
export const handler = createAssetMasterDataHandler
export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (e) {
    if (retries === 0) throw e;
    await new Promise(r => setTimeout(r, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
};
