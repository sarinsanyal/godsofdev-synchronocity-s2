import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, Dimensions, TouchableOpacity } from 'react-native';
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
// 1. IMPORT GLOBAL DATA 
import { MOCK_EVENTS, DatabaseEvent } from '../../constants/mockData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.45;

export default function DiscoverScreen() {
  const [events, setEvents] = useState<DatabaseEvent[]>(MOCK_EVENTS);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const activeIndex = events.length - 1;

  const handleSwipe = (direction: 'left' | 'right') => {
    // Here you would eventually construct your user_interactions schema insertion!
    setEvents((prev) => prev.slice(0, -1));
    translateX.value = 0;
    translateY.value = 0;
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 200 }, () => runOnJS(handleSwipe)('right'));
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 200 }, () => runOnJS(handleSwipe)('left'));
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>MELA</Text>
          <Text style={styles.headerTitle}>Discover What's Live</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={22} color="#eab308" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardStackContainer}>
        {events.length > 0 ? (
          events.map((event, index) => {
            if (index < activeIndex - 2) return null;
            const isFirst = index === activeIndex;

            if (isFirst) {
              return (
                <GestureDetector key={event.id} gesture={panGesture}>
                  <Animated.View style={[styles.card, styles.topCard, animatedCardStyle]}>
                    <Image source={{ uri: event.image_url }} style={styles.cardImage} />

                    <Animated.View style={[styles.overlayBadge, styles.likeBadge, likeOpacity]}>
                      <Text style={styles.likeText}>INTERESTED</Text>
                    </Animated.View>
                    <Animated.View style={[styles.overlayBadge, styles.nopeBadge, nopeOpacity]}>
                      <Text style={styles.nopeText}>PASS</Text>
                    </Animated.View>

                    <View style={styles.cardInfoContainer}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>✨ {event.category.toUpperCase()}</Text>
                      </View>
                      <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                      <Text style={styles.summaryText}>{event.summary}</Text>

                      <View style={styles.metaRow}>
                        <Ionicons name="location-outline" size={16} color="#71717a" />
                        <Text style={styles.metaText} numberOfLines={1}>{event.location.address}</Text>
                      </View>
                    </View>
                  </Animated.View>
                </GestureDetector>
              );
            }

            const backgroundStyle = index === activeIndex - 1 ? styles.secondCard : styles.thirdCard;
            return (
              <View key={event.id} style={[styles.card, backgroundStyle]}>
                <Image source={{ uri: event.image_url }} style={styles.cardImage} />
                <View style={styles.cardInfoContainer}>
                  <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyTitle}>End of Discover Deck</Text>
          </View>
        )}
      </View>

      {/* FOOTER BUTTON ACTIONS */}
      {events.length > 0 && (
        <View style={styles.actionButtonRow}>
          <TouchableOpacity onPress={() => { translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 200 }, () => runOnJS(handleSwipe)('left')); }} style={[styles.circleButton, styles.closeButton]}>
            <Ionicons name="close" size={28} color="#ef4444" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 200 }, () => runOnJS(handleSwipe)('right')); }} style={[styles.circleButton, styles.heartButton]}>
            <Ionicons name="heart" size={28} color="#eab308" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  // Updated Top Navigation Bar Styles
  headerBar: {
    height: 120,          // Height bumped up slightly to elegantly breathe with the stacked titles
    paddingTop: 50,
    paddingHorizontal: '6%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  headerTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerSub: {
    fontSize: 21,
    fontWeight: '900',
    color: '#eab308',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#18181b',
    letterSpacing: -0.5,
    marginTop: 1,       // Tight padding pairing with the subheadline
  },
  hamburgerButton: {
    padding: 6,
    alignSelf: 'center',
  },
  filterButton: { width: 44, height: 44, backgroundColor: '#fef08a', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  cardStackContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { position: 'absolute', width: SCREEN_WIDTH * 0.92, height: SCREEN_HEIGHT * 0.58, backgroundColor: '#ffffff', borderRadius: 28, borderWidth: 1, borderColor: '#f4f4f5', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 4, overflow: 'hidden' },
  topCard: { zIndex: 10 },
  secondCard: { transform: [{ scale: 0.95 }, { translateY: 15 }], zIndex: 5, opacity: 0.9 },
  thirdCard: { transform: [{ scale: 0.90 }, { translateY: 30 }], zIndex: 1, opacity: 0.6 },
  cardImage: { width: '100%', height: '55%', backgroundColor: '#f4f4f5' },
  cardInfoContainer: { padding: 20, flex: 1, backgroundColor: '#ffffff' },
  categoryBadge: { backgroundColor: '#fef08a', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  categoryText: { color: '#854d0e', fontSize: 10, fontWeight: '900' },
  eventTitle: { fontSize: 22, fontWeight: '900', color: '#18181b' },
  summaryText: { fontSize: 14, color: '#4b5563', marginTop: 4, fontStyle: 'italic', marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  metaText: { fontSize: 13, color: '#71717a', marginLeft: 6, fontWeight: '500' },
  overlayBadge: { position: 'absolute', top: 30, borderWidth: 4, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 14, zIndex: 999 },
  likeBadge: {
    position: 'absolute', // Ensures overlay locks on top of the image
    top: 35,
    left: 25,
    borderWidth: 3,
    borderColor: '#22c55e',          // Upgraded to a more vibrant UI green
    backgroundColor: 'rgba(24, 24, 27, 0.85)', // Dark zinc tint shield that isolates text from photo patterns
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    transform: [{ rotate: '-10deg' }],
    zIndex: 10,
  },
  likeText: {
    color: '#22c55e',
    fontSize: 24,                    // Slightly larger footprint for better scannability
    fontWeight: '900',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)', // Adds micro-contrast directly underneath the text
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  nopeBadge: {
    position: 'absolute',
    top: 35,
    right: 25,
    borderWidth: 3,
    borderColor: '#ef4444',
    backgroundColor: 'rgba(24, 24, 27, 0.85)', // Dark zinc tint shield
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    transform: [{ rotate: '10deg' }],
    zIndex: 10,
  },
  nopeText: {
    color: '#ef4444',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  actionButtonRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 30, gap: 24 },
  circleButton: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#f4f4f5' },
  closeButton: { borderColor: '#fee2e2' },
  heartButton: { borderColor: '#fef08a', backgroundColor: '#fffdf0' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyEmoji: { fontSize: 50, marginBottom: 10 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#18181b' }
});