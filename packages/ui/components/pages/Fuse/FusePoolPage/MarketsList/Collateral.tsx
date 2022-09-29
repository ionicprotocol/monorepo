import { Switch } from '@chakra-ui/react';
import { ContractTransaction } from 'ethers';
import LogRocket from 'logrocket';
import * as React from 'react';

import { Row } from '@ui/components/shared/Flex';
import { SwitchCSS } from '@ui/components/shared/SwitchCSS';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useIsMobile } from '@ui/hooks/useScreenSize';
import { useErrorToast, useInfoToast } from '@ui/hooks/useToast';
import { MarketData } from '@ui/types/TokensDataMap';
import { errorCodeToMessage } from '@ui/utils/errorCodeToMessage';

export const Collateral = ({
  asset,
  comptrollerAddress,
}: {
  asset: MarketData;
  comptrollerAddress: string;
}) => {
  const { currentSdk, setPendingTxHash } = useMultiMidas();
  const errorToast = useErrorToast();
  const infoToast = useInfoToast();

  const { cSwitch } = useColors();
  const isMobile = useIsMobile();

  const onToggleCollateral = async () => {
    if (!currentSdk) return;

    const comptroller = currentSdk.createComptroller(comptrollerAddress);

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

    setPendingTxHash(call.hash);

    LogRocket.track('Fuse-ToggleCollateral');
  };
  return (
    <Row mainAxisAlignment="center" crossAxisAlignment="center">
      <SwitchCSS symbol={asset.underlyingSymbol.replace(/[\s+()]/g, '')} color={cSwitch.bgColor} />
      <Switch
        isChecked={asset.membership}
        className={'switch-' + asset.underlyingSymbol.replace(/[\s+()]/g, '')}
        onChange={onToggleCollateral}
        size={isMobile ? 'sm' : 'md'}
        cursor={'pointer'}
        ml={4}
      />
    </Row>
  );
};
