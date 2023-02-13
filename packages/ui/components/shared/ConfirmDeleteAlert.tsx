import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';
import { useRef } from 'react';

export default function ConfirmDeleteAlert({
  onClose,
  onConfirm,
  isOpen,
  title = 'Are you sure?',
  description = "You can't undo this action afterwards.",
}: {
  onConfirm: () => void;
  onClose: () => void;
  isOpen: boolean;
  title: string;
  description: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cancelRef = useRef<any>(null);

  return (
    <AlertDialog isCentered isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {title}
          </AlertDialogHeader>

          <AlertDialogBody>{description}</AlertDialogBody>

          <AlertDialogFooter>
            <Button onClick={onClose} ref={cancelRef} variant="_outline">
              Cancel
            </Button>
            <Button ml={3} onClick={onConfirm}>
              Remove
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
