import { Button, Flex } from '@chakra-ui/react';
import type { LeveredPosition } from '@ionicprotocol/types';
import { useRouter } from 'next/router';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export const Farm = ({ position }: { position: LeveredPosition }) => {
  const router = useRouter();
  const { setGlobalLoading } = useMultiIonic();

  return (
    <Flex justifyContent={'flex-end'}>
      <Button
        onClick={() => {
          setGlobalLoading(true);
          router.push(
            `/leverage/${position.chainId}/new/${position.collateral.cToken}/${position.borrowable.cToken}`
          );
        }}
        variant={'solidGreen'}
      >
        Farm
      </Button>
    </Flex>
  );
};
