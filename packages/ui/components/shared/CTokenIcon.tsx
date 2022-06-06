import { Avatar, AvatarGroup, AvatarGroupProps, AvatarProps } from '@chakra-ui/avatar';
import { HStack, Skeleton, Text, useColorMode } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React from 'react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useRari } from '@ui/context/RariContext';
import { useTokenData } from '@ui/hooks/useTokenData';

export const CTokenIcon = ({
  address,
  withTooltip = true,
  withMotion = true,
  ...avatarProps
}: {
  address: string;
  withTooltip?: boolean;
  withMotion?: boolean;
} & Partial<AvatarProps>) => {
  const { addressIcons } = useRari();

  const { data: tokenData } = useTokenData(address);
  const { colorMode } = useColorMode();
  return (
    <motion.div whileHover={withMotion ? { scale: 1.2 } : undefined}>
      <SimpleTooltip label={tokenData?.symbol ?? 'Loading...'} isDisabled={!withTooltip}>
        <Avatar
          key={address}
          name={tokenData?.symbol ?? 'Loading...'}
          src={
            tokenData?.logoURL ||
            `https://d1912tcoux65lj.cloudfront.net/token/${addressIcons[
              address.toLowerCase()
            ].toLowerCase()}.png` ||
            (colorMode === 'light'
              ? '/images/help-circle-dark.svg'
              : '/images/help-circle-light.svg')
          }
          {...avatarProps}
        />
      </SimpleTooltip>
    </motion.div>
  );
};

export const TokenWithLabel = ({
  address,
  ...avatarProps
}: {
  address: string;
} & Partial<AvatarProps>) => {
  const { data: tokenData, isLoading } = useTokenData(address);
  const { colorMode } = useColorMode();

  return (
    <Skeleton isLoaded={!isLoading} width={'100%'}>
      <HStack>
        <Avatar
          key={address}
          name={tokenData?.symbol ?? 'Loading...'}
          src={
            tokenData?.logoURL ||
            (colorMode === 'light'
              ? '/images/help-circle-dark.svg'
              : '/images/help-circle-light.svg')
          }
          {...avatarProps}
        />
        {!tokenData && <Text>LOAD</Text>}
        <Text>{tokenData?.extraData?.shortName ?? tokenData?.symbol}</Text>
      </HStack>
    </Skeleton>
  );
};

export const CTokenAvatarGroup = ({
  tokenAddresses,
  popOnHover = false,
  ...avatarGroupProps
}: {
  tokenAddresses: string[];
  popOnHover: boolean;
} & Partial<AvatarGroupProps>) => {
  return (
    <AvatarGroup size="xs" max={30} {...avatarGroupProps}>
      {tokenAddresses.map((tokenAddress, index) => {
        return (
          <CTokenIcon
            key={index}
            address={tokenAddress}
            _hover={popOnHover ? { transform: 'scale(1.2)', zIndex: 5 } : undefined}
          />
        );
      })}
    </AvatarGroup>
  );
};
