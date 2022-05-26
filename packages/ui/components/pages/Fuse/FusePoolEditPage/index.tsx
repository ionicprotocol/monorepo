import { ArrowBackIcon } from '@chakra-ui/icons';
import { Flex, Heading, HStack, Spinner, Text, useDisclosure } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { memo } from 'react';

import FuseNavbar from '@ui/components/pages/Fuse/FuseNavbar';
import AssetConfiguration from '@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration';
import AddAssetButton from '@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/AddAssetButton';
import AddAssetModal from '@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/AddAssetModal';
import FlywheelEdit from '@ui/components/pages/Fuse/FusePoolEditPage/FlywheelEdit';
import PoolConfiguration from '@ui/components/pages/Fuse/FusePoolEditPage/PoolConfiguration';
import { AdminAlert } from '@ui/components/shared/AdminAlert';
import DashboardBox from '@ui/components/shared/DashboardBox';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { useRari } from '@ui/context/RariContext';
import { useIsComptrollerAdmin } from '@ui/hooks/fuse/useIsComptrollerAdmin';
import { useAuthedCallback } from '@ui/hooks/useAuthedCallback';
import { useColors } from '@ui/hooks/useColors';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useIsSemiSmallScreen } from '@ui/hooks/useIsSemiSmallScreen';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import { Center, Column, RowOrColumn } from '@ui/utils/chakraUtils';

const FusePoolEditPage = memo(() => {
  const isMobile = useIsSemiSmallScreen();

  const {
    isOpen: isAddAssetModalOpen,
    onOpen: openAddAssetModal,
    onClose: closeAddAssetModal,
  } = useDisclosure();
  const authedOpenModal = useAuthedCallback(openAddAssetModal);

  const { setLoading, coingeckoId } = useRari();
  const router = useRouter();
  const poolId = router.query.poolId as string;
  const { data } = useFusePoolData(poolId);
  const { data: usdPrice } = useUSDPrice(coingeckoId);
  const isAdmin = useIsComptrollerAdmin(data?.comptroller);
  const { cPage } = useColors();

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
        <Flex
          minH="100vh"
          flexDir="column"
          alignItems="flex-start"
          bgColor={cPage.primary.bgColor}
          justifyContent="flex-start"
        >
          <FuseNavbar />

          <AddAssetModal
            comptrollerAddress={data.comptroller}
            poolName={data.name}
            poolID={poolId}
            isOpen={isAddAssetModalOpen}
            onClose={closeAddAssetModal}
          />

          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            bg={cPage.primary.bgColor}
            color={cPage.primary.txtColor}
            mx="auto"
            width="100%"
          >
            <HStack width="100%" mt="9%" mb={4} mx="auto" spacing={6}>
              <ArrowBackIcon
                fontSize="2xl"
                fontWeight="extrabold"
                cursor="pointer"
                onClick={() => {
                  setLoading(true);
                  router.back();
                }}
              />
              <Heading textAlign="left" fontSize="xl" fontWeight="bold">
                Back
              </Heading>
            </HStack>
            {!!data && (
              <AdminAlert
                isAdmin={isAdmin}
                isAdminText="You are the admin of this Fuse Pool!"
                isNotAdminText="You are not the admin of this Fuse Pool!"
              />
            )}

            <RowOrColumn
              width="100%"
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-start"
              isRow={!isMobile}
              alignItems="stretch"
            >
              <DashboardBox width={isMobile ? '100%' : '50%'} mt={4}>
                {data ? (
                  <PoolConfiguration
                    assets={data.assets}
                    comptrollerAddress={data.comptroller}
                    poolName={data.name}
                  />
                ) : (
                  <Center height="100%" py={48}>
                    <Spinner my={8} />
                  </Center>
                )}
              </DashboardBox>

              <DashboardBox width={isMobile ? '100%' : '50%'} mt={4} ml={isMobile ? 0 : 4}>
                {data.assets.length > 0 ? (
                  <AssetConfiguration
                    openAddAssetModal={authedOpenModal}
                    assets={data.assets}
                    comptrollerAddress={data.comptroller}
                    poolID={poolId}
                    poolName={data.name}
                  />
                ) : (
                  <Column expand mainAxisAlignment="center" crossAxisAlignment="center" py={4}>
                    <Text mb={4}>There are no assets in this pool.</Text>

                    <AddAssetButton
                      comptrollerAddress={data.comptroller}
                      openAddAssetModal={authedOpenModal}
                    />
                  </Column>
                )}
              </DashboardBox>
            </RowOrColumn>
            <FlywheelEdit pool={data} />
          </Column>
        </Flex>
      </PageTransitionLayout>
    </>
  );
});

export default FusePoolEditPage;
