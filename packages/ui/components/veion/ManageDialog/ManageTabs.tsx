import * as React from 'react';

import { Tabs, TabsList, TabsTrigger } from '@ui/components/ui/tabs';

interface ManageTabsProps {
  arrText: string[];
  setActiveToggle: (value: string) => void;
  defaultValue?: string;
}

export function ManageTabs({
  arrText,
  setActiveToggle,
  defaultValue = 'Increase'
}: ManageTabsProps) {
  return (
    <Tabs
      defaultValue={defaultValue}
      onValueChange={setActiveToggle}
      className="w-full"
    >
      <TabsList className="w-full bg-graylite rounded-lg p-1 h-auto gap-1">
        {arrText.map((text) => (
          <TabsTrigger
            key={text}
            value={text}
            className="rounded-md py-1 px-3 text-xs text-white/40 data-[state=active]:bg-darkone data-[state=active]:text-accent data-[state=active]:shadow-none transition-all"
          >
            {text}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
