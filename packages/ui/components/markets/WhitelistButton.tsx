'use client';

import { Button } from '@ui/components/ui/button';
import { useVeIONContext } from '@ui/context/VeIonContext';

interface WhitelistButtonProps {
  className?: string;
}

export function WhitelistButton({ className = '' }: WhitelistButtonProps) {
  const { emissions } = useVeIONContext();
  const { isUserBlacklisted, whitelistUser } = emissions;

  if (!isUserBlacklisted) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={whitelistUser.execute}
      disabled={
        whitelistUser.isPending ||
        whitelistUser.isSimulating ||
        !whitelistUser.canWhitelist
      }
      className={`ml-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 border-red-900/50 ${className}`}
    >
      {whitelistUser.isPending
        ? 'Whitelisting...'
        : whitelistUser.isSimulating
          ? 'Checking...'
          : 'Whitelist'}
    </Button>
  );
}
