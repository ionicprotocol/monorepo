import { Divider } from '@chakra-ui/react';
import type { FundOperationMode, VaultData } from '@ionicprotocol/types';
import type { BigNumber } from 'ethers';
import { utils } from 'ethers';

import { Column } from '@ui/components/shared/Flex';
import { CardBox } from '@ui/components/shared/IonicBox';
import { useUpdatedUserVault } from '@ui/hooks/ionic/useUpdatedUserVaults';
import { Supplied } from 'ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/FundButton/StatsColumn/Supplied';
import { SupplyAPY } from 'ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/FundButton/StatsColumn/SupplyAPY';

interface StatsColumnProps {
  amount: BigNumber;
  mode: FundOperationMode;
  vault: VaultData;
}
export const StatsColumn = ({ amount, mode, vault }: StatsColumnProps) => {
  const { data: updatedVault } = useUpdatedUserVault({ amount, mode, vault });
  const totalSupplyFrom = utils.commify(utils.formatUnits(vault.totalSupply, vault.decimals));
  const totalSupplyTo = updatedVault
    ? utils.commify(utils.formatUnits(updatedVault.totalSupply, vault.decimals))
    : undefined;
  const supplyApyFrom = Number(utils.formatUnits(vault.supplyApy));
  const supplyApyTo = updatedVault ? Number(utils.formatUnits(updatedVault.supplyApy)) : undefined;

  return (
    <CardBox width="100%">
      <Column
        crossAxisAlignment="flex-start"
        expand
        gap={2}
        mainAxisAlignment="space-between"
        px={2}
        py={2}
      >
        <Supplied current={totalSupplyFrom} new={totalSupplyTo} vault={vault} />
        <Divider />
        <SupplyAPY current={supplyApyFrom} new={supplyApyTo} />
      </Column>
    </CardBox>
  );
};
