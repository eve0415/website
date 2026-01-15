import { useCallback, useEffect, useRef, useState } from 'react';

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

/**
 * Hook for capturing keyboard input with tab autocomplete.
 * Only captures when enabled (desktop + prompt state).
 *
 * Uses refs for volatile state to avoid effect re-runs on every keystroke.
 */
export const useKeyboardCapture = (options: UseKeyboardCaptureOptions): UseKeyboardCaptureResult => {
  const { enabled, commands, onSubmit, onCtrlC, onInputChange } = options;

  // State for rendering (these trigger re-renders)
  const [input, setInputState] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1); // -1 = not navigating

  // Refs for accessing latest values in event handler without causing effect re-runs
  const inputRef = useRef(input);
  const cursorPositionRef = useRef(cursorPosition);
  const historyRef = useRef(history);
  const historyIndexRef = useRef(historyIndex);
  const wipInputRef = useRef(''); // Work-in-progress input saved when navigating

  // Tab completion state
  const tabPressCount = useRef(0);
  const lastTabInput = useRef('');
  const pendingTabId = useRef(0);
  const lastProcessedTabId = useRef(0);
  const lastTabResult = useRef('');

  // Refs for callbacks to avoid stale closures
  const commandsRef = useRef(commands);
  const onSubmitRef = useRef(onSubmit);
  const onCtrlCRef = useRef(onCtrlC);
  const onInputChangeRef = useRef(onInputChange);

  // Sync state to refs (runs after every render)
  // Group 1: User input state
  useEffect(() => {
    inputRef.current = input;
    cursorPositionRef.current = cursorPosition;
  });

  // Group 2: Command history state
  useEffect(() => {
    historyRef.current = history;
    historyIndexRef.current = historyIndex;
  });

  // Group 3: Props/callbacks
  useEffect(() => {
    commandsRef.current = commands;
    onSubmitRef.current = onSubmit;
    onCtrlCRef.current = onCtrlC;
    onInputChangeRef.current = onInputChange;
  });

  // Stable helper to update input and cursor together
  const updateInput = useCallback((newInput: string, newCursor: number, resetHistory = true) => {
    setInputState(newInput);
    setCursorPosition(newCursor);
    inputRef.current = newInput;
    cursorPositionRef.current = newCursor;
    onInputChangeRef.current?.(newInput);
    tabPressCount.current = 0;
    setSuggestions([]);
    if (resetHistory) {
      setHistoryIndex(-1);
      historyIndexRef.current = -1;
      wipInputRef.current = '';
    }
  }, []);

  const setInput = useCallback(
    (value: string) => {
      updateInput(value, value.length);
    },
    [updateInput],
  );

  const clearInput = useCallback(() => {
    updateInput('', 0);
  }, [updateInput]);

  // Tab handling function (stable, reads from refs)
  const handleTab = useCallback((currentInput: string, tabId: number): string => {
    // If already processed, return the cached result (React Strict Mode double-call)
    if (tabId === lastProcessedTabId.current) {
      return lastTabResult.current;
    }
    lastProcessedTabId.current = tabId;

    const cacheAndReturn = (result: string): string => {
      lastTabResult.current = result;
      return result;
    };

    const trimmedInput = currentInput.trimStart();
    const cmds = commandsRef.current;
    const matches = cmds.filter(cmd => cmd.startsWith(trimmedInput));

    if (matches.length === 0) {
      return cacheAndReturn(currentInput);
    }

    if (matches.length === 1 && matches[0] !== undefined) {
      setSuggestions([]);
      tabPressCount.current = 0;
      return cacheAndReturn(matches[0]);
    }

    if (lastTabInput.current !== trimmedInput) {
      tabPressCount.current = 0;
      lastTabInput.current = trimmedInput;
    }

    tabPressCount.current += 1;

    if (tabPressCount.current === 1) {
      const commonPrefix = findCommonPrefix(matches);
      if (commonPrefix.length > trimmedInput.length) {
        setSuggestions([]);
        lastTabInput.current = commonPrefix;
        return cacheAndReturn(commonPrefix);
      }
      return cacheAndReturn(currentInput);
    }

    setSuggestions(matches);
    return cacheAndReturn(currentInput);
  }, []);

  // Single event listener effect - only depends on `enabled`
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Read current values from refs
      const currentInput = inputRef.current;
      const currentCursor = cursorPositionRef.current;
      const currentHistory = historyRef.current;
      const currentHistoryIndex = historyIndexRef.current;

      // Ctrl+C
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        onCtrlCRef.current();
        setInputState('');
        setCursorPosition(0);
        inputRef.current = '';
        cursorPositionRef.current = 0;
        setSuggestions([]);
        tabPressCount.current = 0;
        setHistoryIndex(-1);
        historyIndexRef.current = -1;
        wipInputRef.current = '';
        return;
      }

      // Tab for autocomplete
      if (e.key === 'Tab') {
        e.preventDefault();
        const tabId = ++pendingTabId.current;
        const newValue = handleTab(currentInput, tabId);
        setInputState(newValue);
        setCursorPosition(newValue.length);
        inputRef.current = newValue;
        cursorPositionRef.current = newValue.length;
        onInputChangeRef.current?.(newValue);
        setHistoryIndex(-1);
        historyIndexRef.current = -1;
        wipInputRef.current = '';
        return;
      }

      // Enter to submit
      if (e.key === 'Enter') {
        e.preventDefault();
        if (currentInput.trim()) {
          const trimmed = currentInput.trim();
          setHistory(prev => {
            const newHistory = [...prev, trimmed];
            historyRef.current = newHistory;
            return newHistory;
          });
          onSubmitRef.current(trimmed);
        }
        setInputState('');
        setCursorPosition(0);
        inputRef.current = '';
        cursorPositionRef.current = 0;
        setSuggestions([]);
        tabPressCount.current = 0;
        setHistoryIndex(-1);
        historyIndexRef.current = -1;
        wipInputRef.current = '';
        return;
      }

      // Backspace - delete character before cursor
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (currentCursor > 0) {
          const newValue = currentInput.slice(0, currentCursor - 1) + currentInput.slice(currentCursor);
          const newCursor = currentCursor - 1;
          setInputState(newValue);
          setCursorPosition(newCursor);
          inputRef.current = newValue;
          cursorPositionRef.current = newCursor;
          onInputChangeRef.current?.(newValue);
          tabPressCount.current = 0;
          setSuggestions([]);
          setHistoryIndex(-1);
          historyIndexRef.current = -1;
          wipInputRef.current = '';
        }
        return;
      }

      // Delete - delete character at cursor (forward delete)
      if (e.key === 'Delete') {
        e.preventDefault();
        if (currentCursor < currentInput.length) {
          const newValue = currentInput.slice(0, currentCursor) + currentInput.slice(currentCursor + 1);
          setInputState(newValue);
          inputRef.current = newValue;
          onInputChangeRef.current?.(newValue);
          tabPressCount.current = 0;
          setSuggestions([]);
          setHistoryIndex(-1);
          historyIndexRef.current = -1;
          wipInputRef.current = '';
        }
        return;
      }

      // Arrow left - move cursor left
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const newCursor = Math.max(0, currentCursor - 1);
        setCursorPosition(newCursor);
        cursorPositionRef.current = newCursor;
        return;
      }

      // Arrow right - move cursor right
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const newCursor = Math.min(currentInput.length, currentCursor + 1);
        setCursorPosition(newCursor);
        cursorPositionRef.current = newCursor;
        return;
      }

      // Home - cursor to start
      if (e.key === 'Home') {
        e.preventDefault();
        setCursorPosition(0);
        cursorPositionRef.current = 0;
        return;
      }

      // End - cursor to end
      if (e.key === 'End') {
        e.preventDefault();
        setCursorPosition(currentInput.length);
        cursorPositionRef.current = currentInput.length;
        return;
      }

      // Arrow up - navigate history (older)
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentHistory.length === 0) return;

        if (currentHistoryIndex === -1) {
          // Starting navigation - save current input as WIP
          wipInputRef.current = currentInput;
          const newIndex = currentHistory.length - 1;
          setHistoryIndex(newIndex);
          historyIndexRef.current = newIndex;
          const historyEntry = currentHistory[newIndex];
          if (historyEntry !== undefined) {
            setInputState(historyEntry);
            setCursorPosition(historyEntry.length);
            inputRef.current = historyEntry;
            cursorPositionRef.current = historyEntry.length;
            onInputChangeRef.current?.(historyEntry);
          }
        } else if (currentHistoryIndex > 0) {
          // Go to older entry
          const newIndex = currentHistoryIndex - 1;
          setHistoryIndex(newIndex);
          historyIndexRef.current = newIndex;
          const historyEntry = currentHistory[newIndex];
          if (historyEntry !== undefined) {
            setInputState(historyEntry);
            setCursorPosition(historyEntry.length);
            inputRef.current = historyEntry;
            cursorPositionRef.current = historyEntry.length;
            onInputChangeRef.current?.(historyEntry);
          }
        }
        tabPressCount.current = 0;
        setSuggestions([]);
        return;
      }

      // Arrow down - navigate history (newer)
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentHistoryIndex === -1) return;

        if (currentHistoryIndex < currentHistory.length - 1) {
          const newIndex = currentHistoryIndex + 1;
          setHistoryIndex(newIndex);
          historyIndexRef.current = newIndex;
          const historyEntry = currentHistory[newIndex];
          if (historyEntry !== undefined) {
            setInputState(historyEntry);
            setCursorPosition(historyEntry.length);
            inputRef.current = historyEntry;
            cursorPositionRef.current = historyEntry.length;
            onInputChangeRef.current?.(historyEntry);
          }
        } else {
          // At newest entry - return to WIP
          setHistoryIndex(-1);
          historyIndexRef.current = -1;
          setInputState(wipInputRef.current);
          setCursorPosition(wipInputRef.current.length);
          inputRef.current = wipInputRef.current;
          cursorPositionRef.current = wipInputRef.current.length;
          onInputChangeRef.current?.(wipInputRef.current);
          wipInputRef.current = '';
        }
        tabPressCount.current = 0;
        setSuggestions([]);
        return;
      }

      // Regular character input - insert at cursor position
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const newValue = currentInput.slice(0, currentCursor) + e.key + currentInput.slice(currentCursor);
        const newCursor = currentCursor + 1;
        setInputState(newValue);
        setCursorPosition(newCursor);
        inputRef.current = newValue;
        cursorPositionRef.current = newCursor;
        onInputChangeRef.current?.(newValue);
        tabPressCount.current = 0;
        setSuggestions([]);
        setHistoryIndex(-1);
        historyIndexRef.current = -1;
        wipInputRef.current = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleTab]);

  return {
    input,
    cursorPosition,
    suggestions,
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
