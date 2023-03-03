import { Avatar, AvatarProps } from '@chakra-ui/avatar';
import { SpinnerIcon } from '@chakra-ui/icons';
import { Icon, IconProps, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { RiCheckboxBlankCircleFill } from 'react-icons/ri';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useTokenData } from '@ui/hooks/useTokenData';

type PlaceholderIconProps = IconProps;

const PlaceholderIcon = ({ color, ...restOfProps }: PlaceholderIconProps) => {
  return (
    <Icon
      fill="none"
      height="24"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
      {...restOfProps}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
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
  const iconColor = useColorModeValue('#A0AEC0', '#4A5568');
  const { data: tokenData, isLoading } = useTokenData(address, chainId);

  return (
    <motion.div whileHover={withMotion ? { scale: 1.2 } : undefined}>
      <SimpleTooltip isDisabled={!withTooltip} label={tokenData?.symbol || address}>
        <Avatar
          borderRadius={0}
          icon={
            isLoading ? (
              <SpinnerIcon boxSize={'85%'} color={iconColor} opacity={0.3} />
            ) : !tokenData?.logoURL ? (
              <Icon as={RiCheckboxBlankCircleFill} boxSize="120%" color={iconColor} size="120%" />
            ) : (
              <PlaceholderIcon boxSize={'100%'} color={iconColor} />
            )
          }
          name={
            isLoading || !tokenData?.logoURL
              ? undefined
              : tokenData?.name
              ? tokenData.name
              : address
          }
          src={tokenData?.logoURL}
          {...avatarProps}
        />
      </SimpleTooltip>
    </motion.div>
  );
};
