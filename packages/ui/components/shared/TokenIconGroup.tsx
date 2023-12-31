import type { AvatarGroupProps } from '@chakra-ui/avatar';
import { AvatarGroup } from '@chakra-ui/avatar';

import { TokenIcon } from '@ui/components/shared/TokenIcon';

interface TokenIconGroupProps extends Partial<AvatarGroupProps> {
  chainId: number;
  popOnHover: boolean;
  tokenAddresses: string[];
}
export const TokenIconGroup = ({
  tokenAddresses,
  popOnHover = false,
  chainId,
  ...avatarGroupProps
}: TokenIconGroupProps) => {
  return (
    <AvatarGroup max={30} size="xs" {...avatarGroupProps}>
      {tokenAddresses.map((tokenAddress, index) => {
        return (
          <TokenIcon
            _hover={popOnHover ? { transform: 'scale(1.2)', zIndex: 5 } : undefined}
            address={tokenAddress}
            chainId={chainId}
            key={index}
          />
        );
      })}
    </AvatarGroup>
  );
};
