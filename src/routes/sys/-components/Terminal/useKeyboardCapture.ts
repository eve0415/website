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
 */
export const useKeyboardCapture = (options: UseKeyboardCaptureOptions): UseKeyboardCaptureResult => {
  const { enabled, commands, onSubmit, onCtrlC, onInputChange } = options;

  const [input, setInputState] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const tabPressCount = useRef(0);
  const lastTabInput = useRef('');
  // Track tab presses to handle React Strict Mode double-invocation
  const pendingTabId = useRef(0);
  const lastProcessedTabId = useRef(0);
  const lastTabResult = useRef('');

  // Refs for callbacks to avoid stale closures
  const onSubmitRef = useRef(onSubmit);
  const onCtrlCRef = useRef(onCtrlC);
  const onInputChangeRef = useRef(onInputChange);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
    onCtrlCRef.current = onCtrlC;
    onInputChangeRef.current = onInputChange;
  }, [onSubmit, onCtrlC, onInputChange]);

  const setInput = useCallback((value: string) => {
    setInputState(value);
    onInputChangeRef.current?.(value);
    // Reset tab state when input changes manually
    tabPressCount.current = 0;
    setSuggestions([]);
  }, []);

  const clearInput = useCallback(() => {
    setInputState('');
    setSuggestions([]);
    tabPressCount.current = 0;
    onInputChangeRef.current?.('');
  }, []);

  const handleTab = useCallback(
    (currentInput: string, tabId: number): string => {
      // If already processed, return the cached result (React Strict Mode double-call)
      if (tabId === lastProcessedTabId.current) {
        return lastTabResult.current;
      }
      lastProcessedTabId.current = tabId;

      // Helper to cache and return result
      const cacheAndReturn = (result: string): string => {
        lastTabResult.current = result;
        return result;
      };

      const trimmedInput = currentInput.trimStart();

      // Find matching commands
      const matches = commands.filter(cmd => cmd.startsWith(trimmedInput));

      if (matches.length === 0) {
        return cacheAndReturn(currentInput);
      }

      if (matches.length === 1 && matches[0] !== undefined) {
        // Single match: complete it
        setSuggestions([]);
        tabPressCount.current = 0;
        return cacheAndReturn(matches[0]);
      }

      // Multiple matches
      if (lastTabInput.current !== trimmedInput) {
        // Input changed since last tab
        tabPressCount.current = 0;
        lastTabInput.current = trimmedInput;
      }

      tabPressCount.current += 1;

      if (tabPressCount.current === 1) {
        // First tab: complete common prefix
        const commonPrefix = findCommonPrefix(matches);
        if (commonPrefix.length > trimmedInput.length) {
          setSuggestions([]);
          // Update lastTabInput so next Tab continues counting instead of resetting
          lastTabInput.current = commonPrefix;
          return cacheAndReturn(commonPrefix);
        }
        // No additional prefix to complete, show suggestions on second tab
        return cacheAndReturn(currentInput);
      }

      // Second tab: show all matches
      setSuggestions(matches);
      return cacheAndReturn(currentInput);
    },
    [commands],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl+C
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        onCtrlCRef.current();
        clearInput();
        return;
      }

      // Tab for autocomplete
      if (e.key === 'Tab') {
        e.preventDefault();
        const tabId = ++pendingTabId.current;
        setInputState(prev => {
          const newValue = handleTab(prev, tabId);
          onInputChangeRef.current?.(newValue);
          return newValue;
        });
        return;
      }

      // Enter to submit
      if (e.key === 'Enter') {
        e.preventDefault();
        const currentInput = input;
        if (currentInput.trim()) {
          onSubmitRef.current(currentInput.trim());
        }
        clearInput();
        return;
      }

      // Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();
        setInputState(prev => {
          const newValue = prev.slice(0, -1);
          onInputChangeRef.current?.(newValue);
          tabPressCount.current = 0;
          setSuggestions([]);
          return newValue;
        });
        return;
      }

      // Regular character input
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setInputState(prev => {
          const newValue = prev + e.key;
          onInputChangeRef.current?.(newValue);
          tabPressCount.current = 0;
          setSuggestions([]);
          return newValue;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleTab, clearInput, input]);

  return {
    input,
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
