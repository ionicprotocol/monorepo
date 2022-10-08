import { Container } from '@chakra-ui/react';
import { ReactNode } from 'react';

import { Column } from '@ui/components/shared/Flex';
import LoadingOverlay from '@ui/components/shared/LoadingOverlay';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useIsSmallScreen } from '@ui/hooks/useScreenSize';

const Layout = ({ children }: { children: ReactNode }) => {
  const { isGlobalLoading } = useMultiMidas();
  const { cPage } = useColors();
  const isMobile = useIsSmallScreen();

  return (
    <LoadingOverlay isLoading={isGlobalLoading}>
      <Column
        height="100%"
        flex={1}
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        bgColor={cPage.primary.bgColor}
      >
        <Container maxWidth="8xl" px={{ base: 2, md: 4 }}>
          <Column
            width={isMobile ? '100%' : '96%'}
            height="100%"
            flex={1}
            mx="auto"
            mainAxisAlignment="center"
            crossAxisAlignment="stretch"
            position="relative"
          >
            {children}
          </Column>
        </Container>
      </Column>
    </LoadingOverlay>
  );
};

export default Layout;
