import { logger } from './logger';

describe('Logger Utility', () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock values to prevent cluttering test output
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
    // Restore default logger state
    logger.setDebugEnabled(__DEV__);
  });

  describe('when debug is enabled', () => {
    beforeEach(() => {
      logger.setDebugEnabled(true);
    });

    it('should log debug messages', () => {
      logger.debug('ComponentA', 'My debug message');
      expect(logSpy).toHaveBeenCalled();
      expect(logSpy.mock.calls[0][0]).toContain('[DEBUG] [ComponentA] My debug message');
    });

    it('should log info messages', () => {
      logger.info('ComponentB', 'My info message');
      expect(logSpy).toHaveBeenCalled();
      expect(logSpy.mock.calls[0][0]).toContain('[INFO] [ComponentB] My info message');
    });

    it('should log warning messages', () => {
      logger.warn('ComponentC', 'My warning');
      expect(warnSpy).toHaveBeenCalled();
      expect(warnSpy.mock.calls[0][0]).toContain('[WARN] [ComponentC] My warning');
    });
  });

  describe('when debug is disabled', () => {
    beforeEach(() => {
      logger.setDebugEnabled(false);
    });

    it('should NOT log debug, info or warn messages', () => {
      logger.debug('ComponentA', 'Silent debug');
      logger.info('ComponentB', 'Silent info');
      logger.warn('ComponentC', 'Silent warning');

      expect(logSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('should STILL log error messages', () => {
      logger.error('ComponentD', 'Critical error');
      expect(errorSpy).toHaveBeenCalled();
      expect(errorSpy.mock.calls[0][0]).toContain('[ERROR] [ComponentD] Critical error');
    });
  });
});
