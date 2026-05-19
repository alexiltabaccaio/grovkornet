import { StyleSheet } from 'react-native';

export const footerStyles = StyleSheet.create({
  tabContentWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 82,
    justifyContent: 'center',
  },
  tabContent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageToolsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 25,
  },
  infoText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
});
