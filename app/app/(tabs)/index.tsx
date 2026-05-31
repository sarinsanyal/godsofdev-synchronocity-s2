import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, Dimensions, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '../_layout'; 
import { useAuth } from '@clerk/expo'; 

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.45;

interface DatabaseEvent {
  id: string;
  title: string;
  description?: string;
  summary?: string;
  category?: string;
  image_url?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  contact_email?: string;
  contact_phone?: string;
}

export default function DiscoverScreen() {
  const { theme, colors, toggleTheme } = useAppTheme();
  const isDark = theme === 'dark';
  
  const { getToken } = useAuth(); 

  const [events, setEvents] = useState<DatabaseEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [rsvpedEvents, setRsvpedEvents] = useState<string[]>([]);
  
  const [selectedEvent, setSelectedEvent] = useState<DatabaseEvent | null>(null);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
        const response = await fetch(`${BASE_URL}/api/events`); 
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUserRegistrations = async () => {
      try {
        const token = await getToken();
        const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
        const response = await fetch(`${BASE_URL}/api/events/rsvp`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setRsvpedEvents(data.map((ev: DatabaseEvent) => ev.id));
        }
      } catch (err) {
        console.error("Error fetching registrations:", err);
      }
    };

    fetchEvents();
    fetchUserRegistrations();
  }, []);

  const handleRegisterEvent = async (id: string) => {
    if (rsvpedEvents.includes(id)) {
      Alert.alert("Notice", "You are already registered for this event.");
      return;
    }

    setRsvpedEvents(prev => [...prev, id]);

    try {
      const token = await getToken();
      const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
      const response = await fetch(`${BASE_URL}/api/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ eventId: id })
      });

      if (!response.ok) throw new Error('Registration failed.');
      Alert.alert("Success! 🎉", "Your ticket has been confirmed!");
    } catch (err) {
      console.error("RSVP Action Crash:", err);
      setRsvpedEvents(prev => prev.filter(item => item !== id));
      Alert.alert("Action Failed", "Could not process your registration. Try again later.");
    }
  };

  const recordInteraction = async (eventId: string, interactionType: 'like' | 'rejected') => {
    try {
      const token = await getToken();
      const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
      
      const response = await fetch(`${BASE_URL}/api/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ eventId, interactionType })
      });
      
      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Backend rejected the interaction:', data);
        return; 
      }
      
      console.log(`✅ Interaction verified and saved in DB: ${interactionType} for event ${eventId}`);
    } catch (error) {
      console.error('🚨 Network or fetch failure:', error);
    }
  };

  const handleSwipeComplete = (direction: 'left' | 'right') => {
    const currentSwipedEvent = events[currentIndex];
    
    if (currentSwipedEvent) {
      const type = direction === 'right' ? 'like' : 'rejected';
      recordInteraction(currentSwipedEvent.id, type);
    }

    setCurrentIndex((prev) => prev + 1);
    translateX.value = 0;
    translateY.value = 0;
  };

  const panGesture = Gesture.Pan()
    .enabled(selectedEvent === null) 
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(
          SCREEN_WIDTH * 1.5, 
          { duration: 200 }, 
          () => runOnJS(handleSwipeComplete)('right')
        );
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(
          -SCREEN_WIDTH * 1.5, 
          { duration: 200 }, 
          () => runOnJS(handleSwipeComplete)('left')
        );
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 120 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${interpolate(translateX.value, [-SCREEN_WIDTH / 2, SCREEN_WIDTH / 2], [-8, 8])}deg` },
    ],
  }));

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD / 2], [0, 1]),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD / 2, 0], [1, 0]),
  }));

  const hasCardsLeft = currentIndex < events.length;

  const getCategoryTheme = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'gaming': return { color: '#8b5cf6', bg: isDark ? '#2e1065' : '#f5f3ff', text: isDark ? '#ddd6fe' : '#5b21b6' };
      case 'food': return { color: '#ef4444', bg: isDark ? '#7c2d12' : '#fff7ed', text: isDark ? '#ffedd5' : '#9a3412' }; 
      case 'tech': return { color: '#06b6d4', bg: isDark ? '#164e63' : '#ecfeff', text: isDark ? '#cffafe' : '#083344' };
      case 'art': return { color: '#ec4899', bg: isDark ? '#831843' : '#fdf2f8', text: isDark ? '#fce7f3' : '#9d174d' };
      case 'wellness': return { color: '#10b981', bg: isDark ? '#064e3b' : '#ecfdf5', text: isDark ? '#d1fae5' : '#065f46' };
      default: return { color: '#3b82f6', bg: isDark ? '#1e3a8a' : '#eff6ff', text: isDark ? '#dbeafe' : '#1e40af' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Ambient Background Blobs for a premium spatial UI feel */}
      <View style={[styles.bgBlob, styles.bgBlobTop, { backgroundColor: isDark ? 'rgba(55, 48, 163, 0.4)' : 'rgba(224, 231, 255, 0.7)' }]} />
      <View style={[styles.bgBlob, styles.bgBlobBottom, { backgroundColor: isDark ? 'rgba(131, 24, 67, 0.3)' : 'rgba(252, 231, 243, 0.6)' }]} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>MELA</Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Discover What&apos;s Live</Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.toggleButton, 
            { backgroundColor: theme === 'light' ? '#fef08a' : '#451a03' },
            isDark && { borderWidth: 1, borderColor: '#713f12' }
          ]}
          onPress={toggleTheme} 
          activeOpacity={0.8}
        >
          <Ionicons 
            name={theme === 'light' ? "moon" : "sunny"} 
            size={22} 
            color="#eab308" 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardStackContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#eab308" />
        ) : hasCardsLeft ? (
          events
            .map((event, index) => {
              if (index < currentIndex) return null;
              if (index > currentIndex + 2) return null;

              const isTopCard = index === currentIndex;
              const stackPosition = index - currentIndex;

              const backgroundStyle = stackPosition === 1 ? styles.secondCard : styles.thirdCard;
              const themeCardStyle = { backgroundColor: colors.cardBg, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' };
              
              const imageUrl = event.image_url || 'https://via.placeholder.com/400x300?text=No+Image';
              const categoryText = event.category ? event.category.toUpperCase() : 'GENERAL';
              const addressText = event.address || 'Location TBA';

              if (isTopCard) {
                return (
                  <GestureDetector key={event.id} gesture={panGesture}>
                    <Animated.View style={[styles.card, styles.topCard, themeCardStyle, animatedCardStyle]}>
                      <TouchableOpacity 
                        style={{ flex: 1 }} 
                        activeOpacity={0.95} 
                        onPress={() => setSelectedEvent(event)}
                      >
                        <Image source={{ uri: imageUrl }} style={[styles.cardImage, { backgroundColor: colors.cardBorder }]} />

                        <Animated.View style={[styles.likeBadge, likeOpacity]}>
                          <Text style={styles.likeText}>INTERESTED</Text>
                        </Animated.View>
                        <Animated.View style={[styles.nopeBadge, nopeOpacity]}>
                          <Text style={styles.nopeText}>PASS</Text>
                        </Animated.View>

                        {/* FRONT CARD DETAILS */}
                        <View style={[styles.cardInfoContainer, { backgroundColor: colors.cardBg }]}>
                          <View style={[styles.categoryBadge, { backgroundColor: colors.categoryBg }]}>
                            <Text style={[styles.categoryText, { color: colors.categoryText }]}>✨ {categoryText}</Text>
                          </View>
                          <Text style={[styles.eventTitle, { color: colors.textPrimary }]} numberOfLines={1}>{event.title}</Text>
                          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>{event.summary}</Text>

                          <View style={styles.metaRow}>
                            <Ionicons name="location-outline" size={16} color={colors.textMuted} />
                            <Text style={[styles.metaText, { color: colors.textMuted }]} numberOfLines={1}>{addressText}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  </GestureDetector>
                );
              }

              return (
                <View key={event.id} style={[styles.card, backgroundStyle, themeCardStyle]}>
                  <Image source={{ uri: imageUrl }} style={[styles.cardImage, { backgroundColor: colors.cardBorder }]} />
                  
                  {/* BACKGROUND CARD DETAILS */}
                  <View style={[styles.cardInfoContainer, { backgroundColor: colors.cardBg }]}>
                    <View style={[styles.categoryBadge, { backgroundColor: colors.categoryBg }]}>
                      <Text style={[styles.categoryText, { color: colors.categoryText }]}>✨ {categoryText}</Text>
                    </View>
                    <Text style={[styles.eventTitle, { color: colors.textPrimary }]} numberOfLines={1}>{event.title}</Text>
                    <Text style={[styles.summaryText, { color: colors.textSecondary }]}>{event.summary}</Text>

                    <View style={styles.metaRow}>
                      <Ionicons name="location-outline" size={16} color={colors.textMuted} />
                      <Text style={[styles.metaText, { color: colors.textMuted }]} numberOfLines={1}>{addressText}</Text>
                    </View>
                  </View>
                </View>
              );
            })
            .reverse()
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>End of Discover Deck</Text>
          </View>
        )}
      </View>

      {/* FOOTER BUTTON ACTIONS */}
      {!isLoading && hasCardsLeft && (
        <View style={styles.actionButtonRow}>
          <TouchableOpacity 
            onPress={() => { 
              translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 200 }, () => runOnJS(handleSwipeComplete)('left')); 
            }} 
            style={[styles.circleButton, { backgroundColor: colors.btnBg, borderColor: theme === 'light' ? '#fee2e2' : 'rgba(239, 68, 68, 0.2)' }]}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={32} color="#ef4444" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => { 
              translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 200 }, () => runOnJS(handleSwipeComplete)('right')); 
            }} 
            style={[styles.circleButton, { backgroundColor: theme === 'light' ? '#fffdf0' : '#252211', borderColor: theme === 'light' ? '#fef08a' : 'rgba(234, 179, 8, 0.2)' }]}
            activeOpacity={0.8}
          >
            <Ionicons name="heart" size={28} color="#eab308" />
          </TouchableOpacity>
        </View>
      )}

      {/* 📋 DETAILED POPUP MODAL */}
      {selectedEvent && (() => {
        const catTheme = getCategoryTheme(selectedEvent.category);
        const sharedCardStyle = { backgroundColor: colors.cardBg, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' };
        const imageUrl = selectedEvent.image_url || 'https://via.placeholder.com/400x300?text=No+Image';

        const isRegistered = rsvpedEvents.includes(selectedEvent.id);

        return (
          <View style={styles.modalBlurOverlay}>
            <View style={[styles.centerHeroCard, sharedCardStyle]}>
              <Image source={{ uri: imageUrl }} style={styles.heroCardImage} />
              
              <TouchableOpacity 
                style={styles.closeCardButton} 
                onPress={() => setSelectedEvent(null)}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={34} color="#ffffff" />
              </TouchableOpacity>

              {/* ✨ MODIFIED: Changed View to ScrollView to allow scrolling over long content */}
              <ScrollView 
                style={{ flexShrink: 1 }}
                contentContainerStyle={styles.heroCardContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={[styles.tagContainer, { backgroundColor: catTheme.bg, borderColor: catTheme.color }]}>
                  <Text style={[styles.categoryBadgeText, { color: catTheme.text }]}>
                    ⚡ {selectedEvent.category?.toUpperCase() || 'EVENT'}
                  </Text>
                </View>

                <Text style={[styles.heroCardTitle, { color: colors.textPrimary }]}>{selectedEvent.title}</Text>
                <Text style={styles.heroCardSummary}>{selectedEvent.summary || 'Live Session'}</Text>
                <Text style={[styles.heroCardDesc, { color: colors.textSecondary }]}>
                  {selectedEvent.description || 'No detailed layout description provided for this session.'}
                </Text>

                <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />

                <View style={styles.metaRowPopup}>
                  <Ionicons name="location" size={16} color={catTheme.color} />
                  <Text style={[styles.metaTextPopup, { color: colors.textSecondary }]} numberOfLines={2}>
                    {selectedEvent.address || 'Location Details TBA'}
                  </Text>
                </View>

                {selectedEvent.contact_email && (
                  <View style={[styles.metaRowPopup, { marginTop: 8, marginBottom: 4 }]}>
                    <Ionicons name="mail" size={16} color={colors.textMuted} />
                    <Text style={[styles.metaTextPopup, { color: colors.textSecondary }]} numberOfLines={1}>
                      {selectedEvent.contact_email}
                    </Text>
                  </View>
                )}

                {/* INTERACTIONS BAR */}
                <View style={styles.modalActionButtonRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.dislikeButton, isDark && { backgroundColor: '#451a1a', borderColor: '#7f1d1d' }]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedEvent(null);
                      translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 200 }, () => runOnJS(handleSwipeComplete)('left'));
                    }}
                  >
                    <Ionicons name="close-outline" size={26} color="#ef4444" />
                    <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Pass</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.likeButton, isDark && { backgroundColor: '#453503', borderColor: '#715c00' }]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedEvent(null);
                      translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 200 }, () => runOnJS(handleSwipeComplete)('right'));
                    }}
                  >
                    <Ionicons name="heart" size={24} color="#eab308" />
                    <Text style={[styles.actionButtonText, { color: '#eab308' }]}>Like</Text>
                  </TouchableOpacity>
                </View>

                {/* REGISTER FULL WIDTH BUTTON */}
                <TouchableOpacity
                  style={[
                    styles.registerButton, 
                    isDark && { backgroundColor: '#064e3b', borderColor: '#047857' },
                    isRegistered && { backgroundColor: '#047857', opacity: 0.75, borderColor: '#064e3b' }
                  ]}
                  activeOpacity={0.8}
                  disabled={isRegistered}
                  onPress={() => handleRegisterEvent(selectedEvent.id)}
                >
                  <Ionicons 
                    name={isRegistered ? "checkmark-done-circle" : "ticket-outline"} 
                    size={20} 
                    color="#ffffff" 
                  />
                  <Text style={styles.registerButtonText}>
                    {isRegistered ? "Registered" : "Register Now"}
                  </Text>
                </TouchableOpacity>

              </ScrollView>
            </View>
          </View>
        );
      })()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  
  bgBlob: { position: 'absolute', width: SCREEN_WIDTH * 1.2, height: SCREEN_WIDTH * 1.2, borderRadius: 9999 },
  bgBlobTop: { top: -SCREEN_WIDTH * 0.4, right: -SCREEN_WIDTH * 0.3 },
  bgBlobBottom: { bottom: -SCREEN_WIDTH * 0.2, left: -SCREEN_WIDTH * 0.4 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16, zIndex: 10 },
  headerSub: { fontSize: 13, fontWeight: '900', color: '#eab308', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 },
  headerTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
  toggleButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  
  cardStackContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  card: { position: 'absolute', width: SCREEN_WIDTH * 0.9, height: SCREEN_HEIGHT * 0.6, borderRadius: 32, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 8, overflow: 'hidden' },
  topCard: { zIndex: 10 },
  secondCard: { transform: [{ scale: 0.95 }, { translateY: 20 }], zIndex: 5, opacity: 0.95 },
  thirdCard: { transform: [{ scale: 0.90 }, { translateY: 40 }], zIndex: 1, opacity: 0.75 },
  
  cardImage: { width: '100%', height: '52%' },
  cardInfoContainer: { padding: 24, flex: 1, justifyContent: 'center' },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginBottom: 12 },
  categoryText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  eventTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  summaryText: { fontSize: 15, marginTop: 6, fontStyle: 'italic', marginBottom: 16, lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 'auto' },
  metaText: { fontSize: 14, marginLeft: 6, fontWeight: '600' },
  
  likeBadge: { position: 'absolute', top: 40, left: 30, borderWidth: 4, borderColor: '#22c55e', backgroundColor: 'rgba(24, 24, 27, 0.7)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, transform: [{ rotate: '-10deg' }], zIndex: 99 },
  likeText: { color: '#22c55e', fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  nopeBadge: { position: 'absolute', top: 40, right: 30, borderWidth: 4, borderColor: '#ef4444', backgroundColor: 'rgba(24, 24, 27, 0.7)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, transform: [{ rotate: '10deg' }], zIndex: 99 },
  nopeText: { color: '#ef4444', fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  
  actionButtonRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 20, gap: 32, zIndex: 10 },
  circleButton: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 5, borderWidth: 1.5 },
  
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800' },

  /* POPUP SYSTEM STYLES */
  modalBlurOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(9, 9, 11, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  centerHeroCard: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderRadius: 36,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
    borderWidth: 1,
  },
  heroCardImage: { width: '100%', height: SCREEN_HEIGHT * 0.24, backgroundColor: '#e4e4e7' },
  closeCardButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  heroCardContent: { padding: 28 },
  tagContainer: { borderWidth: 1, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginBottom: 12 },
  categoryBadgeText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  heroCardTitle: { fontSize: 24, fontWeight: '900', lineHeight: 30, letterSpacing: -0.5 },
  heroCardSummary: { fontSize: 15, color: '#eab308', fontWeight: '800', marginTop: 6 },
  heroCardDesc: { fontSize: 14, marginTop: 10, lineHeight: 22, opacity: 0.9 },
  dividerLine: { height: 1, marginTop: 16, marginBottom: 16, opacity: 0.6 },
  metaRowPopup: { flexDirection: 'row', alignItems: 'center' },
  metaTextPopup: { fontSize: 13, marginLeft: 10, fontWeight: '600', flex: 1 },
  modalActionButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dislikeButton: {
    borderColor: '#fee2e2',
    backgroundColor: '#ffd6d6',
  },
  likeButton: {
    borderColor: '#fffde1',
    backgroundColor: '#fffbcb',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  /* REGISTER STYLES */
  registerButton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    backgroundColor: '#10b981',
    borderWidth: 1.5,
    borderColor: '#059669',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 10,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});