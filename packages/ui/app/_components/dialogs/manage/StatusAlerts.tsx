import { Alert, AlertDescription } from '@ui/components/ui/alert';
import { HFPStatus } from '@ui/context/ManageDialogContext';

interface StatusAlert {
  status: HFPStatus;
  message: string;
}

const alerts: Record<HFPStatus, StatusAlert> = {
  [HFPStatus.WARNING]: {
    status: HFPStatus.WARNING,
    message:
      'You are close to the liquidation threshold. Manage your health factor carefully.'
  },
  [HFPStatus.CRITICAL]: {
    status: HFPStatus.CRITICAL,
    message: 'Health factor too low.'
  },
  [HFPStatus.UNKNOWN]: {
    status: HFPStatus.UNKNOWN,
    message: 'Unable to calculate health factor.'
  },
  [HFPStatus.NORMAL]: {
    status: HFPStatus.NORMAL,
    message: 'Your health factor is normal.'
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

  return (
    <Alert
      variant={status === HFPStatus.CRITICAL ? 'destructive' : 'default'}
      className="py-2 border-0 bg-opacity-90"
      style={{
        backgroundColor:
          status === HFPStatus.CRITICAL ? 'rgb(239 68 68 / 0.9)' : undefined
      }}
    >
      <AlertDescription className="text-sm text-white">
        {alert.message}
      </AlertDescription>
    </Alert>
  );
};

export default StatusAlerts;
