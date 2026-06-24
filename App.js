import React, { useState, useEffect } from 'react';
import { StyleSheet, Animated, Platform, View, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FavoritesProvider, useFavorites } from './src/context/FavoritesContext';
import { ScrollProvider, useScrollContext, NAVBAR_CONTENT_HEIGHT } from './src/context/ScrollContext';
import { TransitionProvider, useTransition } from './src/context/TransitionContext';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import Navbar from './src/components/Navbar';
import Footer from './src/components/Footer';
import VideoPlayer from './src/components/VideoPlayer';
import TransitionOverlay from './src/components/TransitionOverlay';

function AppInner() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [activeTab, setActiveTab] = useState('home');
  const [playerVisible, setPlayerVisible] = useState(false);
  const [playerMovie, setPlayerMovie] = useState(null);

  const insets = useSafeAreaInsets();
  const { loaded } = useFavorites();
  const { visible: transitionVisible, collapse, phase } = useTransition();
  const {
    navbarTranslate, footerTranslate,
    contentPaddingTop, contentPaddingBottom,
    setNavbarTotalHeight,
  } = useScrollContext();

  useEffect(() => {
    const totalHeight = NAVBAR_CONTENT_HEIGHT + insets.top;
    setNavbarTotalHeight(totalHeight);
  }, [insets.top]);

  // Botão voltar nativo Android
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onBackPress = () => {
      if (playerVisible) { closePlayer(); return true; }
      // Se o overlay de transição está aberto, fecha com animação
      if (transitionVisible) { collapse(() => setCurrentScreen('home')); return true; }
      if (currentScreen === 'search') { goHome(); return true; }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [currentScreen, playerVisible, transitionVisible]);

  const navigateTo = (screen, movie = null) => {
    if (screen !== 'detail') setCurrentScreen(screen);
  };

  const goHome = () => {
    setCurrentScreen('home');
    setActiveTab('home');
  };

  const openPlayer = (movie) => { setPlayerMovie(movie); setPlayerVisible(true); };
  const closePlayer = () => { setPlayerVisible(false); setPlayerMovie(null); };

  const bgColor = '#0a0a0f';

  if (!loaded) return <View style={{ flex: 1, backgroundColor: '#0a0a0f' }} />;

  return (
    <View style={[styles.root, { backgroundColor: bgColor }]}>
      <StatusBar style="light" backgroundColor="#0a0a0f" />

      <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
        <Animated.View style={[styles.navbarWrapper, { transform: [{ translateY: navbarTranslate }] }]}>
          <View style={{ height: insets.top, backgroundColor: 'rgba(10,10,15,0.98)' }} />
          <Navbar
            onLogoPress={goHome}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            navigateTo={navigateTo}
          />
        </Animated.View>

        <Animated.View style={[styles.content, { paddingTop: contentPaddingTop, paddingBottom: contentPaddingBottom }]}>
          {currentScreen === 'home' && (
            <HomeScreen
              navigateTo={navigateTo}
              activeTab={activeTab}
              onPlayMovie={openPlayer}
            />
          )}
          {currentScreen === 'search' && (
            <SearchScreen navigateTo={navigateTo} />
          )}
        </Animated.View>

        <Animated.View style={[styles.footerWrapper, { transform: [{ translateY: footerTranslate }] }]}>
          <Footer />
          <View style={{ height: insets.bottom, backgroundColor: 'rgba(5,5,10,0.98)' }} />
        </Animated.View>
      </Animated.View>

      {/* Overlay da transição expand — fica acima de tudo */}
      <TransitionOverlay onPlayMovie={openPlayer} />

      {playerMovie && (
        <VideoPlayer
          visible={playerVisible}
          onClose={closePlayer}
          videoUrl={playerMovie.videoUrl}
          title={playerMovie.title}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <FavoritesProvider>
        <TransitionProvider>
          <ScrollProvider>
            <AppInner />
          </ScrollProvider>
        </TransitionProvider>
      </FavoritesProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  navbarWrapper: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    ...Platform.select({ web: { position: 'fixed' } }),
  },
  content: { flex: 1 },
  footerWrapper: {
    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100,
    ...Platform.select({ web: { position: 'fixed' } }),
  },
});
