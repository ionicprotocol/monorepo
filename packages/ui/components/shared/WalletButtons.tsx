import { Button, Center, Flex, HStack, Img, Spinner, Text } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

import ClaimAllRewardsButton from '@ui/components/shared/ClaimAllRewardsButton';
import { Row } from '@ui/components/shared/Flex';
import { useIsSmallScreen } from '@ui/hooks/useScreenSize';
import { shortAddress } from '@ui/utils/shortAddress';

export const WalletButtons = () => {
  const isMobile = useIsSmallScreen();

  return (
    <Row mainAxisAlignment="center" crossAxisAlignment="center" gap={2}>
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
                          src={chain.iconUrl}
                          width={6}
                          height={6}
                          borderRadius="50%"
                        />
                      )}
                      {!isMobile && <Text ml={2}>{chain.name}</Text>}
                    </Button>
                    <Button onClick={openAccountModal} px={2}>
                      {account.hasPendingTransactions ? (
                        <HStack>
                          <Center height="100%">
                            <Spinner size="md" thickness="4px" speed="1s" />
                          </Center>
                          {!isMobile && <Text>Pending</Text>}
                        </HStack>
                      ) : (
                        <HStack>
                          {<Jazzicon diameter={23} seed={jsNumberForAddress(account.address)} />}
                          {!isMobile && <Text>{shortAddress(account.address)}</Text>}
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
};
