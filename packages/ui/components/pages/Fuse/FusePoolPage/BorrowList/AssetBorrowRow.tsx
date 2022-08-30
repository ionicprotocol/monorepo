import { QuestionIcon } from '@chakra-ui/icons';
import { HStack, Td, Text, Tr, useDisclosure, VStack } from '@chakra-ui/react';
import { FundOperationMode } from '@midas-capital/types';
import { utils } from 'ethers';

import PoolModal from '@ui/components/pages/Fuse/Modals/PoolModal/index';
import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { DOWN_LIMIT, UP_LIMIT } from '@ui/constants/index';
import { useMidas } from '@ui/context/MidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useIsMobile } from '@ui/hooks/useScreenSize';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';
import { shortUsdFormatter, smallUsdFormatter } from '@ui/utils/bigUtils';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

interface AssetBorrowRowProps {
  assets: MarketData[];
  index: number;
  comptrollerAddress: string;
}

export const AssetBorrowRow = ({ assets, index, comptrollerAddress }: AssetBorrowRowProps) => {
  const asset = assets[index];
  const { currentChain, midasSdk } = useMidas();

  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();

  const { data: tokenData } = useTokenData(asset.underlyingToken);
  const blocksPerMin = getBlockTimePerMinuteByChainId(currentChain.id);

  const borrowAPR = midasSdk.ratePerBlockToAPY(asset.borrowRatePerBlock, blocksPerMin);

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
            openModal();
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
            <PopoverTooltip
              placement="top-start"
              body={<div dangerouslySetInnerHTML={{ __html: asset.extraDocs || '' }} />}
            >
              <Text fontWeight="bold" fontSize={{ base: '2.8vw', sm: '0.9rem' }} ml={2}>
                {tokenData?.symbol ?? asset.underlyingSymbol}
              </Text>
            </PopoverTooltip>
          </HStack>
        </Td>

        {isMobile ? null : tokenData?.symbol !== undefined ? (
          asset.underlyingSymbol.toLowerCase() !== tokenData?.symbol?.toLowerCase() ? (
            <Td maxW={'30px'}>
              <PopoverTooltip body={asset?.underlyingSymbol ?? ''}>
                <QuestionIcon />
              </PopoverTooltip>
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

              <PopoverTooltip
                placement="top-start"
                body={
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
              </PopoverTooltip>
            </VStack>
          </Td>
        )}

        <Td isNumeric verticalAlign={'top'}>
          <VStack alignItems={'flex-end'}>
            <SimpleTooltip
              label={asset.borrowBalanceFiat.toString()}
              isDisabled={
                asset.borrowBalanceFiat === DOWN_LIMIT || asset.borrowBalanceFiat >= UP_LIMIT
              }
            >
              <Text color={cCard.txtColor} fontWeight="bold" fontSize={{ base: '2.8vw', sm: 'md' }}>
                {smallUsdFormatter(asset.borrowBalanceFiat)}
                {asset.borrowBalanceFiat > DOWN_LIMIT && asset.borrowBalanceFiat < UP_LIMIT && '+'}
              </Text>
            </SimpleTooltip>
            <SimpleTooltip
              label={utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals)}
              isDisabled={
                Number(utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals)) ===
                  DOWN_LIMIT ||
                Number(utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals)) >= UP_LIMIT
              }
            >
              <Text color={cCard.txtColor} mt={1} fontSize={{ base: '2.8vw', sm: '0.8rem' }}>
                {smallUsdFormatter(
                  Number(utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals))
                ).replace('$', '')}
                {Number(utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals)) >
                  DOWN_LIMIT &&
                  Number(utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals)) <
                    UP_LIMIT &&
                  '+'}{' '}
                {tokenData?.symbol ?? asset.underlyingSymbol}
              </Text>
            </SimpleTooltip>
          </VStack>
        </Td>

        <Td verticalAlign={'top'}>
          <PopoverTooltip
            body={
              <>
                {asset.liquidityFiat > DOWN_LIMIT && asset.liquidityFiat < UP_LIMIT && (
                  <>
                    <div>{asset.liquidityFiat.toString()}</div>
                    <br />
                  </>
                )}
                <div>
                  Liquidity is the amount of this asset that is available to borrow (unborrowed). To
                  see how much has been supplied and borrowed in total, navigate to the Pool Info
                  tab.
                </div>
              </>
            }
            placement="top-end"
          >
            <VStack alignItems={'flex-end'}>
              <Text color={cCard.txtColor} fontWeight="bold" fontSize={{ base: '2.8vw', sm: 'md' }}>
                {smallUsdFormatter(asset.liquidityFiat)}
                {asset.liquidityFiat > DOWN_LIMIT && asset.liquidityFiat < UP_LIMIT && '+'}
              </Text>
              <Text color={cCard.txtColor} fontSize={{ base: '2.8vw', sm: '0.8rem' }}>
                {shortUsdFormatter(
                  Number(utils.formatUnits(asset.liquidity, asset.underlyingDecimals))
                ).replace('$', '')}{' '}
                {tokenData?.symbol}
              </Text>
            </VStack>
          </PopoverTooltip>
        </Td>
      </Tr>
    </>
  );
};
