import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, useWindowDimensions,
} from 'react-native';
import { useFavorites } from '../context/FavoritesContext';

const Navbar = ({ onLogoPress, activeTab, setActiveTab, navigateTo }) => {
  const { favorites } = useFavorites();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const navItems = [
    { id: 'home',      label: 'Início',   icon: '🏠' },
    { id: 'favorites', label: 'Favoritos',icon: '❤️', count: favorites.length },
    { id: 'trending',  label: 'Em Alta',  icon: '🔥' },
    { id: 'search',    label: 'Buscar',   icon: '🔍' },
  ];

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'search') {
      navigateTo('search');
    } else {
      navigateTo('home');
      if (tabId === 'home') onLogoPress();
    }
  };

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={onLogoPress} style={styles.logoContainer} activeOpacity={0.8}>
        <Text style={styles.logoIcon}>🎬</Text>
        {!isMobile && (
          <Text style={styles.logoText}>
            Moacir<Text style={styles.logoAccent}>Films</Text>
          </Text>
        )}
      </TouchableOpacity>

      <View style={[styles.navItems, isMobile && styles.navItemsMobile]}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handleTabPress(item.id)}
            style={[styles.navItem, activeTab === item.id && styles.navItemActive]}
            activeOpacity={0.7}
          >
            {isMobile ? (
              <View style={styles.mobileTabInner}>
                <Text style={[styles.mobileTabIcon, activeTab === item.id && styles.mobileTabIconActive]}>
                  {item.icon}
                </Text>
                {item.count > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{item.count}</Text>
                  </View>
                )}
                {activeTab === item.id && <View style={styles.mobileIndicator} />}
              </View>
            ) : (
              <>
                <Text style={[styles.navItemText, activeTab === item.id && styles.navItemTextActive]}>
                  {item.label}{item.count > 0 ? ` (${item.count})` : ''}
                </Text>
                {activeTab === item.id && <View style={styles.navIndicator} />}
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Espaço para balancear o logo */}
      <View style={styles.navRight} />
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: 'rgba(10,10,15,0.98)',
    paddingHorizontal: 16, height: 60,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 36 },
  logoIcon: { fontSize: 20 },
  logoText: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  logoAccent: { color: '#e50914' },
  navItems: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' },
  navItemsMobile: { gap: 0 },
  navItem: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center', position: 'relative' },
  navItemActive: { backgroundColor: 'rgba(229,9,20,0.12)' },
  navItemText: { color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: '500' },
  navItemTextActive: { color: '#fff', fontWeight: '700' },
  navIndicator: { position: 'absolute', bottom: 2, width: 20, height: 2, backgroundColor: '#e50914', borderRadius: 2 },
  mobileTabInner: { alignItems: 'center', justifyContent: 'center', position: 'relative', paddingHorizontal: 2, paddingBottom: 2 },
  mobileTabIcon: { fontSize: 20, opacity: 0.6 },
  mobileTabIconActive: { opacity: 1 },
  mobileIndicator: { position: 'absolute', bottom: -2, width: 16, height: 2, backgroundColor: '#e50914', borderRadius: 2 },
  countBadge: { position: 'absolute', top: -4, right: -6, backgroundColor: '#e50914', borderRadius: 8, minWidth: 15, height: 15, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  countBadgeText: { color: '#fff', fontSize: 8, fontWeight: '800' },
  navRight: { minWidth: 36 },
});

export default Navbar;
