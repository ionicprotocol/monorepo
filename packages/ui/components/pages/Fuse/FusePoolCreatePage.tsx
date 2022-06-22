import { AddIcon, QuestionIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  IconButton,
  Input,
  Select,
  Spinner,
  Switch,
  Text,
  useToast,
} from '@chakra-ui/react';
import { isAddress } from '@ethersproject/address';
import { utils } from 'ethers';
import LogRocket from 'logrocket';
import { useRouter } from 'next/router';
import { memo, ReactNode, useState } from 'react';

import FusePageLayout from '@ui/components/pages/Fuse/FusePageLayout';
import DashboardBox from '@ui/components/shared/DashboardBox';
import { Center, Column, Row } from '@ui/components/shared/Flex';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { SliderWithLabel } from '@ui/components/shared/SliderWithLabel';
import { SwitchCSS } from '@ui/components/shared/SwitchCSS';
import { useRari } from '@ui/context/RariContext';
import { useColors } from '@ui/hooks/useColors';
import { useIsSmallScreen } from '@ui/hooks/useScreenSize';
import { handleGenericError } from '@ui/utils/errorHandling';
import { formatPercentage } from '@ui/utils/formatPercentage';

const FusePoolCreatePage = memo(() => {
  return (
    <PageTransitionLayout>
      <FusePageLayout>
        <CreatePoolConfiguration />
      </FusePageLayout>
    </PageTransitionLayout>
  );
});

export default FusePoolCreatePage;

export const CreatePoolConfiguration = () => {
  const toast = useToast();

  const { fuse, currentChain, address } = useRari();
  const router = useRouter();

  const [name, setName] = useState('');
  const [oracle, setOracle] = useState('');
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [whitelist, setWhitelist] = useState<string[]>([]);

  const [closeFactor, setCloseFactor] = useState(50);
  const [liquidationIncentive, setLiquidationIncentive] = useState(8);

  const [isCreating, setIsCreating] = useState(false);

  const onDeploy = async () => {
    if (name === '') {
      toast({
        title: 'Error!',
        description: 'You must specify a name for your Fuse pool!',
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });

      return;
    }

    if (oracle === '') {
      toast({
        title: 'Error!',
        description: 'You must select an oracle.',
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });

      return;
    }

    setIsCreating(true);
    // 50% -> 50 * (1e18 / 100)
    const bigCloseFactor = utils.parseUnits(closeFactor.toString(), 16);

    // 8% -> 108 * (1e18 / 100)
    const bigLiquidationIncentive = utils.parseUnits((liquidationIncentive + 100).toString(), 16);

    const reporter = null;

    try {
      const deployResult = await fuse.deployPool(
        name,
        isWhitelisted,
        bigCloseFactor,
        bigLiquidationIncentive,
        oracle,
        { reporter },
        { from: address },
        isWhitelisted ? whitelist : []
      );
      const poolId = deployResult.pop();

      toast({
        title: 'Your pool has been deployed!',
        description: 'You may now add assets to it.',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });

      LogRocket.track('Fuse-CreatePool');

      if (typeof poolId === 'number') {
        await router.push(`/${currentChain.id}/pool/${poolId}`);
      } else {
        await router.push(`/${currentChain.id}?filter=created-pools`);
      }
    } catch (e) {
      handleGenericError(e, toast);
      setIsCreating(false);
    }
  };

  const { cCard, cSolidBtn, cSwitch } = useColors();
  const isMobile = useIsSmallScreen();
  return (
    <Box alignSelf={'center'} mx="auto">
      <DashboardBox maxWidth="550px" mx={'auto'}>
        <Heading fontWeight="extrabold" size="md" px={4} py={4}>
          Create Pool
        </Heading>

        <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
          <Divider bg={cCard.dividerColor} />

          <OptionRow>
            <Text fontWeight="normal" mr={4}>
              Name
            </Text>
            <Input
              width="60%"
              placeholder="Type Pool name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </OptionRow>

          <Divider bg={cCard.dividerColor} />

          <OptionRow>
            <Text fontWeight="normal" mr={4}>
              Oracle
            </Text>
            <Select
              width="60%"
              value={oracle}
              onChange={(event) => setOracle(event.target.value)}
              placeholder="Select Oracle"
            >
              {currentChain.id === 1337 ? (
                <option
                  className="white-bg-option"
                  value={fuse.chainDeployment.MasterPriceOracle.address}
                >
                  MasterPriceOracle
                </option>
              ) : (
                <>
                  <option
                    className="white-bg-option"
                    value={fuse.chainDeployment.MasterPriceOracle.address}
                  >
                    MasterPriceOracle
                  </option>
                </>
              )}
            </Select>
          </OptionRow>

          <Divider bg={cCard.dividerColor} />

          <OptionRow>
            <SimpleTooltip
              label={
                "If enabled you will be able to limit the ability to supply to the pool to a select group of addresses. The pool will not show up on the 'all pools' list."
              }
            >
              <Text fontWeight="normal">
                Whitelisted <QuestionIcon ml={1} mb="4px" />
              </Text>
            </SimpleTooltip>

            <Row mainAxisAlignment={'center'} crossAxisAlignment="center">
              <SwitchCSS symbol="whitelist" color={cSwitch.bgColor} />
              <Switch
                className="whitelist-switch"
                isChecked={isWhitelisted}
                onChange={() => {
                  setIsWhitelisted((past) => !past);
                  // Add the user to the whitelist by default
                  if (whitelist.length === 0) {
                    setWhitelist([address]);
                  }
                }}
                size={isMobile ? 'sm' : 'md'}
                cursor={'pointer'}
                _focus={{ boxShadow: 'none' }}
                _hover={{}}
              />
            </Row>
          </OptionRow>

          {isWhitelisted ? (
            <WhitelistInfo
              whitelist={whitelist}
              addToWhitelist={(user) => {
                setWhitelist((past) => [...past, user]);
              }}
              removeFromWhitelist={(user) => {
                setWhitelist((past) =>
                  past.filter(function (item) {
                    return item !== user;
                  })
                );
              }}
            />
          ) : null}

          <Divider bg={cCard.dividerColor} />

          <Flex p={4} w="100%" direction={{ base: 'column', md: 'row' }}>
            <SimpleTooltip
              label={
                "The percent, ranging from 0% to 100%, of a liquidatable account's borrow that can be repaid in a single liquidate transaction. If a user has multiple borrowed assets, the closeFactor applies to any single borrowed asset, not the aggregated value of a user’s outstanding borrowing. Compound's close factor is 50%."
              }
            >
              <Text fontWeight="normal">
                Close Factor <QuestionIcon ml={1} mb="4px" />
              </Text>
            </SimpleTooltip>

            <SliderWithLabel
              value={closeFactor}
              setValue={setCloseFactor}
              formatValue={formatPercentage}
              min={5}
              max={90}
              ml="auto"
              mt={{ base: 4, md: 0 }}
            />
          </Flex>

          <Divider bg={cCard.dividerColor} />

          <Flex p={4} w="100%" direction={{ base: 'column', md: 'row' }}>
            <SimpleTooltip
              label={
                "The additional collateral given to liquidators as an incentive to perform liquidation of underwater accounts. For example, if the liquidation incentive is 10%, liquidators receive an extra 10% of the borrowers collateral for every unit they close. Compound's liquidation incentive is 8%."
              }
            >
              <Text fontWeight="normal">
                Liquidation Incentive <QuestionIcon ml={1} mb="4px" />
              </Text>
            </SimpleTooltip>

            <SliderWithLabel
              value={liquidationIncentive}
              setValue={setLiquidationIncentive}
              formatValue={formatPercentage}
              min={0}
              max={50}
              ml={{ base: 'auto', md: 4 }}
              mt={{ base: 4, md: 0 }}
            />
          </Flex>
        </Column>
      </DashboardBox>
      <Center>
        <Button
          width={'100%'}
          height="60px"
          mt={4}
          fontSize="xl"
          onClick={onDeploy}
          maxWidth={'500px'}
          disabled={isCreating}
        >
          <Center color={cSolidBtn.primary.txtColor} fontWeight="bold">
            {isCreating ? <Spinner /> : 'Create'}
          </Center>
        </Button>
      </Center>
    </Box>
  );
};

