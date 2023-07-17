import { CheckIcon, SmallCloseIcon as CloseIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  CircularProgress,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack
} from '@chakra-ui/react';
import React, { useCallback, useMemo, useState } from 'react';

import ClipboardValue from '@ui/components/shared/ClipboardValue';
import { Center } from '@ui/components/shared/Flex';
import { IonicModal } from '@ui/components/shared/Modal';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useFlywheel } from '@ui/hooks/rewards/useFlywheel';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import type { AddFlywheelModalProps, AddFlywheelProps } from '@ui/types/ComponentPropsType';
import { shortAddress } from '@ui/utils/shortAddress';

const AddFlywheel = ({ comptrollerAddress, onSuccess }: AddFlywheelProps) => {
  const { currentSdk, address } = useMultiIonic();

  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const [flywheelAddress, setFlywheelAddress] = useState<string>('');
  const { data: flywheel, error, isLoading } = useFlywheel(flywheelAddress);

  const [isAdding, setIsAdding] = useState(false);
  const isReady = useMemo(
    () => flywheel?.address === flywheelAddress,
    [flywheel?.address, flywheelAddress]
  );

  const addFlywheel = useCallback(async () => {
    if (!flywheel || !currentSdk) return;

    try {
      setIsAdding(true);
      const comptroller = currentSdk.createComptroller(comptrollerAddress, currentSdk.signer);
      const tx = await comptroller.functions._addRewardsDistributor(flywheel?.address, {
        from: address
      });
      await tx.wait();
      successToast({
        description: 'Flywheel added to pool!',
        id: 'Added flywheel - ' + Math.random().toString()
      });
      if (onSuccess) onSuccess();
    } catch (e) {
      console.error(e);
      errorToast({
        description: e as string,
        id: 'Adding flywheel - ' + Math.random().toString()
      });
    } finally {
      setIsAdding(false);
    }
  }, [address, comptrollerAddress, errorToast, flywheel, currentSdk, onSuccess, successToast]);

  return (
    <VStack width="100%">
      <InputGroup>
        <Input
          autoFocus
          isInvalid={!!error}
          onChange={(event) => setFlywheelAddress(event.target.value)}
          placeholder="Flywheel Address: 0xXX...XX"
          px={2}
          textAlign="center"
          value={flywheelAddress}
        />
        <InputRightElement>
          {error ? (
            <CloseIcon color="fail" />
          ) : isLoading ? (
            <CircularProgress color="ecru" isIndeterminate size={'16px'} />
          ) : flywheel ? (
            <CheckIcon color="success" />
          ) : null}
        </InputRightElement>
      </InputGroup>

      {flywheel && (
        <VStack width={'100%'}>
          <HStack justify={'space-between'} width={'100%'}>
            <Text>Owner:</Text>
            <ClipboardValue label={shortAddress(flywheel.owner)} value={flywheel.address} />
          </HStack>
          <HStack justify={'space-between'} width={'100%'}>
            <Text>Reward Token:</Text>
            <ClipboardValue label={shortAddress(flywheel.rewardToken)} value={flywheel.address} />
          </HStack>
          <HStack justify={'space-between'} width={'100%'}>
            <Text>Rewards Contract:</Text>
            <ClipboardValue label={shortAddress(flywheel.rewards)} value={flywheel.address} />
          </HStack>
          <HStack justify={'space-between'} width={'100%'}>
            <Text>Booster:</Text>
            <ClipboardValue label={shortAddress(flywheel.booster)} value={flywheel.address} />
          </HStack>
        </VStack>
      )}
      <Box px={4} py={2} width="100%">
        <Button
          disabled={isAdding || !isReady}
          isLoading={isAdding}
          onClick={addFlywheel}
          width="100%"
        >
          Add to Pool
        </Button>
      </Box>
    </VStack>
  );
};

const AddFlywheelModal = ({ isOpen, onClose, ...rest }: AddFlywheelModalProps) => {
  return (
    <IonicModal
      body={
        <Center p={4}>
          <AddFlywheel {...rest} onSuccess={onClose} />
        </Center>
      }
      header="Add Existing Flywheel"
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};

export default AddFlywheelModal;
