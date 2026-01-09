import type { FC } from 'react';

import { useMemo } from 'react';

import { type ErrorType, getRandomError } from './ErrorVisualizations/error-types';
import FileNotFound from './ErrorVisualizations/FileNotFound/file-not-found';
import IndexOutOfBounds from './ErrorVisualizations/IndexOutOfBounds/index-out-of-bounds';
import NullPointer from './ErrorVisualizations/NullPointer/null-pointer';
import OutOfMemory from './ErrorVisualizations/OutOfMemory/out-of-memory';
import SegFault from './ErrorVisualizations/SegFault/seg-fault';
import StackOverflow from './ErrorVisualizations/StackOverflow/stack-overflow';

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
};

const AftermathScene: FC<AftermathSceneProps> = ({ visible }) => {
  // Select random error on mount (consistent during the visit)
  const selectedError = useMemo(() => getRandomError(), []);
  const ErrorComponent = ERROR_COMPONENTS[selectedError.type];

  if (!visible) return null;

  return <ErrorComponent />;
};

export default AftermathScene;
