import { ArrowRight } from 'lucide-react';

import { Button } from '@ui/components/ui/button';
import { Card, CardContent } from '@ui/components/ui/card';

import TokenPair from '../TokenPair';

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
        <p className="text-gray-400 text-xxs font-light">{summary.title}</p>
        <div className="flex md:gap-3 items-center">
          <TokenPair
            token1="ion"
            token2="eth"
          />
          <p className="text-white font-semibold text-lg">{summary.amount}</p>
          {summary.Icon}
        </div>
      </CardContent>
    </Card>

    <Card className="md:col-span-4 col-span-6 bg-graylite">
      <CardContent className="space-y-3 p-5">
        <div className="text-gray-400  flex justify-between items-center text-xxs">
          <p className="font-light">{detail.title}</p>
          <p className="">GET</p>
        </div>
        <div className="flex items-center justify-between gap-2 xl:gap-6">
          <div className="flex items-center">
            <TokenPair
              token1="ion"
              token2="eth"
            />
            <p className="text-white font-medium text-md ml-2 text-lg">
              ION/WETH
            </p>
            <Button
              className={`${detail.buttonClass} bg-accent text-grayUnselect text-xs font-bold ml-6 rounded-xl`}
              onClick={detail.onClick}
            >
              {detail.buttonText} <ArrowRight />
            </Button>
          </div>
          <p className="text-white font-medium text-md text-lg">{detail.get}</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default LPRow;
