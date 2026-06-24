import React, { useState, useRef } from 'react';
import {
  View, Text, ImageBackground, TouchableOpacity,
  StyleSheet, useWindowDimensions, Animated,
} from 'react-native';
import { useFavorites } from '../context/FavoritesContext';
import { useTransition } from '../context/TransitionContext';

const MovieCard = ({ movie, onPress, index = 0, containerWidth }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { expand } = useTransition();
  const { width: screenWidth } = useWindowDimensions();
  const width = containerWidth || screenWidth;
  const isMobile = width < 768;
  const GAP = 12;
  const GRID_PADDING = isMobile ? 24 : 48; // grid paddingHorizontal * 2
  const columns = isMobile ? 2 : Math.floor((width - GRID_PADDING) / (180 + GAP));
  const usableWidth = width - GRID_PADDING;
  const cardWidth = (usableWidth - GAP * (columns - 1)) / columns;
  const cardHeight = cardWidth * 1.5;
  const favorited = isFavorite(movie.id);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const cardRef = useRef(null);

  const onLoad = () => {
    setImageLoaded(true);
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 350,
      delay: (index % 6) * 60,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    // Mede a posição absoluta do card na tela e dispara a transição
    if (cardRef.current) {
      cardRef.current.measure((fx, fy, w, h, px, py) => {
        expand({ x: px, y: py, width: w, height: h }, movie, () => {
          onPress(movie);
        });
      });
    } else {
      onPress(movie);
    }
  };

  return (
    <Animated.View
      ref={cardRef}
      style={[
        { opacity: imageLoaded ? fadeAnim : 0 },
        { transform: [{ translateY: imageLoaded ? fadeAnim.interpolate({ inputRange: [0,1], outputRange: [16, 0] }) : 16 }] },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.88}
        style={[styles.card, { width: cardWidth, height: cardHeight }]}
      >
        <ImageBackground
          source={{ uri: movie.image }}
          style={styles.cardImage}
          resizeMode="cover"
          borderRadius={12}
          onLoad={onLoad}
        >
          <View style={styles.cardOverlay} />

          <View style={styles.topLeft}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {movie.rating}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.favBtn}
            onPress={(e) => { e.stopPropagation?.(); toggleFavorite(movie); }}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.favIcon}>{favorited ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>

          <View style={styles.cardFooter}>
            <Text style={styles.cardTitle} numberOfLines={2}>{movie.title}</Text>
            <View style={styles.cardMeta}>
              <Text style={styles.cardYear}>{movie.year}</Text>
              <Text style={styles.cardGenre}>{movie.genre[0]}</Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12, overflow: 'hidden',
    backgroundColor: '#1a1a2e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  cardImage: { flex: 1, justifyContent: 'space-between', padding: 0 },
  cardOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '45%', backgroundColor: 'rgba(5,5,15,0.82)',
    borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
  },
  topLeft: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', gap: 4 },
  ratingBadge: { backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  ratingText: { color: '#f5c518', fontSize: 10, fontWeight: '700' },
  favBtn: { position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  favIcon: { fontSize: 14 },
  cardFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10 },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '700', lineHeight: 18, marginBottom: 4 },
  cardMeta: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  cardYear: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '500' },
  cardGenre: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '500' },
});

export default MovieCard;
