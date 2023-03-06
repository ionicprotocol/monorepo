import { Avatar, AvatarProps } from '@chakra-ui/avatar';
import { SpinnerIcon } from '@chakra-ui/icons';
import { Icon, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { RiCheckboxBlankCircleFill } from 'react-icons/ri';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useTokenData } from '@ui/hooks/useTokenData';

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
            ) : undefined
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
