import { Box, Button, useDisclosure } from '@chakra-ui/react';
import type { OpenPosition } from '@ionicprotocol/types';

import { RemovePositionModal } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/AdditionalInfo/RemovePositionButton/RemovePositionModal/index';

export const RemovePositionButton = ({ position }: { position: OpenPosition }) => {
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();

  return (
    <Box>
      <Button onClick={openModal}>Remove closed position</Button>
      <RemovePositionModal isOpen={isModalOpen} onClose={closeModal} position={position} />
    </Box>
  );
};
