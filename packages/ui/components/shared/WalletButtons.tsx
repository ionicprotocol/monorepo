import { Button, Center, Divider, Flex, HStack, Icon, Img, Spinner, Text } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { memo } from 'react';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
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
                    <Button fontSize="14px" onClick={openConnectModal} variant="ghost">
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
                    <Button onClick={openChainModal} px={2} variant="ghost">
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
                      <Icon as={MdOutlineKeyboardArrowDown} color={'iWhite'} height={6} width={6} />
                    </Button>
                    <Center height={6}>
                      <Divider bg={cIPage.dividerColor} orientation="vertical" width="2px" />
                    </Center>
                    <Button onClick={openAccountModal} px={2} variant="ghost">
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
