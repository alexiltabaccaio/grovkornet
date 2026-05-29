import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  filterThumb: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterPlaceholder: {
    width: 38,
    height: 38,
    backgroundColor: '#222',
    marginBottom: 6,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textVariantPlaceholder: {
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
    overflow: 'visible',
  },
  imageSource: {
    width: '100%',
    height: '100%',
    zIndex: 1,
  },

  filterText: {
    color: '#CCC',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
    minHeight: 28,
  },
  filterTextActive: {
    color: '#FFF',
  },
  valueText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    zIndex: 1,
    padding: 0,
    margin: 0,
  },
  valueTextLarge: {
    fontSize: 18,
    width: 60,
  },
  pillButton: {
    height: 32,
    borderRadius: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    minWidth: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: '#FFF',
  },
  pillButtonInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: '#333',
  },
  pillValueText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    padding: 0,
    margin: 0,
    letterSpacing: 0.5,
  },
  presetContainer: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  presetContainerActive: {
    // any styles for the active container
  },
  presetImageContainer: {
    width: 80,
    height: 60,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#000',
    overflow: 'hidden',
    marginBottom: 6,
  },
  presetImageContainerActive: {
    borderColor: '#FF9500',
  },
  presetImage: {
    width: '100%',
    height: '100%',
  },
  presetLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
    width: '100%',
  },
  presetLabelActive: {
    color: '#FF9500',
    fontWeight: '900',
  },
});
