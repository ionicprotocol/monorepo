import { Container } from '@chakra-ui/react';
import { ReactNode, useEffect, useRef, useState } from 'react';

import Terms from '@ui/components/pages/Fuse/Modals/Terms';
import { Column } from '@ui/components/shared/Flex';
import LoadingOverlay from '@ui/components/shared/LoadingOverlay';
import { MIDAS_T_AND_C_ACCEPTED } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';

const Layout = ({ children }: { children: ReactNode }) => {
  const { isGlobalLoading } = useMultiMidas();
  const { cPage } = useColors();
  const [isAcceptedTerms, setAcceptedTerms] = useState<boolean | undefined>();
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    if (mounted.current) {
      setAcceptedTerms(localStorage.getItem(MIDAS_T_AND_C_ACCEPTED) === 'true');
    }

    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <LoadingOverlay isLoading={isGlobalLoading}>
      <Column
        bgColor={cPage.primary.bgColor}
        crossAxisAlignment="center"
        flex={1}
        height="100%"
        mainAxisAlignment="flex-start"
      >
        <Container maxWidth="8xl" px={{ base: 2, md: 4 }}>
          <Column
            crossAxisAlignment="stretch"
            flex={1}
            height="100%"
            mainAxisAlignment="center"
            mx="auto"
            position="relative"
            width={'98%'}
          >
            {isAcceptedTerms !== undefined && <Terms isAcceptedTerms={isAcceptedTerms} />}
            {children}
          </Column>
        </Container>
      </Column>
    </LoadingOverlay>
  );
};

export default Layout;
