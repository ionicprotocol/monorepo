import { Button, Center, Divider, Flex, HStack, Img, Spinner, Text } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { memo } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

import ClaimAllRewardsButton from '@ui/components/shared/ClaimAllRewardsButton';
import { Row } from '@ui/components/shared/Flex';
import { useColors } from '@ui/hooks/useColors';
import { shortAddress } from '@ui/utils/shortAddress';

export const WalletButtons = memo(() => {
  const { cIPage } = useColors();

  return (
    <Row crossAxisAlignment="center" gap={4} mainAxisAlignment="center">
      <ClaimAllRewardsButton />
      <ConnectButton.Custom>
        {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none'
                }
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <Button
                      color={'iWhite'}
                      fontSize="14px"
                      onClick={openConnectModal}
                      variant="ghost"
                    >
                      Connect Wallet
                    </Button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <Button onClick={openChainModal} variant="ghost">
                      Change Network
                    </Button>
                  );
                }

                return (
                  <Flex alignItems="center" gap={4}>
                    <Button color={'iWhite'} onClick={openChainModal} px={2}>
                      {chain.iconUrl && (
                        <Img
                          alt={chain.name ?? 'Chain icon'}
                          borderRadius="50%"
                          height={6}
                          src={chain.iconUrl}
                          width={6}
                        />
                      )}
                      <Text display={{ base: 'none', md: 'flex' }} ml={2} size="md">
                        {chain.name}
                      </Text>
                    </Button>
                    <Center height={6}>
                      <Divider bg={cIPage.dividerColor} orientation="vertical" width="2px" />
                    </Center>
                    <Button color={'iWhite'} onClick={openAccountModal} px={2}>
                      {account.hasPendingTransactions ? (
                        <HStack>
                          <Center height="100%">
                            <Spinner size="md" speed="1s" thickness="4px" />
                          </Center>
                          <Text display={{ base: 'none', md: 'flex' }} size="md">
                            Pending
                          </Text>
                        </HStack>
                      ) : (
                        <HStack>
                          {<Jazzicon diameter={23} seed={jsNumberForAddress(account.address)} />}
                          <Text display={{ base: 'none', md: 'flex' }} size="md">
                            {shortAddress(account.address)}
                          </Text>
                        </HStack>
                      )}
                    </Button>
                  </Flex>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </Row>
  );
});
