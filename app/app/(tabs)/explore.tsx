import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity, Image, ActivityIndicator, TextInput, Keyboard, FlatList } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { MOCK_EVENTS, DatabaseEvent } from '../../constants/mockData';
import { useAppTheme } from '../_layout'; // <-- Wire up our global layout theme controller

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ExploreScreen() {
  // 1. Consume the master theme tokens
  const { theme, colors } = useAppTheme();
  const isDark = theme === 'dark';

  const mapRef = useRef<MapView | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<DatabaseEvent | null>(null);

  // ❤️ State Engines for Interaction Tracking
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  const [dislikedEvents, setDislikedEvents] = useState<string[]>([]);

  const STREET_LAT_DELTA = 0.06;
  const STREET_LNG_DELTA = 0.06;

  const DEFAULT_FALLBACK = {
    latitude: 22.5726,
    longitude: 88.3639,
    latitudeDelta: STREET_LAT_DELTA,
    longitudeDelta: STREET_LNG_DELTA,
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }
      let currentLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLoc);
      setLoading(false);
    })();
  }, []);

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'Gaming': return { color: '#8b5cf6', icon: 'game-controller', bg: isDark ? '#2e1065' : '#f5f3ff', text: isDark ? '#ddd6fe' : '#5b21b6' };
      case 'Food': return { color: '#f97316', icon: 'pizza', bg: isDark ? '#7c2d12' : '#fff7ed', text: isDark ? '#ffedd5' : '#9a3412' };
      case 'Tech': return { color: '#06b6d4', icon: 'code-working', bg: isDark ? '#164e63' : '#ecfeff', text: isDark ? '#cffafe' : '#083344' };
      case 'Art': return { color: '#ec4899', icon: 'color-palette', bg: isDark ? '#831843' : '#fdf2f8', text: isDark ? '#fce7f3' : '#9d174d' };
      case 'Wellness': return { color: '#10b981', icon: 'leaf', bg: isDark ? '#064e3b' : '#ecfdf5', text: isDark ? '#d1fae5' : '#065f46' };
      default: return { color: '#3b82f6', icon: 'musical-notes', bg: isDark ? '#1e3a8a' : '#eff6ff', text: isDark ? '#dbeafe' : '#1e40af' };
    }
  };

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_EVENTS;
    return MOCK_EVENTS.filter(event => 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const panToCoordinates = (latitude: number, longitude: number, isEventOffset = false) => {
    mapRef.current?.animateToRegion({
      latitude: isEventOffset ? latitude - 0.001 : latitude,
      longitude,
      latitudeDelta: STREET_LAT_DELTA,
      longitudeDelta: STREET_LNG_DELTA,
    }, 800);
  };

  const snapToCurrentLocation = async () => {
    try {
      let currentLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(currentLoc);
      panToCoordinates(currentLoc.coords.latitude, currentLoc.coords.longitude);
    } catch {
      if (location) panToCoordinates(location.coords.latitude, location.coords.longitude);
    }
  };

  const handleSelectEvent = (event: DatabaseEvent) => {
    if (dislikedEvents.includes(event.id)) return;
    Keyboard.dismiss();
    setIsSearchFocused(false);
    setSelectedEvent(event);
    panToCoordinates(event.location.latitude, event.location.longitude, true);
  };

  const handleSearchSubmit = () => {
    Keyboard.dismiss();
    setIsSearchFocused(false);
    const visibleEvents = filteredEvents.filter(ev => !dislikedEvents.includes(ev.id));
    if (visibleEvents.length > 0) {
      handleSelectEvent(visibleEvents[0]);
    }
  };

  const toggleLikeEvent = (id: string) => {
    setLikedEvents(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleDislikeEvent = (id: string) => {
    if (!dislikedEvents.includes(id)) {
      setDislikedEvents(prev => [...prev, id]);
      setLikedEvents(prev => prev.filter(item => item !== id));
      setSelectedEvent(null);
    } else {
      setDislikedEvents(prev => prev.filter(item => item !== id));
    }
  };

  if (loading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#eab308" />
        <Text style={[styles.loaderText, { color: colors.textSecondary }]}>Pinging GPS Coordinates...</Text>
      </View>
    );
  }

  const initialRegion = location ? {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: STREET_LAT_DELTA,
    longitudeDelta: STREET_LNG_DELTA,
  } : DEFAULT_FALLBACK;

  // Shared Theme Styles definitions
  const sharedCardStyle = { backgroundColor: colors.cardBg, borderColor: colors.cardBorder };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        userInterfaceStyle={theme} // <-- Native Apple/Google map elements adapt to theme!
        onPress={() => {
          setSelectedEvent(null);
          setIsSearchFocused(false);
          Keyboard.dismiss();
        }}
      >
        {filteredEvents.map((event) => {
          const catTheme = getCategoryTheme(event.category);
          const isActive = selectedEvent?.id === event.id;
          const isDisliked = dislikedEvents.includes(event.id);

          return (
            <Marker
              key={event.id}
              coordinate={{
                latitude: event.location.latitude,
                longitude: event.location.longitude,
              }}
              onPress={(e) => {
                e.stopPropagation();
                handleSelectEvent(event);
              }}
              opacity={isDisliked ? 0.25 : 1.0}
            >
              <View style={[
                styles.markerContainer,
                { backgroundColor: catTheme.color },
                isActive && [styles.markerActive, { borderColor: colors.textPrimary }]
              ]}>
                <Ionicons name={catTheme.icon as any} size={15} color="#ffffff" />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* 🔍 FLOATING SEARCH INTERFACE ENGINE */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBarWrapper, sharedCardStyle]}>
          <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search locations, events, types..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            clearButtonMode="never"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} style={styles.searchClearIcon} />
            </TouchableOpacity>
          )}
        </View>

        {/* 📋 DYNAMIC SEARCH SUGGESTION DROPDOWN LIST */}
        {isSearchFocused && searchQuery.trim().length > 0 && (
          <View style={[styles.dropdownPanel, sharedCardStyle]}>
            {filteredEvents.filter(ev => !dislikedEvents.includes(ev.id)).length === 0 ? (
              <View style={styles.noResultsBox}>
                <Text style={[styles.noResultsText, { color: colors.textMuted }]}>No events match your criteria</Text>
              </View>
            ) : (
              <FlatList
                data={filteredEvents.filter(ev => !dislikedEvents.includes(ev.id))}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: 240 }}
                renderItem={({ item }) => {
                  const catTheme = getCategoryTheme(item.category);
                  return (
                    <TouchableOpacity
                      style={[styles.dropdownRow, { borderBottomColor: colors.cardBorder }]}
                      onPress={() => handleSelectEvent(item)}
                    >
                      <View style={[styles.listIconContainer, { backgroundColor: catTheme.color }]}>
                        <Ionicons name={catTheme.icon as any} size={14} color="#ffffff" />
                      </View>
                      <View style={styles.listTextContainer}>
                        <Text style={[styles.listTitle, { color: colors.textPrimary }]} numberOfLines={1}>{item.title}</Text>
                        <Text style={[styles.listSub, { color: colors.textMuted }]} numberOfLines={1}>{item.location.address}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        )}
      </View>

      {/* 🎯 FLOATING GPS TARGET CONTROL PILL */}
      <TouchableOpacity 
        style={[
          styles.locationButton, 
          sharedCardStyle,
          { bottom: selectedEvent ? 30 : 110 }
        ]} 
        onPress={snapToCurrentLocation}
        activeOpacity={0.8}
      >
        <FontAwesome6 name="location-crosshairs" size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* 📋 CENTRALIZED FULL-SCREEN MODAL EVENT DISPLAY */}
      {selectedEvent && (() => {
        const catTheme = getCategoryTheme(selectedEvent.category);
        const isLiked = likedEvents.includes(selectedEvent.id);

        return (
          <View style={styles.modalBlurOverlay}>
            <View style={[styles.centerHeroCard, sharedCardStyle]}>
              <Image source={{ uri: selectedEvent.image_url }} style={styles.heroCardImage} />
              
              <TouchableOpacity 
                style={styles.closeCardButton} 
                onPress={() => setSelectedEvent(null)}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={34} color="#ffffff" />
              </TouchableOpacity>

              <View style={styles.heroCardContent}>
                <View style={[styles.tagContainer, { backgroundColor: catTheme.bg, borderColor: catTheme.color }]}>
                  <Text style={[styles.categoryBadgeText, { color: catTheme.text }]}>
                    ⚡ {selectedEvent.category.toUpperCase()}
                  </Text>
                </View>

                <Text style={[styles.heroCardTitle, { color: colors.textPrimary }]}>{selectedEvent.title}</Text>
                <Text style={styles.heroCardSummary}>{selectedEvent.summary}</Text>
                <Text style={[styles.heroCardDesc, { color: colors.textSecondary }]}>{selectedEvent.description}</Text>

                <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />

                <View style={styles.metaRow}>
                  <Ionicons name="navigate-circle" size={18} color={catTheme.color} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={2}>{selectedEvent.location.address}</Text>
                </View>

                <View style={[styles.metaRow, { marginTop: 8, marginBottom: 4 }]}>
                  <Ionicons name="mail" size={16} color={colors.textMuted} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>{selectedEvent.contact_email}</Text>
                </View>

                {/* ⚡ SWIPE-INSPIRED LIKE & DISLIKE INTERACTION CONTROL ROW */}
                <View style={styles.actionButtonRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.dislikeButton, isDark && { backgroundColor: '#451a1a', borderColor: '#7f1d1d' }]}
                    activeOpacity={0.7}
                    onPress={() => toggleDislikeEvent(selectedEvent.id)}
                  >
                    <Ionicons name="close-outline" size={26} color="#ef4444" />
                    <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Pass</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton, 
                      styles.likeButton,
                      isDark && { backgroundColor: '#14532d', borderColor: '#166534' },
                      isLiked && { backgroundColor: '#22c55e', borderColor: '#22c55e' }
                    ]}
                    activeOpacity={0.7}
                    onPress={() => toggleLikeEvent(selectedEvent.id)}
                  >
                    <Ionicons 
                      name={isLiked ? "heart" : "heart-outline"} 
                      size={24} 
                      color={isLiked ? "#ffffff" : "#22c55e"} 
                    />
                    <Text style={[styles.actionButtonText, { color: isLiked ? '#ffffff' : '#22c55e' }]}>
                      {isLiked ? 'Liked' : 'Like'}
                    </Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          </View>
        );
      })()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 12, fontSize: 14, fontWeight: '600' },
  
  markerContainer: {
    padding: 9,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  markerActive: {
    borderWidth: 2.5,
    transform: [{ scale: 1.3 }],
    shadowOpacity: 0.3,
  },

  searchContainer: {
    position: 'absolute',
    top: 60,
    left: '5%',
    right: '5%',
    zIndex: 1000,
  },
  searchBarWrapper: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500', height: '100%' },
  searchClearIcon: { marginLeft: 8 },

  dropdownPanel: {
    borderRadius: 16,
    marginTop: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  listIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listTextContainer: { flex: 1 },
  listTitle: { fontSize: 14, fontWeight: '700' },
  listSub: { fontSize: 11, marginTop: 1 },
  noResultsBox: { padding: 16, alignItems: 'center' },
  noResultsText: { fontSize: 13, fontWeight: '500' },

  locationButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    zIndex: 999,
  },

  modalBlurOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(24, 24, 27, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  centerHeroCard: {
    width: SCREEN_WIDTH * 0.88,
    maxHeight: SCREEN_HEIGHT * 0.80,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 15,
    borderWidth: 1,
  },
  heroCardImage: { width: '100%', height: SCREEN_HEIGHT * 0.25, backgroundColor: '#e4e4e7' },
  closeCardButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  heroCardContent: { padding: 24 },
  tagContainer: { borderWidth: 1, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 10 },
  categoryBadgeText: { fontSize: 10, fontWeight: '900' },
  heroCardTitle: { fontSize: 22, fontWeight: '900', lineHeight: 28 },
  heroCardSummary: { fontSize: 14, color: '#eab308', fontWeight: '700', marginTop: 4 },
  heroCardDesc: { fontSize: 13, marginTop: 8, lineHeight: 18 },
  dividerLine: { height: 1, marginTop: 14, marginBottom: 14 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, marginLeft: 8, fontWeight: '600', flex: 1 },

  actionButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dislikeButton: {
    borderColor: '#fee2e2',
    backgroundColor: '#ffd6d6',
  },
  likeButton: {
    borderColor: '#dcfce7',
    backgroundColor: '#b7f8cb',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});