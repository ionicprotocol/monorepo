import React, { useState } from 'react';

import Modal from '../Modal';

import type { MarketData } from '@ui/types/TokensDataMap';

export type LoopProps = {
  selectedMarketData: MarketData;
};

export default function Loop({ selectedMarketData }: LoopProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  console.log(selectedMarketData);

  return (
    <>
      {isOpen && (
        <Modal close={() => setIsOpen(false)}>
          <div />
        </Modal>
      )}
    </>
  );
}
