import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';
import { useRef } from 'react';

export default function ConfirmDeleteAlert({
  onClose,
  onConfirm,
  isOpen,
  title = 'Confirm Remove',
  description = "Are you sure? You can't undo this action afterwards.",
}: {
  onConfirm: () => void;
  onClose: () => void;
  isOpen: boolean;
  title: string;
  description: string;
}) {
  const cancelRef = useRef<any>();

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {{ title }}
          </AlertDialogHeader>

          <AlertDialogBody>{{ description }}</AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={onConfirm} ml={3}>
              Remove
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
