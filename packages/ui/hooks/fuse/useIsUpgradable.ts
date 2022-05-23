import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';

export const useIsUpgradeable = (comptrollerAddress: string) => {
  const { fuse } = useRari();

  const { data } = useQuery(comptrollerAddress + ' isUpgradeable', async () => {
    const comptroller = fuse.createComptroller(comptrollerAddress);

    const isUpgradeable: boolean = await comptroller.callStatic.adminHasRights();

    return isUpgradeable;
  });

  return data;
};
