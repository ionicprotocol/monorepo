import { TableRowProps, Td, Tr } from '@chakra-ui/react';

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
      <Td
        fontSize={{ base: '3vw', sm: '0.9rem' }}
        wordBreak={'break-all'}
        width={'50%'}
        lineHeight={1.5}
        textAlign="left"
        border="none"
      >
        {statATitle}: <b>{statA}</b>
      </Td>

      <Td
        fontSize={{ base: '3vw', sm: '0.9rem' }}
        wordBreak={'break-all'}
        width={'50%'}
        lineHeight={1.5}
        textAlign="left"
        border="none"
      >
        {statBTitle}: <b>{statB}</b>
      </Td>
    </Tr>
  );
};
