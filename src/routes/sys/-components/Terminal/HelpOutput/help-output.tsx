import type { FC } from 'react';

const HelpOutput: FC = () => (
  <div className='font-mono text-sm'>
    <div className='text-neon mb-4'>SYS.DIAGNOSTIC(1)</div>

    <div className='text-subtle-foreground mb-2'>NAME</div>
    <div className='mb-4 pl-4'>sys.diagnostic - system diagnostic interface</div>

    <div className='text-subtle-foreground mb-2'>SYNOPSIS</div>
    <div className='mb-4 pl-4'>command [arguments...]</div>

    <div className='text-subtle-foreground mb-2'>COMMANDS</div>
    <div className='pl-4'>
      <div className='flex gap-4'>
        <span className='text-neon w-20'>help</span>
        <span>Display this help message</span>
      </div>
      <div className='flex gap-4'>
        <span className='text-neon w-20'>clear</span>
        <span>Clear terminal output</span>
      </div>
      <div className='flex gap-4'>
        <span className='text-neon w-20'>whoami</span>
        <span>Display current user</span>
      </div>
      <div className='flex gap-4'>
        <span className='text-neon w-20'>neofetch</span>
        <span>Display system information</span>
      </div>
      <div className='flex gap-4'>
        <span className='text-neon w-20'>exit</span>
        <span>Exit diagnostic mode</span>
      </div>
    </div>

    <div className='text-subtle-foreground mt-4 mb-2'>EASTER EGGS</div>
    <div className='text-subtle-foreground pl-4'>Try some dangerous commands... if you dare.</div>
  </div>
);

export default HelpOutput;
