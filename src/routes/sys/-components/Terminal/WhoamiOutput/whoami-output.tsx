import type { FC } from 'react';

interface WhoamiOutputProps {
  login: string;
}

const WhoamiOutput: FC<WhoamiOutputProps> = ({ login }) => <div className='text-neon font-mono'>{login}</div>;

export default WhoamiOutput;
