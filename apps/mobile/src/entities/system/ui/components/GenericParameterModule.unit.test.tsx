import React from 'react';
import { render } from '@testing-library/react-native';
import { GenericParameterModule } from './GenericParameterModule';

// Mock the system store
const mockSetActiveParameter = jest.fn();
let mockCurrentActiveParameter = 'none';

jest.mock('../../model/useSystemStore', () => ({
  useSystemStore: jest.fn((fn?: (state: any) => unknown) => {
    const state = {
      activeParameter: mockCurrentActiveParameter,
      setActiveParameter: mockSetActiveParameter,
    };
    return fn ? fn(state) : state;
  }),
}));

// Mock ConnectedParameter to easily find it in rendered output
jest.mock('./ConnectedParameter', () => {
  const { Text } = require('react-native');
  return {
    ConnectedParameter: (props: any) => (
      <Text testID={`mock-param-${props.id}`} accessibilityLabel={props.label}>
        {props.id}
      </Text>
    ),
  };
});

describe('GenericParameterModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentActiveParameter = 'none';
  });

  it('renders null when parameter list is empty', () => {
    const { toJSON } = render(
      <GenericParameterModule parameters={[]} />
    );
    expect(toJSON()).toBeNull();
  });

  it('renders parameters correctly', () => {
    const parameters = ['exposure', 'iso'] as any;
    const { getAllByTestId } = render(
      <GenericParameterModule parameters={parameters} />
    );

    expect(getAllByTestId('mock-param-exposure').length).toBeGreaterThan(0);
    expect(getAllByTestId('mock-param-iso').length).toBeGreaterThan(0);
  });

  it('filters out invisible parameters', () => {
    const parameters = [
      { id: 'exposure', visible: true },
      { id: 'iso', visible: false },
    ] as any;
    const { getAllByTestId, queryAllByTestId } = render(
      <GenericParameterModule parameters={parameters} />
    );

    expect(getAllByTestId('mock-param-exposure').length).toBeGreaterThan(0);
    expect(queryAllByTestId('mock-param-iso').length).toBe(0);
  });

  it('auto-selects the first parameter if activeParameter is invalid', () => {
    mockCurrentActiveParameter = 'invalid-parameter';
    const parameters = ['exposure', 'iso'] as any;

    render(<GenericParameterModule parameters={parameters} />);

    expect(mockSetActiveParameter).toHaveBeenCalledWith('exposure');
  });

  it('does not auto-select the first parameter if activeParameter is already valid', () => {
    mockCurrentActiveParameter = 'iso';
    const parameters = ['exposure', 'iso'] as any;

    render(<GenericParameterModule parameters={parameters} />);

    expect(mockSetActiveParameter).not.toHaveBeenCalled();
  });

  it('uses custom label key if specified in parameter config', () => {
    const parameters = [
      { id: 'exposure', labelKey: 'custom.exposure.label' }
    ] as any;

    const { getAllByTestId } = render(
      <GenericParameterModule parameters={parameters} />
    );

    const params = getAllByTestId('mock-param-exposure');
    expect(params[0].props.accessibilityLabel).toBe('custom.exposure.label');
  });
});
