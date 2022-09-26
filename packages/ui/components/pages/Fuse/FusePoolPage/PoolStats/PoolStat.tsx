import { Stat as ChakraStat, Skeleton, StatProps, Text } from '@chakra-ui/react';

import { useColors } from '@ui/hooks/useColors';

const Stat = (props: StatProps) => {
  const { cPage } = useColors();
  return (
    <ChakraStat
      px={{ base: 4, sm: 6 }}
      py="5"
      bg={cPage.secondary.bgColor}
      shadow="base"
      rounded="lg"
      {...props}
    />
  );
};

export const PoolStat = ({ value, label }: { value?: string; label: string }) => (
  <Stat borderRadius={12}>
    <Text variant="panelMdText">{label}</Text>
    <Text variant="panelTitle" fontWeight="bold">
      {value ? value : <Skeleton mt="2">Num</Skeleton>}
    </Text>
  </Stat>
);
