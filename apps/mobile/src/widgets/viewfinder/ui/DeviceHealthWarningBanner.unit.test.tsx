import React from 'react';
import { render } from '@testing-library/react-native';
import { DeviceHealthWarningBanner } from './DeviceHealthWarningBanner';
import { useSystemStore } from '@entities/system';
import { usePreferencesStore } from '@entities/preferences';

describe('DeviceHealthWarningBanner', () => {
  beforeEach(() => {
    // Reset stores to default safe state
    useSystemStore.setState({ thermalState: 'normal' });
    usePreferencesStore.setState({ fpsSetting: 60 });
  });

  it('renders nothing when thermalState is normal', () => {
    const { queryByTestId } = render(<DeviceHealthWarningBanner />);
    expect(queryByTestId('device-health-warning-banner')).toBeNull();
  });

  it('renders warning when thermalState is warning and user preferred FPS is 60', () => {
    useSystemStore.setState({ thermalState: 'warning' });
    usePreferencesStore.setState({ fpsSetting: 60 });

    const { getByTestId, getByText } = render(<DeviceHealthWarningBanner />);
    expect(getByTestId('device-health-warning-banner')).toBeTruthy();
    expect(getByText('device_health.warning')).toBeTruthy();
  });

  it('renders critical when thermalState is critical and user preferred FPS is 60 or 30', () => {
    useSystemStore.setState({ thermalState: 'critical' });
    usePreferencesStore.setState({ fpsSetting: 30 });

    const { getByTestId, getByText } = render(<DeviceHealthWarningBanner />);
    expect(getByTestId('device-health-warning-banner')).toBeTruthy();
    expect(getByText('device_health.critical')).toBeTruthy();
  });

  it('hides warning when preferred FPS is equal to or lower than the warning threshold (30 FPS)', () => {
    useSystemStore.setState({ thermalState: 'warning' });
    usePreferencesStore.setState({ fpsSetting: 30 });

    const { queryByTestId } = render(<DeviceHealthWarningBanner />);
    expect(queryByTestId('device-health-warning-banner')).toBeNull();
  });

  it('hides critical alert if preferred FPS is lower than safety limit (e.g. 15 FPS option, if one existed, but 30 is still higher)', () => {
    // For completeness, verify critical is hidden if preferredFps <= 15
    useSystemStore.setState({ thermalState: 'critical' });
    usePreferencesStore.setState({ fpsSetting: 15 });

    const { queryByTestId } = render(<DeviceHealthWarningBanner />);
    expect(queryByTestId('device-health-warning-banner')).toBeNull();
  });
});
