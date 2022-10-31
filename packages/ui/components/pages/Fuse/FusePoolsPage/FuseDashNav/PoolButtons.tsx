import { Button, ButtonGroup } from '@chakra-ui/react';
import { useRouter } from 'next/router';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const PoolButtons = () => {
  const router = useRouter();
  const { setGlobalLoading } = useMultiMidas();

  return (
    <ButtonGroup spacing={0} flexFlow={'row wrap'} justifyContent="center">
      <Button
        onClick={() => {
          setGlobalLoading(true);
          router.push('/create-pool');
        }}
      >
        + Create Pool
      </Button>
    </ButtonGroup>
  );
};
