// Chakra and UI
import { Box } from '@chakra-ui/layout';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Icon,
  Text,
} from '@chakra-ui/react';
import { Spinner } from '@chakra-ui/spinner';
import { MdCheckCircle, MdOutlineCancel } from 'react-icons/md';

import { useColors } from '@hooks/useColors';
import { Row } from '@utils/chakraUtils';

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
      <Row mainAxisAlignment="center" crossAxisAlignment="center" width="92%" mx="auto">
        <Accordion allowToggle width="100%" index={activeStep - 1}>
          {steps.map((step, index) => {
            return (
              <AccordionItem key={index}>
                <h2>
                  <AccordionButton>
                    {failedStep - 1 === index ? (
                      <Icon
                        as={MdOutlineCancel}
                        width={35}
                        height={35}
                        color={cCard.borderColor}
                      ></Icon>
                    ) : activeStep - 1 === index ? (
                      <Spinner
                        width={30}
                        height={30}
                        borderWidth={3}
                        color={cCard.borderColor}
                      ></Spinner>
                    ) : activeStep > index ? (
                      <Icon
                        as={MdCheckCircle}
                        width={35}
                        height={35}
                        color={cCard.borderColor}
                      ></Icon>
                    ) : (
                      <Box
                        width={30}
                        height={30}
                        alignItems="center"
                        justifyContent="center"
                        borderWidth={3}
                        borderColor={cCard.borderColor}
                        borderRadius="50%"
                      >
                        <Text
                          height="100%"
                          color={cCard.borderColor}
                          fontSize={18}
                          fontWeight="bold"
                        >
                          {index + 1}
                        </Text>
                      </Box>
                    )}

                    <Box flex="1" textAlign="left" ml={4}>
                      {step}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} pl={16}>
                  {step} ...
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>
      </Row>
      {/* <Box
        width="100%"
        h="10%"
        d="flex"
        mb={4}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        // bg="pink"
      >
        <Row mainAxisAlignment="space-around" crossAxisAlignment="center" width="100%">
          {steps.map((step, index) => (
            <Circle
              size="40px"
              color="white"
              key={index}
              opacity={activeStep === index ? '1' : '0.7'}
              bg={activeStep > index ? 'gray' : tokenData.color}
            >
              {activeStep === index ? <Spinner /> : index + 1}
            </Circle>
          ))}
        </Row>
      </Box> */}
    </>
  );
};
export default TransactionStepper;
