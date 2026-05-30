import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useOAuth } from '@clerk/expo';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useWarmUpBrowser } from '../hooks/useWarmUpBrowser'; 
import { useAppTheme } from './_layout'; // Your layout theme hook

// Required to finalize the session once the web browser redirects back
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { theme, colors, toggleTheme } = useAppTheme();
  
  // 1. Warm-up browser hook for slicker OAuth performance on Android
  useWarmUpBrowser(); 
  
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const onPressLogin = React.useCallback(async () => {
    try {
      // 2. Explicitly tell Clerk to return to the app's root URL when done
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/(tabs)', { scheme: 'mela' }),
      });

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      }
    } catch (err) {
      console.error('OAuth error:', JSON.stringify(err, null, 2));
    }
  }, [startOAuthFlow]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* HEADER SECTION - Shared structure from your feed screen */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>MELA</Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Your Culture Hub</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.toggleButton, { backgroundColor: theme === 'light' ? '#fef08a' : '#451a03' }]}
          onPress={toggleTheme} 
        >
          <Ionicons 
            name={theme === 'light' ? "moon" : "sunny"} 
            size={22} 
            color="#eab308" 
          />
        </TouchableOpacity>
      </View>

      {/* FULL-BLEED CONTENT HERO */}
      <View style={styles.contentContainer}>
        
        {/* TEXT GROUP - Shifts things up by using paddingTop instead of centering */}
        <View style={styles.textGroup}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.categoryBg }]}>
            <Text style={[styles.categoryText, { color: colors.categoryText }]}>✨ LIVE EXPERIENCES</Text>
          </View>

          <Text style={[styles.welcomeTitle, { color: colors.textPrimary }]}>
            Discover What&apos;s Live Next
          </Text>
          
          <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
            Join Mela to swipe through local festivals, pop-up events, hidden concerts, and experiences happening right around you.
          </Text>
        </View>

        {/* BRIGHT CTA BUTTON - Elevated slightly along with the layout shift */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[
              styles.googleButton, 
              { 
                backgroundColor: theme === 'light' ? '#fffdf0' : '#252211', 
                borderColor: theme === 'light' ? '#fef08a' : '#715c00' 
              }
            ]} 
            onPress={onPressLogin} 
            activeOpacity={0.8}
          >
            <Ionicons name="logo-google" size={22} color="#eab308" style={styles.buttonIcon} />
            <Text style={styles.googleButtonText}>SIGN IN WITH GOOGLE</Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* BOTTOM FOOTER BRANDING */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          By signing in you agree to our Terms of Service
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingTop: 40, 
    paddingBottom: 16 
  },
  headerSub: { 
    fontSize: 30, 
    fontWeight: '900', 
    color: '#eab308', 
    letterSpacing: 1, 
    textTransform: 'uppercase' 
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: '900', 
    letterSpacing: -0.5, 
    marginTop: 1 
  },
  toggleButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  contentContainer: { 
    flex: 1, 
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 60 // Decreased from 100 to pull the Google button upward
  },
  textGroup: {
    paddingTop: '15%', // Replaces flex-centering to pin text closer to the upper-third of the screen
  },
  categoryBadge: { 
    alignSelf: 'flex-start', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 8, 
    marginBottom: 16 
  },
  categoryText: { 
    fontSize: 11, 
    fontWeight: '900',
    letterSpacing: 0.5
  },
  welcomeTitle: { 
    fontSize: 36, 
    fontWeight: '900', 
    lineHeight: 44,
    letterSpacing: -1,
    marginBottom: 16
  },
  subtitleText: { 
    fontSize: 16, 
    lineHeight: 24,
    fontWeight: '500',
  },
  actionContainer: {
    width: '100%',
    marginTop: 0, // Keeps a structural gap between text and button while everything shifts up
    marginBottom: 100
  },
  googleButton: { 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center', 
    height: 64,
    borderRadius: 32, 
    borderWidth: 1.5,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 10, 
    elevation: 3, 
    width: '100%',
  },
  buttonIcon: {
    marginRight: 12
  },
  googleButtonText: { 
    color: '#eab308', 
    fontSize: 15, 
    fontWeight: '900',
    letterSpacing: 1
  },
  footer: {
    paddingBottom: 100,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500'
  }
});