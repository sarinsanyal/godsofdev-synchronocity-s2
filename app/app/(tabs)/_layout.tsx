import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Aesthetic Colors
  const activeColor = '#eab308'; // That Bumble/Ochre Yellow
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
          height: 88,
          paddingBottom: Platform.OS === 'ios' ? 30 : 15,
          paddingTop: 10,
          // Premium Shadow
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 5,
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
              size={24} 
              color={color} 
            />
          ),
        }}
      />

      {/* 2. THE HERO EXPLORE TAB (Middle & Emphasized) */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => (
            <View style={styles.exploreContainer}>
              <View style={[
                styles.exploreCircle, 
                { backgroundColor: focused ? '#eab308' : '#18181b' }
              ]}>
                <Feather 
                  name="map" 
                  size={26} 
                  color={focused ? '#ffffff' : '#ffffff'} 
                />
              </View>
            </View>
          ),
          // We hide the label for the hero button to keep the UI "Clean"
          tabBarLabel: () => null,
        }}
      />

      {/* 3. PROFILE & INVENTORY TAB */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "person-circle" : "person-circle-outline"} 
              size={28} 
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
    // This pushes the icon up out of the bar
    top: Platform.OS === 'ios' ? -15 : -18, 
    height: 70,
    width: 70,
  },
  exploreCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    // Intense shadow for the main action button
    shadowColor: '#eab308',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#ffffff', // Creates a "cutout" look against the bar
  },
});