// for supply-side rewards apy:
// export const

import { Fuse } from '@midas-capital/sdk';
import { BigNumber, utils } from 'ethers';
import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';
import { useTokensDataAsMap } from '@ui/hooks/useTokenData';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import {
  CTokenDataForRewards,
  CTokenIncentivesMap,
  CTokenRewardsDistributorIncentivesWithRatesMap,
  CTokensDataForRewardsMap,
  RewardsDataForMantissa,
  TokenPrices,
} from '@ui/types/ComponentPropsType';
import { convertMantissaToAPR, convertMantissaToAPY } from '@ui/utils/apyUtils';
import {
  createComptroller,
  createCToken,
  createMasterPriceOracle,
  createOracle,
} from '@ui/utils/createComptroller';

// ( ( rewardSupplySpeed * rewardEthPrice ) / ( underlyingTotalSupply * underlyingEthPrice / 1e18 / 1e18 ) )
// (
//     rewardSpeed: number,  // getRewardsSpeedsByPool
//     rewardEthPrice: number,  // useAssetPricesInEth + the rewardtoken -- price of the rewardToken in ETH
//     underlyingTotalSupply: number, // (CToken.totalSupply() * CToken.exchangeRateCurrent())
//     underlyingEthPrice: number // useAssetPricesInEth + the CToken underlying price in ETH
// )

export const useIncentivesWithRates = (
  incentives: CTokenIncentivesMap,
  rewardTokenAddrs: string[],
  comptroller: string
) => {
  // this is what we return
  const incentivesWithRates: CTokenRewardsDistributorIncentivesWithRatesMap = {};

  const ctokenAddrs = Object.keys(incentives);

  const cTokensDataMap = useCTokensDataForRewards(ctokenAddrs);

  // return speed;

  // Reduce CTokens Array to Underlying, using same indices
  const underlyings = Object.keys(cTokensDataMap).map((key) => cTokensDataMap[key].underlyingToken);

  // const rewardTokens = Object.keys(ctokensRewardsMap).map(
  //   (key) => ctokensRewardsMap[key].rewardTOk
  // );

  // Then we need to get underlying prices
  const tokenPrices = useAssetPricesInEth([...underlyings, ...rewardTokenAddrs], comptroller);

  // This shit is bananas
  if (!tokenPrices || !ctokenAddrs) return {};

  // Each CToken has an array of incentives data
  for (const cTokenAddress of ctokenAddrs) {
    const incentivesForCToken = incentives[cTokenAddress];
    const cTokenData = cTokensDataMap[cTokenAddress];

    // this is what we return
    incentivesWithRates[cTokenAddress] =
      incentivesForCToken.length && !!cTokenData
        ? incentivesForCToken.map((incentiveForCToken) => {
            const { rewardToken, borrowSpeed, supplySpeed } = incentiveForCToken;
            const supplyMantissaData: RewardsDataForMantissa = {
              cTokenAddress,
              rewardSpeed: supplySpeed,
              rewardEthPrice: tokenPrices.tokenPrices[rewardToken].ethPrice,
              underlyingTotalSupply: Number(utils.formatEther(cTokenData.totalSupply)),
              underlyingEthPrice: tokenPrices.tokenPrices[cTokenData.underlyingToken].ethPrice,
            };

            const borrowMantissaData: RewardsDataForMantissa = {
              cTokenAddress,
              rewardSpeed: borrowSpeed,
              rewardEthPrice: tokenPrices.tokenPrices[rewardToken].ethPrice,
              underlyingTotalSupply: Number(utils.formatEther(cTokenData.totalSupply)),
              underlyingEthPrice: tokenPrices.tokenPrices[cTokenData.underlyingToken].ethPrice,
            };

            const supplyMantissa = constructMantissa(
              supplyMantissaData.rewardSpeed,
              supplyMantissaData.rewardEthPrice,
              supplyMantissaData.underlyingTotalSupply,
              supplyMantissaData.underlyingEthPrice
            );

            const borrowMantissa = constructMantissa(
              borrowMantissaData.rewardSpeed,
              borrowMantissaData.rewardEthPrice,
              borrowMantissaData.underlyingTotalSupply,
              borrowMantissaData.underlyingEthPrice
            );

            const supplyAPY = convertMantissaToAPY(supplyMantissa, 365);
            const supplyAPR = convertMantissaToAPR(supplyMantissa);
            const borrowAPY = convertMantissaToAPY(borrowMantissa, 365);
            const borrowAPR = convertMantissaToAPR(borrowMantissa);

            return {
              ...incentiveForCToken,
              supplyAPY,
              supplyAPR,
              borrowAPY,
              borrowAPR,
            };
          })
        : [];
  }

  return incentivesWithRates;
};

