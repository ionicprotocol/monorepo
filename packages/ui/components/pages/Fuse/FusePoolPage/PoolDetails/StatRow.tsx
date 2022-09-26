import { TableRowProps, Td, Text, Tr } from '@chakra-ui/react';

import { useColors } from '@ui/hooks/useColors';

export const StatRow = ({
  statATitle,
  statA,
  statBTitle,
  statB,
  ...tableRowProps
}: {
  statATitle: string;
  statA: string;
  statBTitle: string;
  statB: string;
} & TableRowProps) => {
  const { cCard } = useColors();

  return (
    <Tr borderTopWidth={'1px'} borderColor={cCard.dividerColor} {...tableRowProps}>
      <Td wordBreak={'break-all'} width={'50%'} lineHeight={1.5} textAlign="left" border="none">
        <Text variant="smText">
          {statATitle}: <b>{statA}</b>
        </Text>
      </Td>

      <Td wordBreak={'break-all'} width={'50%'} lineHeight={1.5} textAlign="left" border="none">
        <Text variant="smText">
          {statBTitle}: <b>{statB}</b>
        </Text>
      </Td>
    </Tr>
  );
};
