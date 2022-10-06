import { SupportedChains } from '@midas-capital/types';
import { SortingState } from '@tanstack/react-table';
import { useEffect, useRef, useState } from 'react';

import PoolsRowList from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/index';
import { AlertHero } from '@ui/components/shared/Alert';
import {
  ALL,
  MIDAS_POOL_FILTER,
  MIDAS_POOL_SEARCH,
  MIDAS_POOL_SORT_DESC,
  MIDAS_POOL_SORT_ID,
} from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useCrossFusePools } from '@ui/hooks/fuse/useFusePools';
import { useEnabledChains } from '@ui/hooks/useChainConfig';
import { Err } from '@ui/types/ComponentPropsType';

const FusePoolList = () => {
  const enabledChains = useEnabledChains();
  const { isLoading, poolsPerChain, error } = useCrossFusePools([...enabledChains]);
  const [err, setErr] = useState<Err | undefined>(error as Err);
  const mounted = useRef(false);
  const [preSearchText, setPreSearchText] = useState<string | undefined>(undefined);
  const [preFilter, setPreFilter] = useState<(string | SupportedChains)[] | undefined>(undefined);
  const [preSorting, setPreSorting] = useState<SortingState | undefined>(undefined);
  const { address } = useMultiMidas();

  useEffect(() => {
    setErr(error as Err);
  }, [error]);

  useEffect(() => {
    mounted.current = true;

    let _initSearch = localStorage.getItem(MIDAS_POOL_SEARCH);
    _initSearch = _initSearch ? _initSearch : '';
    const filterItem = localStorage.getItem(MIDAS_POOL_FILTER);
    const _initFilter = filterItem
      ? (JSON.parse(filterItem) as (string | SupportedChains)[])
      : [ALL];
    let _initSortId = localStorage.getItem(MIDAS_POOL_SORT_ID);
    _initSortId = _initSortId ? _initSortId : address ? 'supplyBalance' : 'totalSupplied';
    const _initSortDesc = localStorage.getItem(MIDAS_POOL_SORT_DESC);
    const initSortDesc = _initSortDesc && _initSortDesc === 'true' ? true : false;

    if (mounted.current) {
      setPreSearchText(_initSearch);
      setPreFilter(_initFilter);
      setPreSorting([{ id: _initSortId, desc: initSortDesc }]);
    }

    return () => {
      mounted.current = false;
    };
  }, [address]);

  if (err && err.code !== 'NETWORK_ERROR') {
    return (
      <AlertHero
        status="warning"
        variant="subtle"
        title={err.reason ? err.reason : 'Unexpected Error'}
        description="Unable to retrieve Pools. Please try again later."
      />
    );
  }

  return preSearchText !== undefined && preFilter !== undefined && preSorting !== undefined ? (
    <PoolsRowList
      poolsPerChain={poolsPerChain}
      isLoading={isLoading}
      preFilter={preFilter}
      preSearchText={preSearchText}
      preSorting={preSorting}
    />
  ) : null;
};

export default FusePoolList;
