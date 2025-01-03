import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

import { Alert, AlertDescription } from '@ui/components/ui/alert';
import { HFPStatus } from '@ui/context/ManageDialogContext';

import type { LucideProps } from 'lucide-react';

interface StatusAlert {
  status: HFPStatus;
  message: string;
  icon: React.ComponentType<LucideProps>; // Update the type here
}

const alerts: Record<HFPStatus, StatusAlert> = {
  [HFPStatus.WARNING]: {
    status: HFPStatus.WARNING,
    message:
      'You are close to the liquidation threshold. Manage your health factor carefully.',
    icon: AlertTriangle
  },
  [HFPStatus.CRITICAL]: {
    status: HFPStatus.CRITICAL,
    message: 'Health factor too low.',
    icon: AlertCircle
  },
  [HFPStatus.UNKNOWN]: {
    status: HFPStatus.UNKNOWN,
    message: 'Unable to calculate health factor.',
    icon: HelpCircle
  },
  [HFPStatus.NORMAL]: {
    status: HFPStatus.NORMAL,
    message: 'Your health factor is normal.',
    icon: CheckCircle
  }
};

interface StatusAlertsProps {
  status: HFPStatus | undefined;
  availableStates: HFPStatus[];
}

const StatusAlerts = ({ status, availableStates }: StatusAlertsProps) => {
  if (!status || !availableStates.includes(status)) return null;

  const alert = alerts[status];
  if (!alert) return null;

  const Icon = alert.icon;

  return (
    <Alert
      variant={status === HFPStatus.CRITICAL ? 'destructive' : 'default'}
      className="py-2 border-0 bg-opacity-90"
      style={{
        backgroundColor:
          status === HFPStatus.CRITICAL ? 'rgb(239 68 68 / 0.9)' : undefined
      }}
    >
      <div className="flex items-center">
        <Icon className="mr-2 h-4 w-4 text-white" />
        <AlertDescription className="text-sm text-white">
          {alert.message}
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default StatusAlerts;
