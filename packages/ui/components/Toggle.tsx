'use client';

import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

interface IToggle {
  arrText?: string[];
  setActiveToggle: Dispatch<SetStateAction<string>>;
}
export default function Toggle({
  arrText = ['Deposit', 'Withdraw'],
  setActiveToggle
}: IToggle) {
  const [active, setActive] = useState<string>(arrText[0]);

  useEffect(() => {
    setActiveToggle(active);
  }, [active, setActiveToggle]);
  return (
    <div
      className={`mx-auto rounded-lg bg-grayone p-1 flex text-center gap-x-1 text-xs items-center justify-center`}
    >
      {arrText.map((text, idx) => (
        <p
          key={idx}
          className={`rounded-md py-1 px-3 text-center w-full cursor-pointer ${
            active.toLowerCase() === text.toLowerCase()
              ? 'bg-darkone text-accent '
              : 'text-white/40 '
          } transition-all duration-200 ease-linear `}
          onClick={() => setActive(text)}
        >
          {text}
        </p>
      ))}
    </div>
  );
}
