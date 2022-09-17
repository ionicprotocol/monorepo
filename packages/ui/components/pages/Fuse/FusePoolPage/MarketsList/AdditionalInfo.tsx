import { Row } from '@tanstack/react-table';

import { Market } from './index';

export const AdditionalInfo = ({ row }: { row: Row<Market> }) => {
  return <pre style={{ fontSize: '20px' }}>{row && <code>Additional info here</code>}</pre>;
};
