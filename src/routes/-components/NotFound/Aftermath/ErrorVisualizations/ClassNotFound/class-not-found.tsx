import type { FC } from 'react';

import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

interface ClassPathEntry {
  path: string;
  type: 'jar' | 'dir';
  searched: boolean;
  found: boolean;
}

// Java ClassNotFoundException with classpath search visualization
const ClassNotFound: FC = () => {
  const reducedMotion = useReducedMotion();

  const classpath = useMemo(
    (): ClassPathEntry[] => [
      { path: 'lib/spring-core-5.3.jar', type: 'jar', searched: false, found: false },
      { path: 'lib/hibernate-core-5.6.jar', type: 'jar', searched: false, found: false },
      { path: 'lib/commons-lang3-3.12.jar', type: 'jar', searched: false, found: false },
      { path: 'target/classes/', type: 'dir', searched: false, found: false },
      { path: 'lib/jackson-core-2.13.jar', type: 'jar', searched: false, found: false },
      { path: 'lib/slf4j-api-1.7.jar', type: 'jar', searched: false, found: false },
    ],
    [],
  );

  const [searchedPaths, setSearchedPaths] = useState<ClassPathEntry[]>(() => (reducedMotion ? classpath.map(p => ({ ...p, searched: true })) : classpath));
  const [currentSearch, setCurrentSearch] = useState<number | null>(() => (reducedMotion ? null : 0));
  const [searchComplete, setSearchComplete] = useState(() => reducedMotion);
  const [scanLines, setScanLines] = useState<string[]>([]);

  const searchIndexRef = useRef(0);

  // Animate classpath search
  useEffect(() => {
    if (reducedMotion) return;

    searchIndexRef.current = 0;
    const interval = setInterval(() => {
      if (searchIndexRef.current < classpath.length) {
        setCurrentSearch(searchIndexRef.current);
        setScanLines(prev => [...prev, `Scanning: ${classpath[searchIndexRef.current]!.path}`]);

        setTimeout(() => {
          setSearchedPaths(prev => prev.map((p, i) => (i === searchIndexRef.current ? { ...p, searched: true } : p)));
          setScanLines(prev => [...prev, `  → Page.class not found`]);
          searchIndexRef.current += 1;

          if (searchIndexRef.current >= classpath.length) {
            setCurrentSearch(null);
            setSearchComplete(true);
          }
        }, 300);
      } else {
        clearInterval(interval);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [reducedMotion, classpath]);

  return (
    <div className='bg-background fixed inset-0 overflow-x-hidden overflow-y-auto'>
      {/* Java header */}
      <div className='bg-muted flex h-9 items-center border-b border-[#f89820]/30 px-4'>
        <span className='font-mono text-xs text-[#f89820]'>Java ClassLoader - ClassNotFoundException</span>
      </div>

      <div className='bg-background flex h-[calc(100%-2.25rem)] flex-col md:flex-row'>
        {/* Classpath visualization */}
        <div className='h-1/2 flex-1 overflow-y-auto p-4 md:h-auto md:p-8'>
          <div className='mx-auto max-w-2xl'>
            <div className='mb-6 font-mono text-sm text-[#f89820]'>ClassLoader.loadClass("Page")</div>

            {/* Class hierarchy */}
            <div className='mb-8 rounded border border-[#333] bg-[#111] p-4'>
              <div className='mb-3 font-mono text-xs text-[#666]'>Class Hierarchy Search</div>
              <div className='flex items-center gap-4'>
                <div className='bg-muted rounded border border-[#666] px-3 py-2 font-mono text-xs'>
                  <div className='text-[#888]'>Bootstrap</div>
                  <div className='text-[#666]'>ClassLoader</div>
                </div>
                <span className='text-[#666]'>→</span>
                <div className='bg-muted rounded border border-[#666] px-3 py-2 font-mono text-xs'>
                  <div className='text-[#888]'>Extension</div>
                  <div className='text-[#666]'>ClassLoader</div>
                </div>
                <span className='text-[#666]'>→</span>
                <div className='rounded border border-[#f44336] bg-[#f44336]/20 px-3 py-2 font-mono text-xs'>
                  <div className='text-[#f44336]'>Application</div>
                  <div className='text-[#f44336]'>ClassLoader</div>
                </div>
              </div>
            </div>

            {/* Classpath entries */}
            <div className='mb-4 font-mono text-xs text-[#666]'>Classpath Entries:</div>
            <div className='space-y-2'>
              {searchedPaths.map((entry, i) => (
                <div
                  key={entry.path}
                  className={`flex items-center gap-4 rounded border p-3 font-mono text-sm transition-all ${
                    currentSearch === i ? 'border-[#f89820] bg-[#f89820]/20' : entry.searched ? 'bg-muted border-[#333] opacity-50' : 'bg-muted border-[#333]'
                  }`}
                >
                  <span className='text-xl'>{entry.type === 'jar' ? '📦' : '📁'}</span>
                  <span className='flex-1 text-[#d4d4d4]'>{entry.path}</span>
                  {currentSearch === i && <span className='animate-pulse text-[#f89820]'>searching...</span>}
                  {entry.searched && currentSearch !== i && <span className='text-[#f44336]'>✗ not found</span>}
                </div>
              ))}
            </div>

            {/* Target class */}
            <div className='mt-8 text-center'>
              <div className='inline-block rounded border-2 border-dashed border-[#f44336]/50 bg-[#f44336]/10 px-8 py-4'>
                <div className='font-mono text-lg text-[#f44336]'>Page.class</div>
                <div className='mt-1 font-mono text-xs text-[#888]'>com.example.Page</div>
                <div className='mt-2 font-mono text-xs text-[#f44336]'>NOT FOUND</div>
              </div>
            </div>
          </div>
        </div>

        {/* Console panel */}
        <div className='bg-muted h-1/2 w-full overflow-y-auto border-t border-[#333] p-4 md:h-auto md:w-96 md:border-t-0 md:border-l'>
          <div className='mb-4 font-mono text-xs text-[#f89820]'>Console Output</div>

          <div className='max-h-64 space-y-1 overflow-y-auto font-mono text-[10px]'>
            {scanLines.map((line, i) => (
              <div key={i} className={line.includes('not found') ? 'text-[#f44336]' : 'text-[#888]'}>
                {line}
              </div>
            ))}
          </div>

          {searchComplete && (
            <div className='mt-6 rounded border border-[#f44336]/50 bg-[#f44336]/10 p-3'>
              <div className='font-mono text-xs text-[#f44336]'>Exception in thread "main"</div>
              <div className='mt-1 font-mono text-xs text-[#f44336]'>java.lang.ClassNotFoundException: Page</div>
              <div className='mt-2 font-mono text-[10px] text-[#888]'>
                at java.net.URLClassLoader.findClass
                <br />
                at java.lang.ClassLoader.loadClass
                <br />
                at Main.main(Main.java:404)
              </div>
            </div>
          )}

          <div className='mt-6 rounded border border-[#333] bg-[#111] p-3'>
            <div className='mb-2 font-mono text-xs text-[#666]'>Possible fixes:</div>
            <div className='space-y-1 font-mono text-[10px] text-[#4caf50]'>
              <div>• Add missing JAR to classpath</div>
              <div>• Check package declaration</div>
              <div>• Verify class name spelling</div>
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
          クラスを探す → ホームへ戻る
        </Link>
      </div>
    </div>
  );
};

export default ClassNotFound;
