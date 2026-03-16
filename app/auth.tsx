import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import Colors from '@/constants/colors';

// This screen handles the OAuth redirect for Android Chrome Custom Tabs.
// When klexi://auth?code=... is received, this component must render and call
// maybeCompleteAuthSession() to close the Custom Tab and return control to
// the openAuthSessionAsync promise in auth.ts.
WebBrowser.maybeCompleteAuthSession();

export default function AuthCallbackScreen() {
  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0A0F',
  },
});
