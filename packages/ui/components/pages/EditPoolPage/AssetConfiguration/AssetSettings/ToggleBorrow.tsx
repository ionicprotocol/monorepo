import { InfoOutlineIcon } from '@chakra-ui/icons';
import { Flex, HStack, Spacer, Switch, Text } from '@chakra-ui/react';
import type { NativePricedFuseAsset } from '@ionicprotocol/types';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { Column, Row } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useCTokenData } from '@ui/hooks/fuse/useCTokenData';
import { useIsEditableAdmin } from '@ui/hooks/fuse/useIsEditableAdmin';
import { useErrorToast } from '@ui/hooks/useToast';
import { handleGenericError } from '@ui/utils/errorHandling';

interface ToggleBorrowProps {
  comptrollerAddress: string;
  poolChainId: number;
  selectedAsset: NativePricedFuseAsset;
}

export const ToggleBorrow = ({
  comptrollerAddress,
  selectedAsset,
  poolChainId
}: ToggleBorrowProps) => {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const { cToken: cTokenAddress, isBorrowPaused: isPaused } = selectedAsset;
  const { currentSdk } = useMultiIonic();
  const { data: cTokenData } = useCTokenData(comptrollerAddress, cTokenAddress, poolChainId);
  const addRecentTransaction = useAddRecentTransaction();
  const errorToast = useErrorToast();
  const queryClient = useQueryClient();
  const isEditableAdmin = useIsEditableAdmin(comptrollerAddress, poolChainId);

  const toggleBorrowState = async () => {
    if (!cTokenAddress || !currentSdk) return;
    setIsUpdating(true);

    const comptroller = currentSdk.createComptroller(comptrollerAddress, currentSdk.signer);
    try {
      if (!cTokenAddress) throw new Error('Missing token address');
      const tx = await comptroller._setBorrowPaused(cTokenAddress, !isPaused);
      addRecentTransaction({ description: 'Set borrowing status', hash: tx.hash });
      await tx.wait();
      await queryClient.refetchQueries();
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller: comptrollerAddress,
        token: cTokenAddress
      };
      const sentryInfo = {
        contextName: 'Updating borrow status',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Column
      crossAxisAlignment="flex-start"
      height="100%"
      mainAxisAlignment="flex-start"
      overflowY="auto"
      width="100%"
    >
      {cTokenData && (
        <>
          <Flex
            alignItems="center"
            direction={{ base: 'column', sm: 'row' }}
            px={{ base: 4, md: 8 }}
            py={4}
            w="100%"
            wrap="wrap"
          >
            <HStack>
              <Text size="md">Borrowing Possibility </Text>
              <SimpleTooltip label={'It shows the possibility if you can borrow or not.'}>
                <InfoOutlineIcon ml={1} />
              </SimpleTooltip>
            </HStack>
            <Spacer />
            <Row mainAxisAlignment="center" mt={{ base: 4, sm: 0 }}>
              <Switch
                className="switch-borrowing"
                h="20px"
                isChecked={!isPaused}
                isDisabled={isUpdating || !isEditableAdmin}
                ml="auto"
                onChange={toggleBorrowState}
              />
            </Row>
          </Flex>
        </>
      )}
    </Column>
  );
};
