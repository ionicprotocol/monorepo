import { ButtonGroup, HStack, Img, Spinner, Text } from '@chakra-ui/react';
import type { SupportedChains } from '@midas-capital/types';

import { CButton } from '@ui/components/shared/Button';
import { ALL } from '@ui/constants/index';
import { useChainConfig, useEnabledChains } from '@ui/hooks/useChainConfig';
import { useIsSmallScreen } from '@ui/hooks/useScreenSize';
import type { PoolsPerChainStatus } from '@ui/types/ComponentPropsType';

export const ChainFilterButtons = ({
  isLoading,
  globalFilter,
  onFilter,
  poolsPerChain,
}: {
  globalFilter: (SupportedChains | string)[];
  isLoading: boolean;
  onFilter: (filter: SupportedChains | string) => void;
  poolsPerChain: PoolsPerChainStatus;
}) => {
  const enabledChains = useEnabledChains();
  const isSmallScreen = useIsSmallScreen();

  return (
    <ButtonGroup flexFlow={'row wrap'} gap={0} isAttached justifyContent="flex-start" spacing={0}>
      <CButton
        disabled={isLoading}
        isSelected={globalFilter.includes(ALL)}
        onClick={() => onFilter(ALL)}
        px={4}
        variant="filter"
      >
        <Text>{isSmallScreen ? 'All' : 'All Chains'}</Text>
      </CButton>
      {enabledChains.map((chainId) => {
        return (
          <ChainFilterButton
            chainId={chainId}
            globalFilter={globalFilter}
            isLoading={poolsPerChain[chainId.toString()].isLoading}
            key={chainId}
            onFilter={onFilter}
          />
        );
      })}
    </ButtonGroup>
  );
};

const ChainFilterButton = ({
  chainId,
  onFilter,
  globalFilter,
  isLoading,
}: {
  chainId: SupportedChains;
  globalFilter: (SupportedChains | string)[];
  isLoading: boolean;
  onFilter: (chainId: SupportedChains) => void;
}) => {
  const chainConfig = useChainConfig(chainId);
  const isSmallScreen = useIsSmallScreen();

  return chainConfig ? (
    <CButton
      disabled={isLoading}
      isSelected={globalFilter.includes(chainId)}
      mx={'-1px'}
      onClick={() => onFilter(chainId)}
      px={4}
      variant="filter"
    >
      <HStack>
        {isLoading ? (
          <Spinner />
        ) : (
          <Img
            alt=""
            borderRadius="50%"
            height={6}
            src={chainConfig.specificParams.metadata.img}
            width={6}
          />
        )}
        {!isSmallScreen && <Text pt="2px">{chainConfig.specificParams.metadata.shortName}</Text>}
      </HStack>
    </CButton>
  ) : null;
};
