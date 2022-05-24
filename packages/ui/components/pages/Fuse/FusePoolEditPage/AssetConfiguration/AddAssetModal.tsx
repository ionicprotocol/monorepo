import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import {
  Button,
  CircularProgress,
  Heading,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';

import { AddAssetSettings } from '@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/AddAssetSettings';
import { ModalDivider } from '@ui/components/shared/Modal';
import { useRari } from '@ui/context/RariContext';
import { useTokenData } from '@ui/hooks/useTokenData';
import { WRAPPED_NATIVE_TOKEN_DATA } from '@ui/networkData/index';

interface AddAssetProps {
  comptrollerAddress: string;
  onSuccess?: () => void;
  poolID: string;
  poolName: string;
}
const AddAsset = ({ comptrollerAddress, onSuccess, poolID, poolName }: AddAssetProps) => {
  const { currentChain } = useRari();
  const [tokenAddress, setTokenAddress] = useState<string>('');

  const { data: tokenData, isLoading, error } = useTokenData(tokenAddress);

  return (
    <VStack py={4}>
      <VStack px={4} width="100%">
        <VStack>
          {tokenData?.logoURL ? (
            <Image alt="" mt={4} src={tokenData.logoURL} boxSize="50px" borderRadius="50%" />
          ) : null}
          <Heading as="h1" size="lg">
            {error && 'Invalid Address!'}
            {tokenData && tokenData.symbol}
          </Heading>
          {tokenData?.name && (
            <Heading as="h2" size="md" isTruncated>
              {tokenData.name}
            </Heading>
          )}
        </VStack>

        <VStack width="100%">
          <InputGroup>
            <Input
              px={2}
              textAlign="center"
              placeholder={'Token Address: 0xXX...XX'}
              value={tokenAddress}
              isInvalid={!!error}
              onChange={(event) => setTokenAddress(event.target.value)}
              autoFocus
            />
            <InputRightElement>
              {error ? (
                <CloseIcon color="fail" />
              ) : isLoading ? (
                <CircularProgress size={'16px'} isIndeterminate color="ecru" />
              ) : tokenData ? (
                <CheckIcon color="success" />
              ) : null}
            </InputRightElement>
          </InputGroup>
          <Button
            alignSelf={'flex-end'}
            variant={'link'}
            pr={4}
            onClick={() => setTokenAddress(WRAPPED_NATIVE_TOKEN_DATA[currentChain.id].address)}
          >
            Use {WRAPPED_NATIVE_TOKEN_DATA[currentChain.id].symbol} Address
          </Button>
        </VStack>
      </VStack>

      {tokenData && (
        <AddAssetSettings
          comptrollerAddress={comptrollerAddress}
          tokenData={tokenData}
          onSuccess={onSuccess}
          poolName={poolName}
          poolID={poolID}
        />
      )}
    </VStack>
  );
};

const AddAssetModal = ({
  isOpen,
  onClose,
  ...addAssetProps
}: {
  isOpen: boolean;
  onClose: () => void;
} & AddAssetProps) => {
  return (
    <Modal motionPreset="slideInBottom" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Asset</ModalHeader>
        <ModalCloseButton top={4} />
        <ModalDivider />
        <AddAsset onSuccess={onClose} {...addAssetProps} />
      </ModalContent>
    </Modal>
  );
};

export default AddAssetModal;
