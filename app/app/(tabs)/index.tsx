import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
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

  const [events, setEvents] = useState<DatabaseEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Popup Detail Modal State
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

    fetchEvents();
  }, []);

  const handleSwipeComplete = (direction: 'left' | 'right') => {
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
    switch (category) {
      case 'Gaming': return { color: '#8b5cf6', bg: isDark ? '#2e1065' : '#f5f3ff', text: isDark ? '#ddd6fe' : '#5b21b6' };
      case 'Food': return { color: '#ef4444', bg: isDark ? '#7c2d12' : '#fff7ed', text: isDark ? '#ffedd5' : '#9a3412' }; 
      case 'Tech': return { color: '#06b6d4', bg: isDark ? '#164e63' : '#ecfeff', text: isDark ? '#cffafe' : '#083344' };
      case 'Art': return { color: '#ec4899', bg: isDark ? '#831843' : '#fdf2f8', text: isDark ? '#fce7f3' : '#9d174d' };
      case 'Wellness': return { color: '#10b981', bg: isDark ? '#064e3b' : '#ecfdf5', text: isDark ? '#d1fae5' : '#065f46' };
      default: return { color: '#3b82f6', bg: isDark ? '#1e3a8a' : '#eff6ff', text: isDark ? '#dbeafe' : '#1e40af' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>MELA</Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Discover What&apos;s Live</Text>
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
              const themeCardStyle = { backgroundColor: colors.cardBg, borderColor: colors.cardBorder };
              
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
            style={[styles.circleButton, { backgroundColor: colors.btnBg, borderColor: theme === 'light' ? '#fee2e2' : '#451d1d' }]}
          >
            <Ionicons name="close" size={28} color="#ef4444" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => { 
              translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 200 }, () => runOnJS(handleSwipeComplete)('right')); 
            }} 
            style={[styles.circleButton, { backgroundColor: theme === 'light' ? '#fffdf0' : '#252211', borderColor: theme === 'light' ? '#fef08a' : '#715c00' }]}
          >
            <Ionicons name="heart" size={28} color="#eab308" />
          </TouchableOpacity>
        </View>
      )}

      {/* 📋 DETAILED POPUP MODAL */}
      {selectedEvent && (() => {
        const catTheme = getCategoryTheme(selectedEvent.category);
        const sharedCardStyle = { backgroundColor: colors.cardBg, borderColor: colors.cardBorder };
        const imageUrl = selectedEvent.image_url || 'https://via.placeholder.com/400x300?text=No+Image';

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

              <View style={styles.heroCardContent}>
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

                {/* 🟩 NEW REGISTER FULL WIDTH BUTTON */}
                <TouchableOpacity
                  style={[styles.registerButton, isDark && { backgroundColor: '#064e3b', borderColor: '#047857' }]}
                  activeOpacity={0.8}
                  onPress={() => alert('Dummy Registration Triggered')}
                >
                  <Ionicons name="ticket-outline" size={20} color="#ffffff" />
                  <Text style={styles.registerButtonText}>Register Now</Text>
                </TouchableOpacity>

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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  headerSub: { fontSize: 30, fontWeight: '900', color: '#eab308', letterSpacing: 1, textTransform: 'uppercase' },
  headerTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5, marginTop: 1 },
  toggleButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  cardStackContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { position: 'absolute', width: SCREEN_WIDTH * 0.92, height: SCREEN_HEIGHT * 0.58, borderRadius: 28, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 4, overflow: 'hidden' },
  topCard: { zIndex: 10 },
  secondCard: { transform: [{ scale: 0.95 }, { translateY: 15 }], zIndex: 5, opacity: 0.9 },
  thirdCard: { transform: [{ scale: 0.90 }, { translateY: 30 }], zIndex: 1, opacity: 0.6 },
  cardImage: { width: '100%', height: '55%' },
  cardInfoContainer: { padding: 20, flex: 1 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  categoryText: { fontSize: 10, fontWeight: '900' },
  eventTitle: { fontSize: 22, fontWeight: '900' },
  summaryText: { fontSize: 14, marginTop: 4, fontStyle: 'italic', marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  metaText: { fontSize: 13, marginLeft: 6, fontWeight: '500' },
  likeBadge: { position: 'absolute', top: 35, left: 25, borderWidth: 3, borderColor: '#22c55e', backgroundColor: 'rgba(24, 24, 27, 0.85)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, transform: [{ rotate: '-10deg' }], zIndex: 99 },
  likeText: { color: '#22c55e', fontSize: 24, fontWeight: '900', letterSpacing: 1.5, textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  nopeBadge: { position: 'absolute', top: 35, right: 25, borderWidth: 3, borderColor: '#ef4444', backgroundColor: 'rgba(24, 24, 27, 0.85)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, transform: [{ rotate: '10deg' }], zIndex: 99 },
  nopeText: { color: '#ef4444', fontSize: 24, fontWeight: '900', letterSpacing: 1.5, textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  actionButtonRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 10, gap: 24 },
  circleButton: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, borderWidth: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyEmoji: { fontSize: 50, marginBottom: 10 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold' },

  /* 📋 POPUP SYSTEM STYLES */
  modalBlurOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(24, 24, 27, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
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
  heroCardImage: { width: '100%', height: SCREEN_HEIGHT * 0.22, backgroundColor: '#e4e4e7' },
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
  metaRowPopup: { flexDirection: 'row', alignItems: 'center' },
  metaTextPopup: { fontSize: 12, marginLeft: 8, fontWeight: '600', flex: 1 },
  modalActionButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 46,
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
    borderColor: '#fffde1',
    backgroundColor: '#fffbcb',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  /* 🟩 REGISTER STYLES */
  registerButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#10b981',
    borderWidth: 1.5,
    borderColor: '#059669',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});