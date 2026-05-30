import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Aesthetic Colors
  const activeColor = '#eab308'; // Ochre Yellow
  const inactiveColor = isDark ? '#71717a' : '#a1a1aa';
  const bgColor = isDark ? '#09090b' : '#ffffff';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: bgColor,
          borderTopWidth: 0,
          height: 92, // Increased slightly to comfortably hold larger typography
          paddingBottom: Platform.OS === 'ios' ? 24 : 14,
          paddingTop: 10,
          // Premium Shadow
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 10,
        },
        // ⚙️ Enlarged Typography applied globally across tabs
        tabBarLabelStyle: {
          fontSize: 13,          // Bumped up for clear scannability
          fontWeight: '800',     // Thicker aesthetic weight matching the brand identity
          letterSpacing: -0.2,
          marginTop: 4,
        },
      }}>
      
      {/* 1. DISCOVER TAB */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "albums" : "albums-outline"} 
              size={32} // Scaled slightly down to balance larger text ratios
              color={color} 
            />
          ),
        }}
      />

      {/* 2. THE HERO EXPLORE TAB (Middle & Visible Label) */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => (
            <View style={styles.exploreContainer}>
              <View style={[
                styles.exploreCircle, 
                { 
                  backgroundColor: focused ? '#eab308' : '#18181b',
                  borderColor: isDark ? '#09090b' : '#ffffff' // Cutout background adapts dynamically to dark mode
                }
              ]}>
                <Feather 
                  name="map" 
                  size={24} 
                  color="#ffffff" 
                />
              </View>
            </View>
          ),
        }}
      />

      {/* 3. PROFILE TAB */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "person-circle" : "person-circle-outline"} 
              size={32} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  exploreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // Reduced top offset to allow the "Explore" text string room to clear directly underneath
    top: Platform.OS === 'ios' ? -10 : -12, 
    height: 60,
    width: 60,
  },
  exploreCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    // Intense shadow action
    shadowColor: '#eab308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 3.5,
  },
});