import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { makeMutable } from 'react-native-reanimated';
import { GalleryViewer } from './GalleryViewer';
import { useGalleryViewer } from '@features/gallery';
import { useVerificationStore } from '@entities/verification';

jest.mock('@features/gallery', () => {
  const actual = jest.requireActual('@features/gallery');
  return {
    ...actual,
    useGalleryViewer: jest.fn(),
  };
});

const mockPhotos = [
  { uri: 'file:///test/1.jpg', id: '1' },
  { uri: 'file:///test/2.jpg', id: '2' },
];

describe('GalleryViewer', () => {
  const mockUseGalleryViewer = useGalleryViewer as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    useVerificationStore.setState({
      verifiedMap: {
        'file:///test/1.jpg': true,
        'file:///test/2.jpg': false,
      },
    });
  });

  it('renders loading state without spinner or text when initialUri is null', () => {
    mockUseGalleryViewer.mockReturnValue({
      photos: [],
      selectedPhoto: null,
      loading: true,
      onPhotoVisible: jest.fn(),
      onSelectPhoto: jest.fn(),
      onDeletePhoto: jest.fn(),
    });

    const { toJSON, queryByText, queryByTestId } = render(
      <GalleryViewer onClose={jest.fn()} initialUri={null} />
    );

    expect(toJSON()).toBeDefined();
    expect(queryByText('gallery.loading')).toBeNull();
    expect(queryByTestId('gallery-placeholder-image')).toBeNull();
  });

  it('renders loading state with preview image and no spinner when initialUri is provided', () => {
    mockUseGalleryViewer.mockReturnValue({
      photos: [],
      selectedPhoto: null,
      loading: true,
      onPhotoVisible: jest.fn(),
      onSelectPhoto: jest.fn(),
      onDeletePhoto: jest.fn(),
    });

    const testUri = 'file:///test/preview.jpg';
    const { toJSON, queryByText, getByTestId } = render(
      <GalleryViewer onClose={jest.fn()} initialUri={testUri} />
    );

    expect(toJSON()).toBeDefined();
    expect(queryByText('gallery.loading')).toBeNull();
    expect(getByTestId('gallery-placeholder-image')).toBeTruthy();
    expect(getByTestId('gallery-placeholder-image').props.source.uri).toBe(testUri);
  });

  it('renders content when not loading', () => {
    mockUseGalleryViewer.mockReturnValue({
      photos: mockPhotos,
      selectedPhoto: mockPhotos[0],
      loading: false,
      onPhotoVisible: jest.fn(),
      onSelectPhoto: jest.fn(),
      onDeletePhoto: jest.fn(),
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
      onDeletePhoto: jest.fn(),
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
      onDeletePhoto: jest.fn(),
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
      onDeletePhoto: jest.fn(),
    });

    const onCloseMock = jest.fn();
    const { getByLabelText } = render(
      <GalleryViewer onClose={onCloseMock} initialUri={null} galleryTransition={makeMutable(1)} />
    );

    fireEvent.press(getByLabelText('Go back'));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('renders header component when provided', () => {
    mockUseGalleryViewer.mockReturnValue({
      photos: mockPhotos,
      selectedPhoto: mockPhotos[0],
      loading: false,
      onPhotoVisible: jest.fn(),
      onSelectPhoto: jest.fn(),
      onDeletePhoto: jest.fn(),
    });

    const { getByText } = render(
      <GalleryViewer 
        onClose={jest.fn()} 
        initialUri={null} 
        header={<Text>Test Header</Text>} 
      />
    );
    expect(getByText('Test Header')).toBeTruthy();
  });

  it('renders delete button when a photo is selected', () => {
    mockUseGalleryViewer.mockReturnValue({
      photos: mockPhotos,
      selectedPhoto: mockPhotos[0],
      loading: false,
      onPhotoVisible: jest.fn(),
      onSelectPhoto: jest.fn(),
      onDeletePhoto: jest.fn(),
    });

    const { getByTestId } = render(
      <GalleryViewer onClose={jest.fn()} initialUri={null} />
    );

    expect(getByTestId('delete-photo-button')).toBeTruthy();
  });

  it('does not render delete button when no photo is selected', () => {
    mockUseGalleryViewer.mockReturnValue({
      photos: mockPhotos,
      selectedPhoto: null,
      loading: false,
      onPhotoVisible: jest.fn(),
      onSelectPhoto: jest.fn(),
      onDeletePhoto: jest.fn(),
    });

    const { queryByTestId } = render(
      <GalleryViewer onClose={jest.fn()} initialUri={null} />
    );

    expect(queryByTestId('delete-photo-button')).toBeNull();
  });
});
