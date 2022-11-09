import { Switch } from '@chakra-ui/react';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import { ContractTransaction } from 'ethers';
import LogRocket from 'logrocket';
import * as React from 'react';

import { Row } from '@ui/components/shared/Flex';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useIsMobile } from '@ui/hooks/useScreenSize';
import { useErrorToast, useInfoToast } from '@ui/hooks/useToast';
import { MarketData } from '@ui/types/TokensDataMap';
import { errorCodeToMessage } from '@ui/utils/errorCodeToMessage';

export const Collateral = ({
  asset,
  comptrollerAddress,
  poolChainId,
}: {
  asset: MarketData;
  comptrollerAddress: string;
  poolChainId: number;
}) => {
  const { currentChain } = useMultiMidas();
  const sdk = useSdk(poolChainId);
  const errorToast = useErrorToast();
  const infoToast = useInfoToast();
  const isMobile = useIsMobile();
  const addRecentTransaction = useAddRecentTransaction();
  const queryClient = useQueryClient();

  const onToggleCollateral = async () => {
    if (!sdk) return;

    const comptroller = sdk.createComptroller(comptrollerAddress);

    let call: ContractTransaction;
    if (asset.membership) {
      const exitCode = await comptroller.callStatic.exitMarket(asset.cToken);
      if (!exitCode.eq(0)) {
        infoToast({
          title: 'Cannot Remove Collateral',
          description: errorCodeToMessage(exitCode.toNumber()),
        });
        return;
      }
      call = await comptroller.exitMarket(asset.cToken);
    } else {
      call = await comptroller.enterMarkets([asset.cToken]);
    }

    if (!call) {
      if (asset.membership) {
        errorToast({
          title: 'Error! Code: ' + call,
          description:
            'You cannot disable this asset as collateral as you would not have enough collateral posted to keep your borrow. Try adding more collateral of another type or paying back some of your debt.',
        });
      } else {
        errorToast({
          title: 'Error! Code: ' + call,
          description: 'You cannot enable this asset as collateral at this time.',
        });
      }

      return;
    }

    addRecentTransaction({ hash: call.hash, description: 'Toggle collateral' });
    await call.wait();
    await queryClient.refetchQueries();

    LogRocket.track('Fuse-ToggleCollateral');
  };
  return (
    <Row mainAxisAlignment="center" crossAxisAlignment="center">
      <Switch
        isChecked={asset.membership}
        onChange={onToggleCollateral}
        size={isMobile ? 'sm' : 'md'}
        cursor={'pointer'}
        ml={4}
        isDisabled={!currentChain || currentChain.unsupported || currentChain.id !== poolChainId}
      />
    </Row>
  );
};
