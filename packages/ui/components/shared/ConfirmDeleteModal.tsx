import { Button } from '@chakra-ui/react';

import { IonicModal } from '@ui/components/shared/Modal';

export default function ConfirmDeleteModal({
  onClose,
  onConfirm,
  isOpen,
  title = 'Are you sure?',
  description = "You can't undo this action afterwards."
}: {
  description: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}) {
  return (
    <IonicModal
      body={description}
      footer={
        <>
          <Button onClick={onClose} variant="_outline">
            Cancel
          </Button>
          <Button ml={3} onClick={onConfirm}>
            Remove
          </Button>
        </>
      }
      header={title}
      isOpen={isOpen}
      modalBodyProps={{ px: 8 }}
      onClose={onClose}
    />
  );
}
