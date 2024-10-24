import Image from 'next/image';

import { ArrowRight } from 'lucide-react';

import { Button } from '@ui/components/ui/button';
import { Card, CardContent } from '@ui/components/ui/card';

type Summary = {
  title: string;
  amount: string;
  Icon?: JSX.Element;
};

type Detail = {
  title: string;
  buttonText: string;
  buttonClass?: string;
  onClick: () => void;
  get: string;
};

const LPRow = ({ summary, detail }: { summary: Summary; detail: Detail }) => (
  <div className="grid grid-cols-6 gap-3">
    <Card className="md:col-span-2 col-span-3 bg-graylite">
      <CardContent className="space-y-3 p-5">
        <p className="text-xxs font-light">{summary.title}</p>
        <div className="flex flex-wrap md:gap-3 items-center">
          <TokenPair />
          <p className="text-white font-semibold text-md">{summary.amount}</p>
          {summary.Icon}
        </div>
      </CardContent>
    </Card>

    <Card className="md:col-span-4 col-span-6 bg-graylite">
      <CardContent className="space-y-3 p-5">
        <div className="flex justify-between items-center text-xxs">
          <p className="font-light">{detail.title}</p>
          <p className="">GET</p>
        </div>
        <div className="flex items-center justify-between gap-2 xl:gap-6">
          <div className="flex items-center">
            <TokenPair />
            <p className="text-white font-medium text-md ml-2">ION/WETH</p>
            <Button
              className={`${detail.buttonClass} bg-accent text-grayUnselect text-xs font-bold ml-2`}
              onClick={detail.onClick}
            >
              {detail.buttonText} <ArrowRight />
            </Button>
          </div>
          <p className="text-white font-medium text-md">{detail.get}</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const TokenPair = ({ size = 32 }) => (
  <span className="flex">
    <Image
      src="/img/logo/ion.svg"
      alt="logo"
      width={size}
      height={size}
      className="rounded-full"
    />
    <Image
      src="/img/logo/eth.svg"
      alt="logo"
      width={size}
      height={size}
      className="rounded-full -ml-2"
    />
  </span>
);

export default LPRow;
