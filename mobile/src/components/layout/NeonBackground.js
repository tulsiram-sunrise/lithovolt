import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Pattern, Rect, Circle } from 'react-native-svg';
import { neonTheme } from '../../styles/neonTheme';

function PatternOverlay() {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
      <Defs>
        <Pattern id="dotGrid" width="28" height="28" patternUnits="userSpaceOnUse">
          <Circle cx="2" cy="2" r="1" fill="#1f2b24" />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#dotGrid)" />
    </Svg>
  );
}

export function NeonBackground({ children, style, ...rest }) {
  return (
    <LinearGradient
      colors={[neonTheme.colors.background, neonTheme.colors.backgroundAlt]}
      style={[styles.background, style]}
      {...rest}
    >
      <PatternOverlay />
      <View style={styles.content}>{children}</View>
    </LinearGradient>
  );
}

export function NeonScroll({ children, contentContainerStyle, style, ...rest }) {
  return (
    <LinearGradient
      colors={[neonTheme.colors.background, neonTheme.colors.backgroundAlt]}
      style={[styles.background, style]}
    >
      <PatternOverlay />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        {...rest}
      >
        {children}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignSelf: 'stretch',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
});
