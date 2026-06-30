import React from 'react';
import { render } from '@testing-library/react-native';
import { GenericParameterModule } from './GenericParameterModule';
import { Text } from 'react-native';

describe('GenericParameterModule', () => {
  const mockSetActiveParameter = jest.fn();
  const mockRenderItem = jest.fn((id, label) => (
    <Text testID={`mock-param-${id}`} accessibilityLabel={label}>
      {id}
    </Text>
  ));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders null when parameter list is empty', () => {
    const { toJSON } = render(
      <GenericParameterModule
        parameters={[]}
        activeParameter="none"
        setActiveParameter={mockSetActiveParameter}
        renderItem={mockRenderItem}
      />
    );
    expect(toJSON()).toBeNull();
  });

  it('renders parameters correctly', () => {
    const parameters = ['exposure', 'iso'];
    const { getAllByTestId } = render(
      <GenericParameterModule
        parameters={parameters}
        activeParameter="exposure"
        setActiveParameter={mockSetActiveParameter}
        renderItem={mockRenderItem}
      />
    );

    expect(getAllByTestId('mock-param-exposure').length).toBeGreaterThan(0);
    expect(getAllByTestId('mock-param-iso').length).toBeGreaterThan(0);
  });

  it('filters out invisible parameters', () => {
    const parameters = [
      { id: 'exposure', visible: true },
      { id: 'iso', visible: false },
    ];
    const { getAllByTestId, queryAllByTestId } = render(
      <GenericParameterModule
        parameters={parameters}
        activeParameter="exposure"
        setActiveParameter={mockSetActiveParameter}
        renderItem={mockRenderItem}
      />
    );

    expect(getAllByTestId('mock-param-exposure').length).toBeGreaterThan(0);
    expect(queryAllByTestId('mock-param-iso').length).toBe(0);
  });

  it('auto-selects the first parameter if activeParameter is invalid', () => {
    const parameters = ['exposure', 'iso'];

    render(
      <GenericParameterModule
        parameters={parameters}
        activeParameter="invalid-parameter"
        setActiveParameter={mockSetActiveParameter}
        renderItem={mockRenderItem}
      />
    );

    expect(mockSetActiveParameter).toHaveBeenCalledWith('exposure');
  });

  it('does not auto-select the first parameter if activeParameter is already valid', () => {
    const parameters = ['exposure', 'iso'];

    render(
      <GenericParameterModule
        parameters={parameters}
        activeParameter="iso"
        setActiveParameter={mockSetActiveParameter}
        renderItem={mockRenderItem}
      />
    );

    expect(mockSetActiveParameter).not.toHaveBeenCalled();
  });

  it('uses custom label key if specified in parameter config', () => {
    const parameters = [
      { id: 'exposure', labelKey: 'custom.exposure.label' }
    ];

    render(
      <GenericParameterModule
        parameters={parameters}
        activeParameter="exposure"
        setActiveParameter={mockSetActiveParameter}
        renderItem={mockRenderItem}
      />
    );

    expect(mockRenderItem).toHaveBeenCalledWith('exposure', 'custom.exposure.label');
  });
});
