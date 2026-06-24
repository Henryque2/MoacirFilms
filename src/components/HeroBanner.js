import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { useFavorites } from '../context/FavoritesContext';
import { useTransition } from '../context/TransitionContext';

const SLIDE_INTERVAL = 6000; // ms entre cada troca
const FADE_DURATION = 700;   // ms da transição de fade

const HeroBanner = ({ movies, onPress, onPlay }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { expand } = useTransition();
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const bannerHeight = isMobile ? height * 0.55 : height * 0.7;

  // Se receber um único filme (compatibilidade), transforma em array
  const featuredList = Array.isArray(movies) ? movies : [movies];
  const hasMultiple = featuredList.length > 1;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(null);

  // Opacidade do slide atual e do próximo
  const currentOpacity = useRef(new Animated.Value(1)).current;
  const nextOpacity = useRef(new Animated.Value(0)).current;
  // Conteúdo (título, sinopse, etc.) faz fade separado
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentSlide = useRef(new Animated.Value(0)).current;

  const timerRef = useRef(null);
  const isTransitioning = useRef(false);

  const movie = featuredList[currentIndex];
  const favorited = isFavorite(movie.id);

  const goToIndex = useCallback((idx) => {
    if (isTransitioning.current || !hasMultiple) return;
    isTransitioning.current = true;

    const next = (idx + featuredList.length) % featuredList.length;
    setNextIndex(next);
    nextOpacity.setValue(0);

    // 1) fade out conteúdo
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 0, duration: FADE_DURATION / 2, useNativeDriver: true }),
      Animated.timing(contentSlide, { toValue: -20, duration: FADE_DURATION / 2, useNativeDriver: true }),
    ]).start(() => {
      // 2) crossfade do background
      Animated.parallel([
        Animated.timing(currentOpacity, { toValue: 0, duration: FADE_DURATION, useNativeDriver: true }),
        Animated.timing(nextOpacity, { toValue: 1, duration: FADE_DURATION, useNativeDriver: true }),
      ]).start(() => {
        // 3) troca o índice e restaura
        setCurrentIndex(next);
        setNextIndex(null);
        currentOpacity.setValue(1);
        nextOpacity.setValue(0);
        contentSlide.setValue(20);

        Animated.parallel([
          Animated.timing(contentOpacity, { toValue: 1, duration: FADE_DURATION / 2, useNativeDriver: true }),
          Animated.timing(contentSlide, { toValue: 0, duration: FADE_DURATION / 2, useNativeDriver: true }),
        ]).start(() => {
          isTransitioning.current = false;
        });
      });
    });
  }, [featuredList.length, hasMultiple]);

  const advance = useCallback(() => {
    goToIndex(currentIndex + 1);
  }, [currentIndex, goToIndex]);

  // Timer automático
  useEffect(() => {
    if (!hasMultiple) return;
    timerRef.current = setInterval(advance, SLIDE_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [advance, hasMultiple]);

  // Reinicia o timer ao navegar manualmente
  const goManual = (idx) => {
    clearInterval(timerRef.current);
    goToIndex(idx);
    timerRef.current = setInterval(() => {
      setCurrentIndex((cur) => {
        goToIndex(cur + 1);
        return cur;
      });
    }, SLIDE_INTERVAL);
  };

  const nextMovie = nextIndex !== null ? featuredList[nextIndex] : null;

  return (
    <View style={[styles.bannerContainer, { height: bannerHeight }]}>

      {/* Slide atual */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: currentOpacity }]}>
        <ImageBackground
          source={{ uri: movie.backdrop }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlayTop} />
          <View style={styles.overlayBottom} />
          <View style={[styles.overlayColor, { backgroundColor: `${movie.color}22` }]} />
        </ImageBackground>
      </Animated.View>

      {/* Próximo slide (crossfade) */}
      {nextMovie && (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: nextOpacity }]}>
          <ImageBackground
            source={{ uri: nextMovie.backdrop }}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <View style={styles.overlayTop} />
            <View style={styles.overlayBottom} />
            <View style={[styles.overlayColor, { backgroundColor: `${nextMovie.color}22` }]} />
          </ImageBackground>
        </Animated.View>
      )}

      {/* Conteúdo animado */}
      <Animated.View
        style={[
          styles.bannerContent,
          isMobile && styles.bannerContentMobile,
          { opacity: contentOpacity, transform: [{ translateY: contentSlide }] },
        ]}
      >
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>⭐ EM DESTAQUE</Text>
        </View>

        <View style={styles.genreTags}>
          {movie.genre.slice(0, 3).map((g) => (
            <View key={g} style={styles.genreTag}>
              <Text style={styles.genreTagText}>{g}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.bannerTitle, isMobile && styles.bannerTitleMobile]}>
          {movie.title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaRating}>⭐ {movie.rating}</Text>
          <View style={styles.metaDot} />
          <Text style={styles.metaText}>{movie.year}</Text>
          <View style={styles.metaDot} />
          <Text style={styles.metaText}>{movie.duration}</Text>
        </View>

        <Text
          style={[styles.bannerSynopsis, isMobile && styles.bannerSynopsisMobile]}
          numberOfLines={isMobile ? 2 : 3}
        >
          {movie.synopsis}
        </Text>

        <View style={styles.bannerActions}>
          <TouchableOpacity
            style={styles.watchBtn}
            onPress={() => onPlay ? onPlay(movie) : onPress(movie)}
            activeOpacity={0.85}
          >
            <Text style={styles.watchBtnText}>▶  Assistir Agora</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.favoriteBtn, favorited && styles.favoriteBtnActive]}
            onPress={() => toggleFavorite(movie)}
            activeOpacity={0.8}
          >
            <Text style={styles.favoriteBtnText}>{favorited ? '❤️' : '🤍'}</Text>
            <Text style={[styles.favoriteBtnLabel, favorited && styles.favoriteBtnLabelActive]}>
              {favorited ? 'Favoritado' : 'Favoritar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoBtn}
            onPress={() => { const { width: w, height: h } = Dimensions.get('window'); expand({ x: w*0.1, y: h*0.2, width: w*0.8, height: h*0.5 }, movie, () => onPress(movie)); }}
            activeOpacity={0.8}
          >
            <Text style={styles.infoBtnText}>ℹ  Detalhes</Text>
          </TouchableOpacity>
        </View>

        {/* Indicadores de ponto — só se houver mais de um featured */}
        {hasMultiple && (
          <View style={styles.dots}>
            {featuredList.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => goManual(i)}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <View style={[styles.dot, i === currentIndex && styles.dotActive]} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Animated.View>

      {/* Setas de navegação — só no desktop e com múltiplos filmes */}
      {hasMultiple && !isMobile && (
        <>
          <TouchableOpacity
            style={[styles.arrow, styles.arrowLeft]}
            onPress={() => goManual(currentIndex - 1)}
            activeOpacity={0.8}
          >
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.arrow, styles.arrowRight]}
            onPress={() => goManual(currentIndex + 1)}
            activeOpacity={0.8}
          >
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayTop: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: '35%', backgroundColor: 'rgba(10,10,15,0.6)',
  },
  overlayBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '70%', backgroundColor: 'rgba(10,10,15,0.9)',
  },
  overlayColor: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  bannerContent: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 40,
    paddingBottom: 44,
    maxWidth: 680,
  },
  bannerContentMobile: {
    padding: 20,
    paddingBottom: 28,
  },
  featuredBadge: {
    backgroundColor: '#e50914',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 4, alignSelf: 'flex-start', marginBottom: 12,
  },
  featuredText: {
    color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1.5,
  },
  genreTags: {
    flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap',
  },
  genreTag: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
  },
  genreTagText: {
    color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600',
  },
  bannerTitle: {
    fontSize: 48, fontWeight: '900', color: '#fff',
    marginBottom: 12, lineHeight: 54, letterSpacing: -1,
  },
  bannerTitleMobile: { fontSize: 28, lineHeight: 34 },
  metaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14,
  },
  metaRating: { color: '#f5c518', fontSize: 14, fontWeight: '700' },
  metaDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  metaText: { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '500' },
  bannerSynopsis: {
    color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 24, marginBottom: 24,
  },
  bannerSynopsisMobile: { fontSize: 13, lineHeight: 20, marginBottom: 18 },
  bannerActions: {
    flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap',
  },
  watchBtn: {
    backgroundColor: '#e50914', paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 8, flexDirection: 'row', alignItems: 'center',
  },
  watchBtnText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.3 },
  favoriteBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  favoriteBtnActive: {
    backgroundColor: 'rgba(229,9,20,0.2)', borderColor: 'rgba(229,9,20,0.5)',
  },
  favoriteBtnText: { fontSize: 16 },
  favoriteBtnLabel: { color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: 14 },
  favoriteBtnLabelActive: { color: '#ff6b7a' },
  infoBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  infoBtnText: { color: 'rgba(255,255,255,0.7)', fontWeight: '600', fontSize: 14 },
  // Dots
  dots: {
    flexDirection: 'row', gap: 8, marginTop: 20, alignItems: 'center',
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    width: 22, height: 6, borderRadius: 3,
    backgroundColor: '#e50914',
  },
  // Setas desktop
  arrow: {
    position: 'absolute', top: '50%', marginTop: -24,
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  arrowLeft: { left: 20 },
  arrowRight: { right: 20 },
  arrowText: { color: '#fff', fontSize: 32, lineHeight: 40, fontWeight: '300' },
});

export default HeroBanner;
