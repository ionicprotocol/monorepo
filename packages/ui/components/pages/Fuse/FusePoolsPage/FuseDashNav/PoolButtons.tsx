import { Button, ButtonGroup, Grid, Icon } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { Dispatch } from 'react';
import { MdViewList, MdViewModule } from 'react-icons/md';

import { FilterButton, FilterIconButton } from '@ui/components/shared/Button';
import { useMidas } from '@ui/context/MidasContext';
import { useIsSmallScreen } from '@ui/hooks/useScreenSize';

export const PoolButtons = ({
  searchText,
  viewMode,
  setSearchText,
  setViewMode,
}: {
  searchText: string;
  viewMode: string;
  setSearchText: Dispatch<string>;
  setViewMode: Dispatch<string>;
}) => {
  const isAllPoolSelected = searchText === '';
  const isCreatedPoolSelected = searchText === 'created-pools';
  const isVerifiedPoolSelected = searchText === 'verified-pools';
  const isUnverifiedPoolSelected = searchText === 'unverified-pools';
  const router = useRouter();
  const isMobile = useIsSmallScreen();
  const { setLoading, currentChain } = useMidas();

  return (
    <ButtonGroup spacing={0} flexFlow={'row wrap'} justifyContent="center">
      {!isMobile && (
        <>
          <ButtonGroup
            mr={4}
            isAttached
            spacing={0}
            flexFlow={'row wrap'}
            justifyContent="center"
            mt={2}
          >
            <FilterIconButton
              aria-label="List View"
              variant="filter"
              isSelected={viewMode === 'list'}
              onClick={() => setViewMode('list')}
              icon={<Icon as={MdViewList} w={8} h={8} />}
            />
            <FilterIconButton
              aria-label="List View"
              variant="filter"
              isSelected={viewMode === 'card'}
              onClick={() => setViewMode('card')}
              icon={<Icon as={MdViewModule} w={8} h={8} />}
            />
          </ButtonGroup>
          <ButtonGroup
            isAttached
            spacing={0}
            flexFlow={'row wrap'}
            justifyContent="center"
            mx={4}
            mt={2}
          >
            <FilterButton
              isSelected={isAllPoolSelected}
              onClick={() => setSearchText('')}
              variant="filter"
            >
              All Pools
            </FilterButton>
            <FilterButton
              isSelected={isCreatedPoolSelected}
              onClick={() => setSearchText('created-pools')}
              variant="filter"
            >
              Created Pools
            </FilterButton>
            <FilterButton
              isSelected={isVerifiedPoolSelected}
              onClick={() => setSearchText('verified-pools')}
              variant="filter"
            >
              Verified Pools
            </FilterButton>
            <FilterButton
              isSelected={isUnverifiedPoolSelected}
              onClick={() => setSearchText('unverified-pools')}
              variant="filter"
            >
              Unverified Pools
            </FilterButton>
          </ButtonGroup>
        </>
      )}
      {isMobile && (
        <Grid
          templateColumns={{ base: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }}
          gap={2}
          mt={2}
          mr={2}
        >
          <FilterButton
            isSelected={isAllPoolSelected}
            onClick={() => setSearchText('')}
            variant="filter"
          >
            All Pools
          </FilterButton>
          <FilterButton
            isSelected={isCreatedPoolSelected}
            onClick={() => setSearchText('created-pools')}
            variant="filter"
          >
            Created Pools
          </FilterButton>
          <FilterButton
            isSelected={isVerifiedPoolSelected}
            onClick={() => setSearchText('verified-pools')}
            variant="filter"
          >
            Verified Pools
          </FilterButton>
          <FilterButton
            isSelected={isUnverifiedPoolSelected}
            onClick={() => setSearchText('unverified-pools')}
            variant="filter"
          >
            Unverified Pools
          </FilterButton>
        </Grid>
      )}
      <Button
        mt={2}
        onClick={() => {
          setLoading(true);
          router.push(`${currentChain.id}/create-pool`);
        }}
      >
        + Create Pool
      </Button>
    </ButtonGroup>
  );
};
