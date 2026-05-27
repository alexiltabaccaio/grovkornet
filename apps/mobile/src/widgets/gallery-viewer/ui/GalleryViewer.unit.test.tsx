import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { makeMutable } from 'react-native-reanimated';
import { GalleryViewer } from './GalleryViewer';
import { useGalleryViewer } from '@features/gallery';

jest.mock('@features/gallery', () => {
  const actual = jest.requireActual('@features/gallery');
  return {
    ...actual,
    useGalleryViewer: jest.fn(),
  };
});

const mockPhotos = [
  { uri: 'file:///test/1.jpg', id: '1', isVerified: true },
  { uri: 'file:///test/2.jpg', id: '2', isVerified: false },
];

describe('GalleryViewer', () => {
  const mockUseGalleryViewer = useGalleryViewer as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    mockUseGalleryViewer.mockReturnValue({
      photos: [],
      selectedPhoto: null,
      loading: true,
      onPhotoVisible: jest.fn(),
      onSelectPhoto: jest.fn(),
    });

    const { toJSON, getByText } = render(
      <GalleryViewer onClose={jest.fn()} initialUri={null} />
    );

    expect(toJSON()).toBeDefined();
    expect(getByText('gallery.loading')).toBeTruthy();
  });

  it('renders content when not loading', () => {
    mockUseGalleryViewer.mockReturnValue({
      photos: mockPhotos,
      selectedPhoto: mockPhotos[0],
      loading: false,
      onPhotoVisible: jest.fn(),
      onSelectPhoto: jest.fn(),
    });

    const { toJSON, queryByText } = render(
      <GalleryViewer onClose={jest.fn()} initialUri={null} />
    );

    expect(toJSON()).toBeDefined();
    expect(queryByText('gallery.loading')).toBeNull();
  });

  it('renders share button when a photo is selected', () => {
    mockUseGalleryViewer.mockReturnValue({
      photos: mockPhotos,
      selectedPhoto: mockPhotos[0],
      loading: false,
      onPhotoVisible: jest.fn(),
      onSelectPhoto: jest.fn(),
    });

    const { getByLabelText } = render(
      <GalleryViewer onClose={jest.fn()} initialUri={null} />
    );

    expect(getByLabelText('gallery.share_instagram')).toBeTruthy();
  });

  it('does not render share button when no photo is selected', () => {
    mockUseGalleryViewer.mockReturnValue({
      photos: mockPhotos,
      selectedPhoto: null,
      loading: false,
      onPhotoVisible: jest.fn(),
      onSelectPhoto: jest.fn(),
    });

    const { queryByText } = render(
      <GalleryViewer onClose={jest.fn()} initialUri={null} />
    );

    expect(queryByText('gallery.share_instagram')).toBeNull();
  });

  it('calls onClose when back button in strip is pressed', () => {
    mockUseGalleryViewer.mockReturnValue({
      photos: mockPhotos,
      selectedPhoto: mockPhotos[0],
      loading: false,
      onPhotoVisible: jest.fn(),
      onSelectPhoto: jest.fn(),
    });

    const onCloseMock = jest.fn();
    const { getByLabelText } = render(
      <GalleryViewer onClose={onCloseMock} initialUri={null} galleryTransition={makeMutable(1)} />
    );

    fireEvent.press(getByLabelText('Go back'));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
