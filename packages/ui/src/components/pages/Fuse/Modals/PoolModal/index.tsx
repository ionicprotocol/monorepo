import { Modal, ModalBody, ModalContent, ModalOverlay } from '@chakra-ui/react';
import { DepositModalProps } from '@ui/types/ComponentPropsType';
import { useEffect, useState } from 'react';

import AmountSelect from '@ui/components/pages/Fuse/Modals/PoolModal/AmountSelect';

const DepositModal = (props: DepositModalProps) => {
  const [mode, setMode] = useState(props.defaultMode);
  useEffect(() => {
    setMode(props.defaultMode);
  }, [props.isOpen, props.defaultMode]);

  return (
    <Modal motionPreset="slideInBottom" isOpen={props.isOpen} onClose={props.onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
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
