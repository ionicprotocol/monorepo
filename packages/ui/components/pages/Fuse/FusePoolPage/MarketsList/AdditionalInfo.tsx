import { Button, HStack, Text } from '@chakra-ui/react';
import { Row } from '@tanstack/react-table';

import { Market } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList';
import ClaimAssetRewardsButton from '@ui/components/shared/ClaimAssetRewardsButton';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { DOWN_LIMIT, UP_LIMIT } from '@ui/constants/index';
import { MarketData } from '@ui/types/TokensDataMap';
import { smallUsdFormatter } from '@ui/utils/bigUtils';

export const AdditionalInfo = ({
  row,
  comptrollerAddress,
}: {
  row: Row<Market>;
  comptrollerAddress: string;
}) => {
  const asset: MarketData = row.original.market;

  return (
    <HStack>
      <ClaimAssetRewardsButton poolAddress={comptrollerAddress} assetAddress={asset.cToken} />
      <Button>Supply</Button>
      <Button>Withdraw</Button>
      <Button>Borrow</Button>
      <Button>Repay</Button>
    </HStack>
  );
};
