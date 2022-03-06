import { Box, CloseButton, Heading } from '@chakra-ui/react';

import { useColors } from '@hooks/useColors';
import { Row } from '@utils/chakraUtils';

export const ModalTitleWithCloseButton = ({
  text,
  onClose,
}: {
  text: string;
  onClose: () => any;
}) => {
  const { textColor } = useColors();

  return (
    <Row
      width="100%"
      mainAxisAlignment="space-between"
      crossAxisAlignment="center"
      p={4}
      color={textColor}
    >
      <Box width="32px" />
      <Heading fontSize="27px" lineHeight="1.25em">
        {text}
      </Heading>
      <CloseButton onClick={onClose} />
    </Row>
  );
};

export const ModalDivider = ({ ...others }: { [key: string]: any }) => {
  const { cardDividerColor } = useColors();
  return <Box h="1px" width="100%" flexShrink={0} bg={cardDividerColor} {...others} />;
};
