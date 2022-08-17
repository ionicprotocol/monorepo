// Deprecated
import { BigNumber } from '@ethersproject/bignumber';
import axios from 'axios';
import { median, variance } from 'mathjs';
import { NextApiRequest, NextApiResponse } from 'next';

import { ThenArg } from '@ui/types/ComponentPropsType';

function clamp(num: number, min: number, max: number) {
  return num <= min ? min : num >= max ? max : num;
}

const weightedCalculation = async (calculation: () => Promise<number>, weight: number) => {
  return clamp((await calculation()) ?? 0, 0, 1) * weight;
};

async function computeAssetRSS(address: string) {
  address = address.toLowerCase();

  // MAX SCORE FOR ETH
  if (address === '0x0000000000000000000000000000000000000000') {
    return {
      liquidityNative: 4_000_000_000,
      mcap: 33,
      volatility: 20,
      liquidity: 32,
      swapCount: 7,
      coingeckoMetadata: 2,
      exchanges: 3,
      transfers: 3,
      totalScore: 100,
    };
  }

  // BNB IS WEIRD SO WE HAVE TO HARDCODE SOME STUFF
  if (address === '0xB8c77482e45F1F44dE1745F52C74426C631bDD52') {
    return {
      liquidityNative: 0,
      mcap: 33,
      volatility: 20,
      liquidity: 0,
      swapCount: 7,
      coingeckoMetadata: 0,
      exchanges: 3,
      transfers: 3,
      totalScore: 66,
    };
  }

  try {
    // Fetch all the data in parallel
    const [
      {
        market_data: {
          market_cap: { usd: asset_market_cap },
          current_price: { usd: price_usd },
        },
        tickers,
        community_data: { twitter_followers },
      },
      uniData,
      sushiData,
      defiCoins,
      assetVariation,
      ethVariation,
    ] = await Promise.all([
      axios
        .get(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}`)
        .then((res) => res.data),
      axios
        .post('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2', {
          body: JSON.stringify({
            query: `{
              token(id: "${address}") {
                totalLiquidity
                txCount
              }
            }`,
          }),

          headers: { 'Content-Type': 'application/json' },
        })
        .then((res) => res.data),

      axios
        .post('https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap-subgraph-fork', {
          body: JSON.stringify({
            query: `{
            token(id: "${address}") {
              totalLiquidity
              txCount
            }
          }`,
          }),

          headers: { 'Content-Type': 'application/json' },
        })
        .then((res) => res.data),

      axios
        .get(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=decentralized_finance_defi&order=market_cap_desc&per_page=10&page=1&sparkline=false`
        )
        .then((res) => res.data)
        .then((array) => array.slice(0, 30)),

      axios
        .get(
          `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}/market_chart/?vs_currency=usd&days=30`
        )
        .then((res) => res.data)
        // @ts-ignore
        .then((data) => data.prices.map(([, price]) => price))
        .then((prices) => variance(prices)),

      axios
        .get(
          `https://api.coingecko.com/api/v3/coins/ethereum/market_chart/?vs_currency=usd&days=30`
        )
        .then((res) => res.data)
        // @ts-ignore
        .then((data) => data.prices.map(([, price]) => price))
        .then((prices) => variance(prices)),
    ]);

    const mcap = await weightedCalculation(async () => {
      const medianDefiCoinMcap = median(
        // @ts-ignore
        defiCoins.map((coin) => coin.market_cap)
      );

      // Make exception for WETH
      if (address === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
        return 1;
      }

      if (asset_market_cap < 1_000_000) {
        return 0;
      } else {
        return asset_market_cap / medianDefiCoinMcap;
      }
    }, 33);

    let liquidityNative = 0;

    const liquidity = await weightedCalculation(async () => {
      const uniLiquidity = parseFloat(uniData.data.token?.totalLiquidity ?? '0');
      const sushiLiquidity = parseFloat(sushiData.data.token?.totalLiquidity ?? '0');

      const totalLiquidity = uniLiquidity + sushiLiquidity * price_usd;

      liquidityNative = totalLiquidity;

      return totalLiquidity / 220_000_000;
    }, 32);

    const volatility = await weightedCalculation(async () => {
      const peak = ethVariation * 3;

      return 1 - assetVariation / peak;
    }, 20);

    const swapCount = await weightedCalculation(async () => {
      const uniTxCount = parseFloat(uniData.data.token?.txCount ?? '0');

      const sushiTxCount = parseFloat(sushiData.data.token?.txCount ?? '0');

      const totalTxCount = uniTxCount + sushiTxCount;

      return totalTxCount >= 10_000 ? 1 : 0;
    }, 7);

    const exchanges = await weightedCalculation(async () => {
      const reputableExchanges: string[] = [];

      for (const exchange of tickers) {
        const name = exchange.market.identifier;

        if (
          !reputableExchanges.includes(name) &&
          name !== 'uniswap' &&
          exchange.trust_score === 'green'
        ) {
          reputableExchanges.push(name);
        }
      }

      return reputableExchanges.length >= 3 ? 1 : 0;
    }, 3);

    const transfers = await weightedCalculation(async () => {
      return 1;
    }, 3);

    const coingeckoMetadata = await weightedCalculation(async () => {
      // USDC needs an exception because Circle twitter is not listed on Coingecko.
      if (address === '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48') {
        return 1;
      }

      return twitter_followers >= 1000 ? 1 : 0;
    }, 2);

    return {
      liquidityNative,
      mcap,
      volatility,
      liquidity,
      swapCount,
      coingeckoMetadata,
      exchanges,
      transfers,
      totalScore:
        mcap + volatility + liquidity + swapCount + coingeckoMetadata + exchanges + transfers,
    };
  } catch (e) {
    return {
      liquidityNative: 0,
      mcap: 0,
      volatility: 0,
      liquidity: 0,
      swapCount: 0,
      coingeckoMetadata: 0,
      exchanges: 0,
      transfers: 0,
      totalScore: 0,
    };
  }
}

