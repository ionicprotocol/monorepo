'use client';
import { Switch } from '@ui/components/ui/switch';

import CustomTooltip from '../CustomTooltip';

interface AutoLockProps {
  autoLock: boolean;
  setAutoLock: (value: boolean) => void;
}

export default function AutoLock({ autoLock, setAutoLock }: AutoLockProps) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={autoLock}
        onCheckedChange={setAutoLock}
        className="bg-accent data-[state=checked]:bg-accent"
      />
      <div className="text-white text-sm">Autolock</div>
      <CustomTooltip content="The auto-prolong option extends the lock indefinitely, which keeps your voting power at the same peak level. You can disable this option any time later." />
    </div>
  );
}
