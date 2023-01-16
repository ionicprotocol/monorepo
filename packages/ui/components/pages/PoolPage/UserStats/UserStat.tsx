import {
  Stat as ChakraStat,
  StatLabel as ChakraStatLabel,
  StatNumber as ChakraStatNumber,
  Skeleton,
  Stack,
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

const SecondStatNumber = (props: StatNumberProps) => {
  const { cPage } = useColors();
  return (
    <ChakraStatNumber
      fontSize={['xl', 'xl', '2xl', '2xl']}
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
    <Stack
      direction={{ base: 'column', lg: 'row' }}
      justifyItems="center"
      gap={0}
      alignItems={{ base: 'flex-start', lg: 'center' }}
    >
      <StatNumber fontWeight="bold">{value ? value : <Skeleton mt="2">Num</Skeleton>}</StatNumber>
      {secondValue && <SecondStatNumber opacity={0.4}>{secondValue}</SecondStatNumber>}
    </Stack>
  </Stat>
);
