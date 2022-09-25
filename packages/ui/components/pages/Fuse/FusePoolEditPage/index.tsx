import { ArrowBackIcon } from '@chakra-ui/icons';
import { Flex, HStack, Spinner, Text, useDisclosure } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { memo } from 'react';

import AssetConfiguration from '@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration';
import AddAssetButton from '@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/AddAssetButton';
import AddAssetModal from '@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/AddAssetModal';
import FlywheelEdit from '@ui/components/pages/Fuse/FusePoolEditPage/FlywheelEdit';
import PoolConfiguration from '@ui/components/pages/Fuse/FusePoolEditPage/PoolConfiguration';
import FusePageLayout from '@ui/components/pages/Layout/FusePageLayout';
import { AdminAlert } from '@ui/components/shared/Alert';
import DashboardBox from '@ui/components/shared/DashboardBox';
import { Center, Column, RowOrColumn } from '@ui/components/shared/Flex';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { useMidas } from '@ui/context/MidasContext';
import { useIsComptrollerAdmin } from '@ui/hooks/fuse/useIsComptrollerAdmin';
import { useColors } from '@ui/hooks/useColors';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useIsSemiSmallScreen } from '@ui/hooks/useScreenSize';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';

const FusePoolEditPage = memo(() => {
  const isMobile = useIsSemiSmallScreen();

  const {
    isOpen: isAddAssetModalOpen,
    onOpen: openAddAssetModal,
    onClose: closeAddAssetModal,
  } = useDisclosure();

  const { setLoading, coingeckoId } = useMidas();
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
        <FusePageLayout>
          <AddAssetModal
            comptrollerAddress={data.comptroller}
            poolName={data.name}
            poolID={poolId}
            isOpen={isAddAssetModalOpen}
            onClose={closeAddAssetModal}
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
                  setLoading(true);
                  router.back();
                }}
              />
              <Text textAlign="left" variant="title" fontWeight="bold">
                Back
              </Text>
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
                    openAddAssetModal={openAddAssetModal}
                    assets={data.assets}
                    comptrollerAddress={data.comptroller}
                  />
                ) : (
                  <Column expand mainAxisAlignment="center" crossAxisAlignment="center" py={4}>
                    <Text mb={4}>There are no assets in this pool.</Text>

                    <AddAssetButton
                      comptrollerAddress={data.comptroller}
                      openAddAssetModal={openAddAssetModal}
                    />
                  </Column>
                )}
              </DashboardBox>
            </RowOrColumn>
            <FlywheelEdit pool={data} />
          </Flex>
        </FusePageLayout>
      </PageTransitionLayout>
    </>
  );
});

export default FusePoolEditPage;
