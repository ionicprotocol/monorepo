import { Button, Flex } from '@chakra-ui/react';
import type { NewPosition } from '@ionicprotocol/types';
import { useRouter } from 'next/router';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export const Farm = ({ position }: { position: NewPosition }) => {
  const router = useRouter();
  const { setGlobalLoading } = useMultiIonic();

  return (
    <Flex justifyContent={'flex-end'}>
      <Button
        onClick={() => {
          setGlobalLoading(true);
          router.push(`/leverage/${position.chainId}/newPosition/${position.collateral.cToken}`);
        }}
        variant={'solidGreen'}
      >
        Farm
      </Button>
    </Flex>
  );
};
