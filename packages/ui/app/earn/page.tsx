'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@ui/components/ui/card';

import EarnTable from '../_components/earn/EarnTable';
import MorphoTable from '../_components/earn/MorphoTable';

export default function Earn() {
  return (
    <div className="space-y-8">
      <Card className="bg-grayone">
        <CardHeader>
          <CardTitle className="text-center text-white/80 text-xl">
            🏦 Morpho Vaults - Earn ION rewards while supplying to Morpho! 🏦
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MorphoTable />
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
