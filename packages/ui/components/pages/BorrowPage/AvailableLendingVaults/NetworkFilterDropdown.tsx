import { SpinnerIcon } from '@chakra-ui/icons';
import type { AvatarProps, ButtonProps } from '@chakra-ui/react';
import {
  Avatar,
  AvatarGroup,
  Button,
  Checkbox,
  Flex,
  HStack,
  Icon,
  Img,
  Spinner,
  Text,
  VStack
} from '@chakra-ui/react';
import type { SupportedChains } from '@ionicprotocol/types';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';

import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { ALL_NETWORKS } from '@ui/constants/index';
import { useChainConfig, useEnabledChains } from '@ui/hooks/useChainConfig';
import { useColors } from '@ui/hooks/useColors';
import type { LendingNetworkFilter } from '@ui/types/ComponentPropsType';

export const NetworkFilterDropdown = ({
  loadingStatusPerChain,
  networkFilter,
  onNetworkFilter,
  props
}: {
  loadingStatusPerChain: { [chainId: string]: boolean };
  networkFilter: LendingNetworkFilter[];
  onNetworkFilter: (filter: LendingNetworkFilter) => void;
  props?: ButtonProps;
}) => {
  const { cIRow } = useColors();
  const enabledChains = useEnabledChains();
  const chainFilter = networkFilter.filter((f) => f !== ALL_NETWORKS) as SupportedChains[];

  return (
    <Flex alignItems={'center'} bg={cIRow.bgColor} borderRadius="12px" justifyContent="center">
      <PopoverTooltip
        body={
          <VStack alignItems="flex-start">
            <Text>Select Networks</Text>
            <Checkbox
              isChecked={networkFilter.includes(ALL_NETWORKS)}
              onChange={() => onNetworkFilter(ALL_NETWORKS)}
            >
              All Networks
            </Checkbox>
            {enabledChains.map((chainId) => {
              return (
                <ChainFilterCheckbox
                  chainId={chainId}
                  isLoading={loadingStatusPerChain[chainId.toString()]}
                  key={chainId}
                  networkFilter={networkFilter}
                  onNetworkFilter={onNetworkFilter}
                />
              );
            })}
          </VStack>
        }
        popoverProps={{ placement: 'bottom-start', trigger: 'click' }}
      >
        <Button aria-label="Column Settings" px={4} py={2} {...props}>
          <HStack>
            {chainFilter.length === 0 ? (
              <Text>All Networks</Text>
            ) : chainFilter.length === 1 ? (
              <IconChainName
                chainId={chainFilter[0]}
                isLoading={loadingStatusPerChain[chainFilter[0].toString()]}
              />
            ) : (
              <>
                <AvatarGroup>
                  {chainFilter.map((chainId) => (
                    <ButtonContent
                      chainId={chainId}
                      key={chainId}
                      loadingStatusPerChain={loadingStatusPerChain}
                    />
                  ))}
                </AvatarGroup>
                <Text flexShrink={0} ml={'2px'}>
                  {chainFilter.length} Networks
                </Text>
              </>
            )}
            <Icon as={MdOutlineKeyboardArrowDown} color={'iWhite'} height={6} width={6} />
          </HStack>
        </Button>
      </PopoverTooltip>
    </Flex>
  );
};

const IconChainName = ({
  chainId,
  isLoading
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
  onNetworkFilter,
  networkFilter,
  isLoading
}: {
  chainId: SupportedChains;
  isLoading: boolean;
  networkFilter: (SupportedChains | string)[];
  onNetworkFilter: (chainId: SupportedChains) => void;
}) => {
  const chainConfig = useChainConfig(chainId);
  const isChecked = networkFilter.includes(chainId) || networkFilter.includes(ALL_NETWORKS);

  return chainConfig ? (
    <Checkbox isChecked={isChecked} onChange={() => onNetworkFilter(chainId)}>
      <IconChainName chainId={chainId} isLoading={isLoading} />
    </Checkbox>
  ) : null;
};

interface ButtonContentProps extends AvatarProps {
  chainId: SupportedChains;
  loadingStatusPerChain: { [chainId: string]: boolean };
}

const ButtonContent = ({ chainId, loadingStatusPerChain, ...avatarProps }: ButtonContentProps) => {
  const chainConfig = useChainConfig(chainId);

  return chainConfig ? (
    <SimpleTooltip label={chainConfig.specificParams.metadata.shortName}>
      <Avatar
        height="26px"
        icon={
          loadingStatusPerChain[chainId.toString()] ? (
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
