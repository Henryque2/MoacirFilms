import React, { useState, useMemo, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import HeroBanner from '../components/HeroBanner';
import MovieCard from '../components/MovieCard';
import SkeletonCard from '../components/SkeletonCard';
import CategoryFilter from '../components/CategoryFilter';
import { MOVIES, CATEGORIES, getFeaturedMovies, getMoviesByCategory } from '../data/movies';
import { useFavorites } from '../context/FavoritesContext';
import { useScrollContext } from '../context/ScrollContext';

const HomeScreen = ({ navigateTo, activeTab, onPlayMovie }) => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const { favorites } = useFavorites();
  const { handleScroll } = useScrollContext();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [loading, setLoading] = useState(true);

  const featuredMovies = getFeaturedMovies();
  // Simula carregamento inicial com skeletons
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const displayedMovies = useMemo(() => {
    if (activeTab === 'favorites') return favorites;
    if (activeTab === 'trending') return [...MOVIES].sort((a, b) => b.rating - a.rating);
    return getMoviesByCategory(selectedCategory);
  }, [activeTab, selectedCategory, favorites]);

  const handleMoviePress = (movie) => navigateTo('detail', movie);

  const sectionTitle = activeTab === 'favorites' ? `❤️ Meus Favoritos (${favorites.length})` : activeTab === 'trending' ? '🔥 Em Alta' : '🎬 Catálogo';

  const skeletonCount = isMobile ? 6 : 8;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      onScroll={(e) => handleScroll(e.nativeEvent.contentOffset.y)}
      scrollEventThrottle={16}
    >
      {activeTab === 'home' && (
        <HeroBanner movies={featuredMovies} onPress={handleMoviePress} onPlay={onPlayMovie} />
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{sectionTitle}</Text>
        {activeTab === 'home' && (
          <CategoryFilter
            categories={CATEGORIES}
            activeCategory={selectedCategory}
            onSelect={(cat) => { setLoading(true); setSelectedCategory(cat); setTimeout(() => setLoading(false), 400); }}
          />
        )}
      </View>

      {loading ? (
        <View style={[styles.grid, { paddingHorizontal: isMobile ? 12 : 24 }]}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <SkeletonCard key={i} containerWidth={width} />
          ))}
        </View>
      ) : displayedMovies.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>{activeTab === 'favorites' ? '💔' : '🎬'}</Text>
          <Text style={styles.emptyTitle}>
            {activeTab === 'favorites' ? 'Nenhum favorito ainda' : 'Nenhum filme encontrado'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'favorites' ? 'Explore o catálogo e favorite seus filmes preferidos' : 'Tente outra categoria'}
          </Text>
        </View>
      ) : (
        <View style={[styles.grid, { paddingHorizontal: isMobile ? 12 : 24 }]}>
          {displayedMovies.map((movie, i) => (
            <MovieCard key={movie.id} movie={movie} onPress={handleMoviePress} index={i} containerWidth={width} />
          ))}
        </View>
      )}

      <View style={styles.bottomPad} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  scrollContent: { flexGrow: 1 },
  sectionHeader: { paddingTop: 28, paddingHorizontal: 24 },
  sectionTitle: { color: '#ffffff', fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { color: 'rgba(255,255,255,0.45)', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  bottomPad: { height: 24 },
});

export default HomeScreen;
