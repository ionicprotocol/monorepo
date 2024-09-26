// Path: Desktop/monorepo/packages/ui/app/_components/PopoverHint.tsx
import React, { useState } from 'react';

interface PopoverHintProps {
  content: string;
}

export default function InfoPopover({ content }: PopoverHintProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-block transition-all duration-300 ease-linear"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <i className="popover-hint cursor-pointer">i</i>
      {visible && (
        <div className="absolute w-60 z-30 p-2 bg-graylite text-white rounded-lg text-sm  bottom-full left-1/2 transform border-white/10  border mb-2">
          {content}
        </div>
      )}
    </div>
  );
}
