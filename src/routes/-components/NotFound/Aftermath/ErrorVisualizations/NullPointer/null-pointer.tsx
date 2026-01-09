import type { FC } from 'react';

import { Link } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface NullPointerProps {
  onNavigateHome?: () => void;
}

// Memory cell data structure
interface MemoryCell {
  address: string;
  value: string | null;
  isPointer: boolean;
  pointsTo: number | null;
}

// VS Code-style debugger visualization for NullPointerException
const NullPointer: FC<NullPointerProps> = () => {
  const [highlightedCell, setHighlightedCell] = useState<number | null>(null);
  const [showPointerPath, setShowPointerPath] = useState(false);

  // Generate memory grid with null reference
  const memoryGrid = useMemo((): MemoryCell[] => {
    return [
      { address: '0x7fff0000', value: '0x2A', isPointer: false, pointsTo: null },
      { address: '0x7fff0008', value: '0x68656C6C6F', isPointer: false, pointsTo: null },
      { address: '0x7fff0010', value: '0x7fff0028', isPointer: true, pointsTo: 5 },
      { address: '0x7fff0018', value: '3.14', isPointer: false, pointsTo: null },
      { address: '0x7fff0020', value: 'ref →', isPointer: true, pointsTo: null }, // NULL POINTER
      { address: '0x7fff0028', value: 'Object{}', isPointer: false, pointsTo: null },
      { address: '0x7fff0030', value: '0xDEAD', isPointer: false, pointsTo: null },
      { address: '0x7fff0038', value: 'null', isPointer: false, pointsTo: null }, // Target of null pointer
    ];
  }, []);

  // Animate pointer following
  useEffect(() => {
    const timer = setTimeout(() => {
      setHighlightedCell(4); // Highlight the null pointer
      setTimeout(() => setShowPointerPath(true), 500);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleCellHover = useCallback((index: number) => {
    setHighlightedCell(index);
  }, []);

  const handleCellLeave = useCallback(() => {
    setHighlightedCell(4); // Return to null pointer
  }, []);

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-[#1e1e1e]'>
      {/* VS Code-style title bar */}
      <div className='absolute inset-x-0 top-0 flex h-8 items-center border-[#3c3c3c] border-b bg-[#323233] px-4'>
        <div className='flex gap-2'>
          <div className='size-3 rounded-full bg-[#ff5f57]' />
          <div className='size-3 rounded-full bg-[#febc2e]' />
          <div className='size-3 rounded-full bg-[#28c840]' />
        </div>
        <span className='ml-4 text-[#cccccc] text-xs'>Debug Console - NullPointerException</span>
      </div>

      <div className='mt-8 w-full max-w-4xl px-6'>
        {/* Error header */}
        <div className='mb-8 rounded border-[#f14c4c]/30 border-l-4 bg-[#f14c4c]/10 p-4'>
          <div className='font-mono text-[#f14c4c] text-sm'>Exception in thread "main" java.lang.NullPointerException</div>
          <div className='mt-1 font-mono text-[#808080] text-xs'>at Main.processPage(Main.java:404)</div>
        </div>

        {/* Memory visualization */}
        <div className='mb-6 rounded-lg border border-[#3c3c3c] bg-[#252526] p-6'>
          <div className='mb-4 flex items-center gap-2 text-[#4fc1ff] text-xs'>
            <span className='font-mono'>VARIABLES</span>
            <span className='text-[#808080]'>- Memory Layout</span>
          </div>

          {/* Memory grid */}
          <div className='grid grid-cols-4 gap-2'>
            {memoryGrid.map((cell, i) => (
              <div
                key={cell.address}
                className={`relative cursor-pointer rounded border p-3 font-mono text-xs transition-all duration-200 ${
                  highlightedCell === i
                    ? i === 4
                      ? 'border-[#f14c4c] bg-[#f14c4c]/20 ring-1 ring-[#f14c4c]/50'
                      : 'border-[#4fc1ff] bg-[#4fc1ff]/10'
                    : 'border-[#3c3c3c] bg-[#1e1e1e]'
                } ${cell.isPointer && cell.pointsTo === null ? 'animate-pulse' : ''}`}
                onMouseEnter={() => handleCellHover(i)}
                onMouseLeave={handleCellLeave}
              >
                <div className='text-[#569cd6] text-[10px]'>{cell.address}</div>
                <div className={`mt-1 ${cell.value === 'null' || (cell.isPointer && cell.pointsTo === null) ? 'text-[#f14c4c]' : 'text-[#ce9178]'}`}>
                  {cell.value}
                  {cell.isPointer && cell.pointsTo === null && <span className='ml-1 text-[#f14c4c]'>NULL</span>}
                </div>

                {/* Pointer arrow for highlighted cell */}
                {showPointerPath && i === 4 && (
                  <div className='absolute top-1/2 right-0 flex translate-x-full -translate-y-1/2 items-center'>
                    <div className='h-0.5 w-8 bg-[#f14c4c]' />
                    <div className='size-2 rotate-45 border-[#f14c4c] border-t-2 border-r-2' />
                    <div className='ml-2 text-[#f14c4c] text-[10px]'>❌</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className='mt-4 flex gap-6 text-[10px]'>
            <div className='flex items-center gap-2'>
              <div className='size-3 rounded border border-[#f14c4c] bg-[#f14c4c]/20' />
              <span className='text-[#808080]'>Null Reference</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='size-3 rounded border border-[#4fc1ff] bg-[#4fc1ff]/10' />
              <span className='text-[#808080]'>Valid Memory</span>
            </div>
          </div>
        </div>

        {/* Call stack */}
        <div className='mb-8 rounded-lg border border-[#3c3c3c] bg-[#252526] p-4'>
          <div className='mb-3 text-[#4fc1ff] text-xs'>CALL STACK</div>
          <div className='space-y-1 font-mono text-[11px]'>
            <div className='text-[#f14c4c]'>→ processPage(null)</div>
            <div className='text-[#808080] opacity-60'>{'  '}renderContent()</div>
            <div className='text-[#808080] opacity-40'>{'    '}handleRequest()</div>
            <div className='text-[#808080] opacity-20'>{'      '}main()</div>
          </div>
        </div>

        {/* Fix action */}
        <div className='text-center'>
          <Link to='/' className='inline-flex items-center gap-2 rounded bg-[#0e639c] px-6 py-3 font-mono text-sm text-white transition-all hover:bg-[#1177bb]'>
            <span className='text-[#89d185]'>▶</span>
            ポインタを初期化 → ホームへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NullPointer;
