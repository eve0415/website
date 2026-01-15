import { useCallback, useEffect, useReducer, useRef } from 'react';

interface UseKeyboardCaptureOptions {
  /** Whether keyboard capture is enabled */
  enabled: boolean;
  /** Available commands for autocomplete */
  commands: string[];
  /** Callback when Enter is pressed */
  onSubmit: (input: string) => void;
  /** Callback when Ctrl+C is pressed */
  onCtrlC: () => void;
  /** Callback when input changes */
  onInputChange?: (input: string) => void;
}

interface UseKeyboardCaptureResult {
  /** Current input string */
  input: string;
  /** Cursor position within input (0 = before first char, input.length = after last) */
  cursorPosition: number;
  /** Autocomplete suggestions to display */
  suggestions: string[];
  /** Clear the input */
  clearInput: () => void;
  /** Set input directly */
  setInput: (value: string) => void;
}

// State managed by reducer
interface KeyboardState {
  input: string;
  cursorPosition: number;
  suggestions: string[];
  history: string[];
  historyIndex: number; // -1 = not navigating
  wipInput: string; // Work-in-progress input saved when navigating history
}

// Actions for state transitions
type KeyboardAction =
  | { type: 'TYPE_CHAR'; char: string }
  | { type: 'BACKSPACE' }
  | { type: 'DELETE' }
  | { type: 'MOVE_CURSOR'; position: number }
  | { type: 'HISTORY_UP' }
  | { type: 'HISTORY_DOWN' }
  | { type: 'TAB_COMPLETE'; result: string; suggestions: string[] }
  | { type: 'SUBMIT' }
  | { type: 'CANCEL' }
  | { type: 'CLEAR' }
  | { type: 'SET_INPUT'; value: string };

const initialState: KeyboardState = {
  input: '',
  cursorPosition: 0,
  suggestions: [],
  history: [],
  historyIndex: -1,
  wipInput: '',
};

function keyboardReducer(state: KeyboardState, action: KeyboardAction): KeyboardState {
  switch (action.type) {
    case 'TYPE_CHAR': {
      const newInput = state.input.slice(0, state.cursorPosition) + action.char + state.input.slice(state.cursorPosition);
      return {
        ...state,
        input: newInput,
        cursorPosition: state.cursorPosition + 1,
        suggestions: [],
        historyIndex: -1,
        wipInput: '',
      };
    }

    case 'BACKSPACE': {
      if (state.cursorPosition === 0) return state;
      const newInput = state.input.slice(0, state.cursorPosition - 1) + state.input.slice(state.cursorPosition);
      return {
        ...state,
        input: newInput,
        cursorPosition: state.cursorPosition - 1,
        suggestions: [],
        historyIndex: -1,
        wipInput: '',
      };
    }

    case 'DELETE': {
      if (state.cursorPosition >= state.input.length) return state;
      const newInput = state.input.slice(0, state.cursorPosition) + state.input.slice(state.cursorPosition + 1);
      return {
        ...state,
        input: newInput,
        suggestions: [],
        historyIndex: -1,
        wipInput: '',
      };
    }

    case 'MOVE_CURSOR': {
      const newPosition = Math.max(0, Math.min(state.input.length, action.position));
      if (newPosition === state.cursorPosition) return state;
      return {
        ...state,
        cursorPosition: newPosition,
      };
    }

    case 'HISTORY_UP': {
      if (state.history.length === 0) return state;

      if (state.historyIndex === -1) {
        // Starting navigation - save current input
        const newIndex = state.history.length - 1;
        const historyEntry = state.history[newIndex];
        if (historyEntry === undefined) return state;
        return {
          ...state,
          wipInput: state.input,
          historyIndex: newIndex,
          input: historyEntry,
          cursorPosition: historyEntry.length,
          suggestions: [],
        };
      }

      if (state.historyIndex > 0) {
        // Go to older entry
        const newIndex = state.historyIndex - 1;
        const historyEntry = state.history[newIndex];
        if (historyEntry === undefined) return state;
        return {
          ...state,
          historyIndex: newIndex,
          input: historyEntry,
          cursorPosition: historyEntry.length,
          suggestions: [],
        };
      }

      return state;
    }

    case 'HISTORY_DOWN': {
      if (state.historyIndex === -1) return state;

      if (state.historyIndex < state.history.length - 1) {
        // Go to newer entry
        const newIndex = state.historyIndex + 1;
        const historyEntry = state.history[newIndex];
        if (historyEntry === undefined) return state;
        return {
          ...state,
          historyIndex: newIndex,
          input: historyEntry,
          cursorPosition: historyEntry.length,
          suggestions: [],
        };
      }

      // At newest - return to WIP
      return {
        ...state,
        historyIndex: -1,
        input: state.wipInput,
        cursorPosition: state.wipInput.length,
        wipInput: '',
        suggestions: [],
      };
    }

    case 'TAB_COMPLETE': {
      return {
        ...state,
        input: action.result,
        cursorPosition: action.result.length,
        suggestions: action.suggestions,
        historyIndex: -1,
        wipInput: '',
      };
    }

    case 'SUBMIT': {
      const trimmed = state.input.trim();
      if (!trimmed) {
        return {
          ...state,
          input: '',
          cursorPosition: 0,
          suggestions: [],
          historyIndex: -1,
          wipInput: '',
        };
      }
      return {
        ...state,
        input: '',
        cursorPosition: 0,
        suggestions: [],
        history: [...state.history, trimmed],
        historyIndex: -1,
        wipInput: '',
      };
    }

    case 'CANCEL':
    case 'CLEAR': {
      return {
        ...state,
        input: '',
        cursorPosition: 0,
        suggestions: [],
        historyIndex: -1,
        wipInput: '',
      };
    }

    case 'SET_INPUT': {
      return {
        ...state,
        input: action.value,
        cursorPosition: action.value.length,
        suggestions: [],
        historyIndex: -1,
        wipInput: '',
      };
    }

    default:
      return state;
  }
}

