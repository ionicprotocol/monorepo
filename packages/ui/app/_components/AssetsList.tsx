import Image from 'next/image';
import React from 'react';

import type { MarketData } from '@ui/types/TokensDataMap';

export type AssetsListProps = {
  availableAssets: MarketData[];
  isOpen: boolean;
  onChange: (asset: MarketData) => void;
};

export default function AssetsList({
  availableAssets,
  isOpen,
  onChange
}: AssetsListProps) {
  return (
    <div
      className={`absolute w-[180px] top-full right-0 px-4 py-3 origin-top-right rounded-lg bg-grayone transition-all ${
        isOpen
          ? 'visible opacity-100 scale-100 z-50'
          : 'opacity-0 scale-90 invisible'
      }`}
    >
      {availableAssets.map((asset) => (
        <div
          className="flex py-1 items-center font-bold text-white cursor-pointer"
          key={`asset-${asset.underlyingSymbol}`}
          onClick={() => onChange(asset)}
        >
          <Image
            alt="link"
            height="20"
            src={`/img/symbols/32/color/${asset.underlyingSymbol?.toLowerCase()}.png`}
            width="20"
          />
          <span className={`text-white pl-2`}>{asset.underlyingSymbol}</span>
        </div>
      ))}
    </div>
  );
}
