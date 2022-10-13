import { Avatar, AvatarProps } from '@chakra-ui/avatar';
import { SpinnerIcon } from '@chakra-ui/icons';
import { Icon, IconProps, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useCallback } from 'react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useTokenData } from '@ui/hooks/useTokenData';

type PlaceholderIconProps = IconProps;

const PlaceholderIcon = ({ color, ...restOfProps }: PlaceholderIconProps) => {
  return (
    <Icon
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...restOfProps}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </Icon>
  );
};

interface TokenIconProps extends AvatarProps {
  address: string;
  chainId: number;
  withTooltip?: boolean;
  withMotion?: boolean;
}
export const TokenIcon = ({
  address,
  chainId,
  withTooltip = true,
  withMotion = true,
  ...avatarProps
}: TokenIconProps) => {
  const iconColor = useColorModeValue('#333', '#ddd');
  const { data: tokenData, isLoading } = useTokenData(address, chainId);

  return (
    <motion.div whileHover={withMotion ? { scale: 1.2 } : undefined}>
      <SimpleTooltip label={tokenData?.symbol || address} isDisabled={!withTooltip}>
        <Avatar
          name={isLoading ? undefined : tokenData?.name ? tokenData.name : address}
          icon={
            isLoading ? (
              <SpinnerIcon boxSize={'85%'} color={iconColor} opacity={0.3} />
            ) : (
              <PlaceholderIcon boxSize={'100%'} color={iconColor} />
            )
          }
          src={tokenData?.logoURL}
          {...avatarProps}
        />
      </SimpleTooltip>
    </motion.div>
  );
};
