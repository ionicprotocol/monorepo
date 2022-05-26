import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  CircularProgress,
  Flex,
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
  Spacer,
  Text,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { SupportedAsset } from '@midas-capital/sdk/dist/cjs/src/types';
import { useEffect, useState } from 'react';

import { AddAssetSettings } from '@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/AddAssetSettings';
import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import { ModalDivider } from '@ui/components/shared/Modal';
import { useRari } from '@ui/context/RariContext';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useTokenData } from '@ui/hooks/useTokenData';

interface AddAssetProps {
  comptrollerAddress: string;
  onSuccess?: () => void;
  poolID: string;
  poolName: string;
}

const AddAsset = ({ comptrollerAddress, onSuccess, poolID, poolName }: AddAssetProps) => {
  const { fuse } = useRari();
  const [nameOrAddress, setNameOrAddress] = useState<string>('');
  const [supportedAssets, setSupportedAssets] = useState<SupportedAsset[] | []>(
    fuse.supportedAssets
  );
  const [addedAssets, setAddedAssets] = useState<string[] | undefined>();
  const { data: poolData } = useFusePoolData(poolID);

  const { data: tokenData, isLoading, error } = useTokenData(nameOrAddress);

  useEffect(() => {
    const searchResults = fuse.supportedAssets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(nameOrAddress.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(nameOrAddress.toLowerCase())
    );
    setSupportedAssets(searchResults);
  }, [nameOrAddress, fuse.supportedAssets]);

  useEffect(() => {
    if (poolData && poolData.assets.length !== 0) {
      const addresses = poolData.assets.map((asset) => asset.underlyingToken);
      setAddedAssets(addresses);
    }
  }, [poolData]);

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
            <Heading as="h2" size="md">
              {tokenData.name}
            </Heading>
          )}
        </VStack>

        <VStack width="100%">
          <InputGroup>
            <Input
              textAlign="center"
              placeholder={'Search name or paste address'}
              value={nameOrAddress}
              isInvalid={!!error}
              onChange={(event) => setNameOrAddress(event.target.value)}
              autoFocus
            />
            <InputRightElement right={3}>
              {error ? (
                <CloseIcon color="fail" />
              ) : isLoading ? (
                <CircularProgress size={'16px'} isIndeterminate color="ecru" />
              ) : tokenData ? (
                <CheckIcon color="success" />
              ) : null}
            </InputRightElement>
          </InputGroup>
        </VStack>
      </VStack>

      {isLoading ? (
        <></>
      ) : tokenData ? (
        <AddAssetSettings
          comptrollerAddress={comptrollerAddress}
          tokenData={tokenData}
          onSuccess={onSuccess}
          poolName={poolName}
          poolID={poolID}
        />
      ) : (
        <>
          {poolData?.assets.length !== 0 && (
            <Box width="100%">
              <Text textAlign="left" fontSize={18} fontWeight="bold" mt={2} px={6}>
                Added assets
              </Text>
            </Box>
          )}
          <Wrap px={5} spacing={2} justify="flex-start" width="100%">
            {poolData &&
              poolData.assets.map((asset, index) => {
                return (
                  <WrapItem key={index}>
                    <Button variant="solid">
                      <CTokenIcon size="sm" address={asset.underlyingToken} />
                      <Center py={1} pl={2} fontWeight="bold">
                        {asset.underlyingSymbol}
                      </Center>
                    </Button>
                  </WrapItem>
                );
              })}
          </Wrap>

          {supportedAssets.length !== 0 ? (
            <>
              <Box width="100%">
                <Text textAlign="left" fontSize={18} fontWeight="bold" px={6} mt={4}>
                  Available supported assets
                </Text>
              </Box>

              <Flex
                direction="column"
                width="100%"
                alignItems="center"
                px={6}
                height="400px"
                overflow="scroll"
              >
                {supportedAssets.map((asset) => {
                  return (
                    <Button
                      variant="listed"
                      key={asset.name}
                      width="100%"
                      justifyContent="flex-start"
                      height="60px"
                      px={2}
                      onClick={() => setNameOrAddress(asset.underlying)}
                      disabled={addedAssets && addedAssets.includes(asset.underlying)}
                    >
                      <Flex direction="row" alignContent="center">
                        <CTokenIcon address={asset.underlying} />
                        <Flex ml={6} direction="column">
                          <Text fontSize={24} textAlign="left">
                            {asset.symbol}
                          </Text>
                          <Spacer />
                          <Text fontWeight="normal" textAlign="left" fontSize={16}>
                            {asset.name}
                          </Text>
                        </Flex>
                      </Flex>
                    </Button>
                  );
                })}
              </Flex>
            </>
          ) : error ? (
            <Text px={6} textAlign="left" width="100%" fontSize={18} fontWeight="bold" my={2}>
              Invalid address
            </Text>
          ) : (
            <Text px={6} textAlign="left" width="100%" fontSize={18} fontWeight="bold" my={2}>
              Not available
            </Text>
          )}
        </>
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
