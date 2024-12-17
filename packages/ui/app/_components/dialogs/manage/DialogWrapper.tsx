'use client';

import { Dialog } from '@ui/components/ui/dialog';
import { useManageDialogContext } from '@ui/context/ManageDialogContext';

import type { ActiveTab } from '.';

const DialogWrapper = ({
  isOpen,
  setIsOpen,
  children,
  setCurrentActiveTab
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  children: React.ReactNode;
  setCurrentActiveTab: (tab: ActiveTab) => void;
}) => {
  const { resetTransactionSteps } = useManageDialogContext();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          resetTransactionSteps();
          setCurrentActiveTab('supply');
        }
      }}
    >
      {children}
    </Dialog>
  );
};

export default DialogWrapper;
