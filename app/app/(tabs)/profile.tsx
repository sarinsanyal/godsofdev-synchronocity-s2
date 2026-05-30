import React, { useState } from 'react';
import { StyleSheet, View, Text, Dimensions, Image, TouchableOpacity, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MapView, { Marker, Region } from 'react-native-maps';
import { MOCK_EVENTS } from '../../constants/mockData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const USER_PROFILE = {
  name: 'Aritra Chatterji',
  username: '@aritra_ch',
  bio: 'Building experiences & finding the best street food hubs in the city. UI developer by day, tech wizard by night. ☕⚡',
  avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
  stats: {
    hosted: 4,
    attended: 28,
    saved: 12
  }
};

// Initial map frame centerpoint (Defaulted to Kolkata coordinates)
const INITIAL_REGION: Region = {
  latitude: 22.5726,
  longitude: 88.3639,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

export default function ProfileScreen() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [organizeModalVisible, setOrganizeModalVisible] = useState(false);
  
  // Core Database Schema Matching States
  const [eventTitle, setEventTitle] = useState('');
  const [eventSummary, setEventSummary] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [eventTags, setEventTags] = useState('');
  const [eventEmail, setEventEmail] = useState('');
  const [eventPhone, setEventPhone] = useState('');
  
  // Timing States
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');

  // Composite Location States (Map tracking replaces manual coordinate text inputs)
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

  // Update internal location states when user finishes sliding/panning the map
  const handleRegionChangeComplete = (region: Region) => {
    setTargetLocation({
      latitude: region.latitude,
      longitude: region.longitude
    });
  };

  const handleCreateEventSubmit = () => {
    if (!eventTitle || !address) {
      Alert.alert('Missing Fields', 'Please supply an event headline and written structural address.');
      return;
    }

    const formattedTags = eventTags.split(',').map(tag => tag.trim()).filter(Boolean);

    // Final consolidated schema structure ready to save straight to Supabase/Postgres
    const databasePayload = {
      title: eventTitle,
      summary: eventSummary,
      description: eventDescription,
      category: eventCategory,
      tags: formattedTags,
      date: eventDate,
      time: eventTime,
      contact_email: eventEmail,
      contact_phone: eventPhone,
      location: {
        address: address,
        latitude: targetLocation.latitude,
        longitude: targetLocation.longitude
      }
    };

    console.log('Database transmission initiated payload:', databasePayload);
    Alert.alert('Success!', 'Your event coordinate vector mapping data has been processed.');
    
    // Reset fields cleanly
    setEventTitle('');
    setEventSummary('');
    setEventDescription('');
    setEventCategory('');
    setEventTags('');
    setEventEmail('');
    setEventPhone('');
    setEventDate('');
    setEventTime('');
    setAddress('');
    setTargetLocation({ latitude: INITIAL_REGION.latitude, longitude: INITIAL_REGION.longitude });
    setOrganizeModalVisible(false);
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER TOP BAR */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.hamburgerButton} onPress={() => setMenuVisible(true)} activeOpacity={0.7}>
          <Ionicons name="menu" size={26} color="#18181b" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* CENTRAL PROFILE HERO */}
        <View style={styles.profileHeroSection}>
          <View style={styles.avatarOutlineRing}>
            <Image source={{ uri: USER_PROFILE.avatar_url }} style={styles.avatarImage} />
          </View>
          <Text style={styles.profileName}>{USER_PROFILE.name}</Text>
          <Text style={styles.profileUsername}>{USER_PROFILE.username}</Text>
          <Text style={styles.profileBio}>{USER_PROFILE.bio}</Text>
        </View>

        {/* METRIC NUMERICAL GRID ROW */}
        <View style={styles.statsCardContainer}>
          <View style={styles.statSegment}>
            <Text style={styles.statValue}>{USER_PROFILE.stats.hosted}</Text>
            <Text style={styles.statLabel}>Hosted</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statSegment}>
            <Text style={styles.statValue}>{USER_PROFILE.stats.attended}</Text>
            <Text style={styles.statLabel}>Attended</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statSegment}>
            <Text style={styles.statValue}>{USER_PROFILE.stats.saved}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
        </View>

        {/* ORGANIZE EVENT BANNER */}
        <TouchableOpacity style={styles.organizeBannerButton} activeOpacity={0.9} onPress={() => setOrganizeModalVisible(true)}>
          <View style={styles.bannerLeftInfo}>
            <View style={styles.bannerIconBox}>
              <Ionicons name="flash" size={20} color="#eab308" />
            </View>
            <View>
              <Text style={styles.bannerMainText}>Gather the Community</Text>
              <Text style={styles.bannerSubText}>Organize your own live custom event</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward-circle" size={28} color="#18181b" />
        </TouchableOpacity>

        {/* HORIZONTAL LIKED EVENTS LIST */}
        <View style={styles.likedSectionWrapper}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeadingText}>Liked Events</Text>
            <TouchableOpacity><Text style={styles.viewAllTextLink}>See All</Text></TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.likedHorizontalScroll}>
            {likedEventsSample.map((event) => {
              const themeColor = getCategoryColor(event.category);
              return (
                <View key={event.id} style={styles.eventMiniCard}>
                  <Image source={{ uri: event.image_url }} style={styles.eventMiniCardImage} />
                  <View style={[styles.miniCategoryIndicator, { backgroundColor: themeColor }]} />
                  <View style={styles.miniCardTextContent}>
                    <Text style={styles.miniEventTitle} numberOfLines={1}>{event.title}</Text>
                    <View style={styles.miniLocationRow}>
                      <Ionicons name="location" size={12} color="#71717a" />
                      <Text style={styles.miniLocationText} numberOfLines={1}>{event.location.address}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

      </ScrollView>

      {/* HAMBURGER SIDE MODAL PANEL */}
      <Modal visible={menuVisible} transparent={true} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.menuOverlayBackground} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={styles.hamburgerSidePanel}>
            <View style={styles.panelTopHeader}>
              <Text style={styles.panelHeaderTitle}>Options</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={24} color="#18181b" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.panelDivider} />

            <TouchableOpacity style={styles.panelRowLink} onPress={() => { setMenuVisible(false); Alert.alert('Settings', 'Account interface router placeholder.'); }}>
              <Ionicons name="settings-outline" size={20} color="#4b5563" />
              <Text style={styles.panelLinkText}>Account Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.panelRowLink} onPress={() => { setMenuVisible(false); Alert.alert('Privacy', 'Security parameters matrix overlay.'); }}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#4b5563" />
              <Text style={styles.panelLinkText}>Privacy & Security</Text>
            </TouchableOpacity>

            <View style={[styles.panelDivider, { marginTop: 'auto' }]} />

            <TouchableOpacity style={[styles.panelRowLink, styles.logoutActionLink]} onPress={() => { setMenuVisible(false); Alert.alert('Logout', 'Cleaning session authorization token tokens...'); }}>
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text style={styles.logoutLinkText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 🏗️ HOST AN EVENT MODAL WITH INTERACTIVE MAP SELECTOR */}
      <Modal visible={organizeModalVisible} animationType="slide" transparent={true} onRequestClose={() => setOrganizeModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalKeyboardAvoidingContainer}>
          <View style={styles.organizeModalWindow}>
            <View style={styles.organizeHeader}>
              <Text style={styles.organizeModalTitle}>Host An Event</Text>
              <TouchableOpacity onPress={() => setOrganizeModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#a1a1aa" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.organizeFormScroll} contentContainerStyle={styles.modalFormContentStyle}>
              
              <Text style={styles.inputLabelText}>EVENT TITLE</Text>
              <TextInput style={styles.formInputBox} placeholder="e.g., Rooftop Jazz Mix" placeholderTextColor="#a1a1aa" value={eventTitle} onChangeText={setEventTitle} />

              <Text style={styles.inputLabelText}>SUMMARY OVERVIEW</Text>
              <TextInput style={styles.formInputBox} placeholder="Short highlight catchphrase" placeholderTextColor="#a1a1aa" value={eventSummary} onChangeText={setEventSummary} />

              <Text style={styles.inputLabelText}>FULL DESCRIPTION</Text>
              <TextInput style={[styles.formInputBox, styles.multilineInputBox]} placeholder="Provide detailed breakdowns..." placeholderTextColor="#a1a1aa" value={eventDescription} onChangeText={setEventDescription} multiline numberOfLines={3} />

              <View style={styles.formGridRow}>
                <View style={styles.gridColumnItem}>
                  <Text style={styles.inputLabelText}>CATEGORY</Text>
                  <TextInput style={styles.formInputBox} placeholder="Gaming, Music.." placeholderTextColor="#a1a1aa" value={eventCategory} onChangeText={setEventCategory} />
                </View>
                <View style={styles.gridColumnItem}>
                  <Text style={styles.inputLabelText}>TAGS</Text>
                  <TextInput style={styles.formInputBox} placeholder="live, indie, chill" placeholderTextColor="#a1a1aa" value={eventTags} onChangeText={setEventTags} />
                </View>
              </View>

              <View style={styles.formGridRow}>
                <View style={styles.gridColumnItem}>
                  <Text style={styles.inputLabelText}>EVENT DATE</Text>
                  <TextInput style={styles.formInputBox} placeholder="e.g., June 15, 2026" placeholderTextColor="#a1a1aa" value={eventDate} onChangeText={setEventDate} />
                </View>
                <View style={styles.gridColumnItem}>
                  <Text style={styles.inputLabelText}>STARTING TIME</Text>
                  <TextInput style={styles.formInputBox} placeholder="e.g., 6:00 PM IST" placeholderTextColor="#a1a1aa" value={eventTime} onChangeText={setEventTime} />
                </View>
              </View>

              {/* 🗺️ INTERACTIVE MAP POSITION PINNER SECTION */}
              <Text style={styles.inputLabelText}>PINPOINT EVENT LOCATION</Text>
              <Text style={styles.inputSubhintText}>Drag and scroll map to align the focal marker at the venue point</Text>
              
              <View style={styles.mapContainerFrame}>
                <MapView 
                  style={styles.embeddedMapRender}
                  initialRegion={INITIAL_REGION}
                  onRegionChangeComplete={handleRegionChangeComplete}
                  showsUserLocation={true}
                />
                {/* Fixed center target anchor mimicking real-world delivery application behaviors */}
                <View style={styles.fixedPinOverlayContainer} pointerEvents="none">
                  <Ionicons name="location" size={36} color="#18181b" />
                  <View style={styles.pinShadowDot} />
                </View>
              </View>

              {/* Coordinates readouts for direct real-time dynamic visibility validation */}
              <View style={styles.coordinateIndicatorRow}>
                <Text style={styles.coordinateItemText}>Lat: {targetLocation.latitude.toFixed(5)}</Text>
                <Text style={styles.coordinateItemText}>Long: {targetLocation.longitude.toFixed(5)}</Text>
              </View>

              <Text style={styles.inputLabelText}>WRITTEN VENUE ADDRESS</Text>
              <TextInput style={styles.formInputBox} placeholder="e.g., Room 302, Phase 2, IT Hub Buildings" placeholderTextColor="#a1a1aa" value={address} onChangeText={setAddress} />

              <Text style={styles.inputLabelText}>CONTACT EMAIL</Text>
              <TextInput style={styles.formInputBox} placeholder="contact@host.com" placeholderTextColor="#a1a1aa" keyboardType="email-address" value={eventEmail} onChangeText={setEventEmail} />

              <Text style={styles.inputLabelText}>CONTACT PHONE</Text>
              <TextInput style={styles.formInputBox} placeholder="+91 XXXXX XXXXX" placeholderTextColor="#a1a1aa" keyboardType="phone-pad" value={eventPhone} onChangeText={setEventPhone} />

              <TouchableOpacity style={styles.submitEventFormButton} activeOpacity={0.8} onPress={handleCreateEventSubmit}>
                <Text style={styles.submitFormButtonText}>Publish Live Broadcast</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { paddingBottom: 40 },
  
  headerBar: {
    height: 100,
    paddingTop: 50,
    paddingHorizontal: '6%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#18181b', letterSpacing: -0.5, flex: 1 },
  hamburgerButton: { padding: 4 },

  profileHeroSection: { alignItems: 'center', marginTop: 24, paddingHorizontal: '8%' },
  avatarOutlineRing: {
    padding: 5,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  profileName: { fontSize: 22, fontWeight: '900', color: '#18181b', marginTop: 16 },
  profileUsername: { fontSize: 13, fontWeight: '600', color: '#a1a1aa', marginTop: 2 },
  profileBio: { fontSize: 13, color: '#52525b', textAlign: 'center', marginTop: 12, lineHeight: 18, fontWeight: '500' },

  statsCardContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: '6%',
    borderRadius: 20,
    paddingVertical: 18,
    marginTop: 28,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  statSegment: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '900', color: '#18181b' },
  statLabel: { fontSize: 11, fontWeight: '600', color: '#71717a', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#f4f4f5', height: '100%' },

  organizeBannerButton: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    marginHorizontal: '6%',
    borderRadius: 20,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  bannerLeftInfo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bannerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  bannerMainText: { fontSize: 14, fontWeight: '800', color: '#18181b' },
  bannerSubText: { fontSize: 11, fontWeight: '500', color: '#71717a', marginTop: 1 },

  likedSectionWrapper: { marginTop: 32 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: '6%', marginBottom: 14 },
  sectionHeadingText: { fontSize: 16, fontWeight: '900', color: '#18181b', letterSpacing: -0.3 },
  viewAllTextLink: { fontSize: 12, fontWeight: '700', color: '#71717a' },
  likedHorizontalScroll: { paddingLeft: '6%', paddingRight: 20, gap: 14 },
  eventMiniCard: {
    width: SCREEN_WIDTH * 0.44,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    overflow: 'hidden',
  },
  eventMiniCardImage: { width: '100%', height: 105, backgroundColor: '#f4f4f5' },
  miniCategoryIndicator: { height: 3, width: '100%' },
  miniCardTextContent: { padding: 12 },
  miniEventTitle: { fontSize: 13, fontWeight: '800', color: '#18181b' },
  miniLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  miniLocationText: { fontSize: 10, color: '#71717a', fontWeight: '500', flex: 1 },

  menuOverlayBackground: { flex: 1, backgroundColor: 'rgba(24, 24, 27, 0.3)', justifyContent: 'flex-end', flexDirection: 'row' },
  hamburgerSidePanel: { width: SCREEN_WIDTH * 0.72, height: '100%', backgroundColor: '#ffffff', paddingHorizontal: 24, paddingBottom: 40 },
  panelTopHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50 },
  panelHeaderTitle: { fontSize: 16, fontWeight: '900', color: '#18181b' },
  panelDivider: { height: 1, backgroundColor: '#f4f4f5', marginVertical: 20 },
  panelRowLink: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  panelLinkText: { fontSize: 14, fontWeight: '600', color: '#4b5563' },
  logoutActionLink: { marginTop: 'auto' },
  logoutLinkText: { fontSize: 14, fontWeight: '700', color: '#ef4444' },

  // Expandable form architecture
  modalKeyboardAvoidingContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(24, 24, 27, 0.4)' },
  organizeModalWindow: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    maxHeight: SCREEN_HEIGHT * 0.88,
  },
  organizeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  organizeModalTitle: { fontSize: 18, fontWeight: '900', color: '#18181b' },
  organizeFormScroll: { marginTop: 4 },
  modalFormContentStyle: { paddingBottom: Platform.OS === 'ios' ? 44 : 24 },
  inputLabelText: { fontSize: 10, fontWeight: '800', color: '#71717a', letterSpacing: 0.5, marginBottom: 6, marginTop: 14 },
  inputSubhintText: { fontSize: 11, color: '#a1a1aa', fontWeight: '500', marginBottom: 10, marginTop: -3 },
  formInputBox: {
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 13,
    color: '#18181b',
    fontWeight: '500',
    backgroundColor: '#fafafa',
  },
  multilineInputBox: {
    height: 76,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top'
  },
  formGridRow: { flexDirection: 'row', gap: 12 },
  gridColumnItem: { flex: 1 },

  // Map elements layout specs
  mapContainerFrame: {
    height: 180,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e4e4e7',
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
  pinShadowDot: {
    width: 6,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginTop: -2,
  },
  coordinateIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 6,
  },
  coordinateItemText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#71717a',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  submitEventFormButton: {
    backgroundColor: '#18181b',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  submitFormButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
});