import { Button, Flex, HStack, Text } from '@chakra-ui/react';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import type { ContractTransaction } from 'ethers';
import { useState } from 'react';

import { Banner } from '@ui/components/shared/Banner';
import { IonicModal } from '@ui/components/shared/Modal';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useBorrowLimitTotal } from '@ui/hooks/useBorrowLimitTotal';
import { useErrorToast } from '@ui/hooks/useToast';
import { useTokenData } from '@ui/hooks/useTokenData';
import type { MarketData } from '@ui/types/TokensDataMap';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { errorCodeToMessage } from '@ui/utils/errorCodeToMessage';
import { handleGenericError } from '@ui/utils/errorHandling';

interface CollateralModalProps {
  asset: MarketData;
  assets: MarketData[];
  comptrollerAddress: string;
  isOpen: boolean;
  onClose: () => void;
  poolChainId: number;
}

export const CollateralModal = ({
  isOpen,
  asset,
  assets,
  comptrollerAddress,
  onClose,
  poolChainId
}: CollateralModalProps) => {
  const { currentSdk, address } = useMultiIonic();
  const addRecentTransaction = useAddRecentTransaction();

  const errorToast = useErrorToast();
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);

  const [isLoading, setIsLoading] = useState(false);

  const { data: borrowLimitTotal } = useBorrowLimitTotal(assets, poolChainId);

  const otherAssets = assets.filter((_asset) => _asset.cToken !== asset.cToken);

  const updatedAssets = [...otherAssets, { ...asset, membership: !asset.membership }];
  const { data: updatedBorrowLimitTotal } = useBorrowLimitTotal(updatedAssets, poolChainId);

  const queryClient = useQueryClient();

  const onConfirm = async () => {
    if (!currentSdk || !address) return;

    try {
      setIsLoading(true);

      const comptroller = currentSdk.createComptroller(comptrollerAddress, currentSdk.signer);

      let call: ContractTransaction;

      if (asset.membership) {
        const exitCode = await comptroller.callStatic.exitMarket(asset.cToken);

        if (!exitCode.eq(0)) {
          throw { message: errorCodeToMessage(exitCode.toNumber()) };
        }
        call = await comptroller.exitMarket(asset.cToken);
      } else {
        call = await comptroller.enterMarkets([asset.cToken]);
      }

      if (!call) {
        if (asset.membership) {
          errorToast({
            description:
              'You cannot disable this asset as collateral as you would not have enough collateral posted to keep your borrow. Try adding more collateral of another type or paying back some of your debt.',
            id: 'Disabling collateral - ' + Math.random().toString(),
            title: 'Error! Code: ' + call
          });
        } else {
          errorToast({
            description: 'You cannot enable this asset as collateral at this time.',
            id: 'Enabling collateral - ' + Math.random().toString(),
            title: 'Error! Code: ' + call
          });
        }

        return;
      }

      addRecentTransaction({ description: 'Toggle collateral', hash: call.hash });

      await call.wait();
      await queryClient.refetchQueries();
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        token: asset.cToken
      };
      const sentryInfo = {
        contextName: 'Toggle collateral',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }

    setIsLoading(false);
  };

  return (
    <IonicModal
      body={
        <Flex
          alignItems="flex-start"
          direction={{ base: 'column' }}
          gap={{ base: '20px' }}
          justifyContent="flex-start"
        >
          <Banner
            alertProps={{ variant: 'warning' }}
            descriptions={[
              {
                text: `${
                  asset.membership ? 'Disabling' : 'Enabling'
                } this asset as collateral affecting your borrowing power`
              }
            ]}
          />
          <Flex justifyContent={'space-between'} width={'100%'}>
            <Text textTransform={'uppercase'}>Total Borrow Limit</Text>
            <HStack color={'iWhite'} spacing={2}>
              <Text>{smallUsdFormatter(borrowLimitTotal || 0)}</Text>
              <Text>{'➡'}</Text>
              <Text>{smallUsdFormatter(updatedBorrowLimitTotal || 0)}</Text>
            </HStack>
          </Flex>
          <Flex justifyContent={'space-between'} width={'100%'}>
            <Text textTransform={'uppercase'}>Borrow Limit Used</Text>
            <Text color={'iWhite'}>0% ➡ 0%</Text>
          </Flex>
          <Button isLoading={isLoading} onClick={onConfirm} variant={'green'} width="100%">
            {!asset.membership ? 'Enable' : 'Disable'} {asset.underlyingSymbol} as collateral
          </Button>
        </Flex>
      }
      header={
        <Text variant={'inherit'}>
          {!asset.membership ? 'Enable' : 'Disable'} {tokenData?.symbol || asset.underlyingSymbol}{' '}
          as Collateral
        </Text>
      }
      isOpen={isOpen}
      modalCloseButtonProps={{ hidden: isLoading }}
      onClose={onClose}
    />
  );
};
