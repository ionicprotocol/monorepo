import { Box, Center } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { ScaleLoader } from 'react-spinners';

import { useColors } from '@ui/hooks/useColors';

function LoadingOverlay({ children, isLoading }: { children?: ReactNode; isLoading: boolean }) {
  const { cPage } = useColors();
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
          <ScaleLoader
            height={60}
            width={12}
            radius={4}
            margin={4}
            color={cPage.primary.borderColor}
            loading
          />
        </Center>
      )}
    </Box>
  );
}

export default LoadingOverlay;
