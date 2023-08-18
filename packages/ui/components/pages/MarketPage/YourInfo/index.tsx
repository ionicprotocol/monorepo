import { Button, Center, Divider, Flex, Skeleton, Text, useDisclosure } from '@chakra-ui/react';
import { utils } from 'ethers';
import { useEffect, useState } from 'react';

import { BorrowModal } from '@ui/components/pages/PoolPage/AssetsToBorrow/Borrow/Modal/index';
import { SupplyModal } from '@ui/components/pages/PoolPage/AssetsToSupply/Supply/Modal/index';
import { Banner } from '@ui/components/shared/Banner';
import { CardBox } from '@ui/components/shared/IonicBox';
import { LoadingText } from '@ui/components/shared/LoadingText';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';
import { useColors } from '@ui/hooks/useColors';
import { useMaxBorrowAmount } from '@ui/hooks/useMaxBorrowAmount';
import { useSupplyCap } from '@ui/hooks/useSupplyCap';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import type { MarketData } from '@ui/types/TokensDataMap';
import { smallFormatter, smallUsdFormatter } from '@ui/utils/bigUtils';

export const YourInfo = ({
  asset,
  assets,
  chainId,
  comptroller,
  isLoading,
  poolId
}: {
  asset?: MarketData;
  assets?: MarketData[];
  chainId: number;
  comptroller?: string;
  isLoading: boolean;
  poolId: string;
}) => {
  const { cIPage } = useColors();
  const [usdAmount, setUsdAmount] = useState<number>(0);
  const {
    isOpen: isSupplyModalOpen,
    onOpen: openSupplyModal,
    onClose: closeSupplyModal
  } = useDisclosure();
  const {
    isOpen: isBorrowModalOpen,
    onOpen: openBorrowModal,
    onClose: closeBorrowModal
  } = useDisclosure();
  const { data: price } = useUsdPrice(chainId.toString());
  const { data: balance, isLoading: isBalanceLoading } = useTokenBalance(
    asset?.underlyingToken,
    chainId
  );

  const { data: supplyCap, isLoading: isSupplyCapLoading } = useSupplyCap({
    chainId,
    comptroller,
    market: asset
  });
  const { data: maxBorrowAmount, isLoading: isMaxBorrowLoading } = useMaxBorrowAmount(
    asset,
    comptroller,
    chainId
  );
  const isActive = maxBorrowAmount && maxBorrowAmount.number > 0 ? true : false;

  useEffect(() => {
    if (asset && maxBorrowAmount && price) {
      setUsdAmount(
        maxBorrowAmount.number * Number(utils.formatUnits(asset.underlyingPrice, 18)) * price
      );
    } else {
      setUsdAmount(0);
    }
  }, [maxBorrowAmount, price, asset]);

  return (
    <CardBox>
      <Flex direction={{ base: 'column' }}>
        <Text mb={{ base: '24px' }} size={'xl'}>
          Your Info
        </Text>
        <Flex direction={{ base: 'column' }} mb={{ base: '10px' }}>
          <Text color={'iLightGray'} textTransform={'uppercase'}>
            Wallet Balance
          </Text>
          <Skeleton isLoaded={!isBalanceLoading && !isLoading}>
            {isBalanceLoading || isLoading ? (
              <LoadingText />
            ) : (
              <Text size={'lg'}>
                {asset && balance
                  ? `${smallFormatter(
                      Number(utils.formatUnits(balance, asset.underlyingDecimals))
                    )} ${asset.underlyingSymbol}`
                  : '-'}
              </Text>
            )}
          </Skeleton>
        </Flex>
        <Center height={5} mb={{ base: '20px' }}>
          <Divider bg={cIPage.dividerColor} orientation="horizontal" width="100%" />
        </Center>
        <Flex alignItems={'center'} justifyContent={'space-between'} mb={{ base: '20px' }}>
          <Flex direction={{ base: 'column' }}>
            <Text color={'iLightGray'} textTransform={'uppercase'}>
              Available To Supply
            </Text>
            <Skeleton isLoaded={!isSupplyCapLoading && !isLoading}>
              {isSupplyCapLoading || isLoading ? (
                <LoadingText />
              ) : supplyCap ? (
                <>
                  <Text size={'lg'}>{`${smallFormatter(
                    supplyCap.tokenCap
                  )} ${asset?.underlyingSymbol}`}</Text>
                  <Text color={'iGray'}>{smallUsdFormatter(supplyCap.usdCap)}</Text>
                </>
              ) : (
                <Text fontSize={'48px'} lineHeight={'36px'}>
                  ∞
                </Text>
              )}
            </Skeleton>
          </Flex>
          {asset && assets && comptroller && poolId && (
            <>
              <Button onClick={openSupplyModal} variant={'solidGreen'}>
                Supply
              </Button>
              <SupplyModal
                asset={asset}
                assets={assets}
                chainId={chainId}
                comptrollerAddress={comptroller}
                isOpen={isSupplyModalOpen}
                onClose={closeSupplyModal}
                poolId={Number(poolId)}
              />
            </>
          )}
        </Flex>
        <Flex alignItems={'center'} justifyContent={'space-between'} mb={{ base: '20px' }}>
          <Flex direction={{ base: 'column' }}>
            <Text color={'iLightGray'} textTransform={'uppercase'}>
              Available To Borrow
            </Text>
            <Skeleton isLoaded={!isMaxBorrowLoading && !isLoading}>
              {isMaxBorrowLoading || isLoading ? (
                <LoadingText />
              ) : maxBorrowAmount ? (
                <>
                  <Text size={'lg'}>{`${smallFormatter(
                    maxBorrowAmount.number
                  )} ${asset?.underlyingSymbol}`}</Text>
                  <Text color={'iGray'}>{smallUsdFormatter(usdAmount)}</Text>
                </>
              ) : (
                <Text fontSize={'48px'} lineHeight={'36px'}>
                  ∞
                </Text>
              )}
            </Skeleton>
          </Flex>
          {asset && assets && comptroller && poolId && (
            <>
              <Button
                onClick={isActive ? openBorrowModal : undefined}
                variant={isActive ? 'solidGreen' : 'solidGray'}
              >
                Borrow
              </Button>
              <BorrowModal
                asset={asset}
                assets={assets}
                chainId={chainId}
                comptrollerAddress={comptroller}
                isOpen={isBorrowModalOpen}
                onClose={closeBorrowModal}
              />
            </>
          )}
        </Flex>
        {!isActive ? (
          <Banner
            alertProps={{ variant: 'warning' }}
            descriptions={[
              {
                text: 'To borrow you need to supply any asset to be used as collateral',
                textProps: { size: 'md' }
              }
            ]}
          />
        ) : null}
      </Flex>
    </CardBox>
  );
};
