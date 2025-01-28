// ManageTabs.tsx
import * as React from 'react';

import { Tabs, TabsList, TabsTrigger } from '@ui/components/ui/tabs';

interface Tab {
  value: string;
  label: React.ReactNode | string;
}

interface ManageTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function ManageTabs({ tabs, activeTab, onTabChange }: ManageTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className="w-full"
    >
      <TabsList className="w-full bg-graylite rounded-lg p-1 h-auto gap-1">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="rounded-md py-1 px-3 text-xs text-white/40 data-[state=active]:bg-darkone data-[state=active]:text-accent data-[state=active]:shadow-none transition-all"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
