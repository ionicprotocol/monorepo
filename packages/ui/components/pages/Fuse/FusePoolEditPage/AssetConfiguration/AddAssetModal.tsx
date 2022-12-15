import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  CircularProgress,
  Divider,
  Flex,
  Heading,
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
import { SupportedAsset } from '@midas-capital/types';
import { useEffect, useMemo, useState } from 'react';

import { AddAssetSettings } from '@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/AddAssetSettings';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useTokenData } from '@ui/hooks/useTokenData';
import { sortSupportedAssets } from '@ui/utils/sorts';

interface AddAssetProps {
  comptrollerAddress: string;
  onSuccess?: () => void;
  poolID: string;
  poolName: string;
  poolChainId: number;
}

const AddAsset = ({
  comptrollerAddress,
  onSuccess,
  poolID,
  poolName,
  poolChainId,
}: AddAssetProps) => {
  const { currentSdk } = useMultiMidas();

  const supportedAssets = useMemo(() => {
    if (currentSdk) {
      return currentSdk.supportedAssets.filter((asset) => !asset.disabled);
    } else {
      return [];
    }
  }, [currentSdk]);

  const [nameOrAddress, setNameOrAddress] = useState<string>('');

  const [availableAssets, setAvailableAssets] = useState<SupportedAsset[] | []>([]);
  const [addedAssets, setAddedAssets] = useState<string[] | undefined>();
  const { data: poolData } = useFusePoolData(poolID, poolChainId);

  const { data: tokenData, isLoading, error } = useTokenData(nameOrAddress, poolData?.chainId);

  const { cPage } = useColors();

  useEffect(() => {
    const availableAssets = supportedAssets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(nameOrAddress.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(nameOrAddress.toLowerCase())
    );
    setAvailableAssets(sortSupportedAssets(availableAssets));
  }, [nameOrAddress, supportedAssets]);

  useEffect(() => {
    if (poolData && poolData.assets.length !== 0) {
      const addresses = poolData.assets.map((asset) => asset.underlyingToken.toLowerCase());
      setAddedAssets(addresses);
    }
  }, [poolData]);

  return (
    <VStack py={4}>
      <VStack px={4} width="100%">
        <VStack>
          {tokenData && poolData && (
            <TokenIcon size="lg" address={tokenData.address} chainId={poolData.chainId} my={4} />
          )}
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
          poolChainId={poolChainId}
        />
      ) : (
        <>
          {poolData?.assets.length !== 0 && (
            <Box width="100%">
              <Text textAlign="left" size="md" fontWeight="bold" mt={2} px={6}>
                Added assets
              </Text>
            </Box>
          )}
          <Wrap
            px={5}
            spacing={2}
            justify="flex-start"
            width="95%"
            height="200px"
            overflowY="auto"
            css={{
              '&::-webkit-scrollbar': {
                display: 'block',
                width: '4px',
                height: '4px',
              },
              '&::-webkit-scrollbar-track': {
                width: '4px',
                height: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: cPage.primary.borderColor,
              },
              '&::-webkit-scrollbar-corner': {
                display: 'none',
              },
            }}
          >
            {poolData &&
              poolData.assets.map((asset, index) => {
                return (
                  <WrapItem key={index}>
                    <Button variant="_solid" px={2}>
                      <TokenIcon
                        size="sm"
                        address={asset.underlyingToken}
                        chainId={poolData.chainId}
                      />
                      <Center pl={1} fontWeight="bold">
                        {asset.underlyingSymbol}
                      </Center>
                    </Button>
                  </WrapItem>
                );
              })}
          </Wrap>

          {poolData && availableAssets.length !== 0 ? (
            <>
              <Box width="100%">
                <Text textAlign="left" size="md" fontWeight="bold" px={6} mt={4}>
                  Available supported assets
                </Text>
              </Box>
              <Flex
                className="addAssetModal"
                direction="column"
                width="95%"
                alignItems="center"
                height="400px"
                overflow="auto"
                css={{
                  '&::-webkit-scrollbar': {
                    display: 'block',
                    width: '4px',
                    height: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    width: '4px',
                    height: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: cPage.primary.borderColor,
                  },
                  '&::-webkit-scrollbar-corner': {
                    display: 'none',
                  },
                }}
              >
                {availableAssets.map((asset, index) => {
                  return (
                    <Button
                      variant="listed"
                      key={index}
                      width="100%"
                      justifyContent="flex-start"
                      onClick={() => setNameOrAddress(asset.underlying)}
                      disabled={addedAssets && addedAssets.includes(asset.underlying.toLowerCase())}
                      height="max-content"
                    >
                      <Flex direction="row" alignContent="center" py={2}>
                        <TokenIcon address={asset.underlying} chainId={poolData.chainId} />
                        <Flex ml={6} direction="column">
                          <Text size="lg" textAlign="left">
                            {asset.symbol}
                          </Text>
                          <Spacer />
                          <Text fontWeight="normal" size="md" textAlign="left">
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
  poolChainId,
  ...addAssetProps
}: {
  isOpen: boolean;
  poolChainId: number;
  onClose: () => void;
} & AddAssetProps) => {
  return (
    <Modal motionPreset="slideInBottom" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text variant="title" fontWeight="bold">
            Add Asset
          </Text>
        </ModalHeader>
        <ModalCloseButton top={4} />
        <Divider />
        <AddAsset onSuccess={onClose} poolChainId={poolChainId} {...addAssetProps} />
      </ModalContent>
    </Modal>
  );
};

export default AddAssetModal;
