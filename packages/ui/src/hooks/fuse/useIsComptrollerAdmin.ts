import { useRari } from '@context/RariContext';
import { useQuery } from 'react-query';

export const useIsComptrollerAdmin = (comptrollerAddress?: string): boolean => {
  const { fuse, address } = useRari();

  const { data } = useQuery(comptrollerAddress + ' admin', async () => {
    if (!comptrollerAddress) return undefined;

    const comptroller = fuse.createComptroller(comptrollerAddress);

    return await comptroller.callStatic.admin();
  });

  return address === data;
};
