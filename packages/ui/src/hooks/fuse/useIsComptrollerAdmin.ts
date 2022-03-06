import { useQuery } from 'react-query';

import { useRari } from '@context/RariContext';
import { createComptroller } from '@utils/createComptroller';

export const useIsComptrollerAdmin = (comptrollerAddress?: string): boolean => {
  const { fuse, address } = useRari();

  const { data } = useQuery(comptrollerAddress + ' admin', async () => {
    if (!comptrollerAddress) return undefined;

    const comptroller = createComptroller(comptrollerAddress, fuse);

    return await comptroller.callStatic.admin();
  });

  return address === data;
};
