import type { NextPage } from 'next';
import Image from 'next/image';
import React, { useMemo } from 'react';
import { WaveGraph } from '../components/wave-graph';
import _ from 'lodash';
import styled from '@emotion/styled';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';

const WithYellowScrollWheel = styled.div`
  scrollbar-width: auto;
  scrollbar-color: rgba(234, 179, 8, 1) rgba(35, 35, 35, 1);

  &::-webkit-scrollbar {
    width: 10px;
    height: 100%;
    max-height: 100%;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-track {
    background-color: rgba(35, 35, 35, 1);
    border-bottom-right-radius: 7px;
    border-top-right-radius: 7px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(234, 179, 8, 1);
    height: 2em;
    border-radius: 5px;
    box-shadow: inset 0 0 3px grey;
    margin: 3px 0;
  }
`;

type Activity = {
  name: string;
  date: string; // YYYY_MM_DD
  link?: string;
}
const activities: Activity[] = [
];

/**
 * tadhack @ avaya engage
 * tadhack @ seminole state
 *
 * @constructor
 */



const Home: NextPage = () => {
  const renderedActivities = useMemo(() => _.map(activities, ({name}, idx) =>
    <p
      key={`activity-${idx}`}
      className={'opacity-70 hover:opacity-100 hover:drop-shadow-lg hover:drop-shadow-yellow selection:text-black cursor-pointer'}>
      - {name}
    </p>
  ), []);

  return <div className={'w-screen h-screen bg-slate-600 flex justify-center align-middle text-white text-sm selection:bg-green-600 selection:text-yellow-200 selection:bg-clip-text'}>
    <div className={'bg-zinc-600 shadow-md shadow-neutral-800 rounded-2xl rounded-tl-[4em] p-6 align-middle m-auto relative max-w-[90vw] w-[40em] min-[30em]'}>
      <div className={'flex'}>
        <div className={'flex-initial relative mr-2 mb-6 min-w-[9em] -left-[2em] -top-[3em] h-[5em] w-[5em]'}>
          <div className={'border-slate-100 border-4 rounded-full overflow-hidden h-[9em] w-[9em] drop-shadow top-0 left-0 transition-all duration-100 hover:h-[8em] hover:w-[10em] hover:h-[10em] hover:-left-[0.25em] hover:-top-[0.25em] hover:drop-shadow-lg hover:border-white'}>
            <Image className={'object-cover select-none'} width={200} height={200} src={'/ryan.jpg'} />
          </div>
        </div>
        <WaveGraph className={'flex-auto rounded-md h-[5em]'} />
      </div>
      <div className={'flex max-h-[7em] mb-[1em]'}>
        <div className={'flex-initial mr-2 min-w-[9em] max-w-[7em] w-[7em]'}>
          <p>Ryan Harrigan</p>
          <div className={'flex justify-start content-center'}>
            <span>alive:</span>
            <span className='flex h-3 w-3 relative ml-2 self-center'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-3 w-3 bg-green-500'></span>
            </span>
          </div>
          <p>loc: Florida</p>
          <div className={'flex justify-start content-center mt-2'}>
            <a href={'https://github.com/RyanHarrigan'} target={'_blank'} rel={'noreferrer'} className={'mr-2 hover:text-yellow-300 hover:drop-shadow'} key={'github-icon'}>
              <GitHubIcon className={'text-[1.25em]'} />
            </a>
            <a href={'https://twitter.com/shock_tested'} target={'_blank'} rel={'noreferrer'} className={'mr-2 hover:text-yellow-300 hover:drop-shadow'} key={'twitter-icon'}>
              <TwitterIcon className={'text-[1.25em]'} />
            </a>
          </div>
        </div>
        <WithYellowScrollWheel className={'bg-black text-xs text-yellow-300 rounded-md h-auto w-full overflow-scroll p-1 selection:bg-yellow-300'}>
          {renderedActivities}
        </WithYellowScrollWheel>
      </div>
    </div>
  </div>
}

export default Home
