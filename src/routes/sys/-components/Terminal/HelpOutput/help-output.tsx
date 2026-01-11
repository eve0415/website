import type { FC } from 'react';

const HelpOutput: FC = () => (
  <div className='font-mono text-sm'>
    <div className='mb-4 text-neon'>SYS.DIAGNOSTIC(1)</div>

    <div className='mb-2 text-subtle-foreground'>NAME</div>
    <div className='mb-4 pl-4'>sys.diagnostic - system diagnostic interface</div>

    <div className='mb-2 text-subtle-foreground'>SYNOPSIS</div>
    <div className='mb-4 pl-4'>command [arguments...]</div>

    <div className='mb-2 text-subtle-foreground'>COMMANDS</div>
    <div className='pl-4'>
      <div className='flex gap-4'>
        <span className='w-20 text-neon'>help</span>
        <span>Display this help message</span>
      </div>
      <div className='flex gap-4'>
        <span className='w-20 text-neon'>clear</span>
        <span>Clear terminal output</span>
      </div>
      <div className='flex gap-4'>
        <span className='w-20 text-neon'>whoami</span>
        <span>Display current user</span>
      </div>
      <div className='flex gap-4'>
        <span className='w-20 text-neon'>neofetch</span>
        <span>Display system information</span>
      </div>
      <div className='flex gap-4'>
        <span className='w-20 text-neon'>exit</span>
        <span>Exit diagnostic mode</span>
      </div>
    </div>

    <div className='mt-4 mb-2 text-subtle-foreground'>EASTER EGGS</div>
    <div className='pl-4 text-subtle-foreground'>Try some dangerous commands... if you dare.</div>
  </div>
);

export default HelpOutput;
