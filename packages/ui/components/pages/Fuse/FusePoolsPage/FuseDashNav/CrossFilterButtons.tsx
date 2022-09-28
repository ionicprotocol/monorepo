import { ButtonGroup, Img } from '@chakra-ui/react';
import { ChainConfig } from '@midas-capital/types';
import { Dispatch, useMemo } from 'react';

import { CButton } from '@ui/components/shared/Button';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { getChainConfig } from '@ui/utils/networkData';

export const CrossFilterButtons = ({
  chainFiltered,
  setChainFiltered,
}: {
  chainFiltered: string[];
  setChainFiltered: Dispatch<string[]>;
}) => {
  const { chainIds } = useMultiMidas();

  const chainsMetaData = useMemo(() => {
    const res: ChainConfig[] = [];

    chainIds.map((chainId) => {
      const metaData = getChainConfig(Number(chainId));
      if (metaData) {
        res.push(metaData);
      }
    });

    return res;
  }, [chainIds]);

  const handleFilter = (chainId: string) => {
    if (chainFiltered.includes(chainId)) {
      if (chainFiltered.length === 1) {
        setChainFiltered([...chainIds]);
      } else {
        setChainFiltered(chainFiltered.filter((chain) => chain !== chainId));
      }
    } else {
      setChainFiltered([...chainFiltered, chainId]);
    }
  };

  return (
    <ButtonGroup isAttached spacing={0} flexFlow={'row wrap'} justifyContent="center" mt={4}>
      {chainsMetaData.map((metaData) => (
        <CButton
          key={metaData.chainId}
          isSelected={chainFiltered.includes(metaData.chainId.toString())}
          onClick={() => handleFilter(metaData.chainId.toString())}
          variant="filter"
          width={10}
          px={1}
        >
          <SimpleTooltip label={metaData.specificParams.metadata.name}>
            <Img
              width={6}
              height={6}
              borderRadius="50%"
              src={metaData.specificParams.metadata.img}
              alt=""
            />
          </SimpleTooltip>
        </CButton>
      ))}
    </ButtonGroup>
  );
};
