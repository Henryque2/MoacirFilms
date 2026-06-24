import React from 'react';
import { Animated, StyleSheet, Dimensions, View } from 'react-native';
import { useTransition } from '../context/TransitionContext';
import DetailScreen from '../screens/DetailScreen';

const TransitionOverlay = ({ onPlayMovie }) => {
  const {
    visible, movie, phase,
    translateX, translateY, scaleX, scaleY, overlayOp, contentOp,
    collapse,
  } = useTransition();

  if (!visible || !movie) return null;

  const { width: SW, height: SH } = Dimensions.get('window');

  return (
    // Container que cobre TODA a tela incluindo navbar/footer
    // zIndex altíssimo para ficar acima de absolutamente tudo
    <Animated.View
      style={[
        styles.fullscreen,
        { width: SW, height: SH, opacity: overlayOp },
        {
          transform: [
            { translateX },
            { translateY },
            { scaleX },
            { scaleY },
          ],
        },
      ]}
      pointerEvents={phase === 'idle' ? 'none' : 'auto'}
    >
      {/* Imagem do filme — visível enquanto o DetailScreen ainda não apareceu */}
      <Animated.Image
        source={{ uri: movie.backdrop || movie.image }}
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: contentOp.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
          },
        ]}
        resizeMode="cover"
      />
      {/* Fundo escuro sobre a imagem */}
      <View style={styles.imageDim} />

      {/* DetailScreen — aparece com fade após expansão completa */}
      {(phase === 'open' || phase === 'collapsing') && (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: contentOp }]}>
          <DetailScreen
            movie={movie}
            onBack={collapse}
            onPlayMovie={onPlayMovie}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
    backgroundColor: '#0a0a0f',
    overflow: 'hidden',
  },
  imageDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,15,0.5)',
  },
});

export default TransitionOverlay;
