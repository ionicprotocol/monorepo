import { QuestionIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  HStack,
  Table,
  TableCaption,
  Tbody,
  Td,
  Text,
  Thead,
  Tr,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { utils } from 'ethers';
import { useState } from 'react';

import PoolModal from '@ui/components/pages/Fuse/Modals/PoolModal/index';
import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { FundOperationMode } from '@ui/constants/index';
import { useAuthedCallback } from '@ui/hooks/useAuthedCallback';
import { useColors } from '@ui/hooks/useColors';
import { MarketData } from '@ui/hooks/useFusePoolData';
import { useTokenData } from '@ui/hooks/useTokenData';
import { convertMantissaToAPR } from '@ui/utils/apyUtils';
import { shortUsdFormatter, smallUsdFormatter } from '@ui/utils/bigUtils';
import { useIsMobile } from '@ui/utils/chakraUtils';

interface BorrowListProps {
  assets: MarketData[];
  borrowBalanceFiat: number;
  comptrollerAddress: string;
}
export const BorrowList = ({ assets, borrowBalanceFiat, comptrollerAddress }: BorrowListProps) => {
  const [isShow, setIsShow] = useState(false);
  const borrowedAssets = assets.filter(
    (asset) => asset.borrowBalanceNative > 1 && !asset.isBorrowPaused
  );
  const nonBorrowedAssets = assets.filter(
    (asset) => asset.borrowBalanceNative < 1 && !asset.isBorrowPaused
  );
  const unBorrowableAssets = assets.filter((asset) => asset.isBorrowPaused);

  const isMobile = useIsMobile();
  const { cCard } = useColors();

  return (
    <Box overflowX="auto">
      <Table variant={'unstyled'} size={'sm'}>
        <TableCaption
          mt="0"
          placement="top"
          textAlign={'left'}
          fontSize={{ base: '3.8vw', sm: 'lg' }}
        >
          Your Borrow Balance: {smallUsdFormatter(borrowBalanceFiat)}
        </TableCaption>
        <Thead>
          {assets.length > 0 ? (
            <Tr>
              <Td
                colSpan={isMobile ? 1 : 2}
                fontSize={{ base: '2.9vw', sm: '0.9rem' }}
                fontWeight={'bold'}
              >
                Asset
              </Td>

              {isMobile ? null : (
                <Td
                  fontSize={{ base: '2.9vw', sm: '0.9rem' }}
                  fontWeight={'bold'}
                  isNumeric
                  textAlign={'right'}
                >
                  APR/TVL
                </Td>
              )}

              <Td
                fontSize={{ base: '2.9vw', sm: '0.9rem' }}
                fontWeight={'bold'}
                isNumeric
                textAlign={'right'}
              >
                Balance
              </Td>

              <Td
                fontSize={{ base: '2.9vw', sm: '0.9rem' }}
                fontWeight={'bold'}
                isNumeric
                textAlign={'right'}
              >
                Liquidity
              </Td>
            </Tr>
          ) : null}
        </Thead>
        <Tbody>
          {assets.length > 0 ? (
            <>
              {borrowedAssets.map((asset, index) => {
                return (
                  <AssetBorrowRow
                    comptrollerAddress={comptrollerAddress}
                    key={asset.underlyingToken}
                    assets={borrowedAssets}
                    index={index}
                  />
                );
              })}
              {borrowedAssets.length > 0 && nonBorrowedAssets.length > 0 && (
                <Tr borderWidth={1} borderColor={cCard.dividerColor}></Tr>
              )}
              {nonBorrowedAssets.map((asset, index) => {
                return (
                  <AssetBorrowRow
                    comptrollerAddress={comptrollerAddress}
                    key={asset.underlyingToken}
                    assets={nonBorrowedAssets}
                    index={index}
                  />
                );
              })}
              {isShow &&
                unBorrowableAssets.map((asset, index) => {
                  return (
                    <AssetBorrowRow
                      comptrollerAddress={comptrollerAddress}
                      key={asset.underlyingToken}
                      assets={unBorrowableAssets}
                      index={index}
                    />
                  );
                })}
              {unBorrowableAssets.length !== 0 && (
                <Tr>
                  <Td colSpan={5}>
                    <Button variant="solid" width="100%" onClick={() => setIsShow(!isShow)}>
                      {!isShow ? 'Show unborrowable assets' : 'Hide unborrowable assets'}
                    </Button>
                  </Td>
                </Tr>
              )}
            </>
          ) : (
            <Tr>
              <Td py={8} fontSize="md" textAlign="center">
                There are no assets in this pool.
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
};
interface AssetBorrowRowProps {
  assets: MarketData[];
  index: number;
  comptrollerAddress: string;
}

const AssetBorrowRow = ({ assets, index, comptrollerAddress }: AssetBorrowRowProps) => {
  const asset = assets[index];

  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();

  const authedOpenModal = useAuthedCallback(openModal);

  const { data: tokenData } = useTokenData(asset.underlyingToken);

  const borrowAPR = convertMantissaToAPR(asset.borrowRatePerBlock);

  const isMobile = useIsMobile();

  const { cCard } = useColors();

  return (
    <>
      <Tr style={{ position: 'absolute' }}>
        <Td>
          <PoolModal
            comptrollerAddress={comptrollerAddress}
            defaultMode={FundOperationMode.BORROW}
            assets={assets}
            index={index}
            isOpen={isModalOpen}
            onClose={closeModal}
          />
        </Td>
      </Tr>
      <Tr
        onClick={(e) => {
          if (asset.isBorrowPaused) {
            e.stopPropagation();
          } else {
            authedOpenModal();
          }
        }}
        cursor={'pointer'}
        _hover={{
          bgColor: cCard.hoverBgColor,
        }}
        opacity={asset.isBorrowPaused ? 0.3 : 1}
      >
        <Td verticalAlign={'middle'}>
          <HStack width={isMobile ? '8%' : '6%'}>
            <CTokenIcon size="sm" address={asset.underlyingToken} />
            <Text fontWeight="bold" fontSize={{ base: '2.8vw', sm: '0.9rem' }} ml={2}>
              {tokenData?.symbol ?? asset.underlyingSymbol}
            </Text>
          </HStack>
        </Td>

        {isMobile ? null : tokenData?.symbol !== undefined ? (
          asset.underlyingSymbol.toLowerCase() !== tokenData?.symbol?.toLowerCase() ? (
            <Td maxW={'30px'}>
              <SimpleTooltip placement="auto" label={asset?.underlyingSymbol ?? ''}>
                <QuestionIcon />
              </SimpleTooltip>
            </Td>
          ) : (
            <Td></Td>
          )
        ) : (
          <Td></Td>
        )}

        {isMobile ? null : (
          <Td isNumeric verticalAlign={'top'}>
            <VStack alignItems={'flex-end'}>
              <Text
                color={cCard.txtColor}
                fontSize={{ base: '2.8vw', sm: 'md' }}
                fontWeight={'bold'}
              >
                {borrowAPR.toFixed(3)}%
              </Text>

              <SimpleTooltip
                label={
                  "Total Value Lent (TVL) measures how much of this asset has been supplied in total. TVL does not account for how much of the lent assets have been borrowed, use 'liquidity' to determine the total unborrowed assets lent."
                }
              >
                <Text
                  wordBreak={'keep-all'}
                  color={cCard.txtColor}
                  fontSize={{ base: '2.8vw', sm: '0.8rem' }}
                >
                  {shortUsdFormatter(asset.totalSupplyFiat)} TVL
                </Text>
              </SimpleTooltip>
            </VStack>
          </Td>
        )}

        <Td isNumeric verticalAlign={'top'}>
          <VStack alignItems={'flex-end'}>
            <Text color={cCard.txtColor} fontWeight={'bold'} fontSize={{ base: '2.8vw', sm: 'md' }}>
              {smallUsdFormatter(asset.borrowBalanceFiat)}
            </Text>

            <Text color={cCard.txtColor} fontSize={{ base: '2.8vw', sm: '0.8rem' }}>
              {smallUsdFormatter(
                Number(utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals))
              ).replace('$', '')}{' '}
              {tokenData?.symbol ?? asset.underlyingSymbol}
            </Text>
          </VStack>
        </Td>

        <Td verticalAlign={'top'}>
          <SimpleTooltip
            label={
              'Liquidity is the amount of this asset that is available to borrow (unborrowed). To see how much has been supplied and borrowed in total, navigate to the Pool Info tab.'
            }
            placement="top-end"
          >
            <VStack alignItems={'flex-end'}>
              <Text
                color={cCard.txtColor}
                fontWeight={'bold'}
                fontSize={{ base: '2.8vw', sm: 'md' }}
              >
                {shortUsdFormatter(asset.liquidityFiat)}
              </Text>

              <Text color={cCard.txtColor} fontSize={{ base: '2.8vw', sm: '0.8rem' }}>
                {shortUsdFormatter(
                  Number(utils.formatUnits(asset.liquidity, asset.underlyingDecimals))
                ).replace('$', '')}{' '}
                {tokenData?.symbol}
              </Text>
            </VStack>
          </SimpleTooltip>
        </Td>
      </Tr>
    </>
  );
};
