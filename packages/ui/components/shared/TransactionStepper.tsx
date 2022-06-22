// Chakra and UI
import { CloseIcon as FailIcon, CheckIcon as SuccessIcon } from '@chakra-ui/icons';
import { Box } from '@chakra-ui/layout';
import { Accordion, AccordionButton, AccordionItem, Icon, Text } from '@chakra-ui/react';
import { Spinner } from '@chakra-ui/spinner';

import { Row } from '@ui/components/shared/Flex';
import { useColors } from '@ui/hooks/useColors';

const TransactionStepper = ({
  activeStep,
  steps,
  failedStep,
}: {
  steps: string[];
  activeStep: number;
  failedStep: number;
}) => {
  const { cCard } = useColors();
  return (
    <>
      <Row mainAxisAlignment="center" crossAxisAlignment="center">
        <Accordion allowToggle width="100%" index={activeStep - 1}>
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
                      {step}
                    </Box>

                    {failedStep - 1 === index ? (
                      <Icon as={FailIcon} width={'22px'} height={'22px'} color={'fail'}></Icon>
                    ) : activeStep - 1 === index ? (
                      <Spinner
                        width={30}
                        height={30}
                        borderWidth={3}
                        color={cCard.borderColor}
                      ></Spinner>
                    ) : activeStep > index ? (
                      <Icon as={SuccessIcon} width={25} height={25} color={'success'}></Icon>
                    ) : null}
                  </AccordionButton>
                </h2>
              </AccordionItem>
            );
          })}
        </Accordion>
      </Row>
    </>
  );
};
export default TransactionStepper;
