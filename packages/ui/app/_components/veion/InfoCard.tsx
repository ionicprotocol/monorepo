import { CornerDownRight } from 'lucide-react';

import { Card, CardContent } from '@ui/components/ui/card';

const InfoCard = ({ text }: { text: string }) => (
  <Card className="col-span-2 bg-graylite p-2 xl:p-5">
    <CardContent className="p-0 space-y-3">
      <CornerDownRight />
      <p className="text-left text-xs">{text}</p>
    </CardContent>
  </Card>
);

export default InfoCard;
