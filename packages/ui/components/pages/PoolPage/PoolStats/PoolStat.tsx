import {
  Stat as ChakraStat,
  StatLabel as ChakraStatLabel,
  StatNumber as ChakraStatNumber,
  Skeleton,
  StatLabelProps,
  StatNumberProps,
  StatProps,
} from '@chakra-ui/react';

import { useColors } from '@ui/hooks/useColors';

const StatLabel = (props: StatLabelProps) => {
  const { cPage } = useColors();
  return <ChakraStatLabel color={cPage.secondary.txtColor} fontWeight="medium" {...props} />;
};

const StatNumber = (props: StatNumberProps) => {
  const { cPage } = useColors();
  return (
    <ChakraStatNumber
      color={cPage.secondary.txtColor}
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
      bg={cPage.secondary.bgColor}
      px={{ base: 4, sm: 6 }}
      py="5"
      rounded="lg"
      shadow="base"
      {...props}
    />
  );
};

export const PoolStat = ({ value, label }: { value?: string; label: string }) => (
  <Stat borderRadius={12}>
    <StatLabel>{label}</StatLabel>
    <StatNumber fontWeight="bold">{value ? value : <Skeleton mt="2">Num</Skeleton>}</StatNumber>
  </Stat>
);
