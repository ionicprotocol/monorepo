import { Divider } from '@chakra-ui/react';
import {
  ComptrollerErrorCodes,
  CTokenErrorCodes,
  NativePricedFuseAsset,
} from '@midas-capital/types';
import { BigNumber, ContractFunction } from 'ethers';

import { AdminFee } from './AdminFee';
import { DebtCeilings } from './DebtCeilings';
import { InterestRateModel } from './InterestRateModel';
import { LoanToValue } from './LoanToValue';
import { Plugin } from './Plugin';
import { ReserveFactor } from './ReserveFactor';
import { SupplyAndBorrowCaps } from './SupplyAndBorrowCap';
import { ToggleBorrow } from './ToggleBorrow';

import RemoveAssetButton from '@ui/components/pages/EditPoolPage/AssetConfiguration/RemoveAssetButton';
import { ConfigRow } from '@ui/components/shared/ConfigRow';
import { Column } from '@ui/components/shared/Flex';
import { useCTokenData } from '@ui/hooks/fuse/useCTokenData';
import { TokenData } from '@ui/types/ComponentPropsType';

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
  comptrollerAddress: string;
  selectedAsset: NativePricedFuseAsset;
  assets: NativePricedFuseAsset[];
  tokenData: TokenData;
  poolChainId: number;
  setSelectedAsset: (value: NativePricedFuseAsset) => void;
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
