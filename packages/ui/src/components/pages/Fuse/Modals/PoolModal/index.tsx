import { Modal, ModalBody, ModalContent, ModalOverlay } from '@chakra-ui/react';
import { USDPricedFuseAsset } from '@midas-capital/sdk';
import { useEffect, useState } from 'react';

import AmountSelect from '@components/pages/Fuse/Modals/PoolModal/AmountSelect';
import { useColors } from '@hooks/useColors';

interface Props {
  isOpen: boolean;
  onClose: () => any;
  defaultMode: Mode;
  index: number;
  assets: USDPricedFuseAsset[];
  comptrollerAddress: string;
}

export enum Mode {
  SUPPLY,
  WITHDRAW,
  BORROW,
  REPAY,
}

const DepositModal = (props: Props) => {
  const [mode, setMode] = useState(props.defaultMode);
  const { cardBgColor, cardBorderColor } = useColors();
  const modalStyle = {
    backgroundColor: cardBgColor,
    width: { md: '450px', base: '92%' },
    borderRadius: '12px',
    border: `2px solid ${cardBorderColor}`,
  };
  useEffect(() => {
    setMode(props.defaultMode);
  }, [props.isOpen, props.defaultMode]);

  return (
    <Modal motionPreset="slideInBottom" isOpen={props.isOpen} onClose={props.onClose} isCentered>
      <ModalOverlay />
      <ModalContent {...modalStyle}>
        <ModalBody p={0}>
          <AmountSelect
            comptrollerAddress={props.comptrollerAddress}
            onClose={props.onClose}
            assets={props.assets}
            index={props.index}
            mode={mode}
            setMode={setMode}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DepositModal;
