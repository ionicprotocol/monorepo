import { SupportedChains } from '@ionicprotocol/types';
import { Handler } from '@netlify/functions';
import { Chain, createPublicClient, http, formatUnits, getContract } from 'viem';

import { functionsAlert } from '../alert';
import { environment, supabase } from '../config';
import { rpcUrls } from '../data/rpcs';
import { chainIdtoChain } from 'chains/dist';
import { IonicSdk } from '@ionicprotocol/sdk';
import { chainIdToConfig } from '@ionicprotocol/chains';

// ABI for the JumpRateModel functions we need
const jumpRateModelABI = [
  {
    inputs: [],
    name: 'blocksPerYear',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'baseRatePerBlock',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'multiplierPerBlock',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'jumpMultiplierPerBlock',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'kink',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { type: 'uint256', name: 'cash' },
      { type: 'uint256', name: 'borrows' },
      { type: 'uint256', name: 'reserves' },
    ],
    name: 'utilizationRate',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { type: 'uint256', name: 'cash' },
      { type: 'uint256', name: 'borrows' },
      { type: 'uint256', name: 'reserves' },
    ],
    name: 'getBorrowRate',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { type: 'uint256', name: 'cash' },
      { type: 'uint256', name: 'borrows' },
      { type: 'uint256', name: 'reserves' },
      { type: 'uint256', name: 'reserveFactorMantissa' },
    ],
    name: 'getSupplyRate',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export const updateInterestModel = async (
  chainId: SupportedChains,
  rpcUrl: string,
  interestModelAddress: string,
  marketData: { cash: bigint; borrows: bigint; reserves: bigint; reserveFactor: bigint }
) => {
  let row: any;
  try {
    const publicClient = createPublicClient({
      chain: chainIdtoChain[chainId] as Chain,
      transport: http(rpcUrl),
    });

    const interestModel = getContract({
      address: interestModelAddress as `0x${string}`,
      abi: jumpRateModelABI,
      client: publicClient,
    });

    // Wrap each call in try-catch to handle individual failures
    const [
      blocksPerYear,
      baseRate,
      multiplier,
      jumpMultiplier,
      kink,
      utilizationRate,
      borrowRate,
      supplyRate,
    ] = await Promise.all([
      interestModel.read.blocksPerYear().catch((): bigint => 0n),
      interestModel.read.baseRatePerBlock().catch((): bigint => 0n),
      interestModel.read.multiplierPerBlock().catch((): bigint => 0n),
      interestModel.read.jumpMultiplierPerBlock().catch((): bigint => 0n),
      interestModel.read.kink().catch((): bigint => 0n),
      interestModel.read.utilizationRate([
        marketData.cash,
        marketData.borrows,
        marketData.reserves,
      ]).catch((): bigint => 0n),
      interestModel.read.getBorrowRate([
        marketData.cash,
        marketData.borrows,
        marketData.reserves,
      ]).catch((): bigint => 0n),
      interestModel.read.getSupplyRate([
        marketData.cash,
        marketData.borrows,
        marketData.reserves,
        marketData.reserveFactor,
      ]).catch((): bigint => 0n),
    ]);

    // Only proceed with database update if we got valid data
    if (blocksPerYear === 0n) {
      throw new Error(`Invalid interest model at address ${interestModelAddress}`);
    }
    
    // Convert BigInt to string before database insertion
    row = {
      chain_id: chainId,
      interest_model_address: interestModelAddress.toLowerCase(),
      blocks_per_year: (blocksPerYear as bigint).toString(),  // Convert BigInt to string
      base_rate: formatUnits(baseRate as bigint, 18),
      multiplier: formatUnits(multiplier as bigint, 18),
      jump_multiplier: formatUnits(jumpMultiplier as bigint, 18),
      kink: formatUnits(kink as bigint, 18),
      utilization_rate: formatUnits(utilizationRate as bigint, 18),
      borrow_rate: formatUnits(borrowRate as bigint, 18),
      supply_rate: formatUnits(supplyRate as bigint, 18),
      updated_at: new Date().toISOString(),
    };

    try {
      console.log('Attempting to write to table:', environment.supabaseInterestModelTableName);
      
      const { error } = await supabase
        .from(environment.supabaseInterestModelTableName)
        .insert(row);

      if (error) {
        throw new Error(`Database error: ${JSON.stringify(error)}`);
      }
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      throw dbError; // Re-throw the more specific error
    }
  } catch (exception) {
    console.error('Full market data:', marketData);
    console.error('Full row data:', row);
    console.error('Exception details:', exception);
    
    // Convert BigInt values to strings for JSON serialization
    const serializedMarketData = Object.entries(marketData).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: value.toString()
    }), {});

    await functionsAlert(
      'Functions.interest-model: Generic Error', 
      JSON.stringify({
        marketData: serializedMarketData,
        row,
        error: exception instanceof Error ? exception.message : exception,
        interestModelAddress,
        chainId
      }, null, 2)
    );
  }
};

const ctokenABI = [
  {
    inputs: [],
    name: 'interestRateModel',
    outputs: [{ type: 'address', name: '' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getCash',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalBorrows',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalReserves',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'reserveFactorMantissa',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function'
  }
];

export const createInterestModelHandler =
  (chain: SupportedChains): Handler =>
  async () => {
    try {
      const config = chainIdToConfig[chain];
      const publicClient = createPublicClient({
        chain: chainIdtoChain[chain] as Chain,
        transport: http(config.specificParams.metadata.rpcUrls.default.http[0]),
      });
      const sdk = new IonicSdk(publicClient as any, undefined, config);

      // Get all active pools
      const [poolIndexes, pools] = await sdk.contracts.PoolDirectory.read.getActivePools();

      if (!pools.length || !poolIndexes.length) {
        throw new Error('No pools found');
      }

      // Process each pool
      await Promise.all(
        pools.map(async ({ comptroller }) => {
          const assets = await sdk.contracts.PoolLens.simulate
            .getPoolAssetsWithData([comptroller])
            .then((r) => r.result)
            .catch(() => []);

          // Update interest model for each asset
          await Promise.all(
            assets.map(async (asset) => {
              const ctoken = getContract({
                address: asset.cToken as `0x${string}`,
                abi: ctokenABI,
                client: publicClient,
              });

              // Get market data from the CToken
              const [cash, borrows, reserves, reserveFactor] = await Promise.all([
                ctoken.read.getCash(),
                ctoken.read.totalBorrows(),
                ctoken.read.totalReserves(),
                ctoken.read.reserveFactorMantissa(),
              ]) as [bigint, bigint, bigint, bigint];

              const interestModelAddress = (await ctoken.read.interestRateModel()) as string;
              
              const marketData = {
                cash,
                borrows,
                reserves,
                reserveFactor,
              };

              await updateInterestModel(chain, config.specificParams.metadata.rpcUrls.default.http[0], interestModelAddress, marketData);
            })
          );
        })
      );

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'done' }),
      };
    } catch (err) {
      console.error(err);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: String(err) }),
      };
    }
  };

export default updateInterestModel; 