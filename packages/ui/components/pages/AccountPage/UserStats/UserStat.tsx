import type { StatLabelProps, StatNumberProps, StatProps } from '@chakra-ui/react';
import {
  Stat as ChakraStat,
  StatLabel as ChakraStatLabel,
  StatNumber as ChakraStatNumber,
  Hide,
  HStack,
  Skeleton,
  StatHelpText
} from '@chakra-ui/react';

import { useColors } from '@ui/hooks/useColors';

const StatLabel = (props: StatLabelProps) => {
  const { cPage } = useColors();
  return <ChakraStatLabel color={cPage.primary.txtColor} fontWeight="medium" {...props} />;
};

const StatNumber = (props: StatNumberProps) => {
  const { cPage } = useColors();
  return (
    <ChakraStatNumber
      color={cPage.primary.txtColor}
      fontSize={['2xl', '2xl', '3xl', '3xl']}
      fontWeight="bold"
      {...props}
    />
  );
};

const Stat = (props: StatProps) => {
  const { cPage } = useColors();
  return (
    <ChakraStat
      bg={cPage.primary.hoverColor}
      borderColor={cPage.primary.borderColor}
      borderWidth={1}
      rounded="lg"
      {...props}
    />
  );
};

export const UserStat = ({
  value,
  secondValue,
  label
}: {
  label: string;
  secondValue?: string;
  value?: string;
}) => {
  return (
    <Stat borderRadius={12} px={6} py={2}>
      <StatLabel>{label}</StatLabel>

      <Skeleton isLoaded={value ? true : false}>
        <HStack alignItems={'center'}>
          <StatNumber fontWeight="bold">{value || '0.00%'}</StatNumber>
          {secondValue && (
            <Hide below="lg">
              <StatHelpText m={0} opacity={0.4}>{`${secondValue} / year`}</StatHelpText>
            </Hide>
          )}
        </HStack>
      </Skeleton>

      {/* // {secondValue && <SecondStatNumber opacity={0.4}>{}</SecondStatNumber>} */}
    </Stat>
  );
};
