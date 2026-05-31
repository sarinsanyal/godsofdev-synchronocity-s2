import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, Dimensions, Image, TouchableOpacity, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MapView, { Region } from 'react-native-maps';
import { useAppTheme } from '../_layout'; 
import { useUser, useAuth } from '@clerk/expo';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker'; 

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const USER_PROFILE = {
  bio: 'Building experiences & finding the best street food hubs in the city. UI developer by day, tech wizard by night. ☕⚡',
  fallback_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
  fallback_image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500'
};

const INITIAL_REGION: Region = {
  latitude: 22.5726,
  longitude: 88.3639,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

export default function ProfileScreen() {
  const { theme, colors } = useAppTheme();
  const isDark = theme === 'dark';
  
  const { user } = useUser();
  const { signOut, getToken } = useAuth(); 

  // --- UI STATE ---
  const [menuVisible, setMenuVisible] = useState(false);
  const [organizeModalVisible, setOrganizeModalVisible] = useState(false);
  const [selectedOwnEvent, setSelectedOwnEvent] = useState<any | null>(null);
  const [selectedEventDetail, setSelectedEventDetail] = useState<any | null>(null); // NEW: For the detailed generic popup
  
  // --- DATA FETCHING STATE ---
  const [hostedEvents, setHostedEvents] = useState<any[]>([]);
  const [likedEvents, setLikedEvents] = useState<any[]>([]);
  const [rsvpedEvents, setRsvpedEvents] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- FORM STATE ---
  const [imageUri, setImageUri] = useState<string | null>(null); 
  const [eventTitle, setEventTitle] = useState('');
  const [eventSummary, setEventSummary] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [eventTags, setEventTags] = useState('');
  const [eventEmail, setEventEmail] = useState('');
  const [eventPhone, setEventPhone] = useState('');
  const [address, setAddress] = useState('');
  const [targetLocation, setTargetLocation] = useState({
    latitude: INITIAL_REGION.latitude,
    longitude: INITIAL_REGION.longitude
  });

  // --- FETCH DATA FROM EXPRESS BACKEND ---
  const fetchProfileData = async () => {
    if (!user?.id) return;
    setIsLoadingData(true);

    try {
      const token = await getToken();
      const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL; 
      
      if (!BASE_URL) {
         console.error("🚨 BASE_URL is missing! Check environment bundles.");
         return;
      }

      const headers = { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      };

      // 1. Fetch Hosted Events
      const eventsRes = await fetch(`${BASE_URL}/api/events`, { headers });
      if (!eventsRes.ok) throw new Error(`Events status: ${eventsRes.status}`);
      const allEvents = await eventsRes.json();
      const userHosted = allEvents.filter((e: any) => e.organizer_id === user?.id);
      setHostedEvents(userHosted);

      // 2. Fetch Liked Events
      try {
        const likedRes = await fetch(`${BASE_URL}/api/events/liked`, { headers });
        if (likedRes.ok) {
          const likedData = await likedRes.json();
          setLikedEvents(likedData);
        }
      } catch (err) {
        console.error("🚨 Error syncing liked components:", err);
      }

      // 3. Fetch Registered/RSVPed Events
      try {
        const rsvpRes = await fetch(`${BASE_URL}/api/events/rsvp`, { headers });
        if (rsvpRes.ok) {
          const rsvpData = await rsvpRes.json();
          setRsvpedEvents(rsvpData);
        }
      } catch (err) {
        console.error("🚨 Error syncing registration tickets:", err);
      }

    } catch (err: any) {
      console.error('❌ Error rendering secure core datasets:', err.message);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  }, [user?.id]);

  // --- IMAGE PICKER HANDLER ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload an image.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9], 
      quality: 0.7, 
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // --- CREATE EVENT SUBMISSION TO EXPRESS BACKEND ---
  const handleCreateEventSubmit = async () => {
    if (!eventTitle || !address || !user?.id) {
      Alert.alert('Missing Fields', 'Please supply an event headline and written structural address.');
      return;
    }

    try {
      const token = await getToken();
      const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL; 

      const formData = new FormData();
      formData.append('title', eventTitle);
      formData.append('summary', eventSummary);
      formData.append('description', eventDescription);
      formData.append('category', eventCategory);
      
      const tagsArray = eventTags ? eventTags.split(',').map(t => t.trim()) : [];
      formData.append('tags', JSON.stringify(tagsArray));
      
      formData.append('lat', String(targetLocation.latitude));
      formData.append('lng', String(targetLocation.longitude));
      
      formData.append('address', address);
      formData.append('contact_email', eventEmail);
      formData.append('contact_phone', eventPhone);

      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'upload.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('image', {
          uri: imageUri,
          name: filename,
          type: type,
        } as any);
      } else {
        formData.append('image_url', USER_PROFILE.fallback_image);
      }

      const response = await fetch(`${BASE_URL}/api/events`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Failed to publish event.');

      Alert.alert('Success! 🎉', 'Your custom community coordinate event mapping vector has been created.');
      setOrganizeModalVisible(false);
      
      setImageUri(null);
      setEventTitle(''); setEventSummary(''); setEventDescription('');
      setEventCategory(''); setEventTags(''); setAddress('');
      setEventEmail(''); setEventPhone('');
      
      fetchProfileData();
    } catch (err: any) {
      console.error('API insertion error:', err);
      Alert.alert('Publishing Error', err.message || 'Failed to connect to server.');
    }
  };

  const handleRegionChangeComplete = (region: Region) => {
    setTargetLocation({ latitude: region.latitude, longitude: region.longitude });
  };

  const handleSignOut = async () => {
    setMenuVisible(false);
    try {
      await signOut();
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category?.toLowerCase()) {
      case 'gaming': return '#8b5cf6';
      case 'food': return '#f97316';
      case 'tech': return '#06b6d4';
      case 'art': return '#ec4899';
      case 'wellness': return '#10b981';
      default: return '#3b82f6';
    }
  };

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

  const dynamicCardStyle = { backgroundColor: colors.cardBg, borderColor: colors.cardBorder };
  const inputThemeStyle = { backgroundColor: isDark ? '#18181b' : '#fafafa', borderColor: colors.cardBorder, color: colors.textPrimary };

  const displayAvatar = user?.imageUrl || USER_PROFILE.fallback_avatar;
  const displayName = user?.fullName || 'Community Member';
  const displayEmail = user?.primaryEmailAddress?.emailAddress || '@user';

  const gradientColors = isDark
    ? (['#09090b', '#18181b', '#27272a'] as const)
    : (['#ffffff', '#f4f4f5', '#e4e4e7'] as const);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFillObject} />
      
      <View style={[styles.headerBar, { backgroundColor: 'transparent', borderBottomColor: colors.cardBorder }]}>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Your Profile</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity onPress={fetchProfileData} activeOpacity={0.7}>
            <Ionicons name="refresh" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.hamburgerButton} onPress={() => setMenuVisible(true)} activeOpacity={0.7}>
            <Ionicons name="menu" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textPrimary} />
        }
      >
        
        {/* CENTRAL PROFILE HERO */}
        <View style={styles.profileHeroSection}>
          <View style={[styles.avatarOutlineRing, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Image source={{ uri: displayAvatar }} style={styles.avatarImage} />
          </View>
          <Text style={[styles.profileName, { color: colors.textPrimary }]}>{displayName}</Text>
          <Text style={styles.profileUsername}>{displayEmail}</Text>
          <Text style={[styles.profileBio, { color: colors.textSecondary }]}>{USER_PROFILE.bio}</Text>
        </View>

        {/* METRIC NUMERICAL GRID ROW */}
        <View style={[styles.statsCardContainer, dynamicCardStyle]}>
          <View style={styles.statSegment}>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{hostedEvents.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Hosted</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.statSegment}>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{rsvpedEvents.length}</Text> 
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Registered</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.statSegment}>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{likedEvents.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Saved</Text>
          </View>
        </View>

        {/* ACTION BANNER */}
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

        {isLoadingData ? (
          <ActivityIndicator size="large" color={colors.textPrimary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* LIVE DYNAMIC REGISTERED / RSVP EVENTS HORIZONTAL CAROUSEL */}
            <View style={styles.sectionSectionWrapper}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionHeadingText, { color: colors.textPrimary }]}>Registered Events 🎫</Text>
                {rsvpedEvents.length > 0 && <Text style={[styles.viewAllTextLink, { color: colors.textMuted }]}>Confirmed Ticket</Text>}
              </View>

              {rsvpedEvents.length === 0 ? (
                 <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>You haven&apos;t secured tickets to any events yet.</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.likedHorizontalScroll}>
                  {rsvpedEvents.map((event) => {
                    const themeColor = getCategoryColor(event.category);
                    return (
                      <TouchableOpacity 
                        key={`rsvp-${event.id}`} 
                        style={[styles.eventMiniCard, dynamicCardStyle]}
                        activeOpacity={0.85}
                        onPress={() => setSelectedEventDetail(event)}
                      >
                        <Image source={{ uri: event.image_url || USER_PROFILE.fallback_image }} style={styles.eventMiniCardImage} />
                        <View style={[styles.miniCategoryIndicator, { backgroundColor: themeColor }]} />
                        <View style={styles.miniCardTextContent}>
                          <Text style={[styles.miniEventTitle, { color: colors.textPrimary }]} numberOfLines={1}>{event.title}</Text>
                          <View style={styles.miniLocationRow}>
                            <Ionicons name="calendar-sharp" size={12} color="#10b981" />
                            <Text style={[styles.miniLocationText, { color: '#10b981', fontWeight: '700' }]} numberOfLines={1}>Pass Confirmed</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* HOSTED EVENTS */}
            <View style={styles.sectionSectionWrapper}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionHeadingText, { color: colors.textPrimary }]}>Your Events</Text>
                <Text style={[styles.viewAllTextLink, { color: colors.textMuted }]}>Engagement Insights</Text>
              </View>

              {hostedEvents.length === 0 ? (
                 <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>You haven&apos;t hosted any events yet.</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.likedHorizontalScroll}>
                  {hostedEvents.map((event) => {
                    const themeColor = getCategoryColor(event.category);
                    return (
                      <TouchableOpacity 
                        key={event.id} 
                        style={[styles.eventMiniCard, dynamicCardStyle]}
                        activeOpacity={0.85}
                        onPress={() => setSelectedEventDetail(event)}
                      >
                        <Image source={{ uri: event.image_url || USER_PROFILE.fallback_image }} style={styles.eventMiniCardImage} />
                        <View style={[styles.miniCategoryIndicator, { backgroundColor: themeColor }]} />
                        <View style={styles.miniCardTextContent}>
                          <Text style={[styles.miniEventTitle, { color: colors.textPrimary }]} numberOfLines={1}>{event.title}</Text>
                          <View style={styles.miniLocationRow}>
                            <Ionicons name="people" size={12} color="#8b5cf6" />
                            <Text style={styles.insightsSubtext}>{event.metrics?.rsvps || 0} active RSVPs</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* LIKED EVENTS */}
            <View style={styles.sectionSectionWrapper}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionHeadingText, { color: colors.textPrimary }]}>Liked Events</Text>
              </View>

              {likedEvents.length === 0 ? (
                 <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>No saved events. Start exploring!</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.likedHorizontalScroll}>
                  {likedEvents.map((event) => {
                    const themeColor = getCategoryColor(event.category);
                    return (
                      <TouchableOpacity 
                        key={event.id} 
                        style={[styles.eventMiniCard, dynamicCardStyle]}
                        activeOpacity={0.85}
                        onPress={() => setSelectedEventDetail(event)}
                      >
                        <Image source={{ uri: event.image_url || USER_PROFILE.fallback_image }} style={styles.eventMiniCardImage} />
                        <View style={[styles.miniCategoryIndicator, { backgroundColor: themeColor }]} />
                        <View style={styles.miniCardTextContent}>
                          <Text style={[styles.miniEventTitle, { color: colors.textPrimary }]} numberOfLines={1}>{event.title}</Text>
                          <View style={styles.miniLocationRow}>
                            <Ionicons name="location" size={12} color={colors.textMuted} />
                            <Text style={[styles.miniLocationText, { color: colors.textMuted }]} numberOfLines={1}>{event.address}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </>
        )}

        <TouchableOpacity 
          style={[styles.mainLogoutButton, { borderColor: colors.cardBorder, backgroundColor: isDark ? '#18181b' : '#fafafa' }]} 
          activeOpacity={0.7} 
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.mainLogoutText}>Sign Out of Account</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* 📋 DETAILED GENERIC EVENT MODAL */}
      {selectedEventDetail && (() => {
        const catTheme = getCategoryTheme(selectedEventDetail.category);
        const sharedCardStyle = { backgroundColor: colors.cardBg, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' };
        const imageUrl = selectedEventDetail.image_url || USER_PROFILE.fallback_image;

        const isRegistered = rsvpedEvents.some(e => e.id === selectedEventDetail.id);
        const isHosted = hostedEvents.some(e => e.id === selectedEventDetail.id);

        return (
          <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setSelectedEventDetail(null)}>
            <View style={styles.modalBlurOverlay}>
              <View style={[styles.centerHeroCard, sharedCardStyle]}>
                <Image source={{ uri: imageUrl }} style={styles.heroCardImage} />

                <TouchableOpacity 
                  style={styles.closeCardButton} 
                  onPress={() => setSelectedEventDetail(null)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={34} color="#ffffff" />
                </TouchableOpacity>

                <ScrollView 
                  style={{ flexShrink: 1 }}
                  contentContainerStyle={styles.heroCardContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={[styles.tagContainer, { backgroundColor: catTheme.bg, borderColor: catTheme.color }]}>
                    <Text style={[styles.categoryBadgeText, { color: catTheme.text }]}>
                      ⚡ {selectedEventDetail.category?.toUpperCase() || 'EVENT'}
                    </Text>
                  </View>

                  <Text style={[styles.heroCardTitle, { color: colors.textPrimary }]}>{selectedEventDetail.title}</Text>
                  <Text style={styles.heroCardSummary}>{selectedEventDetail.summary || 'Live Session'}</Text>
                  <Text style={[styles.heroCardDesc, { color: colors.textSecondary }]}>
                    {selectedEventDetail.description || 'No detailed layout description provided for this session.'}
                  </Text>

                  <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />

                  <View style={styles.metaRowPopup}>
                    <Ionicons name="location" size={16} color={catTheme.color} />
                    <Text style={[styles.metaTextPopup, { color: colors.textSecondary }]} numberOfLines={2}>
                      {selectedEventDetail.address || 'Location Details TBA'}
                    </Text>
                  </View>

                  {selectedEventDetail.contact_email && (
                    <View style={[styles.metaRowPopup, { marginTop: 8, marginBottom: 4 }]}>
                      <Ionicons name="mail" size={16} color={colors.textMuted} />
                      <Text style={[styles.metaTextPopup, { color: colors.textSecondary }]} numberOfLines={1}>
                        {selectedEventDetail.contact_email}
                      </Text>
                    </View>
                  )}

                  {/* DYNAMIC ACTION BUTTON BASED ON EVENT STATUS */}
                  {isHosted ? (
                    <TouchableOpacity
                      style={[styles.registerButton, { backgroundColor: '#3b82f6', borderColor: '#2563eb' }]}
                      activeOpacity={0.8}
                      onPress={() => {
                        setSelectedOwnEvent(selectedEventDetail);
                        setSelectedEventDetail(null); // Close main, open analytics
                      }}
                    >
                      <Ionicons name="analytics" size={20} color="#ffffff" />
                      <Text style={styles.registerButtonText}>View Insights</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.registerButton, 
                        isDark && { backgroundColor: '#064e3b', borderColor: '#047857' },
                        { backgroundColor: '#047857', opacity: 0.75, borderColor: '#064e3b' }
                      ]}
                      activeOpacity={1}
                      disabled={true}
                    >
                      <Ionicons 
                        name={isRegistered ? "checkmark-done-circle" : "heart"} 
                        size={20} 
                        color="#ffffff" 
                      />
                      <Text style={styles.registerButtonText}>
                        {isRegistered ? "Registered" : "Saved to Liked"}
                      </Text>
                    </TouchableOpacity>
                  )}

                </ScrollView>
              </View>
            </View>
          </Modal>
        );
      })()}

      {/* ANALYTICS INSIGHTS MODAL (For Hosted Events) */}
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
                    <Text style={[styles.analyticValue, { color: colors.textPrimary }]}>{selectedOwnEvent.metrics?.rsvps || 0}</Text>
                    <Text style={[styles.analyticLabel, { color: colors.textSecondary }]}>Going (RSVP)</Text>
                  </View>
                  
                  <View style={[styles.analyticCard, { borderColor: '#3b82f6', backgroundColor: isDark ? '#27272a' : '#fafafa' }]}>
                    <Ionicons name="bookmark-outline" size={22} color="#3b82f6" />
                    <Text style={[styles.analyticValue, { color: colors.textPrimary }]}>{selectedOwnEvent.metrics?.saves || 0}</Text>
                    <Text style={[styles.analyticLabel, { color: colors.textSecondary }]}>Interested / Saved</Text>
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

      {/* HAMBURGER MODAL PANEL */}
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
            <TouchableOpacity style={styles.panelRowLink} onPress={() => { setMenuVisible(false); Alert.alert('Settings', 'Account interface management node layout.'); }}>
              <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.panelLinkText, { color: colors.textSecondary }]}>Account Settings</Text>
            </TouchableOpacity>
            <View style={[styles.panelDivider, { marginTop: 'auto', backgroundColor: colors.cardBorder }]} />
            
            <TouchableOpacity style={[styles.panelRowLink, styles.logoutActionLink]} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text style={styles.logoutLinkText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* HOST MODAL WINDOW */}
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
              
              <Text style={[styles.inputLabelText, { color: colors.textMuted }]}>EVENT COVER IMAGE</Text>
              <TouchableOpacity 
                style={[styles.imagePickerBox, { borderColor: colors.cardBorder, backgroundColor: isDark ? '#18181b' : '#fafafa' }]} 
                onPress={pickImage}
                activeOpacity={0.8}
              >
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <Ionicons name="image-outline" size={32} color={colors.textMuted} />
                    <Text style={{ color: colors.textMuted, marginTop: 8, fontSize: 12, fontWeight: '600' }}>
                      Tap to upload cover photo
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

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
                  <Text style={[styles.inputLabelText, { color: colors.textMuted }]}>TAGS (Comma separated)</Text>
                  <TextInput style={[styles.formInputBox, inputThemeStyle]} placeholder="live, indie, chill" placeholderTextColor={colors.textMuted} value={eventTags} onChangeText={setEventTags} />
                </View>
              </View>

              <Text style={[styles.inputLabelText, { color: colors.textMuted }]}>PINPOINT EVENT LOCATION</Text>
              <Text style={styles.inputSubhintText}>Drag map to center focusing pin vector</Text>
              
              <View style={[styles.mapContainerFrame, { borderColor: colors.cardBorder }]}>
                <MapView 
                  style={styles.embeddedMapRender}
                  initialRegion={INITIAL_REGION}
                  onRegionChangeComplete={handleRegionChangeComplete}
                  showsUserLocation={true}
                  userInterfaceStyle={theme}
                />
                <View style={styles.fixedPinOverlayContainer} pointerEvents="none">
                  <Ionicons name="location" size={36} color={colors.textPrimary} />
                  <View style={styles.pinShadowDot} />
                </View>
              </View>

              <Text style={[styles.inputLabelText, { color: colors.textMuted }]}>WRITTEN VENUE ADDRESS</Text>
              <TextInput style={[styles.formInputBox, inputThemeStyle]} placeholder="e.g., Phase II Tech Enclave" placeholderTextColor={colors.textMuted} value={address} onChangeText={setAddress} />

              <Text style={[styles.inputLabelText, { color: colors.textMuted }]}>CONTACT EMAIL</Text>
              <TextInput style={[styles.formInputBox, inputThemeStyle]} placeholder="contact@host.com" placeholderTextColor={colors.textMuted} keyboardType="email-address" value={eventEmail} onChangeText={setEventEmail} autoCapitalize="none" />

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
  emptyStateText: { paddingHorizontal: '6%', fontSize: 13, fontStyle: 'italic' },
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

  mainLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: '6%',
    marginTop: 36,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  mainLogoutText: { color: '#ef4444', fontSize: 14, fontWeight: '700' },

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
    height: SCREEN_HEIGHT * 0.88, 
  },
  organizeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 },
  organizeModalTitle: { fontSize: 20, fontWeight: '900' },
  organizeFormScroll: { marginTop: 4 },
  modalFormContentStyle: { paddingBottom: Platform.OS === 'ios' ? 44 : 24 },
  
  imagePickerBox: {
    height: 160,
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePickerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

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
    marginTop: -36,
    alignItems: 'center',
  },
  pinShadowDot: {
    width: 8,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4,
    marginTop: -4,
  },
  
  submitEventFormButton: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  submitFormButtonText: { fontSize: 15, fontWeight: '800' },

  // NEW STYLES FROM DISCOVER SCREEN FOR THE DETAILED POPUP
  modalBlurOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(9, 9, 11, 0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  centerHeroCard: { width: SCREEN_WIDTH * 0.9, maxHeight: SCREEN_HEIGHT * 0.85, borderRadius: 36, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 24 }, shadowOpacity: 0.25, shadowRadius: 40, elevation: 20, borderWidth: 1 },
  heroCardImage: { width: '100%', height: SCREEN_HEIGHT * 0.24, backgroundColor: '#e4e4e7' },
  closeCardButton: { position: 'absolute', top: 20, right: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8, zIndex: 10 },
  heroCardContent: { padding: 28 },
  tagContainer: { borderWidth: 1, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginBottom: 12 },
  categoryBadgeText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  heroCardTitle: { fontSize: 24, fontWeight: '900', lineHeight: 30, letterSpacing: -0.5 },
  heroCardSummary: { fontSize: 15, color: '#eab308', fontWeight: '800', marginTop: 6 },
  heroCardDesc: { fontSize: 14, marginTop: 10, lineHeight: 22, opacity: 0.9 },
  dividerLine: { height: 1, marginTop: 16, marginBottom: 16, opacity: 0.6 },
  metaRowPopup: { flexDirection: 'row', alignItems: 'center' },
  metaTextPopup: { fontSize: 13, marginLeft: 10, fontWeight: '600', flex: 1 },
  registerButton: { width: '100%', height: 52, borderRadius: 16, backgroundColor: '#10b981', borderWidth: 1.5, borderColor: '#059669', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 10, shadowColor: '#10b981', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 },
  registerButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});