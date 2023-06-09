import { Box, Button, useDisclosure } from '@chakra-ui/react';
import type {
  LeveredCollateral,
  OpenPositionBorrowable,
  SupportedChains,
} from '@midas-capital/types';

import { FundPositionModal } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/AdditionalInfo/FundPositionButton/FundPositionModal/index';

export const FundPositionButton = ({
  collateralAsset,
  borrowAsset,
  chainId,
}: {
  borrowAsset: OpenPositionBorrowable;
  chainId: SupportedChains;
  collateralAsset: LeveredCollateral;
}) => {
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();

  return (
    <Box>
      <Button onClick={openModal}>Fund Position</Button>
      <FundPositionModal
        borrowAsset={borrowAsset}
        chainId={chainId}
        collateralAsset={collateralAsset}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </Box>
  );
};
