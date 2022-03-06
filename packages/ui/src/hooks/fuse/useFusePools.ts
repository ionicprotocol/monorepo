import { filterOnlyObjectProperties, Fuse } from '@midas-capital/sdk';
import { BigNumber } from 'ethers';
import FuseJS from 'fuse.js';
import { useMemo } from 'react';
import { useQuery } from 'react-query';

import { NATIVE_TOKEN_DATA } from '@constants/networkData';
import { useRari } from '@context/RariContext';
import { fetchCoinGeckoPrice } from '@utils/coingecko';
import { formatDateToDDMMYY } from '@utils/dateUtils';
import { blockNumberToTimeStamp } from '@utils/web3utils';

interface LensFusePool {
  blockPosted: string;
  name: string;
  creator: string;
  comptroller: string;
  timestampPosted: string;
}

interface LensFusePoolData {
  totalBorrow: string;
  totalSupply: string;
  underlyingSymbols: string[];
  underlyingTokens: string[];
  whitelistedAdmin: boolean;
}

export type LensPoolsWithData = [
  ids: string[],
  fusePools: LensFusePool[],
  fusePoolsData: LensFusePoolData[],
  errors: boolean[]
];

export interface MergedPool extends LensFusePoolData, LensFusePool {
  id: number;
  suppliedUSD: number;
  borrowedUSD: number;
}

const poolSort = (pools: MergedPool[]) => {
  return pools.sort((a, b) => {
    if (b.suppliedUSD > a.suppliedUSD) {
      return 1;
    }

    if (b.suppliedUSD < a.suppliedUSD) {
      return -1;
    }

    // They're equal, let's sort by pool number:
    return b.id > a.id ? 1 : -1;
  });
};

const mergePoolData = (data: LensPoolsWithData, nativeAssetPriceInUSD: number): MergedPool[] => {
  const [ids, fusePools, fusePoolsData] = data;

  return ids.map((_id, i) => {
    const id = parseFloat(ids[i]);
    const fusePool = fusePools[i];
    const fusePoolData = fusePoolsData[i];

    return {
      id,
      suppliedUSD: (parseFloat(fusePoolData.totalSupply) / 1e18) * nativeAssetPriceInUSD,
      borrowedUSD: (parseFloat(fusePoolData.totalBorrow) / 1e18) * nativeAssetPriceInUSD,
      ...filterOnlyObjectProperties(fusePool),
      ...filterOnlyObjectProperties(fusePoolData),
    };
  });
};

export const fetchPoolsManual = async ({
  fuse,
  address,
  verification = false,
}: {
  fuse: Fuse;
  address: string;
  verification?: boolean;
}) => {
  // Query Directory
  const fusePoolsDirectoryResult =
    await fuse.contracts.FusePoolDirectory.callStatic.getPublicPoolsByVerification(verification, {
      from: address,
    });

  // Extract data from Directory call
  const ids: string[] = (fusePoolsDirectoryResult[0] ?? []).map((bn: BigNumber) => bn.toString());
  const fusePools: LensFusePool[] = fusePoolsDirectoryResult[1];
  const comptrollers = fusePools.map(({ comptroller }) => comptroller);
  // Query lens.getPoolSummary
  const fusePoolsData: LensFusePoolData[] = await Promise.all(
    comptrollers.map(async (comptroller) => {
      const _data = await fuse.contracts.FusePoolLens.callStatic.getPoolSummary(comptroller);
      const data: LensFusePoolData = {
        totalSupply: _data[0],
        totalBorrow: _data[1],
        underlyingTokens: _data[2],
        underlyingSymbols: _data[3],
        whitelistedAdmin: _data[4],
      };
      return data;
    })
  ).catch((err) => {
    console.error('Error querying poolSummaries', err);
    return [];
  });

  const nativeAssetPriceInUSD = await fetchCoinGeckoPrice(
    NATIVE_TOKEN_DATA[fuse.chainId].coingeckoId
  );

  return mergePoolData([ids, fusePools, fusePoolsData, []], nativeAssetPriceInUSD);
};

export const fetchPools = async ({
  fuse,
  address,
  filter,
  blockNum,
}: {
  fuse: Fuse;
  address: string;
  filter: string | null;
  blockNum?: number;
}) => {
  const isCreatedPools = filter === 'created-pools';
  const isVerifiedPools = filter === 'verified-pools';
  const isUnverifiedPools = filter === 'unverified-pools';

  const latestBlockNumber = await fuse.provider.getBlockNumber();
  const _blockNum = blockNum ? blockNum : latestBlockNumber;

  // Get the unix timestamp of the blockNumber
  const startBlockTimestamp = await blockNumberToTimeStamp(fuse.provider, _blockNum);

  const ddMMYYYY = formatDateToDDMMYY(new Date(startBlockTimestamp * 1000));

  const nativeAssetPriceInUSD = blockNum
    ? await fetchCoinGeckoPrice(NATIVE_TOKEN_DATA[fuse.chainId].coingeckoId, ddMMYYYY)
    : await fetchCoinGeckoPrice(NATIVE_TOKEN_DATA[fuse.chainId].coingeckoId);

  const req = isCreatedPools
    ? fuse.contracts.FusePoolLens.callStatic.getPoolsByAccountWithData(address)
    : isVerifiedPools
    ? fuse.contracts.FusePoolLens.callStatic.getPublicPoolsByVerificationWithData(true)
    : isUnverifiedPools
    ? fuse.contracts.FusePoolLens.callStatic.getPublicPoolsByVerificationWithData(false)
    : // or else get all pools
      fuse.contracts.FusePoolLens.callStatic.getPublicPoolsWithData();

  const whitelistedPoolsRequest =
    fuse.contracts.FusePoolLens.callStatic.getWhitelistedPoolsByAccountWithData(address);

  const [pools, whitelistedPools] = await Promise.all([req, whitelistedPoolsRequest]).then(
    (responses) => responses.map((poolData) => mergePoolData(poolData, nativeAssetPriceInUSD))
  );

  return [...pools, ...whitelistedPools];
};

interface UseFusePoolsReturn {
  pools: MergedPool[] | undefined;
  filteredPools: MergedPool[];
  isLoading: boolean;
}

// returns impersonal data about fuse pools ( can filter by your supplied/created pools )
export const useFusePools = (
  filter: 'created-pools' | 'verified-pools' | 'unverified-pools' | string | null
): UseFusePoolsReturn => {
  const { fuse, address } = useRari();

  const isCreatedPools = filter === 'created-pools';
  const isVerifiedPools = filter === 'verified-pools';
  const isUnverifiedPools = filter === 'unverified-pools';
  const isAllPools = filter === '';
  const { isLoading, data: pools } = useQuery(
    address +
      ' fusePoolList' +
      (isCreatedPools || isVerifiedPools || isUnverifiedPools || isAllPools ? filter : ''),
    async () => {
      if (!filter) {
        return await fetchPoolsManual({
          fuse,
          address,
          verification: false,
        });
      }
      return await fetchPools({ fuse, address, filter });
    }
  );

  const filteredPools = useMemo(() => {
    if (!pools?.length) {
      return [];
    }

    if (!filter) {
      return poolSort(pools);
    }

    if (isCreatedPools || isAllPools) {
      return poolSort(pools);
    }

    const options = {
      keys: ['name', 'id', 'underlyingTokens', 'underlyingSymbols'],
      threshold: 0.3,
    };

    const filtered = new FuseJS(pools, options).search(filter);
    return poolSort(filtered.map((item) => item.item));
  }, [pools, filter, isCreatedPools, isAllPools]);

  return { pools, filteredPools, isLoading };
};
