import { Box, Center } from '@chakra-ui/react';
import { ReactNode } from 'react';

import Loader from '@ui/components/shared/Loader';

function LoadingOverlay({ children, isLoading }: { children?: ReactNode; isLoading: boolean }) {
  return (
    <Box position="relative">
      {children}
      {isLoading && (
        <Center
          width="100%"
          height="100%"
          color="white"
          position="fixed"
          top="0"
          left="0"
          background="#000000cc"
          zIndex="9999"
        >
          <Loader />
        </Center>
      )}
    </Box>
  );
}

export default LoadingOverlay;
