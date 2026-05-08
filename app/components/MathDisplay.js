import { Text } from 'react-native';

// Fallback mobile : affiche le LaTeX brut (améliorable plus tard avec react-native-math-view)
export default function MathDisplay({ latex, color = '#0055FF', fontSize = 16 }) {
  return (
    <Text style={{ color, fontSize, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>
      {latex}
    </Text>
  );
}