const handler = async (request: NextApiRequest, response: NextApiResponse) => {
  const { poolId, poolData, admin, _upgradeable, liquidationIncentiveMantissa } = request.body;

  response.setHeader('Access-Control-Allow-Origin', '*');

  const lastUpdated = new Date().toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
  });
  if (poolId) {
    const { assets, totalLiquidityNative } = poolData;
    if (assets.length !== 0) {
      const liquidity = await weightedCalculation(async () => {
        return totalLiquidityNative > 50_000 ? totalLiquidityNative / 2_000_000 : 0;
      }, 25);
      const collateralFactor = await weightedCalculation(async () => {
        // @ts-ignore
        const avgCollatFactor = assets.reduce(
          // @ts-ignore
          (a, b, _, { length }) =>
            a +
            BigNumber.from(b.collateralFactor).div(BigNumber.from(10).pow(16)).toNumber() / length,
          0
        );

        // Returns a percentage in the range of 45% -> 90% (where 90% is 0% and 45% is 100%)
        return -1 * (1 / 45) * avgCollatFactor + 2;
      }, 10);

      const reserveFactor = await weightedCalculation(async () => {
        // @ts-ignore
        const avgReserveFactor = assets.reduce(
          // @ts-ignore
          (a, b, _, { length }) =>
            a + BigNumber.from(b.reserveFactor).div(BigNumber.from(10).pow(16)).toNumber() / length,
          0
        );

        return avgReserveFactor <= 2 ? 0 : avgReserveFactor / 22;
      }, 10);

      const utilization = await weightedCalculation(async () => {
        for (let i = 0; i < poolData.assets.length; i++) {
          const asset = poolData.assets[i];

          // If this asset has more than 75% utilization, fail
          if (
            // @ts-ignore
            asset.totalSupply === '0' ? false : asset.totalBorrow / asset.totalSupply >= 0.75
          ) {
            return 0;
          }
        }

        return 1;
      }, 10);

      let totalRSS = 0;
      const assetsRSS: ThenArg<ReturnType<typeof computeAssetRSS>>[] = [];
      for (const [i, asset] of assets.entries()) {
        const rss = asset.underlyingToken
          ? await computeAssetRSS(asset.underlyingToken)
          : {
              liquidityNative: 0,
              mcap: 0,
              volatility: 0,
              liquidity: 0,
              swapCount: 0,
              coingeckoMetadata: 0,
              exchanges: 0,
              transfers: 0,
              totalScore: 0,
            };
        assetsRSS[i] = rss;
        totalRSS += rss.totalScore;
      }

      const averageRSS = await weightedCalculation(async () => {
        return totalRSS / poolData.assets.length / 100;
      }, 15);

      const upgradeable = await weightedCalculation(async () => {
        if (
          admin.toLowerCase() === '0xa731585ab05fc9f83555cf9bff8f58ee94e18f85' ||
          admin.toLowerCase() === '0x5ea4a9a7592683bf0bc187d6da706c6c4770976f' ||
          admin.toLowerCase() === '0x7d7ec1c9b40f8d4125d2ee524e16b65b3ee83e8f' ||
          (admin.toLowerCase() === '0x7b502f1aa0f48b83ca6349e1f42cacd8150307a6' &&
            poolData.comptroller.toLowerCase() == '0xd4bdcca1ca76ced6fc8bb1ba91c5d7c0ca4fe567') ||
          (admin.toLowerCase() === '0x521cf3d673f4b2025be0bdb03d6410b111cd17d5' &&
            poolData.comptroller.toLowerCase() == '0x8583fdff34ddc3744a46eabc1503769af0bc6604')
        ) {
          return 1;
        }

        return _upgradeable ? 0 : 1;
      }, 10);

      const mustPass = await weightedCalculation(async () => {
        const liquidationIncentive =
          BigNumber.from(liquidationIncentiveMantissa).div(BigNumber.from(10).pow(16)).toNumber() -
          100;

        for (let i = 0; i < assetsRSS.length; i++) {
          const rss = assetsRSS[i];
          const asset = poolData.assets[i];
          // Ex: 75
          const collateralFactor = BigNumber.from(asset.collateralFactor)
            .div(BigNumber.from(10).pow(16))
            .toNumber();

          // If the AMM liquidity is less than 2x the $ amount supplied, fail
          if (rss.liquidityNative < 2 * asset.totalSupplyNative) {
            return 0;
          }

          // If any of the RSS asset scores are less than 60, fail
          if (rss.totalScore < 60) {
            return 0;
          }

          // If the collateral factor and liquidation incentive do not have at least a 5% safety margin, fail
          if (collateralFactor + liquidationIncentive > 95) {
            /*

                See this tweet for why: https://twitter.com/transmissions11/status/1378862288266960898

                TLDR: If CF and LI add up to be greater than 100 then any liquidation will result in instant insolvency. 95 has been determined to be the highest sum that could be considered "safe".

                */

            return 0;
          }

          // If the liquidation incentive is less than or equal to 1/10th of the collateral factor, fail
          if (liquidationIncentive <= collateralFactor / 10) {
            return 0;
          }
        }

        return 1;
      }, 20);

      response.setHeader('Cache-Control', 's-maxage=3600');
      response.json({
        liquidity,
        collateralFactor,
        reserveFactor,
        utilization,
        averageRSS,
        upgradeable,
        mustPass,
        totalScore:
          liquidity +
          collateralFactor +
          reserveFactor +
          utilization +
          averageRSS +
          upgradeable +
          mustPass,
        lastUpdated,
      });
    } else {
      response.setHeader('Cache-Control', 's-maxage=3600');
      response.json({
        liquidity: 0,
        collateralFactor: 0,
        reserveFactor: 0,
        utilization: 0,
        averageRSS: 0,
        upgradeable: 0,
        mustPass: 0,
        totalScore: 0,
        lastUpdated,
      });
    }
  } else {
    response.status(404).send('Specify poolId!');
  }
};

export default handler;
