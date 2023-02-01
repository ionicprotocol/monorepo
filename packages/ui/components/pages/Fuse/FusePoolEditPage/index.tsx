import { ArrowBackIcon } from '@chakra-ui/icons';
import { Flex, HStack, Spinner, Text, useDisclosure } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { memo, useEffect } from 'react';

import AssetConfiguration from '@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration';
import AddAssetButton from '@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/AddAssetButton';
import AddAssetModal from '@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/AddAssetModal';
import FlywheelEdit from '@ui/components/pages/Fuse/FusePoolEditPage/FlywheelEdit';
import PoolConfiguration from '@ui/components/pages/Fuse/FusePoolEditPage/PoolConfiguration';
import FusePageLayout from '@ui/components/pages/Layout/FusePageLayout';
import { AdminAlert } from '@ui/components/shared/Alert';
import { MidasBox } from '@ui/components/shared/Box';
import { Center, Column, RowOrColumn } from '@ui/components/shared/Flex';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useIsComptrollerAdmin } from '@ui/hooks/fuse/useIsComptrollerAdmin';
import { useIsEditableAdmin } from '@ui/hooks/fuse/useIsEditableAdmin';
import { useColors } from '@ui/hooks/useColors';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useNativePriceInUSD } from '@ui/hooks/useNativePriceInUSD';
import { useIsSemiSmallScreen } from '@ui/hooks/useScreenSize';

const FusePoolEditPage = memo(() => {
  const isMobile = useIsSemiSmallScreen();

  const {
    isOpen: isAddAssetModalOpen,
    onOpen: openAddAssetModal,
    onClose: closeAddAssetModal,
  } = useDisclosure();

  const { setGlobalLoading } = useMultiMidas();

  const router = useRouter();
  const poolId = router.query.poolId as string;
  const poolChainId = router.query.chainId as string;
  const { data } = useFusePoolData(poolId, Number(poolChainId));
  const { data: usdPrice } = useNativePriceInUSD(Number(poolChainId));
  const isAdmin = useIsComptrollerAdmin(data?.comptroller, data?.chainId);
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
        <FusePageLayout>
          <AddAssetModal
            comptrollerAddress={data.comptroller}
            poolName={data.name}
            poolID={poolId}
            isOpen={isAddAssetModalOpen}
            onClose={closeAddAssetModal}
            poolChainId={Number(poolChainId)}
          />

          <Flex
            flexDir="column"
            alignItems="flex-start"
            bgColor={cPage.primary.bgColor}
            justifyContent="flex-start"
            color={cPage.primary.txtColor}
            mx="auto"
            width="100%"
          >
            <HStack width="100%" mx="auto" spacing={6}>
              <ArrowBackIcon
                fontSize="2xl"
                fontWeight="extrabold"
                cursor="pointer"
                onClick={() => {
                  setGlobalLoading(true);
                  router.back();
                }}
              />
              <Text textAlign="left" size="lg" fontWeight="bold">
                Back
              </Text>
            </HStack>
            {!!data && (
              <AdminAlert
                isAdmin={isAdmin}
                isAdminText="You are the admin of this Pool!"
                isNotAdminText="You are not the admin of this Pool!"
              />
            )}

            <RowOrColumn
              width="100%"
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-start"
              isRow={!isMobile}
              alignItems="stretch"
            >
              <MidasBox width={isMobile ? '100%' : '50%'} mt={4}>
                {data ? (
                  <PoolConfiguration
                    assets={data.assets}
                    comptrollerAddress={data.comptroller}
                    poolName={data.name}
                    poolChainId={data.chainId}
                  />
                ) : (
                  <Center height="100%" py={48}>
                    <Spinner my={8} />
                  </Center>
                )}
              </MidasBox>

              <MidasBox width={isMobile ? '100%' : '50%'} mt={4} ml={isMobile ? 0 : 4}>
                {data.assets.length > 0 ? (
                  <AssetConfiguration
                    openAddAssetModal={openAddAssetModal}
                    assets={data.assets}
                    comptrollerAddress={data.comptroller}
                    poolChainId={data.chainId}
                  />
                ) : (
                  <Column expand mainAxisAlignment="center" crossAxisAlignment="center" py={4}>
                    <Text mb={4}>There are no assets in this pool.</Text>

                    <AddAssetButton
                      comptrollerAddress={data.comptroller}
                      openAddAssetModal={openAddAssetModal}
                      poolChainId={data.chainId}
                    />
                  </Column>
                )}
              </MidasBox>
            </RowOrColumn>
            <FlywheelEdit pool={data} />
          </Flex>
        </FusePageLayout>
      </PageTransitionLayout>
    </>
  );
});

export default FusePoolEditPage;
