import { Box, Center } from '@chakra-ui/react';
import { ReactNode } from 'react';

import Loader from '@ui/components/shared/Loader';

function LoadingOverlay({ children, isLoading }: { children?: ReactNode; isLoading: boolean }) {
  return (
    <Box position="relative">
      {children}
      {isLoading && (
        <Center
          background="#000000cc"
          color="white"
          height="100%"
          left="0"
          position="fixed"
          top="0"
          width="100%"
          zIndex="9999"
        >
          <Loader />
        </Center>
      )}
    </Box>
  );
}

export default LoadingOverlay;
