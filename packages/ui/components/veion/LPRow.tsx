import { ArrowRight } from 'lucide-react';
import { lisk, mode } from 'viem/chains';

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

const LPRow = ({
  summary,
  detail,
  chain
}: {
  summary: Summary;
  detail: Detail;
  chain: number;
}) => {
  const token2 = chain == mode.id ? 'mode' : chain == lisk.id ? 'weth' : 'eth';

  return (
    <div className="grid grid-cols-6 gap-3 group">
      <Card className="md:col-span-2 col-span-3 bg-gradient-to-br from-graylite to-grayone hover:from-grayone hover:to-graylite transition-all duration-300 border border-white/5">
        <CardContent className="space-y-3 p-5">
          <p className="text-gray-400 text-xxs font-light uppercase tracking-wider">
            {summary.title}
          </p>
          <div className="flex md:gap-3 items-center">
            <TokenPair
              token1="ion"
              token2={token2}
            />
            <p className="text-white font-semibold text-lg bg-clip-text bg-gradient-to-r from-white to-accent">
              {summary.amount}
            </p>
            {summary.Icon && (
              <div className="ml-2 transform transition-all duration-300 group-hover:rotate-12">
                {summary.Icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-4 col-span-6 bg-gradient-to-br from-graylite to-grayone hover:from-grayone hover:to-graylite transition-all duration-300 border border-white/5">
        <CardContent className="space-y-3 p-5">
          <div className="text-gray-400 flex justify-between items-center text-xxs">
            <p className="font-light uppercase tracking-wider">
              {detail.title}
            </p>
            <p className="text-accent">GET</p>
          </div>
          <div className="flex items-center justify-between gap-2 xl:gap-6">
            <div className="flex items-center">
              <TokenPair
                token1="ion"
                token2={token2}
              />
              <p className="text-white font-medium text-lg ml-2">
                ION/{token2.toUpperCase()}
              </p>
              <Button
                className="bg-accent text-grayUnselect text-xs font-bold ml-6 hover:bg-accent/80 transform transition-all duration-300 hover:scale-105 flex items-center gap-2"
                onClick={detail.onClick}
              >
                {detail.buttonText}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
            <p className="text-white font-medium text-lg bg-clip-text bg-gradient-to-r from-white to-accent">
              {detail.get}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LPRow;
