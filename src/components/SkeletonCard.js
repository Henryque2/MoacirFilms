import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, useWindowDimensions } from 'react-native';

const SkeletonCard = ({ containerWidth }) => {
  const { width: screenWidth } = useWindowDimensions();
  const width = containerWidth || screenWidth;
  const isMobile = width < 768;
  const GAP = 12;
  const GRID_PADDING = isMobile ? 24 : 48;
  const columns = isMobile ? 2 : Math.floor((width - GRID_PADDING) / (180 + GAP));
  const usableWidth = width - GRID_PADDING;
  const cardWidth = (usableWidth - GAP * (columns - 1)) / columns;
  const cardHeight = cardWidth * 1.5;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.shimmer, { opacity }]} />
      {/* Rating badge placeholder */}
      <Animated.View style={[styles.badge, { opacity }]} />
      {/* Fav button placeholder */}
      <Animated.View style={[styles.favBtn, { opacity }]} />
      {/* Footer placeholders */}
      <View style={styles.footer}>
        <Animated.View style={[styles.titleBar, { opacity }]} />
        <Animated.View style={[styles.titleBarShort, { opacity }]} />
        <Animated.View style={[styles.metaBar, { opacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
    margin: 6,
  },
  shimmer: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
  },
  badge: {
    position: 'absolute',
    top: 8, left: 8,
    width: 48, height: 20,
    borderRadius: 6,
    backgroundColor: '#2a2a3e',
  },
  favBtn: {
    position: 'absolute',
    top: 8, right: 8,
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: '#2a2a3e',
  },
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 10,
    gap: 6,
  },
  titleBar: {
    height: 14, borderRadius: 4,
    backgroundColor: '#2a2a3e',
    width: '90%',
  },
  titleBarShort: {
    height: 14, borderRadius: 4,
    backgroundColor: '#2a2a3e',
    width: '60%',
  },
  metaBar: {
    height: 10, borderRadius: 4,
    backgroundColor: '#2a2a3e',
    width: '40%',
    marginTop: 2,
  },
});

export default SkeletonCard;