const OptionRow = ({ children, ...others }: { children: ReactNode; [key: string]: ReactNode }) => {
  return (
    <Row
      mainAxisAlignment="space-between"
      crossAxisAlignment="center"
      width="100%"
      p={4}
      overflowX="auto"
      {...others}
    >
      {children}
    </Row>
  );
};

export const WhitelistInfo = ({
  whitelist,
  addToWhitelist,
  removeFromWhitelist,
}: {
  whitelist: string[];
  addToWhitelist: (user: string) => void;
  removeFromWhitelist: (user: string) => void;
}) => {
  const [_whitelistInput, _setWhitelistInput] = useState('');

  const toast = useToast();
  const { cSolidBtn } = useColors();

  return (
    <>
      <OptionRow my={0} mb={4}>
        <Input
          type="text"
          value={_whitelistInput}
          onChange={(event) => _setWhitelistInput(event.target.value)}
          placeholder="0x0000000000000000000000000000000000000000"
        />
        <IconButton
          flexShrink={0}
          aria-label="add"
          icon={<AddIcon />}
          width={35}
          ml={2}
          bg={cSolidBtn.primary.bgColor}
          color={cSolidBtn.primary.txtColor}
          onClick={() => {
            if (isAddress(_whitelistInput) && !whitelist.includes(_whitelistInput)) {
              addToWhitelist(_whitelistInput);
              _setWhitelistInput('');
            } else {
              toast({
                title: 'Error!',
                description:
                  'This is not a valid ethereum address (or you have already entered this address)',
                status: 'error',
                duration: 2000,
                isClosable: true,
                position: 'top-right',
              });
            }
          }}
          _hover={{ bg: cSolidBtn.primary.hoverBgColor, color: cSolidBtn.primary.hoverTxtColor }}
          _active={{}}
        />
      </OptionRow>
      {whitelist.length > 0 ? (
        <Text mb={4} ml={4} width="100%">
          <b>Already added: </b>
          {whitelist.map((user, index, array) => (
            <Text
              key={user}
              className="underline-on-hover"
              as="button"
              onClick={() => removeFromWhitelist(user)}
            >
              {user}
              {array.length - 1 === index ? null : <>,&nbsp;</>}
            </Text>
          ))}
        </Text>
      ) : null}
    </>
  );
};
