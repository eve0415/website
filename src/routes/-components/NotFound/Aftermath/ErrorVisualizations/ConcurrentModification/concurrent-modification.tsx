import type { FC } from 'react';

import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

interface ListItem {
  id: number;
  value: string;
  status: 'normal' | 'reading' | 'modified' | 'deleted';
}

// Java ConcurrentModificationException with dual-thread visualization
const ConcurrentModification: FC = () => {
  const reducedMotion = useReducedMotion();

  const initialItems = useMemo(
    (): ListItem[] => [
      { id: 1, value: 'page_1', status: 'normal' },
      { id: 2, value: 'page_2', status: 'normal' },
      { id: 3, value: 'page_3', status: 'normal' },
      { id: 4, value: 'page_4', status: 'normal' },
      { id: 5, value: 'page_5', status: 'normal' },
    ],
    [],
  );

  const [items, setItems] = useState<ListItem[]>(initialItems);
  const [readerPosition, setReaderPosition] = useState(0);
  const [writerAction, setWriterAction] = useState<string | null>(null);
  const [crashed, setCrashed] = useState(() => reducedMotion);
  const [modCount, setModCount] = useState({ expected: 5, actual: 5 });

  const stepRef = useRef(0);

  // Animate concurrent access
  useEffect(() => {
    if (reducedMotion) return;

    stepRef.current = 0;
    const interval = setInterval(() => {
      stepRef.current += 1;
      const step = stepRef.current;

      // Reader thread advances
      if (step <= 4) {
        setReaderPosition(step - 1);
        setItems(prev => prev.map((item, i) => ({ ...item, status: i === step - 1 ? 'reading' : item.status === 'reading' ? 'normal' : item.status })));
      }

      // Writer thread modifies during iteration
      if (step === 2) {
        setWriterAction('INSERT page_new at index 2');
        setItems(prev => {
          const newItems = [...prev];
          newItems.splice(2, 0, { id: 6, value: 'page_new', status: 'modified' });
          return newItems;
        });
        setModCount(prev => ({ ...prev, actual: prev.actual + 1 }));
      }

      if (step === 3) {
        setWriterAction('DELETE page_4');
        setItems(prev => prev.map(item => (item.value === 'page_4' ? { ...item, status: 'deleted' } : item)));
        setModCount(prev => ({ ...prev, actual: prev.actual + 1 }));
      }

      // Crash when reader detects modification
      if (step === 4) {
        setCrashed(true);
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  return (
    <div className='bg-background fixed inset-0 overflow-hidden'>
      {/* Java header */}
      <div className='bg-muted flex h-9 items-center border-b border-[#f89820]/30 px-4'>
        <span className='font-mono text-xs text-[#f89820]'>Java - ConcurrentModificationException</span>
      </div>

      <div className='bg-background flex h-[calc(100%-2.25rem)]'>
        {/* Thread visualization */}
        <div className='flex-1 p-8'>
          <div className='mx-auto max-w-2xl'>
            {/* Thread headers */}
            <div className='mb-8 grid grid-cols-2 gap-8'>
              <div className='rounded border border-[#4caf50]/50 bg-[#4caf50]/10 p-3'>
                <div className='flex items-center gap-2'>
                  <div className='size-3 rounded-full bg-[#4caf50]' />
                  <span className='font-mono text-sm text-[#4caf50]'>Reader Thread</span>
                </div>
                <div className='mt-2 font-mono text-xs text-[#888]'>
                  for (Page p : pages) {'{'} ... {'}'}
                </div>
              </div>
              <div className='rounded border border-[#ff9800]/50 bg-[#ff9800]/10 p-3'>
                <div className='flex items-center gap-2'>
                  <div className='size-3 rounded-full bg-[#ff9800]' />
                  <span className='font-mono text-sm text-[#ff9800]'>Writer Thread</span>
                </div>
                <div className='mt-2 font-mono text-xs text-[#888]'>{writerAction || 'waiting...'}</div>
              </div>
            </div>

            {/* List visualization */}
            <div className='rounded border border-[#333] bg-[#111] p-4'>
              <div className='mb-3 font-mono text-xs text-[#666]'>ArrayList&lt;Page&gt; pages</div>
              <div className='space-y-2'>
                {items.map((item, i) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 rounded border p-3 font-mono text-sm transition-all ${
                      item.status === 'reading'
                        ? 'border-[#4caf50] bg-[#4caf50]/20'
                        : item.status === 'modified'
                          ? 'border-[#ff9800] bg-[#ff9800]/20'
                          : item.status === 'deleted'
                            ? 'border-[#f44336] bg-[#f44336]/20 line-through opacity-50'
                            : 'bg-muted border-[#333]'
                    }`}
                  >
                    <span className='w-8 text-[#666]'>[{i}]</span>
                    <span className={item.status === 'deleted' ? 'text-[#f44336]' : 'text-white'}>{item.value}</span>
                    {i === readerPosition && !crashed && <span className='ml-auto text-[#4caf50]'>← reading</span>}
                    {item.status === 'modified' && <span className='ml-auto text-[#ff9800]'>← inserted</span>}
                    {item.status === 'deleted' && <span className='ml-auto text-[#f44336]'>← deleted</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* ModCount display */}
            <div className='mt-4 grid grid-cols-2 gap-4'>
              <div className='rounded border border-[#333] bg-[#111] p-3'>
                <div className='font-mono text-xs text-[#666]'>expectedModCount</div>
                <div className='mt-1 font-mono text-xl text-[#4caf50]'>{modCount.expected}</div>
              </div>
              <div className='rounded border border-[#333] bg-[#111] p-3'>
                <div className='font-mono text-xs text-[#666]'>modCount</div>
                <div className={`mt-1 font-mono text-xl ${modCount.actual !== modCount.expected ? 'text-[#f44336]' : 'text-[#4caf50]'}`}>{modCount.actual}</div>
              </div>
            </div>

            {/* Crash message */}
            {crashed && (
              <div className='mt-8 rounded border border-[#f44336]/50 bg-[#f44336]/10 p-4 text-center'>
                <div className='font-mono text-lg text-[#f44336]'>ConcurrentModificationException</div>
                <div className='mt-2 font-mono text-xs text-[#888]'>
                  expectedModCount ({modCount.expected}) != modCount ({modCount.actual})
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stack trace panel */}
        <div className='bg-muted w-80 border-l border-[#333] p-4'>
          <div className='mb-4 font-mono text-xs text-[#f89820]'>Stack Trace</div>

          {crashed && (
            <div className='space-y-1 font-mono text-[10px]'>
              <div className='text-[#f44336]'>Exception in thread "reader-1"</div>
              <div className='text-[#f44336]'>java.util.ConcurrentModificationException</div>
              <div className='pl-2 text-[#888]'>at ArrayList$Itr.checkForComodification(ArrayList.java:911)</div>
              <div className='pl-2 text-[#888]'>at ArrayList$Itr.next(ArrayList.java:861)</div>
              <div className='pl-2 text-[#888]'>at PageService.processPages(PageService.java:404)</div>
              <div className='pl-2 text-[#888]'>at Main.main(Main.java:42)</div>
            </div>
          )}

          <div className='mt-6 rounded border border-[#333] bg-[#111] p-3'>
            <div className='mb-2 font-mono text-xs text-[#666]'>Solution:</div>
            <div className='font-mono text-[10px] text-[#4caf50]'>
              // Use CopyOnWriteArrayList
              <br />
              // or synchronized block
              <br />
              // or Iterator.remove()
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className='absolute inset-x-0 bottom-8 text-center'>
        <Link
          to='/'
          className='inline-flex items-center gap-2 rounded bg-[#f89820]/20 px-6 py-3 font-mono text-sm text-[#f89820] transition-all hover:bg-[#f89820]/30'
        >
          同期を取る → ホームへ戻る
        </Link>
      </div>
    </div>
  );
};

export default ConcurrentModification;
