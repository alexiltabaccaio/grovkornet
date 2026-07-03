import React from 'react';
import { View, StyleSheet } from 'react-native';

interface AppPreviewThumbnailProps {
  backgroundColor?: string;
  footerColor?: string;
  bottomColor?: string;
  textColor?: string;
  shutterColor?: string;
  isActive?: boolean;
}

export const AppPreviewThumbnail = React.memo(({
  backgroundColor = '#222222',
  footerColor = '#111111',
  bottomColor = '#000000',
  textColor = '#FF5722',
  shutterColor = '#FFFFFF',
  isActive = false,
}: AppPreviewThumbnailProps) => {
  return (
    <View style={[styles.container, { backgroundColor }, !isActive && { opacity: 0.7 }]}>

      {/* Viewfinder Area (Background Color) */}
      <View style={styles.viewfinder}>
      </View>

      {/* Bottom Area (Color block) */}
      <View style={[styles.bottomArea, { backgroundColor: bottomColor }]}>
        {/* Gallery Preview Simulation */}
        <View style={[styles.galleryPreview, { borderColor: shutterColor }]} />

        {/* Shutter Wrapper to ensure absolute centering */}
        <View style={styles.shutterWrapper}>
          {/* Outer Ring containing the Inner Button for natural centering */}
          <View style={[styles.shutterRing, { borderColor: shutterColor }]}>
            <View style={[styles.shutterButton, { backgroundColor: shutterColor }]} />
          </View>
        </View>
      </View>

      {/* Footer Area (Control Panel) */}
      <View style={[styles.footer, { backgroundColor: footerColor }]}>
        <View style={[styles.footerItemActive, { backgroundColor: textColor }]} />
        <View style={styles.footerItemInactive} />
        <View style={styles.footerItemInactive} />
        <View style={styles.footerItemInactive} />
      </View>
    </View>
  );
});

AppPreviewThumbnail.displayName = 'AppPreviewThumbnail';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  viewfinder: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    height: '20%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  footerItemInactive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
  },
  footerItemActive: {
    width: 16,
    height: 8,
    borderRadius: 4,
  },
  bottomArea: {
    height: '35%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryPreview: {
    position: 'absolute',
    left: 12,
    top: -18,
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 0.8,
  },
  shutterWrapper: {
    position: 'absolute',
    top: -21,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  shutterRing: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButton: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
