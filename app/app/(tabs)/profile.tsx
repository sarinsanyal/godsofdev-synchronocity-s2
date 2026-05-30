import React, { useState } from 'react';
import { StyleSheet, View, Text, Dimensions, Image, TouchableOpacity, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MapView, { Region } from 'react-native-maps';
import { MOCK_EVENTS } from '../../constants/mockData';
import { useAppTheme } from '../_layout'; // <-- Wire up our global layout theme controller

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const USER_PROFILE = {
  name: 'Aritra Chatterji',
  username: '@aritra_ch',
  bio: 'Building experiences & finding the best street food hubs in the city. UI developer by day, tech wizard by night. ☕⚡',
  avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
  stats: {
    hosted: 3,
    attended: 28,
    saved: 12
  }
};

const MOCK_OWN_EVENTS_METRICS = [
  { id: 'own-1', title: 'Campus Tech Carnival', category: 'Tech', image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500', rsvps: 42, saves: 89, removes: 3, address: 'Main Auditorium Ground' },
  { id: 'own-2', title: 'BGMI LAN Showdown', category: 'Gaming', image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500', rsvps: 124, saves: 210, removes: 14, address: 'Student Activity Center' },
  { id: 'own-3', title: 'Street Food Street Walk', category: 'Food', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500', rsvps: 19, saves: 34, removes: 1, address: 'Backgate Food Street Alley' },
];

const INITIAL_REGION: Region = {
  latitude: 22.5726,
  longitude: 88.3639,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

export default function ProfileScreen() {
  // 1. Consume the master theme tokens
  const { theme, colors } = useAppTheme();
  const isDark = theme === 'dark';

  const [menuVisible, setMenuVisible] = useState(false);
  const [organizeModalVisible, setOrganizeModalVisible] = useState(false);
  const [selectedOwnEvent, setSelectedOwnEvent] = useState<typeof MOCK_OWN_EVENTS_METRICS[0] | null>(null);
  
  // Form input bindings
  const [eventTitle, setEventTitle] = useState('');
  const [eventSummary, setEventSummary] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [eventTags, setEventTags] = useState('');
  const [eventEmail, setEventEmail] = useState('');
  const [eventPhone, setEventPhone] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [address, setAddress] = useState('');
  const [targetLocation, setTargetLocation] = useState({
    latitude: INITIAL_REGION.latitude,
    longitude: INITIAL_REGION.longitude
  });

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Gaming': return '#8b5cf6';
      case 'Food': return '#f97316';
      case 'Tech': return '#06b6d4';
      case 'Art': return '#ec4899';
      case 'Wellness': return '#10b981';
      default: return '#3b82f6';
    }
  };

  const likedEventsSample = MOCK_EVENTS.slice(0, 4);

  const handleRegionChangeComplete = (region: Region) => {
    setTargetLocation({ latitude: region.latitude, longitude: region.longitude });
  };

  const handleCreateEventSubmit = () => {
    if (!eventTitle || !address) {
      Alert.alert('Missing Fields', 'Please supply an event headline and written structural address.');
      return;
    }
    Alert.alert('Success!', 'Your event coordinate vector mapping data has been processed.');
    setOrganizeModalVisible(false);
  };

  // Sharable theme styling matrices
  const dynamicCardStyle = { backgroundColor: colors.cardBg, borderColor: colors.cardBorder };
  const inputThemeStyle = { backgroundColor: isDark ? '#18181b' : '#fafafa', borderColor: colors.cardBorder, color: colors.textPrimary };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* 📋 BRANDED FESTIVAL HEADER TOP BAR CONTAINER */}
      <View style={[styles.headerBar, { backgroundColor: colors.background, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Your Profile</Text>
        </View>
        <TouchableOpacity style={styles.hamburgerButton} onPress={() => setMenuVisible(true)} activeOpacity={0.7}>
          <Ionicons name="menu" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* CENTRAL PROFILE HERO */}
        <View style={styles.profileHeroSection}>
          <View style={[styles.avatarOutlineRing, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Image source={{ uri: USER_PROFILE.avatar_url }} style={styles.avatarImage} />
          </View>
          <Text style={[styles.profileName, { color: colors.textPrimary }]}>{USER_PROFILE.name}</Text>
          <Text style={styles.profileUsername}>{USER_PROFILE.username}</Text>
          <Text style={[styles.profileBio, { color: colors.textSecondary }]}>{USER_PROFILE.bio}</Text>
        </View>

        {/* METRIC NUMERICAL GRID ROW */}
        <View style={[styles.statsCardContainer, dynamicCardStyle]}>
          <View style={styles.statSegment}>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{USER_PROFILE.stats.hosted}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Hosted</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.statSegment}>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{USER_PROFILE.stats.attended}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Attended</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.statSegment}>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{USER_PROFILE.stats.saved}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Saved</Text>
          </View>
        </View>

        {/* 🪄 PROMINENT "ORGANIZE YOUR EVENT" ACTION BANNER */}
        <TouchableOpacity style={[styles.organizeBannerButton, { backgroundColor: isDark ? '#18181b' : '#fafafa', borderColor: colors.cardBorder }]} activeOpacity={0.9} onPress={() => setOrganizeModalVisible(true)}>
          <View style={styles.bannerLeftInfo}>
            <View style={[styles.bannerIconBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <Ionicons name="flash" size={20} color="#eab308" />
            </View>
            <View>
              <Text style={[styles.bannerMainText, { color: colors.textPrimary }]}>Gather the Community</Text>
              <Text style={[styles.bannerSubText, { color: colors.textMuted }]}>Organize your own live custom event</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward-circle" size={28} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* ⚡ YOUR EVENTS (HOSTED MANAGEMENT CAROUSEL) */}
        <View style={styles.sectionSectionWrapper}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeadingText, { color: colors.textPrimary }]}>Your Events</Text>
            <Text style={[styles.viewAllTextLink, { color: colors.textMuted }]}>Tap for Engagement Insights</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.likedHorizontalScroll}>
            {MOCK_OWN_EVENTS_METRICS.map((event) => {
              const themeColor = getCategoryColor(event.category);
              return (
                <TouchableOpacity 
                  key={event.id} 
                  style={[styles.eventMiniCard, dynamicCardStyle]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedOwnEvent(event)}
                >
                  <Image source={{ uri: event.image_url }} style={styles.eventMiniCardImage} />
                  <View style={[styles.miniCategoryIndicator, { backgroundColor: themeColor }]} />
                  <View style={styles.miniCardTextContent}>
                    <Text style={[styles.miniEventTitle, { color: colors.textPrimary }]} numberOfLines={1}>{event.title}</Text>
                    <View style={styles.miniLocationRow}>
                      <Ionicons name="people" size={12} color="#8b5cf6" />
                      <Text style={styles.insightsSubtext}>{event.rsvps} active RSVPs</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* HORIZONTAL LIKED EVENTS LIST */}
        <View style={styles.sectionSectionWrapper}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeadingText, { color: colors.textPrimary }]}>Liked Events</Text>
            <TouchableOpacity><Text style={[styles.viewAllTextLink, { color: colors.textMuted }]}>See All</Text></TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.likedHorizontalScroll}>
            {likedEventsSample.map((event) => {
              const themeColor = getCategoryColor(event.category);
              return (
                <View key={event.id} style={[styles.eventMiniCard, dynamicCardStyle]}>
                  <Image source={{ uri: event.image_url }} style={styles.eventMiniCardImage} />
                  <View style={[styles.miniCategoryIndicator, { backgroundColor: themeColor }]} />
                  <View style={styles.miniCardTextContent}>
                    <Text style={[styles.miniEventTitle, { color: colors.textPrimary }]} numberOfLines={1}>{event.title}</Text>
                    <View style={styles.miniLocationRow}>
                      <Ionicons name="location" size={12} color={colors.textMuted} />
                      <Text style={[styles.miniLocationText, { color: colors.textMuted }]} numberOfLines={1}>{event.location.address}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

      </ScrollView>

      {/* 📊 INTERACTION ANALYTICS SHEET MODAL */}
      <Modal visible={!!selectedOwnEvent} transparent={true} animationType="fade" onRequestClose={() => setSelectedOwnEvent(null)}>
        <TouchableOpacity style={styles.bottomSheetBackdrop} activeOpacity={1} onPress={() => setSelectedOwnEvent(null)}>
          <View style={[styles.analyticsSheetContainer, { backgroundColor: colors.cardBg }]}>
            <View style={[styles.sheetHeaderIndicator, { backgroundColor: colors.cardBorder }]} />
            {selectedOwnEvent && (
              <View>
                <Text style={styles.sheetSubheading}>EVENT INSIGHTS</Text>
                <Text style={[styles.sheetTitleText, { color: colors.textPrimary }]}>{selectedOwnEvent.title}</Text>
                
                <View style={styles.analyticsStatsGrid}>
                  <View style={[styles.analyticCard, { borderColor: '#10b981', backgroundColor: isDark ? '#27272a' : '#fafafa' }]}>
                    <Ionicons name="checkmark-circle-outline" size={22} color="#10b981" />
                    <Text style={[styles.analyticValue, { color: colors.textPrimary }]}>{selectedOwnEvent.rsvps}</Text>
                    <Text style={[styles.analyticLabel, { color: colors.textSecondary }]}>Going (RSVP)</Text>
                  </View>
                  
                  <View style={[styles.analyticCard, { borderColor: '#3b82f6', backgroundColor: isDark ? '#27272a' : '#fafafa' }]}>
                    <Ionicons name="bookmark-outline" size={22} color="#3b82f6" />
                    <Text style={[styles.analyticValue, { color: colors.textPrimary }]}>{selectedOwnEvent.saves}</Text>
                    <Text style={[styles.analyticLabel, { color: colors.textSecondary }]}>Interested / Saved</Text>
                  </View>
                  
                  <View style={[styles.analyticCard, { borderColor: '#ef4444', backgroundColor: isDark ? '#27272a' : '#fafafa' }]}>
                    <Ionicons name="close-circle-outline" size={22} color="#ef4444" />
                    <Text style={[styles.analyticValue, { color: colors.textPrimary }]}>{selectedOwnEvent.removes}</Text>
                    <Text style={[styles.analyticLabel, { color: colors.textSecondary }]}>Removed / Hidden</Text>
                  </View>
                </View>

                <TouchableOpacity style={[styles.closeSheetButton, { backgroundColor: colors.textPrimary }]} onPress={() => setSelectedOwnEvent(null)}>
                  <Text style={[styles.closeSheetButtonText, { color: colors.background }]}>Dismiss Panel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* HAMBURGER SIDE MODAL PANEL */}
      <Modal visible={menuVisible} transparent={true} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.menuOverlayBackground} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={[styles.hamburgerSidePanel, { backgroundColor: colors.cardBg }]}>
            <View style={styles.panelTopHeader}>
              <Text style={[styles.panelHeaderTitle, { color: colors.textPrimary }]}>Options</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.panelDivider, { backgroundColor: colors.cardBorder }]} />
            <TouchableOpacity style={styles.panelRowLink} onPress={() => { setMenuVisible(false); Alert.alert('Settings', 'Account interface router.'); }}>
              <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.panelLinkText, { color: colors.textSecondary }]}>Account Settings</Text>
            </TouchableOpacity>
            <View style={[styles.panelDivider, { marginTop: 'auto', backgroundColor: colors.cardBorder }]} />
            <TouchableOpacity style={[styles.panelRowLink, styles.logoutActionLink]} onPress={() => { setMenuVisible(false); Alert.alert('Logout', 'Session closing.'); }}>
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text style={styles.logoutLinkText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* HOST AN EVENT MODAL */}
      <Modal visible={organizeModalVisible} animationType="slide" transparent={true} onRequestClose={() => setOrganizeModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalKeyboardAvoidingContainer}>
          <View style={[styles.organizeModalWindow, { backgroundColor: colors.cardBg }]}>
            <View style={styles.organizeHeader}>
              <Text style={[styles.organizeModalTitle, { color: colors.textPrimary }]}>Host An Event</Text>
              <TouchableOpacity onPress={() => setOrganizeModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.organizeFormScroll} contentContainerStyle={styles.modalFormContentStyle}>
              <Text style={[styles.inputLabelText, { color: colors.textMuted }]}>EVENT TITLE</Text>
              <TextInput style={[styles.formInputBox, inputThemeStyle]} placeholder="e.g., Rooftop Jazz Mix" placeholderTextColor={colors.textMuted} value={eventTitle} onChangeText={setEventTitle} />

              <Text style={[styles.inputLabelText, { color: colors.textMuted }]}>SUMMARY OVERVIEW</Text>
              <TextInput style={[styles.formInputBox, inputThemeStyle]} placeholder="Short highlight catchphrase" placeholderTextColor={colors.textMuted} value={eventSummary} onChangeText={setEventSummary} />

              <Text style={[styles.inputLabelText, { color: colors.textMuted }]}>FULL DESCRIPTION</Text>
              <TextInput style={[styles.formInputBox, styles.multilineInputBox, inputThemeStyle]} placeholder="Provide detailed breakdowns..." placeholderTextColor={colors.textMuted} value={eventDescription} onChangeText={setEventDescription} multiline numberOfLines={3} />

              <View style={styles.formGridRow}>
                <View style={styles.gridColumnItem}>
                  <Text style={[styles.inputLabelText, { color: colors.textMuted }]}>CATEGORY</Text>
                  <TextInput style={[styles.formInputBox, inputThemeStyle]} placeholder="Gaming, Music.." placeholderTextColor={colors.textMuted} value={eventCategory} onChangeText={setEventCategory} />
                </View>
                <View style={styles.gridColumnItem}>
                  <Text style={[styles.inputLabelText, { color: colors.textMuted }]}>TAGS</Text>
                  <TextInput style={[styles.formInputBox, inputThemeStyle]} placeholder="live, indie, chill" placeholderTextColor={colors.textMuted} value={eventTags} onChangeText={setEventTags} />
                </View>
              </View>

              <View style={styles.formGridRow}>
                <View style={styles.gridColumnItem}>
                  <Text style={[styles.inputLabelText, { color: colors.textMuted }]}>EVENT DATE</Text>
                  <TextInput style={[styles.formInputBox, inputThemeStyle]} placeholder="e.g., June 15, 2026" placeholderTextColor={colors.textMuted} value={eventDate} onChangeText={setEventDate} />
                </View>
                <View style={styles.gridColumnItem}>
                  <Text style={[styles.inputLabelText, { color: colors.textMuted }]}>STARTING TIME</Text>
                  <TextInput style={[styles.formInputBox, inputThemeStyle]} placeholder="e.g., 6:00 PM IST" placeholderTextColor={colors.textMuted} value={eventTime} onChangeText={setEventTime} />
                </View>
              </View>

              <Text style={[styles.inputLabelText, { color: colors.textMuted }]}>PINPOINT EVENT LOCATION</Text>
              <Text style={styles.inputSubhintText}>Drag and scroll map to align the focal marker at the venue point</Text>
              
              <View style={[styles.mapContainerFrame, { borderColor: colors.cardBorder }]}>
                <MapView 
                  style={styles.embeddedMapRender}
                  initialRegion={INITIAL_REGION}
                  onRegionChangeComplete={handleRegionChangeComplete}
                  showsUserLocation={true}
                  userInterfaceStyle={theme} // <-- Native Apple/Google map elements turn dark!
                />
                <View style={styles.fixedPinOverlayContainer} pointerEvents="none">
                  <Ionicons name="location" size={36} color={colors.textPrimary} />
                  <View style={styles.pinShadowDot} />
                </View>
              </View>

              <Text style={[styles.inputLabelText, { color: colors.textMuted }]}>WRITTEN VENUE ADDRESS</Text>
              <TextInput style={[styles.formInputBox, inputThemeStyle]} placeholder="e.g., Room 302, Phase 2, IT Hub Buildings" placeholderTextColor={colors.textMuted} value={address} onChangeText={setAddress} />

              <Text style={[styles.inputLabelText, { color: colors.textMuted }]}>CONTACT EMAIL</Text>
              <TextInput style={[styles.formInputBox, inputThemeStyle]} placeholder="contact@host.com" placeholderTextColor={colors.textMuted} keyboardType="email-address" value={eventEmail} onChangeText={setEventEmail} />

              <Text style={[styles.inputLabelText, { color: colors.textMuted }]}>CONTACT PHONE</Text>
              <TextInput style={[styles.formInputBox, inputThemeStyle]} placeholder="+91 XXXXX XXXXX" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" value={eventPhone} onChangeText={setEventPhone} />

              <TouchableOpacity style={[styles.submitEventFormButton, { backgroundColor: colors.textPrimary }]} activeOpacity={0.8} onPress={handleCreateEventSubmit}>
                <Text style={[styles.submitFormButtonText, { color: colors.background }]}>Publish Live Broadcast</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  headerBar: {
    height: 120,
    paddingTop: 50,
    paddingHorizontal: '6%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerTitleContainer: { flex: 1, justifyContent: 'center' },
  headerSub: { fontSize: 11, fontWeight: '900', color: '#eab308', letterSpacing: 2, textTransform: 'uppercase' },
  headerTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5, marginTop: 1 },
  hamburgerButton: { padding: 6, alignSelf: 'center' },

  profileHeroSection: { alignItems: 'center', marginTop: 24, paddingHorizontal: '8%' },
  avatarOutlineRing: {
    padding: 5,
    borderRadius: 60,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  profileName: { fontSize: 22, fontWeight: '900', marginTop: 16 },
  profileUsername: { fontSize: 13, fontWeight: '600', color: '#a1a1aa', marginTop: 2 },
  profileBio: { fontSize: 13, textAlign: 'center', marginTop: 12, lineHeight: 18, fontWeight: '500' },

  statsCardContainer: {
    flexDirection: 'row',
    marginHorizontal: '6%',
    borderRadius: 20,
    paddingVertical: 18,
    marginTop: 28,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  statSegment: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '900' },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: '100%' },

  organizeBannerButton: {
    flexDirection: 'row',
    marginHorizontal: '6%',
    borderRadius: 20,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  bannerLeftInfo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bannerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  bannerMainText: { fontSize: 14, fontWeight: '800' },
  bannerSubText: { fontSize: 11, fontWeight: '500', marginTop: 1 },

  sectionSectionWrapper: { marginTop: 32 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: '6%', marginBottom: 14 },
  sectionHeadingText: { fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },
  viewAllTextLink: { fontSize: 12, fontWeight: '700' },
  likedHorizontalScroll: { paddingLeft: '6%', paddingRight: 20, gap: 14 },
  eventMiniCard: {
    width: SCREEN_WIDTH * 0.44,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  eventMiniCardImage: { width: '100%', height: 105, backgroundColor: '#f4f4f5' },
  miniCategoryIndicator: { height: 3, width: '100%' },
  miniCardTextContent: { padding: 12 },
  miniEventTitle: { fontSize: 13, fontWeight: '800' },
  miniLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  miniLocationText: { fontSize: 10, fontWeight: '500', flex: 1 },
  insightsSubtext: { fontSize: 11, color: '#8b5cf6', fontWeight: '700', marginTop: 1 },

  bottomSheetBackdrop: { flex: 1, backgroundColor: 'rgba(24, 24, 27, 0.4)', justifyContent: 'flex-end' },
  analyticsSheetContainer: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  sheetHeaderIndicator: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetSubheading: { fontSize: 10, fontWeight: '900', color: '#a1a1aa', letterSpacing: 1.5, marginBottom: 4 },
  sheetTitleText: { fontSize: 20, fontWeight: '900', marginBottom: 24 },
  analyticsStatsGrid: { gap: 12, marginBottom: 12 },
  analyticCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  analyticValue: { fontSize: 20, fontWeight: '900', marginLeft: 12, marginRight: 6 },
  analyticLabel: { fontSize: 13, fontWeight: '600' },
  closeSheetButton: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  closeSheetButtonText: { fontSize: 13, fontWeight: '700' },

  menuOverlayBackground: { flex: 1, backgroundColor: 'rgba(24, 24, 27, 0.3)', justifyContent: 'flex-end', flexDirection: 'row' },
  hamburgerSidePanel: { width: SCREEN_WIDTH * 0.72, height: '100%', paddingHorizontal: 24, paddingBottom: 40 },
  panelTopHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50 },
  panelHeaderTitle: { fontSize: 16, fontWeight: '900' },
  panelDivider: { height: 1, marginVertical: 20 },
  panelRowLink: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  panelLinkText: { fontSize: 14, fontWeight: '600' },
  logoutActionLink: { marginTop: 'auto' },
  logoutLinkText: { fontSize: 14, fontWeight: '700', color: '#ef4444' },

  modalKeyboardAvoidingContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(24, 24, 27, 0.4)' },
  organizeModalWindow: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    maxHeight: SCREEN_HEIGHT * 0.88,
  },
  organizeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  organizeModalTitle: { fontSize: 18, fontWeight: '900' },
  organizeFormScroll: { marginTop: 4 },
  modalFormContentStyle: { paddingBottom: Platform.OS === 'ios' ? 44 : 24 },
  inputLabelText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6, marginTop: 14 },
  inputSubhintText: { fontSize: 11, color: '#a1a1aa', fontWeight: '500', marginBottom: 10, marginTop: -3 },
  formInputBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 13,
    fontWeight: '500',
  },
  multilineInputBox: { height: 76, paddingTop: 12, paddingBottom: 12, textAlignVertical: 'top' },
  formGridRow: { flexDirection: 'row', gap: 12 },
  gridColumnItem: { flex: 1 },

  mapContainerFrame: {
    height: 180,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
    marginTop: 4,
  },
  embeddedMapRender: { ...StyleSheet.absoluteFillObject },
  fixedPinOverlayContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -18,
    marginTop: -32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinShadowDot: { width: 6, height: 3, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.3)', marginTop: -2 },
  submitEventFormButton: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  submitFormButtonText: { fontSize: 14, fontWeight: '700' },
});