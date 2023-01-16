import {
  Stat as ChakraStat,
  StatLabel as ChakraStatLabel,
  StatNumber as ChakraStatNumber,
  HStack,
  Skeleton,
  StatLabelProps,
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
      px={{ base: 4, sm: 6 }}
      py="5"
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
}) => (
  <Stat borderRadius={12}>
    <StatLabel>{label}</StatLabel>
    <HStack>
      <StatNumber fontWeight="bold">{value ? value : <Skeleton mt="2">Num</Skeleton>}</StatNumber>
      {secondValue && (
        <StatNumber fontWeight="bold" opacity={0.6}>
          {secondValue}
        </StatNumber>
      )}
    </HStack>
  </Stat>
);
