import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { DeviceHealthWarningBanner } from './DeviceHealthWarningBanner';
import { useSystemStore } from '@entities/system';
import { usePreferencesStore } from '@entities/preferences';

describe('DeviceHealthWarningBanner', () => {
  beforeEach(() => {
    // Reset stores to default safe state
    useSystemStore.setState({ thermalState: 'normal' });
    usePreferencesStore.setState({ fpsSetting: 60 });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders nothing when thermalState is normal', () => {
    const { queryByTestId } = render(<DeviceHealthWarningBanner />);
    expect(queryByTestId('device-health-warning-circle')).toBeNull();
    expect(queryByTestId('device-health-warning-banner')).toBeNull();
  });

  it('renders warning circle but not text warning initially, then toggles when clicked', () => {
    useSystemStore.setState({ thermalState: 'warning' });
    usePreferencesStore.setState({ fpsSetting: 60 });

    const { getByTestId, queryByTestId, queryByText } = render(<DeviceHealthWarningBanner />);
    
    // Circle should be visible, but not the text banner
    const circle = getByTestId('device-health-warning-circle');
    expect(circle).toBeTruthy();
    expect(queryByTestId('device-health-warning-banner')).toBeNull();
    expect(queryByText('device_health.warning')).toBeNull();

    // Tap circle to show text warning
    fireEvent.press(circle);
    expect(getByTestId('device-health-warning-banner')).toBeTruthy();
    expect(queryByText('device_health.warning')).toBeTruthy();

    // Tap circle again to hide text warning
    fireEvent.press(circle);
    expect(queryByTestId('device-health-warning-banner')).toBeNull();
  });

  it('renders critical circle and toggles showing critical text warning', () => {
    useSystemStore.setState({ thermalState: 'critical' });
    usePreferencesStore.setState({ fpsSetting: 30 });

    const { getByTestId, queryByTestId, queryByText } = render(<DeviceHealthWarningBanner />);
    const circle = getByTestId('device-health-warning-circle');
    expect(circle).toBeTruthy();

    // Tap circle to show text warning
    fireEvent.press(circle);
    expect(getByTestId('device-health-warning-banner')).toBeTruthy();
    expect(queryByText('device_health.critical')).toBeTruthy();

    // Tap the warning text button to hide it
    const textBtn = getByTestId('device-health-warning-text-button');
    fireEvent.press(textBtn);
    expect(queryByTestId('device-health-warning-banner')).toBeNull();
  });

  it('hides text warning automatically after 5 seconds', () => {
    useSystemStore.setState({ thermalState: 'warning' });
    usePreferencesStore.setState({ fpsSetting: 60 });

    const { getByTestId, queryByTestId } = render(<DeviceHealthWarningBanner />);
    const circle = getByTestId('device-health-warning-circle');

    // Tap circle to show
    fireEvent.press(circle);
    expect(getByTestId('device-health-warning-banner')).toBeTruthy();

    // Advance time by 4.9 seconds - should still be visible
    act(() => {
      jest.advanceTimersByTime(4900);
    });
    expect(queryByTestId('device-health-warning-banner')).toBeTruthy();

    // Advance time past 5 seconds total - should disappear
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(queryByTestId('device-health-warning-banner')).toBeNull();
  });

  it('hides warning circle when preferred FPS is equal to or lower than the warning threshold (30 FPS)', () => {
    useSystemStore.setState({ thermalState: 'warning' });
    usePreferencesStore.setState({ fpsSetting: 30 });

    const { queryByTestId } = render(<DeviceHealthWarningBanner />);
    expect(queryByTestId('device-health-warning-circle')).toBeNull();
  });

  it('hides critical circle if preferred FPS is lower than safety limit (e.g. 15 FPS option)', () => {
    useSystemStore.setState({ thermalState: 'critical' });
    usePreferencesStore.setState({ fpsSetting: 15 });

    const { queryByTestId } = render(<DeviceHealthWarningBanner />);
    expect(queryByTestId('device-health-warning-circle')).toBeNull();
  });

  it('automatically closes open warning text if the warning conditions become false', () => {
    useSystemStore.setState({ thermalState: 'warning' });
    usePreferencesStore.setState({ fpsSetting: 60 });

    const { getByTestId, queryByTestId, rerender } = render(<DeviceHealthWarningBanner />);
    const circle = getByTestId('device-health-warning-circle');
    
    // Tap to show
    fireEvent.press(circle);
    expect(getByTestId('device-health-warning-banner')).toBeTruthy();

    // Rerender after thermalState goes to normal
    act(() => {
      useSystemStore.setState({ thermalState: 'normal' });
    });
    rerender(<DeviceHealthWarningBanner />);

    expect(queryByTestId('device-health-warning-circle')).toBeNull();
    expect(queryByTestId('device-health-warning-banner')).toBeNull();
  });
});

