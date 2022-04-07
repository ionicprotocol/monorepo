import { Avatar, AvatarGroup, AvatarGroupProps, AvatarProps } from '@chakra-ui/avatar';
import { Tooltip, useColorMode } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React from 'react';

import { useTokenData } from '@hooks/useTokenData';

export const CTokenIcon = ({
  address,
  ...avatarProps
}: {
  address: string;
} & Partial<AvatarProps>) => {
  const { data: tokenData } = useTokenData(address);
  const { colorMode } = useColorMode();
  return (
    <motion.div whileHover={{ scale: 1.2 }}>
      <Tooltip label={tokenData?.symbol ?? 'Loading...'}>
        <Avatar
          {...avatarProps}
          key={address}
          bg={'transparent'}
          borderWidth="1px"
          name={tokenData?.symbol ?? 'Loading...'}
          borderColor={'transparent'}
          src={
            tokenData?.logoURL ||
            (colorMode === 'light'
              ? '/images/help-circle-dark.svg'
              : '/images/help-circle-light.svg')
          }
        />
      </Tooltip>
    </motion.div>
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
      {tokenAddresses.map((tokenAddress) => {
        return (
          <CTokenIcon
            key={tokenAddress}
            address={tokenAddress}
            _hover={popOnHover ? { transform: 'scale(1.2)', zIndex: 5 } : undefined}
          />
        );
      })}
    </AvatarGroup>
  );
};
