import {
  Hide,
  HStack,
  Skeleton,
  Stat as ChakraStat,
  StatHelpText,
  StatLabel as ChakraStatLabel,
  StatLabelProps,
  StatNumber as ChakraStatNumber,
  StatNumberProps,
  StatProps,
} from '@chakra-ui/react';

import { useColors } from '@ui/hooks/useColors';

const StatLabel = (props: StatLabelProps) => {
  const { cPage } = useColors();
  return <ChakraStatLabel fontWeight="medium" color={cPage.primary.txtColor} {...props} />;
};

const StatNumber = (props: StatNumberProps) => {
  const { cPage } = useColors();
  return (
    <ChakraStatNumber
      fontSize={['2xl', '2xl', '3xl', '3xl']}
      fontWeight="bold"
      color={cPage.primary.txtColor}
      {...props}
    />
  );
};

const Stat = (props: StatProps) => {
  const { cPage } = useColors();
  return (
    <ChakraStat
      bg={cPage.primary.hoverColor}
      borderWidth={1}
      borderColor={cPage.primary.borderColor}
      rounded="lg"
      {...props}
    />
  );
};

export const UserStat = ({
  value,
  secondValue,
  label,
}: {
  value?: string;
  secondValue?: string;
  label: string;
}) => {
  return (
    <Stat borderRadius={12} px={6} py={2}>
      <StatLabel>{label}</StatLabel>

      <Skeleton isLoaded={value ? true : false}>
        <HStack alignItems={'center'}>
          <StatNumber fontWeight="bold">{value || '0.00%'}</StatNumber>
          {secondValue && (
            <Hide below="lg">
              <StatHelpText opacity={0.4} m={0}>{`${secondValue} / year`}</StatHelpText>
            </Hide>
          )}
        </HStack>
      </Skeleton>

      {/* // {secondValue && <SecondStatNumber opacity={0.4}>{}</SecondStatNumber>} */}
    </Stat>
  );
};