const constructMantissa = (
  rewardSpeed: number,
  rewardEthPrice: number,
  underlyingTotalSupply: number,
  underlyingEthPrice: number
) => {
  return (rewardSpeed * rewardEthPrice) / (underlyingTotalSupply * underlyingEthPrice);
};

export const useCTokensDataForRewards = (cTokenAddrs: string[]): CTokensDataForRewardsMap => {
  const { fuse } = useRari();
  const { data: cTokensMap } = useQuery(['CTokensDataForRewards', ...cTokenAddrs], async () => {
    const _map: CTokensDataForRewardsMap = {};
    await Promise.all(
      cTokenAddrs.map(async (cTokenAddr) => {
        const cTokenInstance = createCToken(cTokenAddr, fuse);
        const underlying = await cTokenInstance.callStatic.underlying();
        await cTokenInstance.callStatic.decimals();
        const cTokenTotalSupply = await cTokenInstance.callStatic.totalSupply();

        const exchangeRateCurrent = await cTokenInstance.callStatic.exchangeRateCurrent();

        const underlyingTotalSupply2 =
          (parseFloat(cTokenTotalSupply) * parseFloat(exchangeRateCurrent)) / 1e18;

        // const underlyingTotalSupply =
        //   parseFloat(
        //     toBN(cTokenTotalSupply).mul(toBN(exchangeRateCurrent)).toString()
        //   ) /
        //   10 ** 18;

        // console.log({
        //   cTokenAddr,
        //   cTokenTotalSupply,
        //   exchangeRateCurrent,
        //   underlyingTotalSupply2,
        // });

        const obj: CTokenDataForRewards = {
          underlyingToken: underlying,
          underlyingPrice: BigNumber.from(0),
          cToken: cTokenAddr,
          totalSupply: BigNumber.from(underlyingTotalSupply2.toString()) ?? BigNumber.from(0),
        };

        _map[cTokenAddr] = obj;

        return obj;
      })
    );
    return _map;
  });

  return cTokensMap ?? {};
};

// Fetches price from pool oracle then from Rari DAO MasterPriceOracle if fail
export const getPriceFromOracles = async (
  tokenAddress: string,
  comptroller: string,
  fuse: Fuse
) => {
  // Rari MPO
  const masterPriceOracle = createMasterPriceOracle(fuse);

  // Pool's MPO
  const comptrollerInstance = createComptroller(comptroller, fuse);
  const oracleAddress: string = await comptrollerInstance.callStatic.oracle();
  const oracleContract = createOracle(oracleAddress, fuse, 'MasterPriceOracle');

  let price;
  try {
    price = await oracleContract.callStatic.price(tokenAddress);
  } catch {
    price = await masterPriceOracle.callStatic.price(tokenAddress);
  }
  return price;
};

// Todo - handle situation where oracle cant find the price
// Todo 2 - make sure that you are always using the Fuse Pool's oracle and that the Fuse Pool's Oracle supports this asset
export const useAssetPricesInEth = (
  tokenAddresses: string[],
  comptroller: string
): TokenPrices | undefined => {
  const { fuse, coingeckoId } = useRari();

  createMasterPriceOracle(fuse);

  const tokensData = useTokensDataAsMap(tokenAddresses);
  const { data: usdPrice, isLoading, error } = useUSDPrice(coingeckoId);

  const { data } = useQuery(
    // TODO, can't we delete the Object.keys part?
    ['AssetPricesInEth', ...tokenAddresses, ...Object.keys(tokensData), usdPrice, isLoading, error],
    async () => {
      if ((!isLoading && !usdPrice) || error) throw new Error("Couldn't get USD price");
      if (isLoading || !usdPrice) return undefined;

      const tokenPricesInEth = await Promise.all(
        tokenAddresses.map(async (t) => await getPriceFromOracles(t, comptroller, fuse))
      );

      const tokenUSDPrices: number[] = [];

      // Calc usd prices
      for (let i = 0; i < tokenAddresses.length; i++) {
        const priceInEth = parseFloat(tokenPricesInEth[i]);
        if (!Object.keys(tokensData).length) return;
        const tokenData = tokensData[tokenAddresses[i]];
        const decimals = tokenData.decimals;

        const price = (priceInEth / 10 ** (decimals ?? 18)) * usdPrice;

        tokenUSDPrices.push(price);
      }

      // construct map
      const tokenPrices: {
        [x: string]: {
          ethPrice: number;
          usdPrice: number;
        };
      } = {};

      for (let i = 0; i < tokenAddresses.length; i++) {
        const tokenAddress = tokenAddresses[i];
        const usdPrice = tokenUSDPrices[i];
        const ethPrice = parseFloat(tokenPricesInEth[i]);
        tokenPrices[tokenAddress] = {
          ethPrice,
          usdPrice,
        };
      }

      return { tokenPrices, usdPrice };
    }
  );

  return data;
};
