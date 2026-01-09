import type { FC } from 'react';

interface WhoamiOutputProps {
  login: string;
}

const WhoamiOutput: FC<WhoamiOutputProps> = ({ login }) => <div className='font-mono text-neon'>{login}</div>;

export default WhoamiOutput;
