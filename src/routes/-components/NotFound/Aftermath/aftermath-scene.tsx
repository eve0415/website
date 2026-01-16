import type { FC } from 'react';

import { useMemo } from 'react';

import AssertionError from './ErrorVisualizations/AssertionError/assertion-error';
import BufferOverflow from './ErrorVisualizations/BufferOverflow/buffer-overflow';
import ClassNotFound from './ErrorVisualizations/ClassNotFound/class-not-found';
import ConcurrentModification from './ErrorVisualizations/ConcurrentModification/concurrent-modification';
import DivisionByZero from './ErrorVisualizations/DivisionByZero/division-by-zero';
import { type ErrorType, getRandomError } from './ErrorVisualizations/error-types';
import FileNotFound from './ErrorVisualizations/FileNotFound/file-not-found';
import IndexOutOfBounds from './ErrorVisualizations/IndexOutOfBounds/index-out-of-bounds';
import NullPointer from './ErrorVisualizations/NullPointer/null-pointer';
import OutOfMemory from './ErrorVisualizations/OutOfMemory/out-of-memory';
import Panic from './ErrorVisualizations/Panic/panic';
import RecursionError from './ErrorVisualizations/RecursionError/recursion-error';
import SegFault from './ErrorVisualizations/SegFault/seg-fault';
import StackOverflow from './ErrorVisualizations/StackOverflow/stack-overflow';
import SyntaxError from './ErrorVisualizations/SyntaxError/syntax-error';
import TimeoutError from './ErrorVisualizations/TimeoutError/timeout-error';
import TypeError from './ErrorVisualizations/TypeError/type-error';
import TypeMismatch from './ErrorVisualizations/TypeMismatch/type-mismatch';
import UndefinedBehavior from './ErrorVisualizations/UndefinedBehavior/undefined-behavior';

interface AftermathSceneProps {
  visible: boolean;
}

// Component mapping for each error type
const ERROR_COMPONENTS: Record<ErrorType, FC> = {
  'null-pointer': NullPointer,
  'stack-overflow': StackOverflow,
  'file-not-found': FileNotFound,
  'seg-fault': SegFault,
  'out-of-memory': OutOfMemory,
  'index-out-of-bounds': IndexOutOfBounds,
  'type-error': TypeError,
  'syntax-error': SyntaxError,
  'recursion-error': RecursionError,
  'division-by-zero': DivisionByZero,
  'class-not-found': ClassNotFound,
  panic: Panic,
  'timeout-error': TimeoutError,
  'concurrent-modification': ConcurrentModification,
  'buffer-overflow': BufferOverflow,
  'assertion-error': AssertionError,
  'undefined-behavior': UndefinedBehavior,
  'type-mismatch': TypeMismatch,
};

const AftermathScene: FC<AftermathSceneProps> = ({ visible }) => {
  // Select random error on mount (consistent during the visit)
  const selectedError = useMemo(() => getRandomError(), []);
  const ErrorComponent = ERROR_COMPONENTS[selectedError.type];

  if (!visible) return null;

  return <ErrorComponent />;
};

export default AftermathScene;
