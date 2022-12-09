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
import { TxStep } from '@ui/types/ComponentPropsType';
import { getScanUrlByChainId } from '@ui/utils/networkData';

const TransactionStepper = ({
  activeStep,
  steps,
  failedStep,
  isLoading,
  poolChainId,
}: {
  steps: TxStep[];
  activeStep: number;
  failedStep: number;
  isLoading: boolean;
  poolChainId: number;
}) => {
  const { cCard } = useColors();
  const scanUrl = useMemo(() => getScanUrlByChainId(poolChainId), [poolChainId]);

  return (
    <>
      <Row mainAxisAlignment="center" crossAxisAlignment="center">
        <Accordion allowMultiple width="100%" index={Array.from(Array(activeStep).keys())}>
          {steps.map((step, index) => {
            return (
              <AccordionItem key={index}>
                <h2>
                  <AccordionButton>
                    <Box
                      width={30}
                      height={30}
                      alignItems="center"
                      justifyContent="center"
                      borderWidth={3}
                      borderColor={cCard.borderColor}
                      borderRadius="50%"
                    >
                      <Text height="100%" color={cCard.borderColor} fontSize={18} fontWeight="bold">
                        {index + 1}
                      </Text>
                    </Box>

                    <Box flex="1" textAlign="left" ml={4}>
                      <Text variant="mdText" color={cCard.borderColor} fontWeight="bold">
                        {step.title} {step.done ? '(Done)' : null}
                      </Text>
                    </Box>

                    {failedStep - 1 === index ? (
                      <Icon as={BsFillXCircleFill} width={25} height={25} color={'fail'} />
                    ) : activeStep - 1 === index ? (
                      isLoading ? (
                        <Spinner width={30} height={30} borderWidth={3} color={cCard.borderColor} />
                      ) : (
                        <Icon as={BsFillCheckCircleFill} width={25} height={25} color={'success'} />
                      )
                    ) : activeStep > index ? (
                      <Icon as={BsFillCheckCircleFill} width={25} height={25} color={'success'} />
                    ) : null}
                  </AccordionButton>
                </h2>
                <AccordionPanel pt={0} pb={2}>
                  <VStack alignItems="flex-start" ml={12} spacing={0}>
                    <Text>{step.desc}</Text>
                    <Flex justifyContent="flex-end" width="100%">
                      {step.done && step.txHash ? (
                        <Link href={`${scanUrl}/tx/${step.txHash}`} isExternal rel="noreferrer">
                          <Button variant={'external'} size="sm" rightIcon={<ExternalLinkIcon />}>
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
