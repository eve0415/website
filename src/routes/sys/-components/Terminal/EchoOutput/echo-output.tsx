import type { FC } from 'react';

interface EchoOutputProps {
  text: string;
}

const EchoOutput: FC<EchoOutputProps> = ({ text }) => <div className='font-mono whitespace-pre-wrap'>{text}</div>;

export default EchoOutput;
