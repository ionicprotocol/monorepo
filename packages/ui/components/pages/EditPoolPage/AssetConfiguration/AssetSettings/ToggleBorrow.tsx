import { InfoOutlineIcon } from '@chakra-ui/icons';
import { Flex, HStack, Spacer, Switch, Text } from '@chakra-ui/react';
import { NativePricedFuseAsset } from '@midas-capital/types';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { Column, Row } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useCTokenData } from '@ui/hooks/fuse/useCTokenData';
import { useErrorToast } from '@ui/hooks/useToast';
import { handleGenericError } from '@ui/utils/errorHandling';

interface ToggleBorrowProps {
  comptrollerAddress: string;
  selectedAsset: NativePricedFuseAsset;
  poolChainId: number;
}

export const ToggleBorrow = ({
  comptrollerAddress,
  selectedAsset,
  poolChainId,
}: ToggleBorrowProps) => {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const { cToken: cTokenAddress, isBorrowPaused: isPaused } = selectedAsset;
  const { currentSdk } = useMultiMidas();
  const { data: cTokenData } = useCTokenData(comptrollerAddress, cTokenAddress, poolChainId);
  const addRecentTransaction = useAddRecentTransaction();
  const errorToast = useErrorToast();
  const queryClient = useQueryClient();

  const toggleBorrowState = async () => {
    if (!cTokenAddress || !currentSdk) return;
    setIsUpdating(true);

    const comptroller = currentSdk.createComptroller(comptrollerAddress, currentSdk.signer);
    try {
      if (!cTokenAddress) throw new Error('Missing token address');
      const tx = await comptroller._setBorrowPaused(cTokenAddress, !isPaused);
      addRecentTransaction({ hash: tx.hash, description: 'Set borrowing status' });
      await tx.wait();
      await queryClient.refetchQueries();
    } catch (error) {
      const sentryProperties = {
        token: cTokenAddress,
        chainId: currentSdk.chainId,
        comptroller: comptrollerAddress,
      };
      const sentryInfo = {
        contextName: 'Updating borrow status',
        properties: sentryProperties,
      };
      handleGenericError({ error, toast: errorToast, sentryInfo });
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
                isDisabled={isUpdating}
                className="switch-borrowing"
                h="20px"
                isChecked={!isPaused}
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
