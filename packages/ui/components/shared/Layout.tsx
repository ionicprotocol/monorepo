import { Container } from '@chakra-ui/react';
import { ReactNode } from 'react';

import { Banner } from '@ui/components/shared/Banner';
import { Column } from '@ui/components/shared/Flex';
import LoadingOverlay from '@ui/components/shared/LoadingOverlay';
import { useMidas } from '@ui/context/MidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useIsSmallScreen } from '@ui/hooks/useScreenSize';

const Layout = ({ children }: { children: ReactNode }) => {
  const { loading } = useMidas();
  const { cPage } = useColors();
  const isMobile = useIsSmallScreen();

  return (
    <LoadingOverlay isLoading={loading}>
      <Column
        height="100%"
        flex={1}
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        bgColor={cPage.primary.bgColor}
      >
        <Banner
          text="Midas just launched, use at your own risk. "
          linkText="Read about our Audit with Zellic here."
          linkUrl="https://medium.com/midas-capital/audit-with-zellic-29b63f1be25a"
          status="warning"
        ></Banner>
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
