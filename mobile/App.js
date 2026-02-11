import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, ImageBackground, View, StyleSheet } from 'react-native';
import { useFonts, Orbitron_600SemiBold, Orbitron_700Bold } from '@expo-google-fonts/orbitron';
import { useFonts as useSpaceFonts, SpaceGrotesk_400Regular, SpaceGrotesk_600SemiBold } from '@expo-google-fonts/space-grotesk';
import { neonTheme } from './src/styles/neonTheme';
import RootNavigator from './src/navigation/RootNavigator';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function App() {
  const [orbitronLoaded] = useFonts({ Orbitron_600SemiBold, Orbitron_700Bold });
  const [spaceLoaded] = useSpaceFonts({ SpaceGrotesk_400Regular, SpaceGrotesk_600SemiBold });
  const fontsReady = orbitronLoaded && spaceLoaded;
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync();
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [fontsReady]);

  if (!fontsReady) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={neonTheme.colors.accent} />
      </View>
    );
  }

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <ImageBackground
          source={require('./assets/splash-screen.png')}
          style={styles.splashImage}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: neonTheme.colors.background,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#0284c7',
  },
  splashImage: {
    flex: 1,
  },
});
