import { Box, Button, Input } from '@chakra-ui/react';
import { utils } from 'ethers';

import { MidasBox } from '@ui/components/shared/Box';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Row } from '@ui/components/shared/Flex';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useBorrowMinimum } from '@ui/hooks/useBorrowMinimum';
import { MarketData } from '@ui/types/TokensDataMap';

export const AmountInput = ({
  asset,
  poolChainId,
  userEnteredAmount,
  updateAmount,
}: {
  asset: MarketData;
  poolChainId: number;
  userEnteredAmount: string;
  updateAmount: (amount: string) => void;
}) => {
  const {
    data: { minBorrowAsset },
    isLoading,
  } = useBorrowMinimum(asset, poolChainId);

  const setToMin = () => {
    if (minBorrowAsset) {
      updateAmount(utils.formatUnits(minBorrowAsset, asset.underlyingDecimals));
    } else {
      updateAmount('');
    }
  };

  return (
    <MidasBox width="100%">
      <Row crossAxisAlignment="center" expand mainAxisAlignment="space-between" p={4} width="100%">
        <Input
          autoFocus
          fontSize={22}
          id="fundInput"
          inputMode="decimal"
          mr={4}
          onChange={(event) => updateAmount(event.target.value)}
          placeholder="0.0"
          type="number"
          value={userEnteredAmount}
          variant="unstyled"
        />
        <Row crossAxisAlignment="center" flexShrink={0} mainAxisAlignment="flex-start">
          <Row crossAxisAlignment="center" mainAxisAlignment="flex-start">
            <Box height={8} mr={1} width={8}>
              <TokenIcon address={asset.underlyingToken} chainId={poolChainId} size="sm" />
            </Box>
            <EllipsisText
              fontWeight="bold"
              maxWidth="80px"
              mr={2}
              size="md"
              tooltip={asset.underlyingSymbol}
            >
              {asset.underlyingSymbol}
            </EllipsisText>
          </Row>
          <Button
            height={{ lg: 8, md: 8, sm: 8, base: 8 }}
            isLoading={isLoading}
            onClick={setToMin}
            px={{ lg: 2, md: 2, sm: 2, base: 2 }}
          >
            MIN
          </Button>
        </Row>
      </Row>
    </MidasBox>
  );
};
