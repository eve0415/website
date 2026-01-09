import type { FC } from 'react';

import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

interface FileNode {
  name: string;
  type: 'folder' | 'file';
  children?: FileNode[];
  missing?: boolean;
}

// Blueprint/schematic style visualization for 404 / ENOENT
const FileNotFound: FC = () => {
  const [searchPath, setSearchPath] = useState<string[]>([]);
  const [searchComplete, setSearchComplete] = useState(false);

  const fileTree: FileNode = {
    name: '/',
    type: 'folder',
    children: [
      {
        name: 'src',
        type: 'folder',
        children: [
          {
            name: 'routes',
            type: 'folder',
            children: [
              { name: 'index.tsx', type: 'file' },
              { name: '???', type: 'file', missing: true },
            ],
          },
          { name: 'components', type: 'folder' },
        ],
      },
      { name: 'public', type: 'folder' },
      { name: 'package.json', type: 'file' },
    ],
  };

  // Animate search path using ref to avoid React Compiler issues with captured variables
  const indexRef = useRef(0);

  useEffect(() => {
    const paths = ['/', '/src', '/src/routes', '/src/routes/???'];
    indexRef.current = 0;

    const interval = setInterval(() => {
      if (indexRef.current < paths.length) {
        setSearchPath(prev => [...prev, paths[indexRef.current]!]);
        indexRef.current += 1;
      } else {
        setSearchComplete(true);
        clearInterval(interval);
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const renderTree = (node: FileNode, depth: number = 0, isLast: boolean = true): React.ReactNode => {
    const prefix = depth === 0 ? '' : '│  '.repeat(depth - 1) + (isLast ? '└─ ' : '├─ ');

    return (
      <div key={node.name + depth}>
        <div className={`font-mono text-sm ${node.missing ? 'animate-pulse text-[#ff6b6b]' : node.type === 'folder' ? 'text-[#64b5f6]' : 'text-[#90a4ae]'}`}>
          <span className='text-[#546e7a]'>{prefix}</span>
          <span>
            {node.type === 'folder' ? '📁 ' : '📄 '}
            {node.name}
          </span>
          {node.missing && <span className='ml-2 text-xs'>[NOT FOUND]</span>}
        </div>
        {node.children?.map((child, i) => renderTree(child, depth + 1, i === (node.children?.length ?? 0) - 1))}
      </div>
    );
  };

  return (
    <div className='fixed inset-0 overflow-hidden bg-[#263238]'>
      {/* Blueprint grid pattern */}
      <div
        className='pointer-events-none absolute inset-0 opacity-20'
        style={{
          backgroundImage: `
            linear-gradient(rgba(100, 181, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100, 181, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Corner markers */}
      <div className='pointer-events-none absolute top-4 left-4 size-8 border-[#64b5f6]/30 border-t-2 border-l-2' />
      <div className='pointer-events-none absolute top-4 right-4 size-8 border-[#64b5f6]/30 border-t-2 border-r-2' />
      <div className='pointer-events-none absolute bottom-4 left-4 size-8 border-[#64b5f6]/30 border-b-2 border-l-2' />
      <div className='pointer-events-none absolute right-4 bottom-4 size-8 border-[#64b5f6]/30 border-r-2 border-b-2' />

      <div className='flex h-full flex-col items-center justify-center p-6'>
        {/* Schematic header */}
        <div className='mb-8 text-center'>
          <div className='font-mono text-[#64b5f6]/60 text-xs tracking-[0.3em]'>FILE SYSTEM SCHEMATIC</div>
          <div className='mt-2 border-[#ff6b6b]/30 border-t border-b py-2'>
            <span className='font-mono text-2xl text-[#ff6b6b] tracking-wide'>ENOENT: FILE NOT FOUND</span>
          </div>
        </div>

        {/* Main content area */}
        <div className='flex w-full max-w-4xl gap-8'>
          {/* File tree visualization */}
          <div className='flex-1 rounded border border-[#546e7a]/30 bg-[#1e272c] p-6'>
            <div className='mb-4 flex items-center gap-2 text-[#64b5f6]/60 text-xs'>
              <span>DIRECTORY STRUCTURE</span>
              <div className='flex-1 border-[#546e7a]/30 border-t' />
            </div>
            {renderTree(fileTree)}
          </div>

          {/* Search path visualization */}
          <div className='w-72 rounded border border-[#546e7a]/30 bg-[#1e272c] p-6'>
            <div className='mb-4 flex items-center gap-2 text-[#64b5f6]/60 text-xs'>
              <span>SEARCH PATH</span>
              <div className='flex-1 border-[#546e7a]/30 border-t' />
            </div>

            <div className='space-y-2'>
              {searchPath.map((path, i) => (
                <div
                  key={path}
                  className={`flex items-center gap-2 font-mono text-sm ${i === searchPath.length - 1 && searchComplete ? 'text-[#ff6b6b]' : 'text-[#81c784]'}`}
                >
                  <span className='text-xs'>{i === searchPath.length - 1 && searchComplete ? '✗' : '✓'}</span>
                  <span>{path}</span>
                </div>
              ))}

              {searchComplete && (
                <div className='mt-4 animate-pulse border-[#ff6b6b]/30 border-t pt-4 text-center font-mono text-[#ff6b6b] text-xs'>PATH RESOLUTION FAILED</div>
              )}
            </div>
          </div>
        </div>

        {/* Error details */}
        <div className='mt-8 w-full max-w-4xl rounded border border-[#546e7a]/30 bg-[#1e272c] p-4'>
          <div className='font-mono text-[#90a4ae] text-xs'>
            <span className='text-[#ff6b6b]'>Error:</span> ENOENT: no such file or directory
            <br />
            <span className='text-[#546e7a]'>Path:</span> {typeof window !== 'undefined' ? window.location.pathname : '/unknown'}
            <br />
            <span className='text-[#546e7a]'>Code:</span> 404 NOT_FOUND
          </div>
        </div>

        {/* Fix action */}
        <div className='mt-8'>
          <Link
            to='/'
            className='inline-flex items-center gap-3 rounded border border-[#64b5f6]/30 bg-[#1e272c] px-6 py-3 font-mono text-[#64b5f6] text-sm transition-all hover:border-[#64b5f6] hover:bg-[#64b5f6]/10'
          >
            <span className='text-[#81c784]'>+</span>
            ファイルを作成 → ホームへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FileNotFound;
