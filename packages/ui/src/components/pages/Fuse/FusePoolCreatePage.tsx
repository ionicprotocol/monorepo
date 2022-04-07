import { AddIcon, QuestionIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Divider,
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
import { Event } from '@ethersproject/contracts';
import { utils } from 'ethers';
import LogRocket from 'logrocket';
import { useRouter } from 'next/router';
import { memo, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import FusePageLayout from '@components/pages/Fuse/FusePageLayout';
import DashboardBox from '@components/shared/DashboardBox';
import PageTransitionLayout from '@components/shared/PageTransitionLayout';
import { SimpleTooltip } from '@components/shared/SimpleTooltip';
import { SliderWithLabel } from '@components/shared/SliderWithLabel';
import { SwitchCSS } from '@components/shared/SwitchCSS';
import { useRari } from '@context/RariContext';
import { useColors } from '@hooks/useColors';
import { useIsSmallScreen } from '@hooks/useIsSmallScreen';
import { Center, Column, Row } from '@utils/chakraUtils';
import { handleGenericError } from '@utils/errorHandling';
import { formatPercentage } from '@utils/formatPercentage';

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
  const { t } = useTranslation();
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
      const [poolAddress] = await fuse.deployPool(
        name,
        isWhitelisted,
        bigCloseFactor,
        bigLiquidationIncentive,
        oracle,
        { reporter },
        { from: address },
        isWhitelisted ? whitelist : []
      );

      toast({
        title: 'Your pool has been deployed!',
        description: 'You may now add assets to it.',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });

      const fromBlock = await fuse.provider.getBlockNumber();

      const events = await fuse.contracts.FusePoolDirectory.queryFilter(
        fuse.contracts.FusePoolDirectory.filters.PoolRegistered(),
        fromBlock - 60,
        'latest'
      );

      const event = events.filter(
        (e: Event) => e.args?.pool.comptroller.toLowerCase() === poolAddress.toLowerCase()
      )[0];

      LogRocket.track('Fuse-CreatePool');

      const id = event.args?.index;
      await router.push(`/${currentChain.id}/pool/${id}`);
    } catch (e) {
      handleGenericError(e, toast);
      setIsCreating(false);
    }
  };

  const { cCard, cSolidBtn, cSelect, cSwitch } = useColors();
  const isMobile = useIsSmallScreen();
  return (
    <Box alignSelf={'center'} width={'100%'} mx="auto" mt="8%" mb={8}>
      <DashboardBox width={isMobile ? '100%' : '45%'} maxWidth="500px" mx={'auto'} mt={4}>
        <Heading fontWeight="extrabold" size="md" px={4} py={4}>
          {t('Create Pool')}
        </Heading>

        <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
          <Divider bg={cCard.dividerColor} />

          <OptionRow>
            <Text fontWeight="normal" mr={4}>
              Name
            </Text>
            <Input
              width="40%"
              placeholder="Type Pool name"
              value={name}
              borderColor={cCard.borderColor}
              borderWidth={1}
              onChange={(event) => setName(event.target.value)}
              _focus={{}}
              _hover={{}}
            />
          </OptionRow>

          <Divider bg={cCard.dividerColor} />

          <OptionRow>
            <Text fontWeight="normal" mr={4}>
              Oracle
            </Text>
            <Select
              width="40%"
              value={oracle}
              onChange={(event) => setOracle(event.target.value)}
              borderColor={cSelect.borderColor}
              placeholder="Select Oracle"
              _focus={{}}
              _hover={{}}
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
              label={t(
                "If enabled you will be able to limit the ability to supply to the pool to a select group of addresses. The pool will not show up on the 'all pools' list."
              )}
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

          <OptionRow>
            <SimpleTooltip
              label={t(
                "The percent, ranging from 0% to 100%, of a liquidatable account's borrow that can be repaid in a single liquidate transaction. If a user has multiple borrowed assets, the closeFactor applies to any single borrowed asset, not the aggregated value of a user’s outstanding borrowing. Compound's close factor is 50%."
              )}
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
            />
          </OptionRow>

          <Divider bg={cCard.dividerColor} />

          <OptionRow>
            <SimpleTooltip
              label={t(
                "The additional collateral given to liquidators as an incentive to perform liquidation of underwater accounts. For example, if the liquidation incentive is 10%, liquidators receive an extra 10% of the borrowers collateral for every unit they close. Compound's liquidation incentive is 8%."
              )}
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
            />
          </OptionRow>
        </Column>
      </DashboardBox>
      <Center>
        <Button
          width={isMobile ? '100%' : '45%'}
          height="60px"
          mt={4}
          py={3}
          fontSize="xl"
          bg={cSolidBtn.primary.bgColor}
          onClick={onDeploy}
          maxWidth={'500px'}
          disabled={isCreating}
          _hover={{ opacity: 0.8 }}
        >
          <Center color={cSolidBtn.primary.txtColor} fontWeight="bold">
            {isCreating ? <Spinner /> : t('Create')}
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
  // const { fuse } = useRari();
  const toast = useToast();
  const { cInput, cSolidBtn } = useColors();

  return (
    <>
      <OptionRow my={0} mb={4}>
        <Input
          bg={cInput.bgColor}
          color={cInput.txtColor}
          borderRadius={12}
          _focus={{}}
          _hover={{}}
          borderWidth={2}
          borderColor={cInput.borderColor}
          fontSize={18}
          type="text"
          value={_whitelistInput}
          onChange={(event) => _setWhitelistInput(event.target.value)}
          placeholder="0x0000000000000000000000000000000000000000"
          _placeholder={{ color: cInput.placeHolderTxtColor }}
          width="100%"
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
