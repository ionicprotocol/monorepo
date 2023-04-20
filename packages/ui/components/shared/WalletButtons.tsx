import { Button, Center, Flex, HStack, Img, Spinner, Text } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { memo } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

import ClaimAllRewardsButton from '@ui/components/shared/ClaimAllRewardsButton';
import { Row } from '@ui/components/shared/Flex';
import { shortAddress } from '@ui/utils/shortAddress';

export const WalletButtons = memo(() => {
  return (
    <Row crossAxisAlignment="center" gap={2} mainAxisAlignment="center">
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
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return <Button onClick={openConnectModal}>Connect Wallet</Button>;
                }

                if (chain.unsupported) {
                  return <Button onClick={openChainModal}>Change Network</Button>;
                }

                return (
                  <Flex gap={2}>
                    <Button onClick={openChainModal} px={2}>
                      {chain.iconUrl && (
                        <Img
                          alt={chain.name ?? 'Chain icon'}
                          borderRadius="50%"
                          height={6}
                          src={chain.iconUrl}
                          width={6}
                        />
                      )}
                      <Text color="raisinBlack" display={{ base: 'none', md: 'flex' }} ml={2}>
                        {chain.name}
                      </Text>
                    </Button>
                    <Button onClick={openAccountModal} px={2}>
                      {account.hasPendingTransactions ? (
                        <HStack>
                          <Center height="100%">
                            <Spinner size="md" speed="1s" thickness="4px" />
                          </Center>
                          <Text color="raisinBlack" display={{ base: 'none', md: 'flex' }}>
                            Pending
                          </Text>
                        </HStack>
                      ) : (
                        <HStack>
                          {<Jazzicon diameter={23} seed={jsNumberForAddress(account.address)} />}
                          <Text color="raisinBlack" display={{ base: 'none', md: 'flex' }}>
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
