import { Divider } from '@chakra-ui/react';
import type { NativePricedFuseAsset } from '@midas-capital/types';
import { ComptrollerErrorCodes, CTokenErrorCodes } from '@midas-capital/types';
import type { BigNumber, ContractFunction } from 'ethers';

import { AdminFee } from '@ui/components/pages/EditPoolPage/AssetConfiguration/AssetSettings/AdminFee';
import { BorrowCapWhitelist } from '@ui/components/pages/EditPoolPage/AssetConfiguration/AssetSettings/BorrowCapWhitelist';
import { DebtCeilings } from '@ui/components/pages/EditPoolPage/AssetConfiguration/AssetSettings/DebtCeilings';
import { InterestRateModel } from '@ui/components/pages/EditPoolPage/AssetConfiguration/AssetSettings/InterestRateModel';
import { LoanToValue } from '@ui/components/pages/EditPoolPage/AssetConfiguration/AssetSettings/LoanToValue';
import { Plugin } from '@ui/components/pages/EditPoolPage/AssetConfiguration/AssetSettings/Plugin';
import { ReserveFactor } from '@ui/components/pages/EditPoolPage/AssetConfiguration/AssetSettings/ReserveFactor';
import { SupplyAndBorrowCaps } from '@ui/components/pages/EditPoolPage/AssetConfiguration/AssetSettings/SupplyAndBorrowCap';
import { SupplyCapWhitelist } from '@ui/components/pages/EditPoolPage/AssetConfiguration/AssetSettings/SupplyCapWhitelist';
import { ToggleBorrow } from '@ui/components/pages/EditPoolPage/AssetConfiguration/AssetSettings/ToggleBorrow';
import RemoveAssetButton from '@ui/components/pages/EditPoolPage/AssetConfiguration/RemoveAssetButton';
import { ConfigRow } from '@ui/components/shared/ConfigRow';
import { Column } from '@ui/components/shared/Flex';
import { useCTokenData } from '@ui/hooks/fuse/useCTokenData';
import type { TokenData } from '@ui/types/ComponentPropsType';

export async function testForCTokenErrorAndSend(
  txObjectStaticCall: ContractFunction, // for static calls
  txArgs: BigNumber | string,
  txObject: ContractFunction, // actual method
  failMessage: string
) {
  let response = await txObjectStaticCall(txArgs);

  if (response.toString() !== '0') {
    response = parseInt(response);
    let err;

    if (response >= 1000) {
      const comptrollerResponse = response - 1000;
      let msg = ComptrollerErrorCodes[comptrollerResponse];
      if (msg === 'BORROW_BELOW_MIN') {
        msg =
          'As part of our guarded launch, you cannot borrow less than 1 ETH worth of tokens at the moment.';
      }
      err = new Error(failMessage + ' Comptroller Error: ' + msg);
    } else {
      err = new Error(failMessage + ' CToken Code: ' + CTokenErrorCodes[response]);
    }

    // TODO CAPTURE WITH SENTRY

    throw err;
  }

  return txObject(txArgs);
}

interface AssetSettingsProps {
  assets: NativePricedFuseAsset[];
  comptrollerAddress: string;
  poolChainId: number;
  selectedAsset: NativePricedFuseAsset;
  setSelectedAsset: (value: NativePricedFuseAsset) => void;
  tokenData: TokenData;
}

export const AssetSettings = ({
  comptrollerAddress,
  selectedAsset,
  assets,
  poolChainId,
  setSelectedAsset,
}: AssetSettingsProps) => {
  const { cToken: cTokenAddress } = selectedAsset;
  const { data: cTokenData } = useCTokenData(comptrollerAddress, cTokenAddress, poolChainId);

  return (
    <Column
      crossAxisAlignment="flex-start"
      height="100%"
      mainAxisAlignment="flex-start"
      overflowY="auto"
      width="100%"
    >
      {cTokenData && (
        <>
          <SupplyAndBorrowCaps
            comptrollerAddress={comptrollerAddress}
            poolChainId={poolChainId}
            selectedAsset={selectedAsset}
          />

          <Divider />

          <SupplyCapWhitelist
            comptrollerAddress={comptrollerAddress}
            poolChainId={poolChainId}
            selectedAsset={selectedAsset}
          />

          <Divider />

          <BorrowCapWhitelist
            comptrollerAddress={comptrollerAddress}
            poolChainId={poolChainId}
            selectedAsset={selectedAsset}
          />

          <Divider />

          <DebtCeilings
            assets={assets}
            comptrollerAddress={comptrollerAddress}
            poolChainId={poolChainId}
            selectedAsset={selectedAsset}
          />

          <Divider />

          <ToggleBorrow
            comptrollerAddress={comptrollerAddress}
            poolChainId={poolChainId}
            selectedAsset={selectedAsset}
          />

          <Divider />

          <LoanToValue
            comptrollerAddress={comptrollerAddress}
            poolChainId={poolChainId}
            selectedAsset={selectedAsset}
          />

          <Divider />

          <ReserveFactor
            comptrollerAddress={comptrollerAddress}
            poolChainId={poolChainId}
            selectedAsset={selectedAsset}
          />

          <Divider />

          <AdminFee
            comptrollerAddress={comptrollerAddress}
            poolChainId={poolChainId}
            selectedAsset={selectedAsset}
          />

          <Divider />

          <Plugin poolChainId={poolChainId} selectedAsset={selectedAsset} />

          <Divider />

          <InterestRateModel
            comptrollerAddress={comptrollerAddress}
            poolChainId={poolChainId}
            selectedAsset={selectedAsset}
          />

          <ConfigRow>
            <RemoveAssetButton
              asset={selectedAsset}
              assets={assets}
              comptrollerAddress={comptrollerAddress}
              poolChainId={poolChainId}
              setSelectedAsset={setSelectedAsset}
            />
          </ConfigRow>
        </>
      )}
    </Column>
  );
};
