import { Box, Button, useDisclosure } from '@chakra-ui/react';
import type { LeveredPosition } from '@ionicprotocol/types';

import { ClosePositionModal } from '@ui/components/pages/LeveragePageOld/LeverageList/OpenPosition/AdditionalInfo/ClosePositionButton/ClosePositionModal/index';

export const ClosePositionButton = ({ position }: { position: LeveredPosition }) => {
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();

  return (
    <Box>
      <Button onClick={openModal}>Close position</Button>
      <ClosePositionModal isOpen={isModalOpen} onClose={closeModal} position={position} />
    </Box>
  );
};
