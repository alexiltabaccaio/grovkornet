import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ShareButton } from './ShareButton';
import Share from 'react-native-share';
import { Alert } from 'react-native';

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Alert.alert = jest.fn();
  return RN;
});

describe('ShareButton', () => {
  const mockUri = 'file:///test/verified_photo.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows an alert and does not share when photo is not verified', () => {
    const { getByLabelText } = render(<ShareButton uri={mockUri} isVerified={false} />);
    const button = getByLabelText('gallery.unverified_badge');

    fireEvent.press(button);

    expect(Alert.alert).toHaveBeenCalledWith(
      'gallery.unverified_title',
      'gallery.unverified_message'
    );
    expect(Share.shareSingle).not.toHaveBeenCalled();
    expect(Share.open).not.toHaveBeenCalled();
  });

  it('shares directly to Instagram Stories when photo is verified', async () => {
    const { getByLabelText } = render(<ShareButton uri={mockUri} isVerified={true} />);
    const button = getByLabelText('gallery.share_instagram');

    fireEvent.press(button);

    await waitFor(() => {
      expect(Share.shareSingle).toHaveBeenCalledWith(
        expect.objectContaining({
          social: 'instagramstories',
          backgroundImage: mockUri,
        })
      );
    });
    expect(Share.open).not.toHaveBeenCalled();
  });

  it('falls back to standard Share.open if Share.shareSingle fails', async () => {
    (Share.shareSingle as jest.Mock).mockRejectedValueOnce(new Error('Instagram not installed'));

    const { getByLabelText } = render(<ShareButton uri={mockUri} isVerified={true} />);
    const button = getByLabelText('gallery.share_instagram');

    fireEvent.press(button);

    await waitFor(() => {
      expect(Share.shareSingle).toHaveBeenCalled();
      expect(Share.open).toHaveBeenCalledWith(
        expect.objectContaining({
          url: mockUri,
          title: 'gallery.share_title',
        })
      );
    });
  });

  it('catches and logs errors gracefully if both Share.shareSingle and Share.open fail', async () => {
    (Share.shareSingle as jest.Mock).mockRejectedValueOnce(new Error('IG error'));
    (Share.open as jest.Mock).mockRejectedValueOnce(new Error('Open error'));

    const { getByLabelText } = render(<ShareButton uri={mockUri} isVerified={true} />);
    const button = getByLabelText('gallery.share_instagram');

    // Should not throw or crash the app
    fireEvent.press(button);

    await waitFor(() => {
      expect(Share.shareSingle).toHaveBeenCalled();
      expect(Share.open).toHaveBeenCalled();
    });
  });
});
