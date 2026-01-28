import type { ReactNode } from 'react';

import { useCallback, useReducer } from 'react';

export type TerminalState = 'typing' | 'displaying' | 'prompt';

export interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error' | 'prompt';
  content: ReactNode;
}

interface TerminalStateData {
  state: TerminalState;
  lines: TerminalLine[];
  currentInput: string;
  showCursor: boolean;
  awaitingConfirmation: string | null;
  /** Whether diagnostic content (CodeRadar, StatsPanel, etc.) is visible */
  contentVisible: boolean;
  /** Whether the boot command line is visible (cleared by 'clear' command) */
  bootCommandVisible: boolean;
  /** Text to display when typing was interrupted with Ctrl+C (includes partial text + ^C) */
  interruptedText: string | null;
}

type TerminalAction =
  | { type: 'TYPING_DONE' }
  | { type: 'CTRL_C' }
  | { type: 'CTRL_C_WITH_TEXT'; payload: { partialText: string } }
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'EXECUTE_COMMAND'; payload: { command: string; output: ReactNode; isError?: boolean } }
  | { type: 'CLEAR' }
  | { type: 'AWAIT_CONFIRMATION'; payload: string }
  | { type: 'CONFIRM'; payload: boolean }
  | { type: 'ADD_OUTPUT'; payload: ReactNode }
  | { type: 'SHOW_DIAGNOSTIC' };

const generateId = () => Math.random().toString(36).slice(2, 9);

const initialState: TerminalStateData = {
  state: 'typing',
  lines: [],
  currentInput: '',
  showCursor: true,
  awaitingConfirmation: null,
  contentVisible: false,
  bootCommandVisible: true,
  interruptedText: null,
};

const terminalReducer = (state: TerminalStateData, action: TerminalAction): TerminalStateData => {
  switch (action.type) {
    case 'TYPING_DONE':
      // Only transition if still in typing state (ignore if already interrupted)
      if (state.state !== 'typing') return state;

      // Typing complete → show content and wait for Ctrl+C
      return {
        ...state,
        state: 'displaying',
        contentVisible: true,
      };

    case 'CTRL_C':
      if (state.state === 'displaying') {
        // During content display: hide content instantly, show prompt
        return {
          ...state,
          state: 'prompt',
          contentVisible: false,
        };
      }
      // In prompt state, Ctrl+C clears current input
      return {
        ...state,
        currentInput: '',
        awaitingConfirmation: null,
      };

    case 'CTRL_C_WITH_TEXT':
      // During typing: stop mid-word, show ^C, skip content, go to prompt
      return {
        ...state,
        state: 'prompt',
        interruptedText: `${action.payload.partialText}^C`,
        contentVisible: false,
      };

    case 'SHOW_DIAGNOSTIC':
      // Re-running sys.diagnostic from prompt
      return {
        ...state,
        state: 'displaying',
        contentVisible: true,
      };

    case 'SET_INPUT':
      return {
        ...state,
        currentInput: action.payload,
      };

    case 'EXECUTE_COMMAND': {
      const newLines: TerminalLine[] = [
        ...state.lines,
        {
          id: generateId(),
          type: 'command',
          content: `> ${action.payload.command}`,
        },
      ];

      // Only add output line if there's actual output (not null/undefined)
      if (!(action.payload.output === null || action.payload.output === undefined)) {
        newLines.push({
          id: generateId(),
          type: action.payload.isError === true ? 'error' : 'output',
          content: action.payload.output,
        });
      }

      return {
        ...state,
        lines: newLines,
        currentInput: '',
        awaitingConfirmation: null,
      };
    }

    case 'CLEAR':
      // Clear everything including boot command line, show fresh prompt
      return {
        ...state,
        lines: [],
        currentInput: '',
        awaitingConfirmation: null,
        bootCommandVisible: false,
        interruptedText: null,
      };

    case 'AWAIT_CONFIRMATION':
      return {
        ...state,
        awaitingConfirmation: action.payload,
        lines: [
          ...state.lines,
          {
            id: generateId(),
            type: 'command',
            content: `> ${action.payload}`,
          },
        ],
      };

    case 'CONFIRM': {
      const confirmText = action.payload ? 'y' : 'n';
      return {
        ...state,
        awaitingConfirmation: null,
        lines: [
          ...state.lines,
          {
            id: generateId(),
            type: 'output',
            content: confirmText,
          },
        ],
      };
    }

    case 'ADD_OUTPUT':
      return {
        ...state,
        lines: [
          ...state.lines,
          {
            id: generateId(),
            type: 'output',
            content: action.payload,
          },
        ],
      };

    default:
      return state;
  }
};

export interface UseTerminalResult {
  state: TerminalState;
  lines: TerminalLine[];
  currentInput: string;
  awaitingConfirmation: string | null;
  contentVisible: boolean;
  bootCommandVisible: boolean;
  interruptedText: string | null;
  onTypingDone: () => void;
  onCtrlC: (partialText?: string) => void;
  setInput: (input: string) => void;
  executeCommand: (command: string, output: ReactNode, isError?: boolean) => void;
  clear: () => void;
  awaitConfirmation: (command: string) => void;
  confirm: (confirmed: boolean) => void;
  addOutput: (output: ReactNode) => void;
  showDiagnostic: () => void;
}

export const useTerminal = (): UseTerminalResult => {
  const [data, dispatch] = useReducer(terminalReducer, initialState);

  const onTypingDone = useCallback(() => {
    dispatch({ type: 'TYPING_DONE' });
  }, []);
  const onCtrlC = useCallback((partialText?: string) => {
    dispatch(partialText ? { type: 'CTRL_C_WITH_TEXT', payload: { partialText } } : { type: 'CTRL_C' });
  }, []);
  const setInput = useCallback((input: string) => {
    dispatch({ type: 'SET_INPUT', payload: input });
  }, []);
  const executeCommand = useCallback((command: string, output: ReactNode, isError = false) => {
    dispatch({ type: 'EXECUTE_COMMAND', payload: { command, output, isError } });
  }, []);
  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);
  const awaitConfirmation = useCallback((command: string) => {
    dispatch({ type: 'AWAIT_CONFIRMATION', payload: command });
  }, []);
  const confirm = useCallback((confirmed: boolean) => {
    dispatch({ type: 'CONFIRM', payload: confirmed });
  }, []);
  const addOutput = useCallback((output: ReactNode) => {
    dispatch({ type: 'ADD_OUTPUT', payload: output });
  }, []);
  const showDiagnostic = useCallback(() => {
    dispatch({ type: 'SHOW_DIAGNOSTIC' });
  }, []);

  return {
    state: data.state,
    lines: data.lines,
    currentInput: data.currentInput,
    awaitingConfirmation: data.awaitingConfirmation,
    contentVisible: data.contentVisible,
    bootCommandVisible: data.bootCommandVisible,
    interruptedText: data.interruptedText,
    onTypingDone,
    onCtrlC,
    setInput,
    executeCommand,
    clear,
    awaitConfirmation,
    confirm,
    addOutput,
    showDiagnostic,
  };
};
