import { Tabs, TabsList, TabsTrigger } from '@ui/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@ui/components/ui/tooltip';

interface TabConfig {
  value: string;
  label: React.ReactNode | string;
  disabled?: boolean;
  tooltip?: string;
}

interface ManageTabsProps {
  tabs: TabConfig[];
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
        {tabs.map((tab) => {
          const trigger = (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              disabled={tab.disabled}
              className="rounded-md py-1 px-3 text-xs text-white/40 data-[state=active]:bg-darkone data-[state=active]:text-accent data-[state=active]:shadow-none transition-all"
            >
              {tab.label}
            </TabsTrigger>
          );

          if (tab.tooltip) {
            return (
              <span key={tab.value}>
                <Tooltip>
                  <TooltipTrigger asChild>{trigger}</TooltipTrigger>
                  <TooltipContent>{tab.tooltip}</TooltipContent>
                </Tooltip>
              </span>
            );
          }

          return trigger;
        })}
      </TabsList>
    </Tabs>
  );
}
