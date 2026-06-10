import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';

const Footer = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  if (isMobile) {
    // Mobile: ultra-compact single line
    return (
      <View style={styles.footerMobile}>
        <Text style={styles.footerMobileText}>🎬 MoacirFilms · © 2026</Text>
      </View>
    );
  }

  return (
    <View style={styles.footer}>
      <Text style={styles.footerCopy}>© 2026 MoacirFilms · Que os filmes estejam com você</Text>
      <View style={styles.footerLinks}>
        <Text style={styles.footerLink}>Sobre</Text>
        <Text style={styles.footerDot}>·</Text>
        <Text style={styles.footerLink}>Contato</Text>
        <Text style={styles.footerDot}>·</Text>
        <Text style={styles.footerLink}>Privacidade</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerMobile: {
    backgroundColor: 'rgba(5, 5, 10, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerMobileText: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  footer: {
    backgroundColor: 'rgba(5, 5, 10, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  footerLogo: {
    fontSize: 13,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.5,
  },
  footerLogoAccent: { color: '#e50914' },
  footerCopy: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 11,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerLink: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    fontWeight: '500',
  },
  footerDot: {
    color: 'rgba(255,255,255,0.15)',
    fontSize: 12,
  },
});

export default Footer;
