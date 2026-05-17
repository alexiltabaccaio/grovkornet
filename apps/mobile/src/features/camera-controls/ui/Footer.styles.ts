import { StyleSheet } from 'react-native';

export const footerStyles = StyleSheet.create({
  tabContentWrapper: {
    height: 65,
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    position: 'absolute',
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
