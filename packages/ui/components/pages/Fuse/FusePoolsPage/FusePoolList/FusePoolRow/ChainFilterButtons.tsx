import type { ButtonGroupProps } from '@chakra-ui/react';
import { ButtonGroup, HStack, Img, Spinner, Text } from '@chakra-ui/react';
import type { SupportedChains } from '@midas-capital/types';

import { CButton } from '@ui/components/shared/Button';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { ALL } from '@ui/constants/index';
import { useChainConfig, useEnabledChains } from '@ui/hooks/useChainConfig';
import type { PoolsPerChainStatus } from '@ui/types/ComponentPropsType';

export const ChainFilterButtons = ({
  isLoading,
  globalFilter,
  onFilter,
  poolsPerChain,
  props,
}: {
  globalFilter: (SupportedChains | string)[];
  isLoading: boolean;
  onFilter: (filter: SupportedChains | string) => void;
  poolsPerChain: PoolsPerChainStatus;
  props?: ButtonGroupProps;
}) => {
  const enabledChains = useEnabledChains();

  return (
    <ButtonGroup
      flexFlow={'row wrap'}
      gap={0}
      isAttached
      justifyContent="flex-start"
      spacing={0}
      {...props}
    >
      <CButton
        disabled={isLoading}
        isSelected={globalFilter.includes(ALL)}
        onClick={() => onFilter(ALL)}
        p={0}
        variant="filter"
      >
        <SimpleTooltip height="100%" label={'All Chains'} px={4}>
          <HStack height="100%" justifyContent="center" px={4}>
            <Text>All</Text>
          </HStack>
        </SimpleTooltip>
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

  return chainConfig ? (
    <CButton
      disabled={isLoading}
      isSelected={globalFilter.includes(chainId)}
      mx={'-1px'}
      onClick={() => onFilter(chainId)}
      p={0}
      variant="filter"
    >
      <SimpleTooltip height="100%" label={chainConfig.specificParams.metadata.shortName} px={4}>
        <HStack height="100%" justifyContent="center" px={4}>
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
          <Text display={{ '2xl': 'block', base: 'none' }} pt="2px">
            {chainConfig.specificParams.metadata.shortName}
          </Text>
        </HStack>
      </SimpleTooltip>
    </CButton>
  ) : null;
};
