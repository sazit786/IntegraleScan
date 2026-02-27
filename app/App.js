import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';

export default function App() {
  return (
      <View style={styles.container}>
        <Text style={styles.title}>Intégral Scan</Text>
        <Text style={styles.subtitle}>Test de l'interface</Text>

        {/* Un bouton simple pour tester l'interactivité */}
        <TouchableOpacity
            style={styles.button}
            onPress={() => Alert.alert('Test Réussi !', 'Le bouton fonctionne parfaitement. 🚀')}
        >
          <Text style={styles.buttonText}>Tester le bouton</Text>
        </TouchableOpacity>

        {/* Forcer l'heure et la batterie en blanc */}
        <StatusBar style="light" />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Fond gris très foncé (Dark Theme)
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF', // Texte blanc
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0', // Texte gris clair
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#0A84FF', // Bleu moderne
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});