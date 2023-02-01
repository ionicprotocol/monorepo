import { AvatarGroup, AvatarGroupProps } from '@chakra-ui/avatar';

import { TokenIcon } from '@ui/components/shared/TokenIcon';

interface TokenIconGroupProps extends Partial<AvatarGroupProps> {
  tokenAddresses: string[];
  popOnHover: boolean;
  chainId: number;
}
export const TokenIconGroup = ({
  tokenAddresses,
  popOnHover = false,
  chainId,
  ...avatarGroupProps
}: TokenIconGroupProps) => {
  return (
    <AvatarGroup size="xs" max={30} {...avatarGroupProps}>
      {tokenAddresses.map((tokenAddress, index) => {
        return (
          <TokenIcon
            key={index}
            address={tokenAddress}
            chainId={chainId}
            _hover={popOnHover ? { transform: 'scale(1.2)', zIndex: 5 } : undefined}
          />
        );
      })}
    </AvatarGroup>
  );
};
