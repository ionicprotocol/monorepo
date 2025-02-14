import { InfoIcon } from 'lucide-react';

import { pools } from '@ui/constants';

const InfoVoted = ({ chainId = 34443 }: { chainId: number }) => (
  <div
    className={`border ${pools[chainId]?.border}  ${pools[chainId]?.text}
    text-xs flex items-center gap-3 rounded-md py-2.5 px-4`}
  >
    <InfoIcon className="h-5 w-5 flex-shrink-0" />
    <span>
      Position modification is only available before votes are submitted. Wait
      till next epoch to modify your position.
    </span>
  </div>
);

export default InfoVoted;
