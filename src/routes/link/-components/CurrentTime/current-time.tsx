import type { FC } from 'react';

import { useEffect, useState } from 'react';

interface Props {
  fixedTime?: string;
}

const CurrentTime: FC<Props> = ({ fixedTime }) => {
  const [time, setTime] = useState<string>(fixedTime || '');

  useEffect(() => {
    if (fixedTime) return; // Skip interval if fixed time is provided

    const updateTime = () => {
      const now = new Date();
      const jstTime = new Intl.DateTimeFormat('ja-JP', {
        timeZone: 'Asia/Tokyo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);
      setTime(jstTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [fixedTime]);

  return <span className='font-mono text-neon tabular-nums'>{time || '--:--:--'}</span>;
};

export default CurrentTime;
