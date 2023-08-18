import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  CircularProgress,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Spacer,
  Text,
  VStack,
  Wrap,
  WrapItem
} from '@chakra-ui/react';
import type { SupportedAsset } from '@ionicprotocol/types';
import { useEffect, useMemo, useState } from 'react';

import { AddAssetSettings } from '@ui/components/pages/EditPoolPage/AssetConfiguration/AddAssetModal/AddAssetSettings';
import { IonicModal } from '@ui/components/shared/Modal';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useColors } from '@ui/hooks/useColors';
import { usePoolData } from '@ui/hooks/usePoolData';
import { useTokenData } from '@ui/hooks/useTokenData';
import { sortSupportedAssets } from '@ui/utils/sorts';

interface AddAssetProps {
  comptrollerAddress: string;
  onSuccess?: () => void;
  poolChainId: number;
  poolID: string;
  poolName: string;
}

const AddAsset = ({
  comptrollerAddress,
  onSuccess,
  poolID,
  poolName,
  poolChainId
}: AddAssetProps) => {
  const { currentSdk } = useMultiIonic();

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
  const { data: poolData } = usePoolData(poolID, poolChainId);

  const { data: tokenData, isLoading, error } = useTokenData(nameOrAddress, poolData?.chainId);

  const { cIPage } = useColors();

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
    <VStack>
      <VStack px={4} width="100%">
        <VStack>
          {tokenData && poolData && (
            <TokenIcon address={tokenData.address} chainId={poolData.chainId} my={4} size="lg" />
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
              autoFocus
              isInvalid={!!error}
              onChange={(event) => setNameOrAddress(event.target.value)}
              placeholder={'Search name or paste address'}
              textAlign="center"
              value={nameOrAddress}
            />
            <InputRightElement right={3}>
              {error ? (
                <CloseIcon color="fail" />
              ) : isLoading ? (
                <CircularProgress color="ecru" isIndeterminate size={'16px'} />
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
          onSuccess={onSuccess}
          poolChainId={poolChainId}
          poolID={poolID}
          poolName={poolName}
          tokenData={tokenData}
        />
      ) : (
        <>
          {poolData?.assets.length !== 0 && (
            <Box width="100%">
              <Text fontWeight="bold" mt={2} px={6} size="md" textAlign="left">
                Added assets
              </Text>
            </Box>
          )}
          <Box pr={2} width="100%">
            <Wrap
              css={{
                '&::-webkit-scrollbar': {
                  display: 'block',
                  height: '4px',
                  width: '4px'
                },
                '&::-webkit-scrollbar-corner': {
                  display: 'none'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: cIPage.dividerColor
                },
                '&::-webkit-scrollbar-track': {
                  height: '4px',
                  width: '4px'
                }
              }}
              justify="flex-start"
              maxHeight="200px"
              overflowY="auto"
              px={4}
              spacing={2}
              width="100%"
            >
              {poolData &&
                poolData.assets.map((asset, index) => {
                  return (
                    <WrapItem key={index}>
                      <Button px={2} variant="_solid">
                        <TokenIcon
                          address={asset.underlyingToken}
                          chainId={poolData.chainId}
                          size="sm"
                        />
                        <Center fontWeight="bold" pl={1}>
                          {asset.underlyingSymbol}
                        </Center>
                      </Button>
                    </WrapItem>
                  );
                })}
            </Wrap>
          </Box>

          {poolData && availableAssets.length !== 0 ? (
            <>
              <Box width="100%">
                <Text fontWeight="bold" mt={4} px={6} size="md" textAlign="left">
                  Available supported assets
                </Text>
              </Box>
              <Box pr={2} width="100%">
                <Flex
                  alignItems="center"
                  className="addAssetModal"
                  css={{
                    '&::-webkit-scrollbar': {
                      display: 'block',
                      height: '4px',
                      width: '4px'
                    },
                    '&::-webkit-scrollbar-corner': {
                      display: 'none'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: cIPage.dividerColor
                    },
                    '&::-webkit-scrollbar-track': {
                      height: '4px',
                      width: '4px'
                    }
                  }}
                  direction="column"
                  maxHeight="400px"
                  overflow="auto"
                  width="100%"
                >
                  {availableAssets.map((asset, index) => {
                    return (
                      <Button
                        disabled={
                          addedAssets && addedAssets.includes(asset.underlying.toLowerCase())
                        }
                        height="max-content"
                        justifyContent="flex-start"
                        key={index}
                        onClick={() => setNameOrAddress(asset.underlying)}
                        variant="ghost"
                        width="100%"
                      >
                        <Flex alignContent="center" direction="row" py={2}>
                          <TokenIcon address={asset.underlying} chainId={poolData.chainId} />
                          <Flex direction="column" ml={6}>
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
              </Box>
            </>
          ) : error ? (
            <Text fontSize={18} fontWeight="bold" my={2} px={6} textAlign="left" width="100%">
              Invalid address
            </Text>
          ) : (
            <Text fontSize={18} fontWeight="bold" my={2} px={6} textAlign="left" width="100%">
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
}: AddAssetProps & {
  isOpen: boolean;
  onClose: () => void;
  poolChainId: number;
}) => {
  return (
    <IonicModal
      body={<AddAsset onSuccess={onClose} poolChainId={poolChainId} {...addAssetProps} />}
      header="Add Asset"
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};

export default AddAssetModal;
