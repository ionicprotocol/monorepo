import { Box, Progress, Text, Tooltip } from '@chakra-ui/react';
import { NativePricedFuseAsset } from '@midas-capital/sdk';
import LogRocket from 'logrocket';
import { useEffect } from 'react';

import { PoolDashboardBox } from '@ui/components/pages/Fuse/FusePoolPage/PoolDashboardBox';
import { useBorrowLimit } from '@ui/hooks/useBorrowLimit';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { Row } from '@ui/utils/chakraUtils';

interface CollateralRatioBarProps {
  assets: NativePricedFuseAsset[];
  borrowFiat: number;
}

export const CollateralRatioBar = ({ assets, borrowFiat }: CollateralRatioBarProps) => {
  const maxBorrow = useBorrowLimit(assets);

  const ratio = (borrowFiat / maxBorrow) * 100;

  useEffect(() => {
    if (ratio > 95) {
      LogRocket.track('Fuse-AtRiskOfLiquidation');
    }
  }, [ratio]);

  return (
    <PoolDashboardBox width={'100%'} height="65px" mt={4} p={4} mx="auto">
      <Row mainAxisAlignment="flex-start" crossAxisAlignment="center" expand>
        <Tooltip label={'Keep this bar from filling up to avoid being liquidated!'}>
          <Text flexShrink={0} mr={4}>
            Borrow Limit
          </Text>
        </Tooltip>

        <Tooltip label={'This is how much you have borrowed.'}>
          <Text flexShrink={0} mt="2px" mr={3} fontSize="10px">
            {smallUsdFormatter(borrowFiat)}
          </Text>
        </Tooltip>

        <Tooltip
          label={`You're using ${ratio.toFixed(1)}% of your ${smallUsdFormatter(
            maxBorrow
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
          <Text flexShrink={0} mt="2px" ml={3} fontSize="10px">
            {smallUsdFormatter(maxBorrow)}
          </Text>
        </Tooltip>
      </Row>
    </PoolDashboardBox>
  );
};
