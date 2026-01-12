import type { BootContext, BootMessage } from './boot-messages';

import { describe, expect, it } from 'vitest';

import { BASE_BOOT_DURATION, PROGRESS_STAGES, createBootMessages, flattenMessages, resolveMessageText } from './boot-messages';
import { fastTiming, mockConnection, mockDOMScan } from './boot-sequence.fixtures';

// Standard test context using fixtures
const createTestContext = (overrides: Partial<BootContext> = {}): BootContext => ({
  timing: fastTiming,
  dom: mockDOMScan,
  connection: mockConnection,
  path: '/test-path',
  ...overrides,
});

describe('boot-messages', () => {
  describe('flattenMessages', () => {
    it('flattens nested messages with correct depth', () => {
      const messages: BootMessage[] = [
        {
          id: 'root',
          text: 'Root',
          type: 'group',
          baseDelay: 0,
          children: [{ id: 'child', text: 'Child', type: 'info', baseDelay: 100 }],
        },
      ];

      const result = flattenMessages(messages);

      expect(result).toHaveLength(2);
      expect(result[0]?.depth).toBe(0);
      expect(result[1]?.depth).toBe(1);
    });

    it('preserves message order during flattening', () => {
      const messages: BootMessage[] = [
        {
          id: 'a',
          text: 'A',
          type: 'info',
          baseDelay: 0,
          children: [{ id: 'a1', text: 'A1', type: 'info', baseDelay: 100 }],
        },
        { id: 'b', text: 'B', type: 'info', baseDelay: 200 },
      ];

      const result = flattenMessages(messages);

      expect(result.map(m => m.id)).toEqual(['a', 'a1', 'b']);
    });

    it('handles deeply nested structures', () => {
      const messages: BootMessage[] = [
        {
          id: 'l0',
          text: 'Level 0',
          type: 'group',
          baseDelay: 0,
          children: [
            {
              id: 'l1',
              text: 'Level 1',
              type: 'group',
              baseDelay: 0,
              children: [
                {
                  id: 'l2',
                  text: 'Level 2',
                  type: 'group',
                  baseDelay: 0,
                  children: [{ id: 'l3', text: 'Level 3', type: 'info', baseDelay: 0 }],
                },
              ],
            },
          ],
        },
      ];

      const result = flattenMessages(messages);

      expect(result).toHaveLength(4);
      expect(result[0]?.depth).toBe(0);
      expect(result[1]?.depth).toBe(1);
      expect(result[2]?.depth).toBe(2);
      expect(result[3]?.depth).toBe(3);
    });

    it('returns empty array for empty input', () => {
      expect(flattenMessages([])).toEqual([]);
    });

    it('handles messages without children', () => {
      const messages: BootMessage[] = [
        { id: 'a', text: 'A', type: 'info', baseDelay: 0 },
        { id: 'b', text: 'B', type: 'info', baseDelay: 100 },
      ];

      const result = flattenMessages(messages);

      expect(result).toHaveLength(2);
      expect(result.every(m => m.depth === 0)).toBe(true);
    });

    it('preserves all message properties', () => {
      const messages: BootMessage[] = [{ id: 'test', text: 'Test Message', type: 'warning', baseDelay: 500 }];

      const result = flattenMessages(messages);

      expect(result[0]).toMatchObject({
        id: 'test',
        text: 'Test Message',
        type: 'warning',
        baseDelay: 500,
        depth: 0,
      });
    });
  });

  describe('resolveMessageText', () => {
    const ctx = createTestContext();

    it('returns string text directly', () => {
      const msg: BootMessage = { id: 'test', text: 'Static text', type: 'info', baseDelay: 0 };

      expect(resolveMessageText(msg, ctx)).toBe('Static text');
    });

    it('calls function text with context', () => {
      const msg: BootMessage = {
        id: 'test',
        text: c => `Path is ${c.path}`,
        type: 'info',
        baseDelay: 0,
      };

      expect(resolveMessageText(msg, ctx)).toBe('Path is /test-path');
    });

    it('interpolates timing data', () => {
      const msg: BootMessage = {
        id: 'test',
        text: c => `DNS: ${c.timing.dns}ms, TLS: ${c.timing.tls}ms`,
        type: 'info',
        baseDelay: 0,
      };

      expect(resolveMessageText(msg, ctx)).toBe('DNS: 5ms, TLS: 20ms');
    });

    it('interpolates connection info', () => {
      const msg: BootMessage = {
        id: 'test',
        text: c => `Server: ${c.connection.serverIp}, Cipher: ${c.connection.tlsCipher}`,
        type: 'info',
        baseDelay: 0,
      };

      expect(resolveMessageText(msg, ctx)).toBe('Server: 104.21.48.170, Cipher: TLS_AES_128_GCM_SHA256');
    });

    it('interpolates DOM scan data', () => {
      const msg: BootMessage = {
        id: 'test',
        text: c => `Nodes: ${c.dom.totalNodes}, Lang: ${c.dom.htmlLang}`,
        type: 'info',
        baseDelay: 0,
      };

      expect(resolveMessageText(msg, ctx)).toBe('Nodes: 150, Lang: ja');
    });

    it('interpolates protocol correctly', () => {
      const msg: BootMessage = {
        id: 'test',
        text: c => `Protocol: ${c.timing.protocol}`,
        type: 'info',
        baseDelay: 0,
      };

      expect(resolveMessageText(msg, ctx)).toBe('Protocol: h2');
    });

    it('handles certificate chain interpolation', () => {
      const msg: BootMessage = {
        id: 'test',
        text: c => `Chain: ${c.connection.certChain.join(' → ')}`,
        type: 'info',
        baseDelay: 0,
      };

      expect(resolveMessageText(msg, ctx)).toBe("Chain: Let's Encrypt R3 → ISRG Root X1");
    });
  });

  describe('createBootMessages', () => {
    it('returns non-empty message array', () => {
      const messages = createBootMessages();

      expect(messages.length).toBeGreaterThan(0);
    });

    it('all messages have valid types', () => {
      const messages = createBootMessages();
      const flat = flattenMessages(messages);
      const validTypes = ['info', 'success', 'warning', 'error', 'group'];

      for (const msg of flat) {
        expect(validTypes).toContain(msg.type);
      }
    });

    it('all messages have required properties', () => {
      const messages = createBootMessages();
      const flat = flattenMessages(messages);

      for (const msg of flat) {
        expect(msg).toHaveProperty('id');
        expect(msg).toHaveProperty('text');
        expect(msg).toHaveProperty('type');
        expect(msg).toHaveProperty('baseDelay');
        expect(typeof msg.id).toBe('string');
        expect(typeof msg.baseDelay).toBe('number');
      }
    });

    it('all message IDs are unique', () => {
      const messages = createBootMessages();
      const flat = flattenMessages(messages);
      const ids = flat.map(m => m.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('root level baseDelay values are monotonically increasing', () => {
      const messages = createBootMessages();
      let lastDelay = -1;

      for (const msg of messages) {
        expect(msg.baseDelay).toBeGreaterThanOrEqual(lastDelay);
        lastDelay = msg.baseDelay;
      }
    });

    it('contains expected major sections', () => {
      const messages = createBootMessages();
      const rootIds = messages.map(m => m.id);

      expect(rootIds).toContain('nav');
      expect(rootIds).toContain('tls');
      expect(rootIds).toContain('http');
      expect(rootIds).toContain('parse');
      expect(rootIds).toContain('render');
      expect(rootIds).toContain('hydrate');
    });

    it('hydration section ends with error messages', () => {
      const messages = createBootMessages();
      const hydrate = messages.find(m => m.id === 'hydrate');
      const hydrateChildren = hydrate?.children ?? [];
      const lastTwo = hydrateChildren.slice(-2);

      expect(lastTwo[0]?.type).toBe('error');
      expect(lastTwo[1]?.type).toBe('error');
    });

    it('all dynamic text functions resolve without error', () => {
      const messages = createBootMessages();
      const flat = flattenMessages(messages);
      const ctx = createTestContext();

      for (const msg of flat) {
        expect(() => resolveMessageText(msg, ctx)).not.toThrow();
      }
    });
  });

  describe('PROGRESS_STAGES', () => {
    it('contains expected stages', () => {
      const labels = PROGRESS_STAGES.map(s => s.label);

      expect(labels).toContain('Network');
      expect(labels).toContain('TLS');
      expect(labels).toContain('HTTP');
      expect(labels).toContain('Parse');
      expect(labels).toContain('Render');
      expect(labels).toContain('Hydrate');
    });

    it('stages cover complete timeline without gaps', () => {
      let expectedStart = 0;

      for (const stage of PROGRESS_STAGES) {
        expect(stage.startAt).toBe(expectedStart);
        expectedStart = stage.startAt + stage.duration;
      }
    });

    it('all stages have positive duration', () => {
      for (const stage of PROGRESS_STAGES) {
        expect(stage.duration).toBeGreaterThan(0);
      }
    });

    it('total duration matches BASE_BOOT_DURATION', () => {
      const lastStage = PROGRESS_STAGES.at(-1)!;
      const totalDuration = lastStage.startAt + lastStage.duration;

      expect(totalDuration).toBe(BASE_BOOT_DURATION);
    });
  });

  describe('BASE_BOOT_DURATION', () => {
    it('is 5000ms', () => {
      expect(BASE_BOOT_DURATION).toBe(5000);
    });
  });
});
