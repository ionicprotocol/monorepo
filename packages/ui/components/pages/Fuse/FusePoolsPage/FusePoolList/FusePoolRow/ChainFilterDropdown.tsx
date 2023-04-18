import { SpinnerIcon } from '@chakra-ui/icons';
import type { AvatarProps, ButtonProps } from '@chakra-ui/react';
import {
  Avatar,
  AvatarGroup,
  Button,
  Checkbox,
  HStack,
  Img,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import type { SupportedChains } from '@midas-capital/types';

import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { ALL, SEARCH } from '@ui/constants/index';
import { useChainConfig, useEnabledChains } from '@ui/hooks/useChainConfig';
import type { PoolsPerChainStatus } from '@ui/types/ComponentPropsType';

export const ChainFilterDropdown = ({
  globalFilter,
  isLoading,
  onFilter,
  poolsPerChain,
  props,
}: {
  globalFilter: (SupportedChains | string)[];
  isLoading: boolean;
  onFilter: (filter: SupportedChains | string) => void;
  poolsPerChain: PoolsPerChainStatus;
  props: ButtonProps;
}) => {
  const enabledChains = useEnabledChains();
  const chainFilter = globalFilter.filter((f) => f !== SEARCH && f !== ALL) as SupportedChains[];

  return (
    <PopoverTooltip
      body={
        <VStack alignItems="flex-start">
          <Text>Select Chains</Text>
          <Checkbox
            isChecked={globalFilter.includes(ALL)}
            isDisabled={isLoading}
            onChange={() => onFilter(ALL)}
          >
            All Chains
          </Checkbox>

          {enabledChains.map((chainId) => {
            return (
              <ChainFilterCheckbox
                chainId={chainId}
                globalFilter={globalFilter}
                isLoading={poolsPerChain[chainId.toString()].isLoading}
                key={chainId}
                onFilter={onFilter}
              />
            );
          })}
        </VStack>
      }
      popoverProps={{ placement: 'bottom-start', trigger: 'click' }}
    >
      <Button aria-label="Column Settings" height={12} px={2} variant="_outline" {...props}>
        {chainFilter.length === 0 ? (
          'All Chains'
        ) : chainFilter.length === 1 ? (
          <IconChainName
            chainId={chainFilter[0]}
            isLoading={poolsPerChain[chainFilter[0].toString()].isLoading}
          />
        ) : (
          <>
            <AvatarGroup>
              {chainFilter.map((chainId) => (
                <ButtonContent chainId={chainId} key={chainId} poolsPerChain={poolsPerChain} />
              ))}
            </AvatarGroup>
            <Text flexShrink={0} ml={2}>
              {chainFilter.length} Chains
            </Text>
          </>
        )}
      </Button>
    </PopoverTooltip>
  );
};

const IconChainName = ({
  chainId,
  isLoading,
}: {
  chainId: SupportedChains;
  isLoading: boolean;
}) => {
  const chainConfig = useChainConfig(chainId);

  return chainConfig ? (
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
      <Text pt="2px">{chainConfig.specificParams.metadata.shortName}</Text>
    </HStack>
  ) : null;
};

const ChainFilterCheckbox = ({
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
  const isChecked = globalFilter.includes(chainId) || globalFilter.includes(ALL);

  return chainConfig ? (
    <Checkbox isChecked={isChecked} onChange={() => onFilter(chainId)}>
      <IconChainName chainId={chainId} isLoading={isLoading} />
    </Checkbox>
  ) : null;
};

interface ButtonContentProps extends AvatarProps {
  chainId: SupportedChains;
  poolsPerChain: PoolsPerChainStatus;
}

const ButtonContent = ({ chainId, poolsPerChain, ...avatarProps }: ButtonContentProps) => {
  const chainConfig = useChainConfig(chainId);

  return chainConfig ? (
    <SimpleTooltip label={chainConfig.specificParams.metadata.shortName}>
      <Avatar
        height="26px"
        icon={
          poolsPerChain[chainId.toString()].isLoading ? (
            <SpinnerIcon boxSize={'85%'} opacity={0.3} />
          ) : undefined
        }
        name={chainConfig.specificParams.metadata.shortName}
        src={chainConfig.specificParams.metadata.img}
        width="26px"
        {...avatarProps}
      />
    </SimpleTooltip>
  ) : null;
};
