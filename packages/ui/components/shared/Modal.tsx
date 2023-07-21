import type {
  ModalBodyProps,
  ModalCloseButtonProps,
  ModalContentProps,
  ModalFooterProps,
  ModalHeaderProps,
  ModalProps
} from '@chakra-ui/react';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay
} from '@chakra-ui/react';

export const IonicModal = ({
  isOpen,
  onClose,
  modalProps,
  modalContentProps,
  modalBodyProps,
  modalHeaderProps,
  modalCloseButtonProps,
  modalFooterProps,
  header,
  body,
  footer
}: {
  body: ModalBodyProps['children'];
  footer?: ModalFooterProps['children'];
  header?: ModalHeaderProps['children'];
  isOpen: boolean;
  modalBodyProps?: ModalBodyProps;
  modalCloseButtonProps?: ModalCloseButtonProps;
  modalContentProps?: ModalContentProps;
  modalFooterProps?: ModalFooterProps;
  modalHeaderProps?: ModalHeaderProps;
  modalProps?: Omit<ModalProps, 'children' | 'isOpen' | 'onClose'>;
  onClose: () => void;
}) => {
  return (
    <Modal
      closeOnEsc={false}
      closeOnOverlayClick={false}
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      {...modalProps}
    >
      <ModalOverlay />
      <ModalContent {...modalContentProps}>
        {header && <ModalHeader {...modalHeaderProps}>{header}</ModalHeader>}
        <ModalCloseButton top={4} {...modalCloseButtonProps} />
        <ModalBody p={0} {...modalBodyProps}>
          {body}
        </ModalBody>
        {footer && <ModalFooter {...modalFooterProps}>{footer}</ModalFooter>}
      </ModalContent>
    </Modal>
  );
};
