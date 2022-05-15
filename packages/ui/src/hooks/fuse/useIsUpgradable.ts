import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';
import { createComptroller } from '@ui/utils/createComptroller';

export const useIsUpgradeable = (comptrollerAddress: string) => {
  const { fuse } = useRari();

  const { data } = useQuery(comptrollerAddress + ' isUpgradeable', async () => {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    const isUpgradeable: boolean = await comptroller.callStatic.adminHasRights();

    return isUpgradeable;
  });

  return data;
};
