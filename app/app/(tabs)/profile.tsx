import React from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView } from 'react-native';

// Mock data representing a user's progress for the hackathon demo
const USER_DATA = {
  name: "Alex Explorer",
  streak: 5, // 5-day active streak
  xp: 340,
  nextLevelXp: 500,
  badges: [
    { id: '1', emoji: '🎮', name: 'Trendsetter', desc: 'Swiped on 10 events' },
    { id: '2', emoji: '🧑‍💻', name: 'Silicon Resident', desc: 'Saved 3 tech events' },
    { id: '3', emoji: '🍕', name: 'Foodie Novice', desc: 'Explored 1 local diner' },
  ]
};

export default function ProfileScreen() {
  // Simple calculation for the progress bar percentage
  const progressPercent = (USER_DATA.xp / USER_DATA.nextLevelXp) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER / USER PROFILE CARD */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {USER_DATA.name.charAt(0)}
            </Text>
          </View>
          <Text style={styles.userName}>{USER_DATA.name}</Text>
          <Text style={styles.userTitle}>Level 3 Explorer</Text>
        </View>

        {/* GAMIFIED STATS (THE DUOLINGO EFFECT) */}
        <View style={styles.statsContainer}>
          {/* STREAK WIDGET */}
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{USER_DATA.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          {/* TOTAL SCORE WIDGET */}
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>✨</Text>
            <Text style={styles.statValue}>{USER_DATA.xp}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
        </View>

        {/* PROGRESS BAR TO NEXT BADGE */}
        <View style={styles.progressSection}>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressTitle}>Next Badge Progress</Text>
            <Text style={styles.progressValue}>{USER_DATA.xp}/{USER_DATA.nextLevelXp} XP</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        {/* BADGES COLLECTION GRID */}
        <Text style={styles.sectionTitle}>Unlocked Achievements</Text>
        <View style={styles.badgeGrid}>
          {USER_DATA.badges.map((badge) => (
            <View key={badge.id} style={styles.badgeCard}>
              <View style={styles.badgeIconCircle}>
                <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
              </View>
              <Text style={styles.badgeName}>{badge.name}</Text>
              <Text style={styles.badgeDesc}>{badge.desc}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Solid black background
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f59e0b', // Accent border color
    marginBottom: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  userName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  userTitle: {
    color: '#71717a',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statBox: {
    flex: 0.47,
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#18181b',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: '#a1a1aa',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  progressSection: {
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#18181b',
    borderRadius: 20,
    padding: 16,
    marginBottom: 30,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressValue: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#27272a',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#f59e0b', // Fills up with the amber gamification color
    borderRadius: 6,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 16,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#18181b',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#18181b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeEmoji: {
    fontSize: 22,
  },
  badgeName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  badgeDesc: {
    color: '#71717a',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
});