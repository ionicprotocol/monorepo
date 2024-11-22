import { useState, useEffect } from 'react';

import { formatEther } from 'viem';

import { Button } from '@ui/components/ui/button';
import { Checkbox } from '@ui/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { DROPDOWN } from '@ui/constants';

import ResultHandler from '../ResultHandler';

type ClaimDialogProps = {
  claimableTokens: bigint;
  totalTokens: bigint;
  loading: boolean;
  isDisabled: boolean;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  dropdownSelectedCampaign: number;
  claimAirdrop: () => void;
  claimPublicSale: () => void;
};

const ClaimDialog: React.FC<ClaimDialogProps> = ({
  claimableTokens,
  totalTokens,
  loading,
  isDisabled,
  dialogOpen,
  setDialogOpen,
  dropdownSelectedCampaign,
  claimAirdrop,
  claimPublicSale
}) => {
  const [agreement, setAgreement] = useState<boolean>(false);

  useEffect(() => {
    if (!dialogOpen) {
      setAgreement(false);
    }
  }, [dialogOpen]);

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
    >
      <DialogContent className="max-w-md p-8">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-xl font-semibold text-center">
            You can{' '}
            {dropdownSelectedCampaign !== DROPDOWN.PublicSale
              ? 'now instantly'
              : ''}{' '}
            claim{' '}
            {Number(formatEther(claimableTokens)).toLocaleString(undefined, {
              maximumFractionDigits: 2
            })}{' '}
            ION
          </DialogTitle>
          <DialogDescription className="text-sm opacity-90 text-center">
            {dropdownSelectedCampaign !== DROPDOWN.PublicSale
              ? 'To receive the full Airdrop amount, please wait till the end of the vesting period'
              : 'The rest of the tokens will be vested linearly.'}
          </DialogDescription>
        </DialogHeader>

        <ResultHandler isLoading={loading}>
          <div className="flex flex-col gap-6 mt-6">
            {dropdownSelectedCampaign !== DROPDOWN.PublicSale && (
              <div className="flex items-start space-x-3 px-2">
                <Checkbox
                  id="agreement"
                  checked={agreement}
                  onCheckedChange={(checked) =>
                    setAgreement(checked as boolean)
                  }
                  className="mt-1 h-4 w-4 data-[state=checked]:border-accent data-[state=checked]:bg-accent"
                />
                <label
                  htmlFor="agreement"
                  className="text-sm font-semibold leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I understand and agree to forfeit{' '}
                  {(
                    Number(formatEther(totalTokens)) -
                    Number(formatEther(claimableTokens))
                  ).toLocaleString(undefined, {
                    maximumFractionDigits: 2
                  })}{' '}
                  vested $ION, in favour of instantly receiving tokens now
                </label>
              </div>
            )}

            <Button
              className="w-full bg-accent hover:bg-accent/90 text-darkone disabled:opacity-40 py-4 text-base"
              disabled={
                isDisabled ||
                (dropdownSelectedCampaign !== DROPDOWN.PublicSale && !agreement)
              }
              onClick={() => {
                if (dropdownSelectedCampaign === DROPDOWN.AirdropSZN1) {
                  claimAirdrop();
                }
                if (dropdownSelectedCampaign === DROPDOWN.PublicSale) {
                  claimPublicSale();
                }
              }}
            >
              {dropdownSelectedCampaign !== DROPDOWN.PublicSale && 'Instant'}{' '}
              Claim
            </Button>
          </div>
        </ResultHandler>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimDialog;
