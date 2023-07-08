import { Box, Progress, Text, Tooltip } from '@chakra-ui/react';
import { useMemo } from 'react';

import { Row } from '@ui/components/shared/Flex';
import type { MidasBoxProps } from '@ui/components/shared/IonicBox';
import { IonicBox } from '@ui/components/shared/IonicBox';
import { useBorrowLimitTotal } from '@ui/hooks/useBorrowLimitTotal';
import type { MarketData } from '@ui/types/TokensDataMap';
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

  return (
    <IonicBox height="65px" mx="auto" p={4} width={'100%'} {...midasBoxProps}>
      <Row crossAxisAlignment="center" expand mainAxisAlignment="flex-start">
        <Tooltip label={'Keep this bar from filling up to avoid being liquidated!'}>
          <Text flexShrink={0} mr={4} size="md">
            Borrow Limit
          </Text>
        </Tooltip>

        <Tooltip label={'This is how much you have borrowed.'}>
          <Text flexShrink={0} fontWeight="bold" mr={3} mt="2px" size="lg">
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
              borderRadius="10px"
              colorScheme={
                ratio <= 40 ? 'whatsapp' : ratio <= 60 ? 'yellow' : ratio <= 80 ? 'orange' : 'red'
              }
              size="xs"
              value={ratio}
              width="100%"
            />
          </Box>
        </Tooltip>

        <Tooltip label="If your borrow amount reaches this value, you will be liquidated.">
          <Text flexShrink={0} fontWeight="bold" ml={3} mt="2px" size="lg">
            {smallUsdFormatter(maxBorrow || 0)}
          </Text>
        </Tooltip>
      </Row>
    </IonicBox>
  );
};
