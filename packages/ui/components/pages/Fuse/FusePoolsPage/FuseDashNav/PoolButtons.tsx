import { Button, ButtonGroup } from '@chakra-ui/react';
import { useRouter } from 'next/router';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const PoolButtons = () => {
  const router = useRouter();
  const { setGlobalLoading, currentChain } = useMultiMidas();

  return (
    <ButtonGroup spacing={0} flexFlow={'row wrap'} justifyContent="center">
      {/* {!isMobile && (
        <ButtonGroup
          isAttached
          spacing={0}
          flexFlow={'row wrap'}
          justifyContent="center"
          mx={4}
          mt={2}
          hidden
        >
          <CButton
            isSelected={isAllPoolSelected}
            onClick={() => setSearchText('')}
            variant="filter"
          >
            All Pools
          </CButton>
          <CButton
            isSelected={isCreatedPoolSelected}
            onClick={() => setSearchText('created-pools')}
            variant="filter"
          >
            Created Pools
          </CButton>
          <CButton
            isSelected={isVerifiedPoolSelected}
            onClick={() => setSearchText('verified-pools')}
            variant="filter"
          >
            Verified Pools
          </CButton>
          <CButton
            isSelected={isUnverifiedPoolSelected}
            onClick={() => setSearchText('unverified-pools')}
            variant="filter"
          >
            Unverified Pools
          </CButton>
        </ButtonGroup>
      )}
      {isMobile && (
        <Grid
          templateColumns={{ base: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }}
          gap={2}
          mt={2}
          mr={2}
          hidden
        >
          <CButton
            isSelected={isAllPoolSelected}
            onClick={() => setSearchText('')}
            variant="filter"
          >
            All Pools
          </CButton>
          <CButton
            isSelected={isCreatedPoolSelected}
            onClick={() => setSearchText('created-pools')}
            variant="filter"
          >
            Created Pools
          </CButton>
          <CButton
            isSelected={isVerifiedPoolSelected}
            onClick={() => setSearchText('verified-pools')}
            variant="filter"
          >
            Verified Pools
          </CButton>
          <CButton
            isSelected={isUnverifiedPoolSelected}
            onClick={() => setSearchText('unverified-pools')}
            variant="filter"
          >
            Unverified Pools
          </CButton>
        </Grid>
      )} */}
      <Button
        mt={2}
        onClick={() => {
          if (currentChain && !currentChain.unsupported) {
            setGlobalLoading(true);
            router.push(`${currentChain.id}/create-pool`);
          }
        }}
        isDisabled={!currentChain || currentChain.unsupported}
      >
        + Create Pool
      </Button>
    </ButtonGroup>
  );
};
