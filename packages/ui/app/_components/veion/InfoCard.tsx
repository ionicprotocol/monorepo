// _components/veion/InfoCard.tsx
import Link from 'next/link';

import { CornerDownRight } from 'lucide-react';

import { Card, CardContent } from '@ui/components/ui/card';

interface InfoCardProps {
  text: string;
  href?: string;
}

const InfoCard = ({ text, href }: InfoCardProps) => {
  const Content = (
    <Card className="col-span-2 bg-graylite p-2 xl:p-5 hover:bg-graylite/80 transition-colors">
      <CardContent className="p-0 space-y-3">
        <CornerDownRight className="text-white/60" />
        <p className="text-left text-xs text-white/60">{text}</p>
      </CardContent>
    </Card>
  );

  return href ? (
    <Link
      href={href}
      className="col-span-2 cursor-pointer"
    >
      {Content}
    </Link>
  ) : (
    Content
  );
};

export default InfoCard;
