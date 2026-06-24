import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { Animated, Dimensions, Easing } from 'react-native';

const TransitionContext = createContext(null);

export const TransitionProvider = ({ children }) => {
  const getScreen = () => Dimensions.get('window');

  const progress  = useRef(new Animated.Value(0)).current; // 0=card, 1=fullscreen
  const contentOp = useRef(new Animated.Value(0)).current;

  // Guarda origem para calcular os transforms
  const origin = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // Valores derivados interpolados a partir de `progress`
  // Calculados no momento do expand com os valores reais
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleX     = useRef(new Animated.Value(1)).current;
  const scaleY     = useRef(new Animated.Value(1)).current;
  const overlayOp  = useRef(new Animated.Value(0)).current;

  const [visible, setVisible] = useState(false);
  const [movie,   setMovie]   = useState(null);
  const [phase,   setPhase]   = useState('idle');

  const expand = useCallback((cardLayout, selectedMovie, onDone) => {
    const { x, y, width: cw, height: ch } = cardLayout;
    const { width: SW, height: SH } = getScreen();

    origin.current = { x, y, w: cw, h: ch };

    // O overlay parte do centro da tela em tamanho full,
    // e usamos scaleX/scaleY + translateX/translateY para simular
    // que está no lugar do card.
    // cardCenter → screenCenter delta:
    const cardCX = x + cw / 2;
    const cardCY = y + ch / 2;
    const screenCX = SW / 2;
    const screenCY = SH / 2;

    const startTX = cardCX - screenCX;
    const startTY = cardCY - screenCY;
    const startSX = cw / SW;
    const startSY = ch / SH;

    // Posiciona no card
    translateX.setValue(startTX);
    translateY.setValue(startTY);
    scaleX.setValue(startSX);
    scaleY.setValue(startSY);
    overlayOp.setValue(1);
    contentOp.setValue(0);

    setMovie(selectedMovie);
    setVisible(true);
    setPhase('expanding');

    const DURATION = 320;
    const EASE = Easing.out(Easing.bezier(0.25, 0.46, 0.45, 0.94));

    Animated.parallel([
      Animated.timing(translateX, { toValue: 0,  duration: DURATION, easing: EASE, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0,  duration: DURATION, easing: EASE, useNativeDriver: true }),
      Animated.timing(scaleX,     { toValue: 1,  duration: DURATION, easing: EASE, useNativeDriver: true }),
      Animated.timing(scaleY,     { toValue: 1,  duration: DURATION, easing: EASE, useNativeDriver: true }),
    ]).start(() => {
      setPhase('open');
      Animated.timing(contentOp, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      onDone?.();
    });
  }, []);

  const collapse = useCallback((onDone) => {
    setPhase('collapsing');
    const { x, y, w: cw, h: ch } = origin.current;
    const { width: SW, height: SH } = getScreen();

    const cardCX = x + cw / 2;
    const cardCY = y + ch / 2;
    const screenCX = SW / 2;
    const screenCY = SH / 2;

    const endTX = cardCX - screenCX;
    const endTY = cardCY - screenCY;
    const endSX = cw / SW;
    const endSY = ch / SH;

    const DURATION = 280;
    const EASE = Easing.in(Easing.bezier(0.55, 0.055, 0.675, 0.19));

    Animated.sequence([
      Animated.timing(contentOp, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(translateX, { toValue: endTX, duration: DURATION, easing: EASE, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: endTY, duration: DURATION, easing: EASE, useNativeDriver: true }),
        Animated.timing(scaleX,     { toValue: endSX, duration: DURATION, easing: EASE, useNativeDriver: true }),
        Animated.timing(scaleY,     { toValue: endSY, duration: DURATION, easing: EASE, useNativeDriver: true }),
        Animated.timing(overlayOp,  { toValue: 0,     duration: DURATION, easing: EASE, useNativeDriver: true }),
      ]),
    ]).start(() => {
      setVisible(false);
      setPhase('idle');
      setMovie(null);
      onDone?.();
    });
  }, []);

  return (
    <TransitionContext.Provider value={{
      expand, collapse,
      translateX, translateY, scaleX, scaleY, overlayOp, contentOp,
      visible, movie, phase,
    }}>
      {children}
    </TransitionContext.Provider>
  );
};

export const useTransition = () => {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error('useTransition must be used within TransitionProvider');
  return ctx;
};
