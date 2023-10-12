import { Grid, GridItem } from '@chakra-ui/react';
import type { LeveredPosition } from '@ionicprotocol/types';
import { useRouter } from 'next/router';
import { memo, useEffect, useMemo, useState } from 'react';

import Details from './details';
import { Info } from './info';
import { NewPosition } from './newPosition';

import PageLayout from '@ui/components/pages/Layout/PageLayout';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { usePositionsPerChain } from '@ui/hooks/leverage/usePositionsPerChain';
import { useEnabledChains } from '@ui/hooks/useChainConfig';

const NewPositionComp = memo(() => {
  const router = useRouter();

  const chainId = useMemo(
    () => (router.isReady ? (router.query.chainId as string) : ''),
    [router.isReady, router.query.chainId]
  );
  const collateral = useMemo(
    () => (router.isReady ? (router.query.collateral as string) : ''),
    [router.isReady, router.query.collateral]
  );
  const borrowable = useMemo(
    () => (router.isReady ? (router.query.borrowable as string) : ''),
    [router.isReady, router.query.borrowable]
  );

  const enabledChains = useEnabledChains();
  const { positionsPerChain } = usePositionsPerChain([...enabledChains]);
  const [position, setPosition] = useState<LeveredPosition>();

  useEffect(() => {
    if (chainId && collateral && borrowable) {
      const { data: positions } = positionsPerChain[chainId];
      const _position = positions?.find(
        (pos) => pos.collateral.cToken === collateral && pos.borrowable.cToken === borrowable
      );

      if (_position) {
        setPosition(_position);
      } else {
        setPosition(undefined);
      }
    }
  }, [chainId, collateral, borrowable, positionsPerChain]);

  return (
    <PageTransitionLayout>
      {position ? (
        <PageLayout>
          <Details position={position} />
          <Grid
            alignItems="stretch"
            gap={5}
            templateColumns={{
              base: 'repeat(1, 1fr)',
              lg: 'repeat(2, 1fr)'
            }}
            w="100%"
          >
            <GridItem>
              <NewPosition position={position} />
            </GridItem>
            <GridItem>
              <Info position={position} />
            </GridItem>
          </Grid>
        </PageLayout>
      ) : null}
    </PageTransitionLayout>
  );
});

export default NewPositionComp;
