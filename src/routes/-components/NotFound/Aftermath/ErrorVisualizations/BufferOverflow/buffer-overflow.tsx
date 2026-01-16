import type { FC } from 'react';

import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

interface MemoryBlock {
  address: string;
  label: string;
  value: string;
  isBuffer: boolean;
  isCorrupted: boolean;
  isCanary: boolean;
}

// Memory visualization showing buffer overflow like Tetris blocks corrupting stack
const BufferOverflow: FC = () => {
  const reducedMotion = useReducedMotion();

  const memoryLayout = useMemo(
    (): MemoryBlock[] => [
      { address: '0x7fff0048', label: 'ret_addr', value: '0x00401234', isBuffer: false, isCorrupted: false, isCanary: false },
      { address: '0x7fff0040', label: 'canary', value: '0xDEADBEEF', isBuffer: false, isCorrupted: false, isCanary: true },
      { address: '0x7fff0038', label: 'local_var', value: '0x00000001', isBuffer: false, isCorrupted: false, isCanary: false },
      { address: '0x7fff0030', label: 'buffer[7]', value: '0x00', isBuffer: true, isCorrupted: false, isCanary: false },
      { address: '0x7fff0028', label: 'buffer[6]', value: '0x00', isBuffer: true, isCorrupted: false, isCanary: false },
      { address: '0x7fff0020', label: 'buffer[5]', value: '0x00', isBuffer: true, isCorrupted: false, isCanary: false },
      { address: '0x7fff0018', label: 'buffer[4]', value: '0x00', isBuffer: true, isCorrupted: false, isCanary: false },
      { address: '0x7fff0010', label: 'buffer[3]', value: '0x41', isBuffer: true, isCorrupted: false, isCanary: false },
      { address: '0x7fff0008', label: 'buffer[2]', value: '0x41', isBuffer: true, isCorrupted: false, isCanary: false },
      { address: '0x7fff0000', label: 'buffer[1]', value: '0x41', isBuffer: true, isCorrupted: false, isCanary: false },
    ],
    [],
  );

  const [writeIndex, setWriteIndex] = useState(() => (reducedMotion ? 12 : 0));
  const [corruption, setCorruption] = useState<number[]>(() => (reducedMotion ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : []));
  const [canaryDead, setCanaryDead] = useState(() => reducedMotion);
  const [crashed, setCrashed] = useState(() => reducedMotion);
  const [jitterOffsets, setJitterOffsets] = useState<number[]>(() => Array(10).fill(0) as number[]);

  const writeIndexRef = useRef(0);

  // Animate buffer overflow
  useEffect(() => {
    if (reducedMotion) return;

    writeIndexRef.current = 0;
    const interval = setInterval(() => {
      if (writeIndexRef.current < 12) {
        writeIndexRef.current += 1;
        setWriteIndex(writeIndexRef.current);

        // Corrupt from bottom up (buffer fills, then overflows)
        const blockIndex = memoryLayout.length - 1 - Math.min(writeIndexRef.current - 1, memoryLayout.length - 1);
        if (blockIndex >= 0) {
          setCorruption(prev => [...prev, blockIndex]);
        }

        // Check if canary is hit (index 1 in array)
        if (writeIndexRef.current >= 9) {
          setCanaryDead(true);
        }

        if (writeIndexRef.current >= 11) {
          setTimeout(() => setCrashed(true), 300);
        }
      } else {
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [reducedMotion, memoryLayout.length]);

  // Jitter animation for corrupted blocks
  useEffect(() => {
    if (reducedMotion) return;

    const interval = setInterval(() => {
      setJitterOffsets(prev => prev.map((_, i) => Math.sin(Date.now() / 100 + i) * 2));
    }, 50);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  return (
    <div className='bg-background fixed inset-0 overflow-x-hidden overflow-y-auto'>
      {/* Terminal header */}
      <div className='bg-background flex h-9 items-center border-b border-[#00ff00]/30 px-4'>
        <span className='font-mono text-xs text-[#00ff00]'>GDB - Stack Smashing Detected</span>
      </div>

      <div className='bg-background flex h-[calc(100%-2.25rem)]'>
        {/* Memory visualization */}
        <div className='flex-1 p-8'>
          <div className='mb-4 font-mono text-xs text-[#00ff00]/70'>Stack Memory Layout (High → Low)</div>

          <div className='mx-auto max-w-md space-y-1'>
            {memoryLayout.map((block, i) => {
              const isCorrupted = corruption.includes(i);
              const isOverflow = isCorrupted && !block.isBuffer;

              return (
                <div
                  key={block.address}
                  className={`flex items-center gap-4 rounded border px-4 py-2 font-mono text-xs transition-all duration-200 ${
                    crashed && block.isCanary
                      ? 'animate-pulse border-[#ff0000] bg-[#ff0000]/30'
                      : isOverflow
                        ? 'border-[#ff0000] bg-[#ff0000]/20'
                        : isCorrupted
                          ? 'border-[#ff6600] bg-[#ff6600]/10'
                          : block.isBuffer
                            ? 'border-[#00ff00]/50 bg-[#00ff00]/5'
                            : 'border-[#333] bg-[#111]'
                  }`}
                  style={{
                    transform: isCorrupted && !reducedMotion ? `translateX(${jitterOffsets[i] ?? 0}px)` : 'none',
                  }}
                >
                  <span className='w-24 text-[#666]'>{block.address}</span>
                  <span className={`w-20 ${block.isCanary ? 'text-[#ffcc00]' : 'text-[#00ff00]'}`}>{block.label}</span>
                  <span className={isCorrupted ? 'text-[#ff0000]' : 'text-[#888]'}>{isCorrupted ? '0x41414141' : block.value}</span>
                  {block.isCanary && canaryDead && <span className='ml-auto text-[#ff0000]'>CANARY DEAD</span>}
                  {isOverflow && !block.isCanary && <span className='ml-auto text-[#ff0000]'>CORRUPTED</span>}
                </div>
              );
            })}
          </div>

          {/* Write pointer indicator */}
          <div className='mx-auto mt-4 max-w-md'>
            <div className='flex items-center gap-2 font-mono text-xs'>
              <span className='text-[#00ff00]'>write_ptr:</span>
              <div className='h-2 flex-1 overflow-hidden rounded bg-[#333]'>
                <div className='h-full bg-[#ff6600] transition-all duration-200' style={{ width: `${Math.min((writeIndex / 12) * 100, 100)}%` }} />
              </div>
              <span className='text-[#ff6600]'>{writeIndex}/8</span>
            </div>
          </div>
        </div>

        {/* GDB output panel */}
        <div className='bg-background w-96 border-l border-[#00ff00]/30 p-4'>
          <div className='mb-4 font-mono text-xs text-[#00ff00]/50'>(gdb) run</div>

          {writeIndex > 0 && (
            <div className='space-y-2 font-mono text-xs'>
              <div className='text-[#00ff00]'>Starting program: ./page</div>
              <div className='text-[#888]'>Reading symbols...</div>

              {writeIndex > 6 && <div className='text-[#ffcc00]'>*** Warning: buffer overflow detected ***</div>}

              {canaryDead && <div className='text-[#ff0000]'>*** stack smashing detected ***: terminated</div>}

              {crashed && (
                <>
                  <div className='mt-4 text-[#ff0000]'>Program received signal SIGABRT, Aborted.</div>
                  <div className='text-[#888]'>0x00007ffff7a42428 in __GI_raise ()</div>
                  <div className='mt-2 text-[#00ff00]'>(gdb) bt</div>
                  <div className='pl-2 text-[#888]'>
                    #0 __GI_raise () at raise.c:50
                    <br />
                    #1 __GI_abort () at abort.c:79
                    <br />
                    #2 __libc_message () at libc_message.c:155
                    <br />
                    #3 __fortify_fail () at fortify_fail.c:37
                    <br />
                    #4 __stack_chk_fail () at stack_chk_fail.c:28
                    <br />
                    #5 main () at page.c:404
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className='absolute inset-x-0 bottom-8 text-center'>
        <Link
          to='/'
          className='inline-flex items-center gap-2 rounded bg-[#00ff00]/20 px-6 py-3 font-mono text-sm text-[#00ff00] transition-all hover:bg-[#00ff00]/30'
        >
          境界チェック → ホームへ戻る
        </Link>
      </div>
    </div>
  );
};

export default BufferOverflow;
