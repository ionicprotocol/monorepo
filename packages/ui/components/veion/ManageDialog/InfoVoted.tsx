import React from 'react';

import { CheckCircle2 } from 'lucide-react';

const InfoVoted = () => {
  return (
    <div className="relative">
      <div
        className="
        rounded-lg
        border
        border-white/10
        bg-gradient-to-r
        from-black/40
        to-black/20
        backdrop-blur-sm
        p-4
        flex
        items-center
        gap-3
        shadow-lg
        shadow-emerald-500/5
      "
      >
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-md rounded-full" />
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400 relative z-10" />
        </div>

        <span className="text-sm font-medium text-white/80">
          Position modification is only available before votes are submitted.
          <span className="block mt-0.5 text-white/60">
            Wait until next epoch to modify your position.
          </span>
        </span>
      </div>
    </div>
  );
};

export default InfoVoted;