/**
 * Hook for capturing keyboard input with tab autocomplete.
 * Only captures when enabled (desktop + prompt state).
 *
 * Uses useReducer for state management - cleaner than multiple useState + ref syncing.
 */
export const useKeyboardCapture = (options: UseKeyboardCaptureOptions): UseKeyboardCaptureResult => {
  const { enabled, commands, onSubmit, onCtrlC, onInputChange } = options;

  const [state, dispatch] = useReducer(keyboardReducer, initialState);

  // Refs for callbacks to avoid stale closures in event handler
  const commandsRef = useRef(commands);
  const onSubmitRef = useRef(onSubmit);
  const onCtrlCRef = useRef(onCtrlC);
  const onInputChangeRef = useRef(onInputChange);

  // Sync callback refs
  useEffect(() => {
    commandsRef.current = commands;
    onSubmitRef.current = onSubmit;
    onCtrlCRef.current = onCtrlC;
    onInputChangeRef.current = onInputChange;
  });

  // Tab completion state (not in reducer - caching for double-invocation protection)
  const tabPressCount = useRef(0);
  const lastTabInput = useRef('');
  const pendingTabId = useRef(0);
  const lastProcessedTabId = useRef(0);
  const lastTabResult = useRef<{ result: string; suggestions: string[] }>({ result: '', suggestions: [] });

  // Tab handling function
  const handleTab = useCallback((currentInput: string, tabId: number): { result: string; suggestions: string[] } => {
    // If already processed, return the cached result (React Strict Mode double-call)
    if (tabId === lastProcessedTabId.current) {
      return lastTabResult.current;
    }
    lastProcessedTabId.current = tabId;

    const cacheAndReturn = (result: string, suggestions: string[]): { result: string; suggestions: string[] } => {
      lastTabResult.current = { result, suggestions };
      return lastTabResult.current;
    };

    const trimmedInput = currentInput.trimStart();
    const cmds = commandsRef.current;
    const matches = cmds.filter(cmd => cmd.startsWith(trimmedInput));

    if (matches.length === 0) {
      return cacheAndReturn(currentInput, []);
    }

    if (matches.length === 1 && matches[0] !== undefined) {
      tabPressCount.current = 0;
      return cacheAndReturn(matches[0], []);
    }

    if (lastTabInput.current !== trimmedInput) {
      tabPressCount.current = 0;
      lastTabInput.current = trimmedInput;
    }

    tabPressCount.current += 1;

    if (tabPressCount.current === 1) {
      const commonPrefix = findCommonPrefix(matches);
      if (commonPrefix.length > trimmedInput.length) {
        lastTabInput.current = commonPrefix;
        return cacheAndReturn(commonPrefix, []);
      }
      return cacheAndReturn(currentInput, []);
    }

    return cacheAndReturn(currentInput, matches);
  }, []);

  // Stable callbacks for external use
  const setInput = useCallback((value: string) => {
    dispatch({ type: 'SET_INPUT', value });
    onInputChangeRef.current?.(value);
  }, []);

  const clearInput = useCallback(() => {
    dispatch({ type: 'CLEAR' });
    onInputChangeRef.current?.('');
  }, []);

  // Single event listener effect - only depends on `enabled`
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl+C
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        dispatch({ type: 'CANCEL' });
        onCtrlCRef.current();
        onInputChangeRef.current?.('');
        tabPressCount.current = 0;
        return;
      }

      // Tab for autocomplete
      if (e.key === 'Tab') {
        e.preventDefault();
        const tabId = ++pendingTabId.current;
        const { result, suggestions } = handleTab(state.input, tabId);
        dispatch({ type: 'TAB_COMPLETE', result, suggestions });
        onInputChangeRef.current?.(result);
        return;
      }

      // Enter to submit
      if (e.key === 'Enter') {
        e.preventDefault();
        const trimmed = state.input.trim();
        if (trimmed) {
          onSubmitRef.current(trimmed);
        }
        dispatch({ type: 'SUBMIT' });
        onInputChangeRef.current?.('');
        tabPressCount.current = 0;
        return;
      }

      // Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (state.cursorPosition > 0) {
          const newInput = state.input.slice(0, state.cursorPosition - 1) + state.input.slice(state.cursorPosition);
          dispatch({ type: 'BACKSPACE' });
          onInputChangeRef.current?.(newInput);
          tabPressCount.current = 0;
        }
        return;
      }

      // Delete
      if (e.key === 'Delete') {
        e.preventDefault();
        if (state.cursorPosition < state.input.length) {
          const newInput = state.input.slice(0, state.cursorPosition) + state.input.slice(state.cursorPosition + 1);
          dispatch({ type: 'DELETE' });
          onInputChangeRef.current?.(newInput);
          tabPressCount.current = 0;
        }
        return;
      }

      // Arrow left
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        dispatch({ type: 'MOVE_CURSOR', position: state.cursorPosition - 1 });
        return;
      }

      // Arrow right
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        dispatch({ type: 'MOVE_CURSOR', position: state.cursorPosition + 1 });
        return;
      }

      // Home
      if (e.key === 'Home') {
        e.preventDefault();
        dispatch({ type: 'MOVE_CURSOR', position: 0 });
        return;
      }

      // End
      if (e.key === 'End') {
        e.preventDefault();
        dispatch({ type: 'MOVE_CURSOR', position: state.input.length });
        return;
      }

      // Arrow up - history older
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        // Need to get history entry for onInputChange callback
        const hist = state.history;
        const idx = state.historyIndex;
        if (hist.length === 0) return;

        let newInput: string | undefined;
        if (idx === -1) {
          newInput = hist[hist.length - 1];
        } else if (idx > 0) {
          newInput = hist[idx - 1];
        }

        dispatch({ type: 'HISTORY_UP' });
        if (newInput !== undefined) {
          onInputChangeRef.current?.(newInput);
        }
        tabPressCount.current = 0;
        return;
      }

      // Arrow down - history newer
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const idx = state.historyIndex;
        if (idx === -1) return;

        let newInput: string;
        if (idx < state.history.length - 1) {
          newInput = state.history[idx + 1] ?? '';
        } else {
          newInput = state.wipInput;
        }

        dispatch({ type: 'HISTORY_DOWN' });
        onInputChangeRef.current?.(newInput);
        tabPressCount.current = 0;
        return;
      }

      // Regular character input
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const newInput = state.input.slice(0, state.cursorPosition) + e.key + state.input.slice(state.cursorPosition);
        dispatch({ type: 'TYPE_CHAR', char: e.key });
        onInputChangeRef.current?.(newInput);
        tabPressCount.current = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleTab, state]);

  return {
    input: state.input,
    cursorPosition: state.cursorPosition,
    suggestions: state.suggestions,
    clearInput,
    setInput,
  };
};

/**
 * Find the longest common prefix among an array of strings.
 */
function findCommonPrefix(strings: string[]): string {
  const first = strings[0];
  if (strings.length === 0 || first === undefined) return '';
  if (strings.length === 1) return first;

  let prefix: string = first;
  for (let i = 1; i < strings.length; i++) {
    const current = strings[i];
    if (current === undefined) continue;
    while (!current.startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (prefix === '') return '';
    }
  }
  return prefix;
}
