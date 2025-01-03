'use client';

import EarnTable from '@ui/components/earn/EarnTable';
import LegacyTable from '@ui/components/earn/LegacyTable';
import MorphoTable from '@ui/components/earn/MorphoTable';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@ui/components/ui/card';

export default function Earn() {
  return (
    <div className="space-y-8">
      <Card className="bg-grayone">
        <CardHeader>
          <CardTitle className="text-center text-white/80 text-xl">
            🏦 Morpho Vaults - Earn $ION and $MORPHO rewards while supplying to
            Morpho! 🏦
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MorphoTable />
        </CardContent>
      </Card>

      <Card className="bg-grayone">
        <CardHeader>
          <CardTitle className="text-center text-white/80 text-xl">
            🗄️ Legacy pools{' '}
            <span className="text-red-400/80">(Withdraw Only)</span> 🗄️
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LegacyTable />
        </CardContent>
      </Card>

      <Card className="bg-grayone">
        <CardHeader>
          <CardTitle className="text-center text-white/80 text-xl">
            ✨ Earn extra yield using the opportunities listed to make use of
            your Ionic deposits! ✨
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EarnTable />
        </CardContent>
      </Card>
    </div>
  );
}
