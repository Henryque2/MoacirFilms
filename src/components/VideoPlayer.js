import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  useWindowDimensions,
  Platform,
  Animated,
  Linking,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';

// ─── Extrai o ID do YouTube de qualquer formato de URL ───────────────────────
const extractYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([^?&\s]+)/,
    /youtube\.com\/watch\?(?:.*&)?v=([^&\s]+)/,
    /youtube\.com\/embed\/([^?&\s]+)/,
    /youtube\.com\/shorts\/([^?&\s]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// ─── Iframe do YouTube para WEB ──────────────────────────────────────────────
const YouTubeWebEmbed = ({ youtubeId, playerHeight }) => (
  <View style={[styles.videoWrapper, { height: playerHeight }]}>
    <iframe
      width="100%"
      height="100%"
      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      style={{ border: 'none', display: 'block' }}
    />
  </View>
);

// ─── Card de redirecionamento para mobile ─────────────────────────────────────
// O YouTube bloqueia embeds em WebView de apps (erro 153).
// A única solução confiável é abrir no app do YouTube ou no browser.
const YouTubeMobileRedirect = ({ youtubeId, playerHeight, title, onClose }) => {
  const appUrl = `youtube://watch?v=${youtubeId}`;   // abre no app do YouTube
  const webUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

  const openYouTube = async () => {
    try {
      const canOpen = await Linking.canOpenURL(appUrl);
      if (canOpen) {
        await Linking.openURL(appUrl);
      } else {
        await Linking.openURL(webUrl);
      }
      onClose();
    } catch {
      await Linking.openURL(webUrl);
      onClose();
    }
  };

  return (
    <View style={[styles.videoWrapper, { height: playerHeight }, styles.redirectBox]}>
      <Text style={styles.ytLogo}>▶</Text>
      <Text style={styles.redirectTitle}>Trailer no YouTube</Text>
      <Text style={styles.redirectSub}>
        O YouTube não permite reprodução direta em aplicativos.{'\n'}
        Toque abaixo para assistir.
      </Text>
      <TouchableOpacity style={styles.openBtn} onPress={openYouTube} activeOpacity={0.85}>
        <Text style={styles.openBtnText}>Abrir no YouTube</Text>
      </TouchableOpacity>
      <Text style={styles.redirectHint}>
        Abre no app do YouTube se instalado, ou no navegador.
      </Text>
    </View>
  );
};

// ─── Vídeo direto (MP4 etc.) na WEB via <video> HTML ─────────────────────────
const DirectWebPlayer = ({ videoUrl, playerHeight }) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  if (error) return <ErrorBox playerHeight={playerHeight} />;

  return (
    <View style={[styles.videoWrapper, { height: playerHeight }]}>
      <video
        src={videoUrl}
        style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000', display: 'block' }}
        autoPlay
        controls
        playsInline
        onCanPlay={() => setLoading(false)}
        onError={() => { setLoading(false); setError(true); }}
      />
      {loading && <LoadingOverlay />}
    </View>
  );
};

// ─── Vídeo direto no mobile via expo-av ──────────────────────────────────────
const DirectMobilePlayer = ({ videoUrl, playerHeight }) => {
  const videoRef = useRef(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  if (error) return <ErrorBox playerHeight={playerHeight} />;

  return (
    <View style={[styles.videoWrapper, { height: playerHeight }]}>
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        useNativeControls
        onPlaybackStatusUpdate={(s) => {
          if (s.isLoaded) setLoading(false);
          if (s.error) { setLoading(false); setError(true); }
        }}
        onError={() => { setLoading(false); setError(true); }}
      />
      {loading && <LoadingOverlay />}
    </View>
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const LoadingOverlay = () => (
  <View style={styles.loadingOverlay}>
    <Text style={styles.loadingSpinner}>⏳</Text>
    <Text style={styles.loadingText}>Carregando...</Text>
  </View>
);

const ErrorBox = ({ playerHeight }) => (
  <View style={[styles.videoWrapper, { height: playerHeight }, styles.errorBox]}>
    <Text style={styles.errorIcon}>⚠️</Text>
    <Text style={styles.errorText}>Não foi possível carregar o vídeo.</Text>
    <Text style={styles.errorSub}>Verifique a URL ou sua conexão.</Text>
  </View>
);

// ─── Modal principal ──────────────────────────────────────────────────────────
const VideoPlayer = ({ visible, onClose, videoUrl, title, movie }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const playerWidth = isMobile ? width : Math.min(width * 0.85, 900);
  const playerHeight = playerWidth * (9 / 16);
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(backdropOpacity, {
      toValue: visible ? 1 : 0,
      duration: visible ? 250 : 200,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible) return null;

  const youtubeId = extractYouTubeId(videoUrl);
  const isYT = Boolean(youtubeId);

  const renderPlayer = () => {
    if (isYT) {
      return Platform.OS === 'web'
        ? <YouTubeWebEmbed youtubeId={youtubeId} playerHeight={playerHeight} />
        : <YouTubeMobileRedirect
            youtubeId={youtubeId}
            playerHeight={playerHeight}
            title={title}
            onClose={onClose}
          />;
    }
    return Platform.OS === 'web'
      ? <DirectWebPlayer videoUrl={videoUrl} playerHeight={playerHeight} />
      : <DirectMobilePlayer videoUrl={videoUrl} playerHeight={playerHeight} />;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

        <View style={[styles.playerContainer, { width: playerWidth, borderRadius: isMobile ? 0 : 16 }]}>
          {/* Header */}
          <View style={styles.playerHeader}>
            <View style={styles.playerTitleRow}>
              {isYT && <Text style={styles.ytBadge}>▶ YouTube</Text>}
              <Text style={styles.playerTitle} numberOfLines={1}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {renderPlayer()}
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerContainer: {
    backgroundColor: '#0d0d0d',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 20,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  playerTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 12,
    overflow: 'hidden',
  },
  ytBadge: {
    backgroundColor: '#ff0000',
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    letterSpacing: 0.5,
  },
  playerTitle: { color: '#fff', fontSize: 15, fontWeight: '700', flex: 1 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  videoWrapper: {
    width: '100%', backgroundColor: '#000',
    position: 'relative', overflow: 'hidden',
  },
  video: { width: '100%', height: '100%' },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#000', gap: 10,
  },
  loadingSpinner: { fontSize: 32 },
  loadingText: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  errorBox: { alignItems: 'center', justifyContent: 'center', gap: 8 },
  errorIcon: { fontSize: 36 },
  errorText: { color: '#fff', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  errorSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center' },
  // Redirect box (mobile YouTube)
  redirectBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  ytLogo: {
    fontSize: 48,
    color: '#ff0000',
  },
  redirectTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  redirectSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  openBtn: {
    backgroundColor: '#ff0000',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 4,
  },
  openBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  redirectHint: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 11,
    textAlign: 'center',
  },
});

export default VideoPlayer;
