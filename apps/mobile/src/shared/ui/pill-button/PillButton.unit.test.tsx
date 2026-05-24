import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PillButton } from './PillButton';

describe('PillButton Unit Tests', () => {
  it('renders label correctly', () => {
    const { getByText } = render(
      <PillButton label="Test Label" isActive={false} onPress={() => {}} />
    );
    expect(getByText('Test Label')).toBeDefined();
  });

  it('triggers onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <PillButton label="Press Me" isActive={false} onPress={onPressMock} />
    );
    fireEvent.press(getByText('Press Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('renders correct variant without crashing', () => {
    const { getByText } = render(
      <>
        <PillButton label="Default" isActive={true} onPress={() => {}} variant="default" />
        <PillButton label="Auto" isActive={true} onPress={() => {}} variant="auto" />
        <PillButton label="Module" isActive={true} onPress={() => {}} variant="module" />
      </>
    );
    expect(getByText('Default')).toBeDefined();
    expect(getByText('Auto')).toBeDefined();
    expect(getByText('Module')).toBeDefined();
  });

  it('handles shared value for isActive', () => {
    const isActiveShared = { value: true } as any;
    const { getByText } = render(
      <PillButton label="Shared" isActive={isActiveShared} onPress={() => {}} />
    );
    expect(getByText('Shared')).toBeDefined();
  });

  it('handles shared value for opacity', () => {
    const opacityShared = { value: 0.8 } as any;
    const { getByText } = render(
      <PillButton label="SharedOpacity" isActive={false} opacity={opacityShared} onPress={() => {}} />
    );
    expect(getByText('SharedOpacity')).toBeDefined();
  });

  describe('getColors branching (including debug and variants)', () => {
    it('handles isDebugEnabled = true and variant = module', () => {
      const { getByText } = render(
        <>
          <PillButton label="DebugModuleActive" isActive={true} isDebugEnabled={true} variant="module" onPress={() => {}} />
          <PillButton label="DebugModuleInactive" isActive={false} isDebugEnabled={true} variant="module" onPress={() => {}} />
        </>
      );
      expect(getByText('DebugModuleActive')).toBeDefined();
      expect(getByText('DebugModuleInactive')).toBeDefined();
    });

    it('handles isDebugEnabled = true and other variants', () => {
      const { getByText } = render(
        <>
          <PillButton label="DebugDefaultActive" isActive={true} isDebugEnabled={true} variant="default" onPress={() => {}} />
          <PillButton label="DebugDefaultInactive" isActive={false} isDebugEnabled={true} variant="default" onPress={() => {}} />
        </>
      );
      expect(getByText('DebugDefaultActive')).toBeDefined();
      expect(getByText('DebugDefaultInactive')).toBeDefined();
    });

    it('handles isDebugEnabled = false and inactive variants', () => {
      const { getByText } = render(
        <>
          <PillButton label="DefaultInactive" isActive={false} variant="default" onPress={() => {}} />
          <PillButton label="ModuleInactive" isActive={false} variant="module" onPress={() => {}} />
          <PillButton label="AutoInactive" isActive={false} variant="auto" onPress={() => {}} />
        </>
      );
      expect(getByText('DefaultInactive')).toBeDefined();
      expect(getByText('ModuleInactive')).toBeDefined();
      expect(getByText('AutoInactive')).toBeDefined();
    });
  });

  describe('arePropsEqual (compare function)', () => {
    const compare = (PillButton as any).compare;
    const defaultProps = {
      label: 'Button',
      isActive: false,
      onPress: () => {},
      variant: 'default' as const,
      isDebugEnabled: false,
      opacity: 1,
      style: { margin: 10 },
      textStyle: { color: 'red' },
    };

    it('returns true when all props are equal', () => {
      const result = compare(defaultProps, { ...defaultProps });
      expect(result).toBe(true);
    });

    it('returns false when label differs', () => {
      const result = compare(defaultProps, { ...defaultProps, label: 'Different' });
      expect(result).toBe(false);
    });

    it('returns false when variant differs', () => {
      const result = compare(defaultProps, { ...defaultProps, variant: 'module' });
      expect(result).toBe(false);
    });

    it('returns false when isDebugEnabled differs', () => {
      const result = compare(defaultProps, { ...defaultProps, isDebugEnabled: true });
      expect(result).toBe(false);
    });

    it('returns false when style differs', () => {
      const result = compare(defaultProps, { ...defaultProps, style: { margin: 20 } });
      expect(result).toBe(false);
    });

    it('returns false when textStyle differs', () => {
      const result = compare(defaultProps, { ...defaultProps, textStyle: { color: 'blue' } });
      expect(result).toBe(false);
    });

    describe('isActive prop comparison', () => {
      it('returns false when isActive boolean value differs', () => {
        const result = compare(defaultProps, { ...defaultProps, isActive: true });
        expect(result).toBe(false);
      });

      it('returns true when isActive shared value values are the same', () => {
        const prev = { ...defaultProps, isActive: { value: true } as any };
        const next = { ...defaultProps, isActive: { value: true } as any };
        const result = compare(prev, next);
        expect(result).toBe(true);
      });

      it('returns false when isActive shared value values differ', () => {
        const prev = { ...defaultProps, isActive: { value: true } as any };
        const next = { ...defaultProps, isActive: { value: false } as any };
        const result = compare(prev, next);
        expect(result).toBe(false);
      });

      it('returns true when compared between boolean and shared value with same underlying value', () => {
        const prev = { ...defaultProps, isActive: true };
        const next = { ...defaultProps, isActive: { value: true } as any };
        const result = compare(prev, next);
        expect(result).toBe(true);
      });
    });

    describe('opacity prop comparison', () => {
      it('returns false when opacity differs', () => {
        const result = compare(defaultProps, { ...defaultProps, opacity: 0.5 });
        expect(result).toBe(false);
      });

      it('returns true when opacity shared value values are the same', () => {
        const prev = { ...defaultProps, opacity: { value: 0.8 } as any };
        const next = { ...defaultProps, opacity: { value: 0.8 } as any };
        const result = compare(prev, next);
        expect(result).toBe(true);
      });

      it('returns false when opacity shared value values differ', () => {
        const prev = { ...defaultProps, opacity: { value: 0.8 } as any };
        const next = { ...defaultProps, opacity: { value: 0.5 } as any };
        const result = compare(prev, next);
        expect(result).toBe(false);
      });

      it('returns true when compared between number and shared value with same underlying value', () => {
        const prev = { ...defaultProps, opacity: 0.8 };
        const next = { ...defaultProps, opacity: { value: 0.8 } as any };
        const result = compare(prev, next);
        expect(result).toBe(true);
      });
    });
  });
});
