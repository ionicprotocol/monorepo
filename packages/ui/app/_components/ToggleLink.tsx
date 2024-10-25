'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface IToggleLinks {
  arrText?: string[];
  baseUrl?: string; // e.g., '/veion/governance'
}

export default function ToggleLinks({
  arrText = ['Deposit', 'Withdraw'],
  baseUrl = '/veion/governance'
}: IToggleLinks) {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || arrText[0];
  const watch = searchParams.get('watch') || 'overview';

  return (
    <div className="mx-auto rounded-lg bg-inherit p-1 flex text-center gap-x-1 text-xs items-center justify-center">
      {arrText.map((text, idx) => (
        <Link
          key={idx}
          href={`${baseUrl}?watch=${watch}&view=${text}`}
          className={`rounded-md py-1 px-3 text-center w-full cursor-pointer ${
            view.toLowerCase() === text.toLowerCase()
              ? 'bg-darkone text-accent'
              : 'text-white/40'
          } transition-all duration-200 ease-linear whitespace-nowrap`}
        >
          {text}
        </Link>
      ))}
    </div>
  );
}
