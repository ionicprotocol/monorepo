import {
  Divider,
  Modal,
  ModalBody,
  ModalBodyProps,
  ModalCloseButton,
  ModalCloseButtonProps,
  ModalContent,
  ModalContentProps,
  ModalFooter,
  ModalFooterProps,
  ModalHeader,
  ModalHeaderProps,
  ModalOverlay,
  ModalProps,
} from '@chakra-ui/react';

export const MidasModal = ({
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
  footer,
}: {
  isOpen: boolean;
  onClose: () => void;
  modalProps?: Omit<ModalProps, 'children' | 'isOpen' | 'onClose'>;
  modalContentProps?: ModalContentProps;
  modalBodyProps?: ModalBodyProps;
  modalHeaderProps?: ModalHeaderProps;
  modalCloseButtonProps?: ModalCloseButtonProps;
  modalFooterProps?: ModalFooterProps;
  header?: ModalHeaderProps['children'];
  body: ModalBodyProps['children'];
  footer?: ModalFooterProps['children'];
}) => {
  return (
    <Modal
      closeOnEsc={false}
      closeOnOverlayClick={false}
      isCentered
      isOpen={isOpen}
      motionPreset="slideInBottom"
      onClose={onClose}
      {...modalProps}
    >
      <ModalOverlay />
      <ModalContent {...modalContentProps}>
        {header && <ModalHeader {...modalHeaderProps}>{header}</ModalHeader>}
        <ModalCloseButton top={4} {...modalCloseButtonProps} />
        <Divider />
        <ModalBody p={0} {...modalBodyProps}>
          {body}
        </ModalBody>
        {footer && <ModalFooter {...modalFooterProps}>{footer}</ModalFooter>}
      </ModalContent>
    </Modal>
  );
};
