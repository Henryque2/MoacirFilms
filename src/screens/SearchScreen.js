import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { MOVIES, CATEGORIES } from '../data/movies';
import { useFavorites } from '../context/FavoritesContext';
import { useScrollContext } from '../context/ScrollContext';
import MovieCard from '../components/MovieCard';
import SkeletonCard from '../components/SkeletonCard';

const STORAGE_KEY = '@cineverse_search_history';

const loadHistory = () => {
  try {
    const raw = typeof localStorage !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY)
      : null;
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveHistory = (history) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  } catch {}
};

// Destaca o termo buscado no texto
const HighlightText = ({ text, highlight, style, numberOfLines }) => {
  if (!highlight || !text.toLowerCase().includes(highlight.toLowerCase())) {
    return <Text style={style} numberOfLines={numberOfLines}>{text}</Text>;
  }
  const idx = text.toLowerCase().indexOf(highlight.toLowerCase());
  const before = text.slice(0, idx);
  const match  = text.slice(idx, idx + highlight.length);
  const after  = text.slice(idx + highlight.length);
  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {before}
      <Text style={styles.highlight}>{match}</Text>
      {after}
    </Text>
  );
};

const SearchScreen = ({ navigateTo }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { handleScroll } = useScrollContext();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState(null);
  const [minRating, setMinRating] = useState(0);
  const [minYear, setMinYear] = useState(null);
  const [history, setHistory] = useState(() => loadHistory());
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchBarHeight, setSearchBarHeight] = useState(114);
  const filtersHeight = useRef(new Animated.Value(0)).current;

  const isSearching = query.trim().length > 0 || activeGenre || minRating > 0 || minYear;

  // Filtro combinado
  const results = MOVIES.filter((m) => {
    const q = query.trim().toLowerCase();
    const matchText = !q || (
      m.title.toLowerCase().includes(q) ||
      m.genre.some((g) => g.toLowerCase().includes(q)) ||
      m.director.toLowerCase().includes(q) ||
      m.cast.some((a) => a.toLowerCase().includes(q))
    );
    const matchGenre  = !activeGenre || m.genre.includes(activeGenre);
    const matchRating = m.rating >= minRating;
    const matchYear   = !minYear || m.year >= minYear;
    return matchText && matchGenre && matchRating && matchYear;
  });

  // Sugestões quando campo vazio
  const topRated  = [...MOVIES].sort((a, b) => b.rating - a.rating).slice(0, isMobile ? 4 : 6);
  const recent    = [...MOVIES].sort((a, b) => b.year - a.year).slice(0, isMobile ? 4 : 6);

  const toggleFilters = () => {
    const toValue = showFilters ? 0 : 1;
    setShowFilters(!showFilters);
    Animated.spring(filtersHeight, { toValue, useNativeDriver: false, tension: 80, friction: 12 }).start();
  };

  const handleSearch = (text) => {
    setQuery(text);
    if (text.trim().length > 0) setLoading(true);
    setTimeout(() => setLoading(false), 300);
  };

  const commitSearch = (text) => {
    const q = text.trim();
    if (!q) return;
    const next = [q, ...history.filter((h) => h !== q)].slice(0, 8);
    setHistory(next);
    saveHistory(next);
  };

  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const removeHistory = (item) => {
    const next = history.filter((h) => h !== item);
    setHistory(next);
    saveHistory(next);
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  const handleMoviePress = (movie) => {
    commitSearch(query);
    navigateTo('detail', movie);
  };


  const RATINGS = [0, 6, 7, 8, 9];
  const YEARS   = [null, 2020, 2015, 2010, 2000];

  const filtersPanelHeight = filtersHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  return (
    <View style={styles.container}>
      {/* Search bar fixa */}
      <View style={styles.searchBar} onLayout={(e) => setSearchBarHeight(e.nativeEvent.layout.height)}>
        <View style={styles.inputRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Buscar filme, gênero, diretor ou ator..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={query}
            onChangeText={handleSearch}
            onSubmitEditing={() => commitSearch(query)}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearQuery} style={styles.clearBtn} activeOpacity={0.7}>
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Botão de filtros */}
        <TouchableOpacity
          style={[styles.filterToggle, showFilters && styles.filterToggleActive]}
          onPress={toggleFilters}
          activeOpacity={0.8}
        >
          <Text style={styles.filterToggleText}>⚙ Filtros{(activeGenre || minRating > 0 || minYear) ? ' ●' : ''}</Text>
        </TouchableOpacity>
      </View>

      {/* Painel de filtros animado */}
      <Animated.View style={[styles.filtersPanel, { height: filtersPanelHeight, overflow: 'hidden', top: searchBarHeight }]}>
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Gênero</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
            <TouchableOpacity
              style={[styles.chip, !activeGenre && styles.chipActive]}
              onPress={() => setActiveGenre(null)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, !activeGenre && styles.chipTextActive]}>Todos</Text>
            </TouchableOpacity>
            {CATEGORIES.filter((c) => c !== 'Todos').map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.chip, activeGenre === g && styles.chipActive]}
                onPress={() => setActiveGenre(activeGenre === g ? null : g)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, activeGenre === g && styles.chipTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterRow}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Avaliação mínima</Text>
            <View style={styles.filterChips}>
              {RATINGS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, minRating === r && styles.chipActive]}
                  onPress={() => setMinRating(r)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, minRating === r && styles.chipTextActive]}>
                    {r === 0 ? 'Todos' : `⭐ ${r}+`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.filterRow}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>A partir de</Text>
            <View style={styles.filterChips}>
              {YEARS.map((y) => (
                <TouchableOpacity
                  key={y}
                  style={[styles.chip, minYear === y && styles.chipActive]}
                  onPress={() => setMinYear(y)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, minYear === y && styles.chipTextActive]}>
                    {y ? `${y}+` : 'Todos'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={(e) => handleScroll(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        {/* Estado: buscando */}
        {isSearching ? (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {loading ? 'Buscando...' : `${results.length} resultado${results.length !== 1 ? 's' : ''}`}
              </Text>
              {(activeGenre || minRating > 0 || minYear) && (
                <TouchableOpacity
                  onPress={() => { setActiveGenre(null); setMinRating(0); setMinYear(null); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.clearFilters}>Limpar filtros</Text>
                </TouchableOpacity>
              )}
            </View>

            {loading ? (
              <View style={[styles.grid, { paddingHorizontal: isMobile ? 12 : 24 }]}>
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} containerWidth={width} />)}
              </View>
            ) : results.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>Nenhum resultado</Text>
                <Text style={styles.emptySub}>Tente outros termos ou ajuste os filtros</Text>
              </View>
            ) : (
              <View style={[styles.grid, { paddingHorizontal: isMobile ? 12 : 24 }]}>
                {results.map((movie, i) => (
                  <MovieCard key={movie.id} movie={movie} onPress={handleMoviePress} index={i} containerWidth={width} />
                ))}
              </View>
            )}
          </>
        ) : (
          <>
            {/* Histórico */}
            {history.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>🕐 Buscas recentes</Text>
                  <TouchableOpacity onPress={clearHistory} activeOpacity={0.8}>
                    <Text style={styles.clearAll}>Limpar</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.historyList}>
                  {history.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.historyItem}
                      onPress={() => { setQuery(item); handleSearch(item); }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.historyIcon}>🔍</Text>
                      <Text style={styles.historyText}>{item}</Text>
                      <TouchableOpacity
                        onPress={() => removeHistory(item)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.historyRemove}>✕</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Sugestão: Mais bem avaliados */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⭐ Mais bem avaliados</Text>
              <View style={[styles.grid, { paddingHorizontal: 0 }]}>
                {topRated.map((movie, i) => (
                  <MovieCard key={movie.id} movie={movie} onPress={handleMoviePress} index={i} containerWidth={width - 40} />
                ))}
              </View>
            </View>

            {/* Sugestão: Lançamentos recentes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🆕 Lançamentos recentes</Text>
              <View style={[styles.grid, { paddingHorizontal: 0 }]}>
                {recent.map((movie, i) => (
                  <MovieCard key={movie.id} movie={movie} onPress={handleMoviePress} index={i} containerWidth={width - 40} />
                ))}
              </View>
            </View>

            {/* Sugestão: Por gênero */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎭 Explorar por gênero</Text>
              <View style={styles.genreGrid}>
                {CATEGORIES.filter((c) => c !== 'Todos').map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={styles.genreCard}
                    onPress={() => { setActiveGenre(g); if (!showFilters) toggleFilters(); }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.genreCardText}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  searchBar: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 10,
  },
  searchIcon: { fontSize: 16 },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    height: 46,
  },
  clearBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  clearBtnText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700' },
  filterToggle: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  filterToggleActive: {
    backgroundColor: 'rgba(229,9,20,0.15)',
    borderColor: 'rgba(229,9,20,0.4)',
  },
  filterToggleText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  filtersPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: '#0d0d14',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  filterSection: { marginTop: 12 },
  filterRow: { marginTop: 4 },
  filterLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  chipActive: { backgroundColor: '#e50914', borderColor: '#e50914' },
  chipText: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingTop: 8 },
  resultsHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  resultsTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  clearFilters: { color: '#e50914', fontSize: 13, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySub: { color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 14, letterSpacing: -0.3 },
  clearAll: { color: '#e50914', fontSize: 13, fontWeight: '600' },
  historyList: { gap: 6 },
  historyItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  historyIcon: { fontSize: 14, opacity: 0.5 },
  historyText: { flex: 1, color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '500' },
  historyRemove: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: '700' },
  highlight: { color: '#e50914', fontWeight: '800' },
  genreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  genreCard: {
    paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  genreCardText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
});

export default SearchScreen;
