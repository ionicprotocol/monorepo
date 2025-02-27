'use client';

import React from 'react';

import Image from 'next/image';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@ui/components/ui/select';

interface ITokenSelector {
  tokenArr?: string[];
  selectedToken?: string;
  onTokenSelect?: (token: string) => void;
}

export default function TokenSelector({
  tokenArr = ['eth', 'weth'],
  selectedToken,
  onTokenSelect
}: ITokenSelector) {
  const handleTokenChange = (value: string) => {
    if (onTokenSelect) {
      onTokenSelect(value);
    }
  };

  return (
    <div className="w-full capitalize text-md font-bold">
      <Select
        value={selectedToken}
        onValueChange={handleTokenChange}
      >
        <SelectTrigger className="w-full py-1.5 pl-3.5 pr-9 text-sm border-2 border-stone-700 bg-grayone/50 backdrop-blur-sm focus:ring-0 focus:ring-offset-0">
          <div className="flex items-center gap-1.5">
            {selectedToken && (
              <Image
                alt="symbol"
                className="w-6 h-6"
                src={`/img/symbols/32/color/${selectedToken.toLowerCase()}.png`}
                width={24}
                height={24}
              />
            )}
            <span className="capitalize">
              {selectedToken || 'Select Token'}
            </span>
          </div>
        </SelectTrigger>
        <SelectContent className="w-full border border-stone-700 bg-grayone/50 backdrop-blur-sm shadow-xl shadow-black/10 rounded-md p-1.5 max-h-60">
          {tokenArr.map((token) => (
            <SelectItem
              key={token}
              value={token}
              className="flex items-center justify-between p-2 text-xs rounded-md cursor-pointer hover:bg-grayone focus:bg-grayone"
            >
              <div className="flex items-center gap-2">
                <Image
                  alt={token}
                  className="w-4 h-4"
                  src={`/img/symbols/32/color/${token.toLowerCase()}.png`}
                  width={16}
                  height={16}
                />
                <span>{token.toUpperCase()}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
