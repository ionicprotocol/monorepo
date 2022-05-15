import { Box, CloseButton, Heading } from '@chakra-ui/react';
import { ReactNode } from 'react';

import { useColors } from '@ui/hooks/useColors';
import { Row } from '@ui/utils/chakraUtils';

export const ModalTitleWithCloseButton = ({
  text,
  onClose,
}: {
  text: string;
  onClose: () => void;
}) => {
  return (
    <Row width="100%" mainAxisAlignment="space-between" crossAxisAlignment="center" p={4}>
      <Box width="32px" />
      <Heading fontSize="26px" lineHeight="1.25em">
        {text}
      </Heading>
      <CloseButton onClick={onClose} />
    </Row>
  );
};

export const ModalDivider = ({ ...others }: { [key: string]: ReactNode }) => {
  const { cCard } = useColors();
  return <Box h="1px" width="100%" flexShrink={0} bg={cCard.dividerColor} {...others} />;
};
