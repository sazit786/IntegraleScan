import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useState } from 'react'; // On importe useState

export default function App() {
  // On crée une mémoire pour le texte
  const [message, setMessage] = useState("Pas click :(");

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Intégral Scan</Text>
        <Text style={styles.subtitle}>Test de l'interface Web</Text>

        {/* Le texte qui va changer au clic */}
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{message}</Text>
        </View>

        {/* Le bouton qui modifie le texte */}
        <TouchableOpacity
            style={styles.button}
            onPress={() => setMessage("Click :)")}
        >
          <Text style={styles.buttonText}>Tester le bouton</Text>
        </TouchableOpacity>

        <StatusBar style="light" />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 30,
  },
  statusBox: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 250,
    alignItems: 'center',
  },
  statusText: {
    color: '#4CAF50', // Un beau vert pour le succès
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#0A84FF',
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