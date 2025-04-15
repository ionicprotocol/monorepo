import { useState } from 'react';

import Link from 'next/link';

import {
  ChartBar,
  Gauge,
  Coins,
  TrendingUp,
  BadgeDollarSign,
  LineChart
} from 'lucide-react';

import { Card, CardContent } from '@ui/components/ui/card';

interface InfoCardProps {
  text: string;
  subtext?: string;
  icon: 'bribes' | 'emissions' | 'gauge' | 'liquidity' | 'markets' | 'treasury';
  href?: string;
}

const getIcon = (type: string) => {
  const iconProps = {
    className:
      'text-accent transform group-hover:rotate-[-5deg] transition-all duration-300',
    size: 20
  };

  switch (type) {
    case 'liquidity':
      return <ChartBar {...iconProps} />;
    case 'gauge':
      return <Gauge {...iconProps} />;
    case 'bribes':
      return <Coins {...iconProps} />;
    case 'emissions':
      return <TrendingUp {...iconProps} />;
    case 'treasury':
      return <BadgeDollarSign {...iconProps} />;
    case 'markets':
      return <LineChart {...iconProps} />;
    default:
      return <ChartBar {...iconProps} />;
  }
};

const InfoCard = ({ text, subtext, icon, href }: InfoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const Content = (
    <Card
      className="relative group overflow-hidden h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-graylite to-grayone opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent/20 blur-2xl rounded-full transform translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700" />

      <CardContent className="relative p-5 space-y-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-transparent flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 border border-accent/20">
          {getIcon(icon)}
        </div>

        <div className="relative space-y-2">
          <p className="text-left text-sm text-white/90 font-medium leading-relaxed transform group-hover:translate-x-1 transition-transform duration-300">
            {text}
          </p>
          {subtext && (
            <p className="text-left text-xs text-white/60 font-light leading-relaxed">
              {subtext}
            </p>
          )}

          <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-transparent group-hover:w-full transition-all duration-500" />
        </div>
      </CardContent>

      {href && (
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        </div>
      )}
    </Card>
  );

  return href ? (
    <Link
      href={href}
      className="flex-1"
    >
      {Content}
    </Link>
  ) : (
    <div className="flex-1">{Content}</div>
  );
};

const InfoCardsSection = () => {
  return (
    <div className="col-span-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <InfoCard
        icon="markets"
        text="Liquidity Markets"
        subtext="Incentivize your favorite Chain with Liquidity Gauges for optimal market depth"
      />
      <InfoCard
        icon="bribes"
        text="Boost Your Pools"
        subtext="Significantly enhance collateral pool depth through strategic bribes"
      />
      <InfoCard
        icon="emissions"
        text="Maximize Emissions"
        subtext="Increase protocol emissions while earning POL for your Treasury"
      />
    </div>
  );
};

export default InfoCardsSection;
