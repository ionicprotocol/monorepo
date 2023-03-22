// Chakra and UI
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, VStack } from '@chakra-ui/layout';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Button,
  Flex,
  Icon,
  Link,
  Text,
} from '@chakra-ui/react';
import { Spinner } from '@chakra-ui/spinner';
import { useMemo } from 'react';
import { BsFillCheckCircleFill, BsFillXCircleFill } from 'react-icons/bs';

import { Row } from '@ui/components/shared/Flex';
import { useColors } from '@ui/hooks/useColors';
import type { TxStep } from '@ui/types/ComponentPropsType';
import { getScanUrlByChainId } from '@ui/utils/networkData';

const TransactionStepper = ({
  activeStep,
  steps,
  failedStep,
  isLoading,
  poolChainId,
}: {
  activeStep: number;
  failedStep: number;
  isLoading: boolean;
  poolChainId: number;
  steps: TxStep[];
}) => {
  const { cCard } = useColors();
  const scanUrl = useMemo(() => getScanUrlByChainId(poolChainId), [poolChainId]);

  return (
    <>
      <Row crossAxisAlignment="center" mainAxisAlignment="center">
        <Accordion
          allowMultiple
          borderColor={cCard.hoverBgColor}
          borderWidth={1}
          index={Array.from(Array(activeStep).keys())}
          width="100%"
        >
          {steps.map((step, index) => {
            return (
              <AccordionItem border="none" key={index}>
                <h2>
                  <AccordionButton
                    _hover={{ bgColor: cCard.hoverBgColor }}
                    bgColor={cCard.hoverBgColor}
                  >
                    <Box
                      alignItems="center"
                      borderColor={cCard.borderColor}
                      borderRadius="50%"
                      borderWidth={3}
                      height={30}
                      justifyContent="center"
                      width={30}
                    >
                      <Text color={cCard.borderColor} fontSize={18} fontWeight="bold" height="100%">
                        {index + 1}
                      </Text>
                    </Box>

                    <Box flex="1" ml={4} textAlign="left">
                      <Text color={cCard.borderColor} fontWeight="bold" variant="mdText">
                        {step.title}
                      </Text>
                    </Box>

                    {failedStep - 1 === index ? (
                      <Icon as={BsFillXCircleFill} color={'fail'} height={25} width={25} />
                    ) : activeStep - 1 === index ? (
                      isLoading ? (
                        <Spinner borderWidth={3} color={cCard.borderColor} height={30} width={30} />
                      ) : (
                        <Icon as={BsFillCheckCircleFill} color={'success'} height={25} width={25} />
                      )
                    ) : activeStep > index ? (
                      <Icon as={BsFillCheckCircleFill} color={'success'} height={25} width={25} />
                    ) : null}
                  </AccordionButton>
                </h2>
                <AccordionPanel py={2}>
                  <VStack alignItems="flex-start" ml={12} spacing={0}>
                    <Text>{step.desc}</Text>
                    <Flex justifyContent="flex-end" width="100%">
                      {step.txHash ? (
                        <Link href={`${scanUrl}/tx/${step.txHash}`} isExternal rel="noreferrer">
                          <Button rightIcon={<ExternalLinkIcon />} size="sm" variant={'external'}>
                            Review tx details
                          </Button>
                        </Link>
                      ) : null}
                    </Flex>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>
      </Row>
    </>
  );
};
export default TransactionStepper;
