import React, { useEffect, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
  Platform,
  Share,
} from 'react-native';
import { useFavorites } from '../context/FavoritesContext';
import { useScrollContext } from '../context/ScrollContext';

const DetailScreen = ({ movie, onBack, onPlayMovie }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { handleScroll } = useScrollContext();


  const handleShare = async () => {
    const text = `🎬 ${movie.title} (${movie.year})\n⭐ ${movie.rating} | ${movie.duration}\n🎭 ${movie.genre.join(', ')}\n\n${movie.synopsis}\n\n▶ Trailer: ${movie.videoUrl}`;
    try {
      if (Platform.OS === 'web') {
        if (navigator?.share) {
          await navigator.share({ title: movie.title, text });
        } else {
          await navigator.clipboard.writeText(text);
          alert('Copiado para a área de transferência!');
        }
      } else if (Platform.OS === 'ios') {
        await Share.share({
          title: movie.title,
          message: `🎬 ${movie.title} (${movie.year})\n⭐ ${movie.rating} | ${movie.duration}\n🎭 ${movie.genre.join(', ')}\n\n${movie.synopsis}`,
          url: movie.videoUrl,
        });
      } else {
        await Share.share({ title: movie.title, message: text });
      }
    } catch (e) {}
  };
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const favorited = isFavorite(movie.id);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const backdropHeight = isMobile ? height * 0.45 : height * 0.6;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      onScroll={(e) => handleScroll(e.nativeEvent.contentOffset.y)}
      scrollEventThrottle={16}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Backdrop with ImageBackground */}
      <View style={{ height: backdropHeight }}>
        <ImageBackground
          source={{ uri: movie.backdrop }}
          style={styles.backdrop}
          resizeMode="cover"
        >
          {/* Overlay layers */}
          <View style={styles.backdropOverlayTop} />
          <View style={styles.backdropOverlayBottom} />
          <View style={[styles.backdropOverlayColor, { backgroundColor: `${movie.color}18` }]} />

          {/* Back Button */}
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <Text style={styles.backBtnText}>← Voltar</Text>
          </TouchableOpacity>

          {/* Title area inside banner */}
          <View style={[styles.backdropContent, isMobile && styles.backdropContentMobile]}>
            <View style={styles.genreRow}>
              {movie.genre.map((g) => (
                <View key={g} style={styles.genreChip}>
                  <Text style={styles.genreChipText}>{g}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.movieTitle, isMobile && styles.movieTitleMobile]}>
              {movie.title}
            </Text>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingStars}>⭐ {movie.rating}</Text>
              <Text style={styles.ratingDivider}>•</Text>
              <Text style={styles.ratingMeta}>{movie.year}</Text>
              <Text style={styles.ratingDivider}>•</Text>
              <Text style={styles.ratingMeta}>{movie.duration}</Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Main content */}
      <Animated.View
        style={[
          styles.mainContent,
          isMobile && styles.mainContentMobile,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Action Buttons — linha 1: Assistir + Favoritar */}
        <View style={styles.actionRowTop}>
          <TouchableOpacity style={styles.playBtn} activeOpacity={0.85} onPress={() => onPlayMovie(movie)}>
            <Text style={styles.playBtnText}>▶  Assistir Agora</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.favoriteLargeBtn, favorited && styles.favoriteLargeBtnActive]}
            onPress={() => toggleFavorite(movie)}
            activeOpacity={0.8}
          >
            <Text style={styles.favoriteLargeIcon}>{favorited ? '❤️' : '🤍'}</Text>
            <Text style={[styles.favoriteLargeText, favorited && styles.favoriteLargeTextActive]}>
              {favorited ? 'Favoritado' : 'Favoritar'}
            </Text>
          </TouchableOpacity>
        </View>
        {/* linha 2: Compartilhar */}
        <TouchableOpacity style={styles.shareBtn} activeOpacity={0.8} onPress={handleShare}>
          <Text style={styles.shareBtnText}>↗  Compartilhar</Text>
        </TouchableOpacity>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⭐ {movie.rating}</Text>
            <Text style={styles.statLabel}>Avaliação</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{movie.year}</Text>
            <Text style={styles.statLabel}>Ano</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{movie.duration}</Text>
            <Text style={styles.statLabel}>Duração</Text>
          </View>
        </View>

        {/* Synopsis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sinopse</Text>
          <Text style={styles.synopsisText}>{movie.synopsis}</Text>
        </View>

        {/* Director */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Direção</Text>
          <View style={styles.directorCard}>
            <View style={[styles.directorAvatar, { backgroundColor: movie.color }]}>
              <Text style={styles.directorAvatarText}>
                {movie.director.charAt(0)}
              </Text>
            </View>
            <View>
              <Text style={styles.directorName}>{movie.director}</Text>
              <Text style={styles.directorRole}>Diretor</Text>
            </View>
          </View>
        </View>

        {/* Cast */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Elenco Principal</Text>
          <View style={styles.castGrid}>
            {movie.cast.map((actor, index) => (
              <View key={actor} style={styles.castItem}>
                <View style={[styles.castAvatar, { backgroundColor: `${movie.color}${index % 2 === 0 ? 'cc' : '88'}` }]}>
                  <Text style={styles.castAvatarText}>{actor.charAt(0)}</Text>
                </View>
                <Text style={styles.castName} numberOfLines={2}>{actor}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gêneros</Text>
          <View style={styles.tagsRow}>
            {movie.genre.map((g) => (
              <View key={g} style={[styles.tag, { borderColor: movie.color }]}>
                <Text style={[styles.tagText, { color: movie.color }]}>{g}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'space-between',
  },
  backdropOverlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(10, 10, 15, 0.5)',
  },
  backdropOverlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
    backgroundColor: 'rgba(10, 10, 15, 0.92)',
  },
  backdropOverlayColor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backBtn: {
    margin: 20,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  backBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  backdropContent: {
    padding: 32,
    paddingBottom: 28,
  },
  backdropContentMobile: {
    padding: 20,
    paddingBottom: 20,
  },
  genreRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  genreChip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  genreChipText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '600',
  },
  movieTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
    marginBottom: 10,
    lineHeight: 46,
  },
  movieTitleMobile: {
    fontSize: 26,
    lineHeight: 32,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratingStars: {
    color: '#f5c518',
    fontWeight: '700',
    fontSize: 16,
  },
  ratingDivider: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 14,
  },
  ratingMeta: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  mainContent: {
    padding: 32,
    paddingTop: 24,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  mainContentMobile: {
    padding: 20,
    paddingTop: 20,
  },
  actionRowTop: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  playBtn: {
    backgroundColor: '#e50914',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 160,
    justifyContent: 'center',
  },
  playBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  favoriteLargeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  favoriteLargeBtnActive: {
    backgroundColor: 'rgba(229, 9, 20, 0.18)',
    borderColor: 'rgba(229, 9, 20, 0.4)',
  },
  favoriteLargeIcon: {
    fontSize: 18,
  },
  favoriteLargeText: {
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    fontSize: 14,
  },
  favoriteLargeTextActive: {
    color: '#ff6b7a',
  },
  shareBtn: {
    marginBottom: 28,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    marginBottom: 28,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  synopsisText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    lineHeight: 26,
  },
  directorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    alignSelf: 'flex-start',
  },
  directorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directorAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  directorName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  directorRole: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  castGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  castItem: {
    alignItems: 'center',
    width: 72,
  },
  castAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  castAvatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  castName: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 15,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  tag: {
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 24,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default DetailScreen;
