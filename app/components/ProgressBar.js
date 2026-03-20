import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export default function ProgressBar({ value = 0 }) {
  const largeur = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(largeur, {
      toValue: value,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const largeurPourcent = largeur.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.conteneur}>
      <Animated.View style={[styles.barre, { width: largeurPourcent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    minWidth: 280,
    height: 14,
    backgroundColor: '#1e1e1e',
    borderRadius: 7,
    overflow: 'hidden',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  barre: {
    height: '100%',
    backgroundColor: '#00e676',
    borderRadius: 7,
    shadowColor: '#00e676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
});
