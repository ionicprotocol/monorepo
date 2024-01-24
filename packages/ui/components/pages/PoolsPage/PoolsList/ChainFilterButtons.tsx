import type { ButtonGroupProps } from '@chakra-ui/react';
import { ButtonGroup, Flex, HStack, Img, Spinner, Text } from '@chakra-ui/react';
import type { SupportedChains } from '@ionicprotocol/types';

import { CButton } from '@ui/components/shared/Button';
import { RowBox } from '@ui/components/shared/IonicBox';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { ALL } from '@ui/constants/index';
import { useChainConfig, useEnabledChains } from '@ui/hooks/useChainConfig';

export const ChainFilterButtons = ({
  globalFilter,
  isLoading,
  loadingStatusPerChain,
  onFilter,
  props
}: {
  globalFilter: (SupportedChains | string)[];
  isLoading: boolean;
  loadingStatusPerChain: { [chainId: string]: boolean };
  onFilter: (filter: SupportedChains | string) => void;
  props?: ButtonGroupProps;
}) => {
  const enabledChains = useEnabledChains();

  return (
    <RowBox borderRadius={{ base: '12px' }} padding={{ base: '4px' }}>
      <ButtonGroup
        flexFlow={'row wrap'}
        gap={0}
        // isAttached
        justifyContent="flex-start"
        spacing={1}
        {...props}
      >
        <CButton
          borderRadius={{ base: '10px' }}
          disabled={isLoading}
          isSelected={globalFilter.includes(ALL)}
          onClick={() => onFilter(ALL)}
          p={0}
          variant="_filter"
        >
          <SimpleTooltip height="100%" label={'All Chains'}>
            <Flex alignItems="center" height="100%" justifyContent="center" width="100%">
              All
            </Flex>
          </SimpleTooltip>
        </CButton>
        {enabledChains.map((chainId) => {
          return (
            <ChainFilterButton
              chainId={chainId}
              globalFilter={globalFilter}
              isLoading={loadingStatusPerChain[chainId.toString()]}
              key={chainId}
              onFilter={onFilter}
            />
          );
        })}
      </ButtonGroup>
    </RowBox>
  );
};

const ChainFilterButton = ({
  chainId,
  onFilter,
  globalFilter,
  isLoading
}: {
  chainId: SupportedChains;
  globalFilter: (SupportedChains | string)[];
  isLoading: boolean;
  onFilter: (chainId: SupportedChains) => void;
}) => {
  const chainConfig = useChainConfig(chainId);

  return chainConfig ? (
    <CButton
      borderRadius={{ base: '10px' }}
      disabled={isLoading}
      isSelected={globalFilter.includes(chainId)}
      mx={'-1px'}
      onClick={() => onFilter(chainId)}
      px={{ '3xl': 2, base: 0 }}
      py={0}
      variant="_filter"
    >
      <SimpleTooltip height="100%" label={chainConfig.specificParams.metadata.shortName}>
        <HStack height="100%" justifyContent="center">
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
          <Text display={{ '3xl': 'block', base: 'none' }} pt="2px">
            {chainConfig.specificParams.metadata.shortName}
          </Text>
        </HStack>
      </SimpleTooltip>
    </CButton>
  ) : null;
};
