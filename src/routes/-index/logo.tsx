import type { FC } from 'react';

import { useEffect, useRef, useState } from 'react';

interface Props {
  className?: string;
  animate?: boolean;
}

const Logo: FC<Props> = ({ className = '', animate = true }) => {
  const [isAnimating, setIsAnimating] = useState(animate);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    if (!animate) return;

    // Calculate path lengths for stroke animation
    pathRefs.current.forEach(path => {
      if (path) {
        const length = path.getTotalLength();
        path.style.strokeDasharray = String(length);
        path.style.strokeDashoffset = String(length);
      }
    });

    // Trigger animation after a brief delay
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [animate]);

  const setPathRef = (index: number) => (el: SVGPathElement | null) => {
    pathRefs.current[index] = el;
  };

  const pathStyle = (index: number): React.CSSProperties => ({
    fill: isAnimating ? 'transparent' : 'currentColor',
    stroke: 'currentColor',
    strokeWidth: isAnimating ? 2 : 0,
    transition: `stroke-dashoffset 0.8s ease-out ${index * 0.1}s, fill 0.3s ease ${0.8 + index * 0.1}s`,
    strokeDashoffset: isAnimating ? undefined : 0,
  });

  return (
    <svg viewBox='0 0 1000 1000' className={`${className} duration-slow transition-transform hover:scale-105`} role='img' aria-label='eve0415 ロゴ'>
      {/* Main diagonal elements */}
      <g className={animate ? 'animate-fade-in-scale' : ''}>
        <path
          ref={setPathRef(0)}
          style={pathStyle(0)}
          d='M448.28,510.56l-68.23,68.23h-163.19l-54.07-54.07-2.42-2.42c-3.6-4.17-5.69-9.71-5.4-15.73.58-12.04,10.93-21.3,22.98-21.3h260.07s10.25,10.25,10.25,10.25c4.15,4.15,4.15,10.88,0,15.03Z'
        />
        <path
          ref={setPathRef(1)}
          style={pathStyle(1)}
          d='M391.12,447.48c0,12.38-10.03,22.43-22.41,22.43H107.97l-56.35-56.35c-3.46-3.94-5.57-9.11-5.57-14.77,0-12.38,10.03-22.41,22.41-22.41h260.65l56.97,56.97c3.14,3.86,5.02,8.77,5.02,14.13Z'
        />
        <path
          ref={setPathRef(2)}
          style={pathStyle(2)}
          d='M608.76,665.26c0,12.38-10.05,22.41-22.43,22.41h-260.59l-57.79-57.79c-2.76-3.72-4.38-8.34-4.38-13.32,0-12.38,10.03-22.41,22.41-22.41h80.45c-2.44,4.36-3.84,9.38-3.84,14.73,0,3.01.45,5.93,1.28,8.67.64,2.13,1.51,4.17,2.58,6.07,5.16,9.16,14.99,15.35,26.24,15.35h199.05l9.68,9.69c.14.12.26.26.39.38l.76.76c.12.12.24.26.37.38,3.61,3.98,5.82,9.27,5.82,15.07Z'
        />
        <path
          ref={setPathRef(3)}
          style={pathStyle(3)}
          d='M736.02,552.51c0,5.38-1.89,10.3-5.05,14.16l-3.2,3.2-53.74,53.76h-275.14c-9.42,0-17.05-7.64-17.05-17.05,0-4.26,1.57-8.16,4.17-11.15l1.74-1.74,13.62-13.63,49.97-49.97h262.28c12.38,0,22.41,10.03,22.41,22.41Z'
        />
        <path
          ref={setPathRef(4)}
          style={pathStyle(4)}
          d='M953.94,334.74c0,5.04-1.66,9.68-4.45,13.41h-.01s-4.52,4.53-4.52,4.53h-.01s-53.16,53.17-53.16,53.17h-275.25c-9.41,0-17.05-7.63-17.05-17.05,0-3.96,1.36-7.6,3.62-10.49l2.97-2.97,63.02-63.02h262.43c12.38,0,22.41,10.03,22.41,22.41Z'
        />
        <path
          ref={setPathRef(5)}
          style={pathStyle(5)}
          d='M844.87,443.62c0,5.42-1.93,10.38-5.12,14.27-.01.01-.03.03-.04.04l-2.88,2.88-53.92,53.93h-275.22c-9.42,0-17.05-7.64-17.05-17.05,0-4.03,1.4-7.74,3.75-10.66l2.63-2.63,63.19-63.19h262.24c12.38,0,22.41,10.03,22.41,22.41Z'
        />
      </g>
    </svg>
  );
};

export default Logo;
