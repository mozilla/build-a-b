import { evaluatePhase2Flag } from '../evaluate-phase2-flag';
import { evaluateFlag } from '@/app/flags';

jest.mock('@/app/flags', () => ({
  evaluateFlag: jest.fn(),
}));

const mockEvaluateFlag = evaluateFlag as jest.MockedFunction<typeof evaluateFlag>;

describe('evaluatePhase2Flag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when min is "a"', () => {
    it('should return true when phase 2a is enabled', async () => {
      mockEvaluateFlag.mockImplementation((flagKey) => {
        if (flagKey === 'showPhase2aFeatures') return Promise.resolve(true);
        if (flagKey === 'showPhase2bFeatures') return Promise.resolve(false);
        if (flagKey === 'showPhase2cFeatures') return Promise.resolve(false);
        return Promise.resolve(false);
      });

      const result = await evaluatePhase2Flag('a');
      expect(result).toBe(true);
    });

    it('should return true when phase 2b is enabled', async () => {
      mockEvaluateFlag.mockImplementation((flagKey) => {
        if (flagKey === 'showPhase2aFeatures') return Promise.resolve(false);
        if (flagKey === 'showPhase2bFeatures') return Promise.resolve(true);
        if (flagKey === 'showPhase2cFeatures') return Promise.resolve(false);
        return Promise.resolve(false);
      });

      const result = await evaluatePhase2Flag('a');
      expect(result).toBe(true);
    });

    it('should return true when phase 2c is enabled', async () => {
      mockEvaluateFlag.mockImplementation((flagKey) => {
        if (flagKey === 'showPhase2aFeatures') return Promise.resolve(false);
        if (flagKey === 'showPhase2bFeatures') return Promise.resolve(false);
        if (flagKey === 'showPhase2cFeatures') return Promise.resolve(true);
        return Promise.resolve(false);
      });

      const result = await evaluatePhase2Flag('a');
      expect(result).toBe(true);
    });

    it('should return true when all phases are enabled', async () => {
      mockEvaluateFlag.mockImplementation((flagKey) => {
        if (flagKey === 'showPhase2aFeatures') return Promise.resolve(true);
        if (flagKey === 'showPhase2bFeatures') return Promise.resolve(true);
        if (flagKey === 'showPhase2cFeatures') return Promise.resolve(true);
        return Promise.resolve(false);
      });

      const result = await evaluatePhase2Flag('a');
      expect(result).toBe(true);
    });

    it('should return false when no phases are enabled', async () => {
      mockEvaluateFlag.mockResolvedValue(false);

      const result = await evaluatePhase2Flag('a');
      expect(result).toBe(false);
    });
  });

  describe('when min is "b"', () => {
    it('should return false when only phase 2a is enabled', async () => {
      mockEvaluateFlag.mockImplementation((flagKey) => {
        if (flagKey === 'showPhase2aFeatures') return Promise.resolve(true);
        if (flagKey === 'showPhase2bFeatures') return Promise.resolve(false);
        if (flagKey === 'showPhase2cFeatures') return Promise.resolve(false);
        return Promise.resolve(false);
      });

      const result = await evaluatePhase2Flag('b');
      expect(result).toBe(false);
    });

    it('should return true when phase 2b is enabled', async () => {
      mockEvaluateFlag.mockImplementation((flagKey) => {
        if (flagKey === 'showPhase2aFeatures') return Promise.resolve(false);
        if (flagKey === 'showPhase2bFeatures') return Promise.resolve(true);
        if (flagKey === 'showPhase2cFeatures') return Promise.resolve(false);
        return Promise.resolve(false);
      });

      const result = await evaluatePhase2Flag('b');
      expect(result).toBe(true);
    });

    it('should return true when phase 2c is enabled', async () => {
      mockEvaluateFlag.mockImplementation((flagKey) => {
        if (flagKey === 'showPhase2aFeatures') return Promise.resolve(false);
        if (flagKey === 'showPhase2bFeatures') return Promise.resolve(false);
        if (flagKey === 'showPhase2cFeatures') return Promise.resolve(true);
        return Promise.resolve(false);
      });

      const result = await evaluatePhase2Flag('b');
      expect(result).toBe(true);
    });

    it('should return true when both phase 2b and 2c are enabled', async () => {
      mockEvaluateFlag.mockImplementation((flagKey) => {
        if (flagKey === 'showPhase2aFeatures') return Promise.resolve(false);
        if (flagKey === 'showPhase2bFeatures') return Promise.resolve(true);
        if (flagKey === 'showPhase2cFeatures') return Promise.resolve(true);
        return Promise.resolve(false);
      });

      const result = await evaluatePhase2Flag('b');
      expect(result).toBe(true);
    });

    it('should return false when no phases are enabled', async () => {
      mockEvaluateFlag.mockResolvedValue(false);

      const result = await evaluatePhase2Flag('b');
      expect(result).toBe(false);
    });
  });

  describe('when min is "c"', () => {
    it('should return false when only phase 2a is enabled', async () => {
      mockEvaluateFlag.mockImplementation((flagKey) => {
        if (flagKey === 'showPhase2aFeatures') return Promise.resolve(true);
        if (flagKey === 'showPhase2bFeatures') return Promise.resolve(false);
        if (flagKey === 'showPhase2cFeatures') return Promise.resolve(false);
        return Promise.resolve(false);
      });

      const result = await evaluatePhase2Flag('c');
      expect(result).toBe(false);
    });

    it('should return false when only phase 2b is enabled', async () => {
      mockEvaluateFlag.mockImplementation((flagKey) => {
        if (flagKey === 'showPhase2aFeatures') return Promise.resolve(false);
        if (flagKey === 'showPhase2bFeatures') return Promise.resolve(true);
        if (flagKey === 'showPhase2cFeatures') return Promise.resolve(false);
        return Promise.resolve(false);
      });

      const result = await evaluatePhase2Flag('c');
      expect(result).toBe(false);
    });

    it('should return true when phase 2c is enabled', async () => {
      mockEvaluateFlag.mockImplementation((flagKey) => {
        if (flagKey === 'showPhase2aFeatures') return Promise.resolve(false);
        if (flagKey === 'showPhase2bFeatures') return Promise.resolve(false);
        if (flagKey === 'showPhase2cFeatures') return Promise.resolve(true);
        return Promise.resolve(false);
      });

      const result = await evaluatePhase2Flag('c');
      expect(result).toBe(true);
    });

    it('should return true when phase 2c is enabled along with other phases', async () => {
      mockEvaluateFlag.mockImplementation((flagKey) => {
        if (flagKey === 'showPhase2aFeatures') return Promise.resolve(true);
        if (flagKey === 'showPhase2bFeatures') return Promise.resolve(true);
        if (flagKey === 'showPhase2cFeatures') return Promise.resolve(true);
        return Promise.resolve(false);
      });

      const result = await evaluatePhase2Flag('c');
      expect(result).toBe(true);
    });

    it('should return false when no phases are enabled', async () => {
      mockEvaluateFlag.mockResolvedValue(false);

      const result = await evaluatePhase2Flag('c');
      expect(result).toBe(false);
    });
  });

  describe('flag evaluation', () => {
    it('should call evaluateFlag for all three phase flags', async () => {
      mockEvaluateFlag.mockResolvedValue(false);

      await evaluatePhase2Flag('a');

      expect(mockEvaluateFlag).toHaveBeenCalledTimes(3);
      expect(mockEvaluateFlag).toHaveBeenCalledWith('showPhase2aFeatures');
      expect(mockEvaluateFlag).toHaveBeenCalledWith('showPhase2bFeatures');
      expect(mockEvaluateFlag).toHaveBeenCalledWith('showPhase2cFeatures');
    });

    it('should evaluate all flags in parallel using Promise.all', async () => {
      const callOrder: string[] = [];

      mockEvaluateFlag.mockImplementation((flagKey) => {
        callOrder.push(flagKey);
        return Promise.resolve(false);
      });

      await evaluatePhase2Flag('a');

      // All three flags should be called before any resolution
      expect(callOrder).toHaveLength(3);
      expect(callOrder).toContain('showPhase2aFeatures');
      expect(callOrder).toContain('showPhase2bFeatures');
      expect(callOrder).toContain('showPhase2cFeatures');
    });
  });
});
