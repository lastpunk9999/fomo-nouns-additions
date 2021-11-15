// import classes from './Noun.module.css';
import React, { useCallback, useEffect, useState } from 'react';
import loadingNoun from '../../assets/loading-skull-noun.gif';
import Image from 'react-bootstrap/Image';
import { utils } from 'ethers';
import { contract as SeederContract } from '../../wrappers/nounsSeeder';
import { contract as DesciptorContract } from '../../wrappers/nounsDescriptor';
import { contract as AuctionContract } from '../../wrappers/nounsAuction';
import { provider } from '../../config';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setActiveBackground } from '../../state/slices/background';
import classes from './Noun.module.css';

const LoadingNoun = () => {
  return <Image src={loadingNoun} className={classes.img} alt={'loading noun'}/>;
};

const Noun: React.FC<{ alt: string }> = props => {
  const dispatch = useAppDispatch();
  const [img, setImg] = useState('');

  async function getNextNounId() {
    const res =  await AuctionContract.auction();
    const nounNumber = utils.bigNumberify(res.nounId).toNumber();
    return nounNumber + 1;
    
  }
  const blockNum = useAppSelector(state => state.block.blockNumber);
  const generateNoun = useCallback( async() => {
    const nounId = await getNextNounId();
    const isNounder = nounId % 10 === 0;
    const nextNounId = isNounder ? nounId + 1 : nounId;
    
    const seed = await SeederContract.generateSeed(
      nextNounId,
      DesciptorContract.address,
      {
        blockTag: 'pending'
      }
      );
      const useGreyBg = seed[0] === 0;
      dispatch(setActiveBackground(useGreyBg));
      const svg = await DesciptorContract.generateSVGImage(seed);
      setImg(svg);
    }, [dispatch]);

    useEffect(() => {
      generateNoun();
    }, [blockNum, generateNoun]);
    
  const { alt } = props;
  return (
    <div className={classes.imgWrapper}>
      {img && <Image className={classes.img} src={`data:image/svg+xml;base64,${img}`} alt={alt} fluid />}
      {!img && <LoadingNoun />}
    </div>
  );
};

export default Noun;