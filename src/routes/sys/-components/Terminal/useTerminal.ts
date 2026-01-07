import type { ReactNode } from 'react';

import { useCallback, useReducer } from 'react';

export type TerminalState = 'typing' | 'running' | 'interrupted' | 'prompt';

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
}

type TerminalAction =
  | { type: 'TYPING_DONE' }
  | { type: 'CTRL_C' }
  | { type: 'BOOT_COMPLETE' }
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'EXECUTE_COMMAND'; payload: { command: string; output: ReactNode; isError?: boolean } }
  | { type: 'CLEAR' }
  | { type: 'AWAIT_CONFIRMATION'; payload: string }
  | { type: 'CONFIRM'; payload: boolean }
  | { type: 'ADD_OUTPUT'; payload: ReactNode };

const generateId = () => Math.random().toString(36).slice(2, 9);

const initialState: TerminalStateData = {
  state: 'typing',
  lines: [],
  currentInput: '',
  showCursor: true,
  awaitingConfirmation: null,
};

const terminalReducer = (state: TerminalStateData, action: TerminalAction): TerminalStateData => {
  switch (action.type) {
    case 'TYPING_DONE':
      return {
        ...state,
        state: 'running',
      };

    case 'CTRL_C':
      if (state.state === 'typing' || state.state === 'running') {
        return {
          ...state,
          state: 'interrupted',
          lines: [
            ...state.lines,
            {
              id: generateId(),
              type: 'output',
              content: '^C',
            },
          ],
        };
      }
      // In prompt state, Ctrl+C clears current input
      return {
        ...state,
        currentInput: '',
        awaitingConfirmation: null,
      };

    case 'BOOT_COMPLETE':
      return {
        ...state,
        state: 'prompt',
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
        {
          id: generateId(),
          type: action.payload.isError ? 'error' : 'output',
          content: action.payload.output,
        },
      ];

      return {
        ...state,
        lines: newLines,
        currentInput: '',
        awaitingConfirmation: null,
      };
    }

    case 'CLEAR':
      return {
        ...state,
        lines: [],
        currentInput: '',
        awaitingConfirmation: null,
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
  onTypingDone: () => void;
  onCtrlC: () => void;
  onBootComplete: () => void;
  setInput: (input: string) => void;
  executeCommand: (command: string, output: ReactNode, isError?: boolean) => void;
  clear: () => void;
  awaitConfirmation: (command: string) => void;
  confirm: (confirmed: boolean) => void;
  addOutput: (output: ReactNode) => void;
}

export const useTerminal = (): UseTerminalResult => {
  const [data, dispatch] = useReducer(terminalReducer, initialState);

  const onTypingDone = useCallback(() => dispatch({ type: 'TYPING_DONE' }), []);
  const onCtrlC = useCallback(() => dispatch({ type: 'CTRL_C' }), []);
  const onBootComplete = useCallback(() => dispatch({ type: 'BOOT_COMPLETE' }), []);
  const setInput = useCallback((input: string) => dispatch({ type: 'SET_INPUT', payload: input }), []);
  const executeCommand = useCallback(
    (command: string, output: ReactNode, isError = false) => dispatch({ type: 'EXECUTE_COMMAND', payload: { command, output, isError } }),
    [],
  );
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), []);
  const awaitConfirmation = useCallback((command: string) => dispatch({ type: 'AWAIT_CONFIRMATION', payload: command }), []);
  const confirm = useCallback((confirmed: boolean) => dispatch({ type: 'CONFIRM', payload: confirmed }), []);
  const addOutput = useCallback((output: ReactNode) => dispatch({ type: 'ADD_OUTPUT', payload: output }), []);

  return {
    state: data.state,
    lines: data.lines,
    currentInput: data.currentInput,
    awaitingConfirmation: data.awaitingConfirmation,
    onTypingDone,
    onCtrlC,
    onBootComplete,
    setInput,
    executeCommand,
    clear,
    awaitConfirmation,
    confirm,
    addOutput,
  };
};
