/* oxlint-disable eslint-plugin-react(jsx-no-comment-textnodes), eslint-plugin-react(no-unescaped-entities), eslint-plugin-react(no-array-index-key) -- Code snippets with comments and quotes are intentional visual elements, static arrays */
import type { FC } from 'react';

import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

// C/C++ undefined behavior with reality glitch effect
const UndefinedBehavior: FC = () => {
  const reducedMotion = useReducedMotion();

  const [outputIndex, setOutputIndex] = useState(() => (reducedMotion ? 5 : 0));
  const [glitchActive, setGlitchActive] = useState(false);
  const [nasalDemons, setNasalDemons] = useState(() => reducedMotion);
  const [chromaticOffset, setChromaticOffset] = useState({ r: 0, g: 0, b: 0 });

  const outputIndexRef = useRef(0);

  // Different outputs from same code (undefined behavior)
  const outputs = [
    { run: 1, result: '42', compiler: 'gcc -O0' },
    { run: 2, result: '0', compiler: 'gcc -O2' },
    { run: 3, result: '-1', compiler: 'gcc -O3' },
    { run: 4, result: '404', compiler: 'clang -O2' },
    { run: 5, result: '???', compiler: '???' },
  ];

  // Animate different outputs
  useEffect(() => {
    if (reducedMotion) return;

    outputIndexRef.current = 0;
    const interval = setInterval(() => {
      if (outputIndexRef.current < outputs.length) {
        outputIndexRef.current += 1;
        setOutputIndex(outputIndexRef.current);

        if (outputIndexRef.current === outputs.length) setNasalDemons(true);
      } else {
        clearInterval(interval);
      }
    }, 800);

    return () => {
      clearInterval(interval);
    };
  }, [reducedMotion, outputs.length]);

  // Glitch effect
  useEffect(() => {
    if (reducedMotion) return;

    const interval = setInterval(() => {
      setGlitchActive(true);
      setChromaticOffset({
        r: Math.random() * 8 - 4,
        g: Math.random() * 8 - 4,
        b: Math.random() * 8 - 4,
      });
      setTimeout(() => {
        setGlitchActive(false);
        setChromaticOffset({ r: 0, g: 0, b: 0 });
      }, 100);
    }, 300);

    return () => {
      clearInterval(interval);
    };
  }, [reducedMotion]);

  return (
    <div className='bg-background fixed inset-0 overflow-x-hidden overflow-y-auto'>
      {/* Glitch overlay */}
      {glitchActive && (
        <div className='pointer-events-none absolute inset-0 z-50 mix-blend-screen'>
          <div className='absolute inset-0 bg-[#ff0000]/10' style={{ transform: `translateX(${chromaticOffset.r}px)` }} />
          <div className='absolute inset-0 bg-[#00ff00]/10' style={{ transform: `translateX(${chromaticOffset.g}px)` }} />
          <div className='absolute inset-0 bg-[#0000ff]/10' style={{ transform: `translateX(${chromaticOffset.b}px)` }} />
        </div>
      )}

      {/* Terminal header */}
      <div className='bg-muted flex h-9 items-center border-b border-[#666]/30 px-4'>
        <span className='font-mono text-xs text-[#888]'>undefined_behavior.c - Nasal Demons Territory</span>
      </div>

      <div className='flex h-[calc(100%-2.25rem)] flex-col md:flex-row'>
        {/* Code panel */}
        <div className='bg-muted h-1/2 flex-1 overflow-y-auto border-b border-[#333] p-4 md:h-auto md:border-r md:border-b-0 md:p-6'>
          <div className='mb-4 font-mono text-xs text-[#666]'>// Same code, different results</div>

          <pre className='rounded border border-[#333] bg-[#0d0d0d] p-4 font-mono text-sm'>
            <span className='text-[#c586c0]'>#include</span> <span className='text-[#ce9178]'>&lt;stdio.h&gt;</span>
            {'\n\n'}
            <span className='text-[#569cd6]'>int</span> <span className='text-[#dcdcaa]'>main</span>() {'{'}
            {'\n'}
            {'    '}
            <span className='text-[#569cd6]'>int</span> x; <span className='text-[#6a9955]'>// uninitialized!</span>
            {'\n'}
            {'    '}
            <span className='text-[#dcdcaa]'>printf</span>(<span className='text-[#ce9178]'>"%d\n"</span>, x);
            {'\n'}
            {'    '}
            <span className='text-[#c586c0]'>return</span> <span className='text-[#b5cea8]'>0</span>;{'\n'}
            {'}'}
          </pre>

          {/* Compiler warning */}
          <div className='mt-4 rounded border border-[#ffaa00]/30 bg-[#ffaa00]/10 p-3'>
            <div className='font-mono text-xs text-[#ffaa00]'>warning: variable 'x' is uninitialized when used here [-Wuninitialized]</div>
          </div>

          {/* Nasal demons */}
          {nasalDemons && (
            <div className='mt-8 text-center'>
              <div className='inline-flex items-center gap-4 rounded border border-[#ff0000]/50 bg-[#ff0000]/10 px-6 py-4'>
                <span className='text-4xl'>&#x1F47F;</span>
                <div className='text-left'>
                  <div className='font-mono text-sm text-[#ff0000]'>NASAL DEMONS RELEASED</div>
                  <div className='font-mono text-xs text-[#888]'>Anything can happen now</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Output panel */}
        <div className='h-1/2 w-full overflow-y-auto bg-[#0d0d0d] p-4 md:h-auto md:w-96 md:p-6'>
          <div className='mb-4 font-mono text-xs text-[#666]'>Execution Results:</div>

          <div className='space-y-3'>
            {outputs.slice(0, outputIndex).map((output, i) => (
              <div
                key={i}
                className={`rounded border p-3 font-mono text-xs transition-all ${
                  output.result === '???' ? 'animate-pulse border-[#ff0000] bg-[#ff0000]/20' : 'bg-muted border-[#333]'
                }`}
                style={{
                  transform: glitchActive && i === outputIndex - 1 ? `translateX(${chromaticOffset.r}px)` : 'none',
                }}
              >
                <div className='flex justify-between'>
                  <span className='text-[#888]'>$ {output.compiler}</span>
                  <span className='text-[#666]'>Run #{output.run}</span>
                </div>
                <div className='mt-2 flex items-center gap-2'>
                  <span className='text-[#00ff00]'>Output:</span>
                  <span
                    className={output.result === '???' ? 'text-[#ff0000]' : 'text-white'}
                    style={{
                      textShadow: glitchActive ? '2px 0 #ff0000, -2px 0 #00ffff' : 'none',
                    }}
                  >
                    {output.result}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {outputIndex >= 3 && (
            <div className='mt-6 rounded border border-[#ff0000]/30 bg-[#ff0000]/5 p-3 font-mono text-xs text-[#ff0000]'>
              &#x26A0; Same code producing different results = Undefined Behavior
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className='absolute inset-x-0 bottom-8 text-center'>
        <Link to='/' className='inline-flex items-center gap-2 rounded bg-[#666]/20 px-6 py-3 font-mono text-sm text-[#888] transition-all hover:bg-[#666]/30'>
          未定義を回避 → ホームへ戻る
        </Link>
      </div>
    </div>
  );
};

export default UndefinedBehavior;
