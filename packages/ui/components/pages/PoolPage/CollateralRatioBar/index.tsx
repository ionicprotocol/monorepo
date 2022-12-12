import { Box, Progress, Text, Tooltip } from '@chakra-ui/react';
import LogRocket from 'logrocket';
import { useEffect, useMemo } from 'react';

import { MidasBox, MidasBoxProps } from '@ui/components/shared/Box';
import { Row } from '@ui/components/shared/Flex';
import { useBorrowLimitTotal } from '@ui/hooks/useBorrowLimitTotal';
import { MarketData } from '@ui/types/TokensDataMap';
import { smallUsdFormatter } from '@ui/utils/bigUtils';

interface CollateralRatioBarProps {
  assets: MarketData[];
  borrowFiat: number;
  poolChainId: number;
}

export const CollateralRatioBar = ({
  assets,
  borrowFiat,
  poolChainId,
  ...midasBoxProps
}: CollateralRatioBarProps & MidasBoxProps) => {
  const { data: maxBorrow } = useBorrowLimitTotal(assets, poolChainId);

  const ratio = useMemo(() => {
    if (maxBorrow && maxBorrow !== 0) {
      return (borrowFiat / maxBorrow) * 100;
    } else {
      return 0;
    }
  }, [borrowFiat, maxBorrow]);

  useEffect(() => {
    if (ratio > 95) {
      LogRocket.track('Fuse-AtRiskOfLiquidation');
    }
  }, [ratio]);

  return (
    <MidasBox width={'100%'} height="65px" p={4} mx="auto" {...midasBoxProps}>
      <Row mainAxisAlignment="flex-start" crossAxisAlignment="center" expand>
        <Tooltip label={'Keep this bar from filling up to avoid being liquidated!'}>
          <Text variant="mdText" flexShrink={0} mr={4}>
            Borrow Limit
          </Text>
        </Tooltip>

        <Tooltip label={'This is how much you have borrowed.'}>
          <Text flexShrink={0} mt="2px" mr={3} variant="lgText" fontWeight="bold">
            {smallUsdFormatter(borrowFiat)}
          </Text>
        </Tooltip>

        <Tooltip
          label={`You're using ${ratio.toFixed(1)}% of your ${smallUsdFormatter(
            maxBorrow || 0
          )} borrow limit.`}
        >
          <Box width="100%">
            <Progress
              size="xs"
              width="100%"
              colorScheme={
                ratio <= 40 ? 'whatsapp' : ratio <= 60 ? 'yellow' : ratio <= 80 ? 'orange' : 'red'
              }
              borderRadius="10px"
              value={ratio}
            />
          </Box>
        </Tooltip>

        <Tooltip label="If your borrow amount reaches this value, you will be liquidated.">
          <Text flexShrink={0} mt="2px" ml={3} variant="lgText" fontWeight="bold">
            {smallUsdFormatter(maxBorrow || 0)}
          </Text>
        </Tooltip>
      </Row>
    </MidasBox>
  );
};
