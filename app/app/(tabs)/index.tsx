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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.45;

interface EventCard {
  id: string;
  title: string;
  category: string;
  image: string;
  location: string;
  date: string;
  organizer: string;
}

// 📦 Expanded deep dataset containing 13 distinct mock events
const MOCK_EVENTS: EventCard[] = [
  { id: '13', title: 'Secret Underground Jazz & Wine Night', category: '🎧 Music & Drinks', image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800', location: 'The Velvet Lounge', date: 'Friday • 8:00 PM', organizer: 'By MoodIndigo Events' },
  { id: '12', title: 'Street Food & Taco Block Party', category: '🍕 Foodie Hub', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', location: 'Arts District Alley 4', date: 'Saturday • 12:00 PM', organizer: 'By LocalEats Co.' },
  { id: '11', title: 'Retro Arcade Tournament', category: '🎮 Gaming', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800', location: 'Pixel Palace HQ', date: 'Sunday • 4:00 PM', organizer: 'By CyberNet' },
  { id: '10', title: 'Rooftop Sunrise Yoga & Matcha', category: '🧘 Wellness', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', location: 'Skyline Terraces', date: 'Mon • 6:30 AM', organizer: 'By ZenState' },
  { id: '9', title: 'Indie Film Premier & Director Q&A', category: '🍿 Movies & Culture', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800', location: 'The Rialto Cinema', date: 'Tue • 7:30 PM', organizer: 'By NeonWave Films' },
  { id: '8', title: 'Tech Startups & Pitch Night', category: '🧑‍💻 Tech & Coding', image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800', location: 'Hacker Hub HQ', date: 'Wed • 6:00 PM', organizer: 'By SiliconAlley' },
  { id: '7', title: 'Neon Midnight Roller Disco', category: '🎉 Nightlife', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800', location: 'SuperSkate Arena', date: 'Thu • 10:00 PM', organizer: 'By RetroGroove' },
  { id: '6', title: 'Lo-Fi Beats Vinyl Pop-Up Shop', category: '🎧 Music & Art', image: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=800', location: 'Spin City Records', date: 'Fri • 3:00 PM', organizer: 'By GrooveDistro' },
  { id: '5', title: 'Artisan Coffee Crafting Class', category: '🍕 Foodie Hub', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800', location: 'Roasters Lab Diner', date: 'Sat • 10:00 AM', organizer: 'By BeanCraft' },
  { id: '4', title: 'Cyberpunk Sneaker Launch', category: '👗 Fashion Pop-Up', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800', location: 'The Warehouse Exhibit', date: 'Sat • 5:00 PM', organizer: 'By SoleCulture' },
  { id: '3', title: 'Live Graffiti Street Art Festival', category: '🎨 Creative Art', image: 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?w=800', location: 'Industrial Yard Wall', date: 'Sun • 11:00 AM', organizer: 'By PaintTheTown' },
  { id: '2', title: 'Local Micro-Brewery Craft Crawl', category: '🍻 Nightlife', image: 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=800', location: 'Hops & Barrels District', date: 'Sun • 6:00 PM', organizer: 'By CraftUnion' },
  { id: '1', title: 'AI & Generative Hackers Meetup', category: '🧑‍💻 Tech & Coding', image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800', location: 'DevHQ Commons', date: 'Mon • 6:30 PM', organizer: 'By FutureLabs' }
];

export default function DiscoverScreen() {
  const [events, setEvents] = useState<EventCard[]>(MOCK_EVENTS);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const activeIndex = events.length - 1;

  const handleSwipeLeft = () => {
    setEvents((prev) => prev.slice(0, -1));
    resetPosition();
  };

  const handleSwipeRight = () => {
    setEvents((prev) => prev.slice(0, -1));
    resetPosition();
  };

  const resetPosition = () => {
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
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 200 }, () => {
          runOnJS(handleSwipeRight)();
        });
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 200 }, () => {
          runOnJS(handleSwipeLeft)();
        });
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 120 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotation = interpolate(translateX.value, [-SCREEN_WIDTH / 2, SCREEN_WIDTH / 2], [-8, 8]);
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD / 2], [0, 1]),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD / 2, 0], [1, 0]),
  }));

  return (
    <View style={styles.container}>
      {/* TOP HEADER BAR */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>DISCOVER</Text>
          <Text style={styles.headerTitle}>What's Next</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={22} color="#eab308" />
        </TouchableOpacity>
      </View>

      {/* CARD STACK CONTAINER */}
      <View style={styles.cardStackContainer}>
        {events.length > 0 ? (
          events.map((event, index) => {
            const isFirst = index === activeIndex;
            const isSecond = index === activeIndex - 1;
            const isThird = index === activeIndex - 2;

            // Only render the top 3 cards in the stack loop to optimize engine performance
            if (index < activeIndex - 2) return null;

            if (isFirst) {
              return (
                <GestureDetector key={event.id} gesture={panGesture}>
                  <Animated.View style={[styles.card, styles.topCard, animatedCardStyle]}>
                    <Image source={{ uri: event.image }} style={styles.cardImage} />

                    <Animated.View style={[styles.overlayBadge, styles.likeBadge, likeOpacity]}>
                      <Text style={styles.likeText}>INTERESTED</Text>
                    </Animated.View>
                    <Animated.View style={[styles.overlayBadge, styles.nopeBadge, nopeOpacity]}>
                      <Text style={styles.nopeText}>PASS</Text>
                    </Animated.View>

                    <View style={styles.cardInfoContainer}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{event.category}</Text>
                      </View>
                      <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                      <Text style={styles.organizerText}>{event.organizer}</Text>
                      <View style={styles.metaRow}>
                        <Ionicons name="calendar-outline" size={16} color="#eab308" />
                        <Text style={styles.metaText}>{event.date}</Text>
                      </View>
                      <View style={styles.metaRow}>
                        <Ionicons name="location-outline" size={16} color="#71717a" />
                        <Text style={styles.metaText} numberOfLines={1}>{event.location}</Text>
                      </View>
                    </View>
                  </Animated.View>
                </GestureDetector>
              );
            }

            // Apply distinct depth styles for cards sitting directly behind the current card
            const backgroundCardStyle = isSecond 
              ? styles.secondCardPlaceholder 
              : styles.thirdCardPlaceholder;

            return (
              <View key={event.id} style={[styles.card, backgroundCardStyle]}>
                <Image source={{ uri: event.image }} style={styles.cardImage} />
                <View style={styles.cardInfoContainer}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{event.category}</Text>
                  </View>
                  <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyTitle}>You've Unlocked Your City!</Text>
            <Text style={styles.emptyDesc}>No more events in your area. Check back later or head to the map hub to view pinned events.</Text>
          </View>
        )}
      </View>

      {/* MANUAL ACTION QUICK BUTTONS */}
      {events.length > 0 && (
        <View style={styles.actionButtonRow}>
          <TouchableOpacity 
            onPress={() => {
              translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 250 }, () => runOnJS(handleSwipeLeft)());
            }}
            style={[styles.circleButton, styles.closeButton]}
          >
            <Ionicons name="close" size={28} color="#ef4444" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => {
              translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 250 }, () => runOnJS(handleSwipeRight)());
            }}
            style={[styles.circleButton, styles.heartButton]}
          >
            <Ionicons name="heart" size={28} color="#eab308" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '900',
    color: '#eab308',
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#18181b',
    letterSpacing: -0.5,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#fef08a',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardStackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.92,
    height: SCREEN_HEIGHT * 0.60,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#f4f4f5',
    shadowColor: '#18181b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  topCard: {
    zIndex: 10,
  },
  // Card 2: Nested slightly lower down and compressed a tiny bit
  secondCardPlaceholder: {
    transform: [{ scale: 0.95 }, { translateY: 15 }],
    zIndex: 5,
    opacity: 0.9,
  },
  // Card 3: Layered underneath Card 2 with even higher compression offset
  thirdCardPlaceholder: {
    transform: [{ scale: 0.90 }, { translateY: 30 }],
    zIndex: 1,
    opacity: 0.6,
  },
  cardImage: {
    width: '100%',
    height: '52%',
    backgroundColor: '#f4f4f5',
  },
  cardInfoContainer: {
    padding: 20,
    flex: 1,
    backgroundColor: '#ffffff',
  },
  categoryBadge: {
    backgroundColor: '#fef08a',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 8,
  },
  categoryText: {
    color: '#854d0e',
    fontSize: 12,
    fontWeight: '800',
  },
  eventTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#18181b',
    lineHeight: 25,
  },
  organizerText: {
    fontSize: 13,
    color: '#a1a1aa',
    marginTop: 2,
    fontWeight: '500',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#3f3f46',
    marginLeft: 8,
    fontWeight: '600',
  },
  overlayBadge: {
    position: 'absolute',
    top: 30,
    borderWidth: 4,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 14,
    zIndex: 999,
  },
  likeBadge: {
    left: 25,
    borderColor: '#008000',
    transform: [{ rotate: '-10deg' }],
  },
  likeText: {
    color: '#008000',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  nopeBadge: {
    right: 25,
    borderColor: '#ef4444',
    transform: [{ rotate: '10deg' }],
  },
  nopeText: {
    color: '#ef4444',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  actionButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
    gap: 24,
  },
  circleButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#18181b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f4f4f5',
  },
  closeButton: {
    borderColor: '#fee2e2',
  },
  heartButton: {
    borderColor: '#fef08a',
    backgroundColor: '#fffdf0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 54,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#18181b',
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    fontWeight: '500',
  },
});