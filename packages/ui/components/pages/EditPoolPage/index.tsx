import { ArrowBackIcon } from '@chakra-ui/icons';
import { Flex, HStack, Spinner, Text, useDisclosure } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo, useEffect, useMemo } from 'react';

import AssetConfiguration from '@ui/components/pages/EditPoolPage/AssetConfiguration';
import AddAssetButton from '@ui/components/pages/EditPoolPage/AssetConfiguration/AddAssetButton';
import AddAssetModal from '@ui/components/pages/EditPoolPage/AssetConfiguration/AddAssetModal';
import FlywheelEdit from '@ui/components/pages/EditPoolPage/FlywheelEdit';
import PoolConfiguration from '@ui/components/pages/EditPoolPage/PoolConfiguration';
import PageLayout from '@ui/components/pages/Layout/PageLayout';
import { Banner } from '@ui/components/shared/Banner';
import { Center, Column, RowOrColumn } from '@ui/components/shared/Flex';
import { CardBox } from '@ui/components/shared/IonicBox';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useIsComptrollerAdmin } from '@ui/hooks/ionic/useIsComptrollerAdmin';
import { useIsEditableAdmin } from '@ui/hooks/ionic/useIsEditableAdmin';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import { useColors } from '@ui/hooks/useColors';
import { usePoolData } from '@ui/hooks/usePoolData';
import { useIsSemiSmallScreen } from '@ui/hooks/useScreenSize';

const EditPoolPage = memo(() => {
  const isMobile = useIsSemiSmallScreen();

  const {
    isOpen: isAddAssetModalOpen,
    onOpen: openAddAssetModal,
    onClose: closeAddAssetModal,
  } = useDisclosure();

  const { setGlobalLoading } = useMultiIonic();

  const router = useRouter();
  const poolId = router.query.poolId as string;
  const poolChainId = router.query.chainId as string;
  const { data } = usePoolData(poolId, Number(poolChainId));
  const { data: usdPrices } = useAllUsdPrices();
  const usdPrice = useMemo(() => {
    if (usdPrices && poolChainId && usdPrices[poolChainId.toString()]) {
      return usdPrices[poolChainId.toString()].value;
    } else {
      return undefined;
    }
  }, [usdPrices, poolChainId]);
  const { data: isAdmin, isLoading } = useIsComptrollerAdmin(data?.comptroller, data?.chainId);
  const isEditableAdmin = useIsEditableAdmin(data?.comptroller, Number(poolChainId));
  const { cPage } = useColors();

  useEffect(() => {
    if (!isEditableAdmin) {
      closeAddAssetModal();
    }
  }, [isEditableAdmin, closeAddAssetModal]);

  if (!data || !usdPrice) {
    return (
      <Center height="100vh">
        <Spinner />
      </Center>
    );
  }

  return (
    <>
      <Head>
        <title key="title">{`Edit: ${data.name}`}</title>
      </Head>
      <PageTransitionLayout>
        <PageLayout>
          <AddAssetModal
            comptrollerAddress={data.comptroller}
            isOpen={isAddAssetModalOpen}
            onClose={closeAddAssetModal}
            poolChainId={Number(poolChainId)}
            poolID={poolId}
            poolName={data.name}
          />

          <Flex
            alignItems="flex-start"
            bgColor={cPage.primary.bgColor}
            color={cPage.primary.txtColor}
            flexDir="column"
            justifyContent="flex-start"
            mx="auto"
            width="100%"
          >
            <HStack mx="auto" spacing={6} width="100%">
              <ArrowBackIcon
                cursor="pointer"
                fontSize="2xl"
                fontWeight="extrabold"
                onClick={() => {
                  setGlobalLoading(true);
                  router.back();
                }}
              />
              <Text fontWeight="bold" size="lg" textAlign="left">
                Back
              </Text>
            </HStack>
            {isLoading ? (
              <Banner
                alertProps={{ mt: 2, variant: 'ghost' }}
                descriptions={[
                  {
                    text: 'Checking if you are the admin of this pool...',
                  },
                ]}
              />
            ) : (
              <Banner
                alertProps={{ mt: 2, variant: isAdmin ? 'info' : 'warning' }}
                descriptions={[
                  {
                    text: `You are ${isAdmin ? '' : 'not'} the admin of this Pool!`,
                  },
                ]}
              />
            )}

            <RowOrColumn
              alignItems="stretch"
              crossAxisAlignment="flex-start"
              isRow={!isMobile}
              mainAxisAlignment="flex-start"
              width="100%"
            >
              <CardBox mt={4} width={isMobile ? '100%' : '50%'}>
                {data ? (
                  <PoolConfiguration
                    assets={data.assets}
                    comptrollerAddress={data.comptroller}
                    poolChainId={data.chainId}
                    poolName={data.name}
                  />
                ) : (
                  <Center height="100%" py={48}>
                    <Spinner my={8} />
                  </Center>
                )}
              </CardBox>

              <CardBox ml={isMobile ? 0 : 4} mt={4} width={isMobile ? '100%' : '50%'}>
                {data.assets.length > 0 ? (
                  <AssetConfiguration
                    assets={data.assets}
                    comptrollerAddress={data.comptroller}
                    openAddAssetModal={openAddAssetModal}
                    poolChainId={data.chainId}
                  />
                ) : (
                  <Column crossAxisAlignment="center" expand mainAxisAlignment="center" py={4}>
                    <Text mb={4}>There are no assets in this pool.</Text>

                    <AddAssetButton
                      comptrollerAddress={data.comptroller}
                      openAddAssetModal={openAddAssetModal}
                      poolChainId={data.chainId}
                    />
                  </Column>
                )}
              </CardBox>
            </RowOrColumn>
            <FlywheelEdit pool={data} />
          </Flex>
        </PageLayout>
      </PageTransitionLayout>
    </>
  );
});

export default EditPoolPage;
