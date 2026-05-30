import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useOAuth } from '@clerk/expo';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useWarmUpBrowser } from '../hooks/useWarmUpBrowser'; 

// Required to finalize the session once the browser redirects back
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  // 1. Call the warm-up hook!
  useWarmUpBrowser(); 
  
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const onPressLogin = React.useCallback(async () => {
    try {
      // 2. Explicitly tell Clerk to return to the app's root URL when done
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/(tabs)', { scheme: 'mela' }),
      });

      if (createdSessionId) {
        // This instantly triggers your _layout.tsx to swap screens!
        setActive!({ session: createdSessionId });
      }
    } catch (err) {
      // 3. If it fails, this will tell you exactly why in your terminal
      console.error('OAuth error:', JSON.stringify(err, null, 2));
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Mela</Text>
      
      <TouchableOpacity style={styles.button} onPress={onPressLogin} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff' // Or wire it to your theme!
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});