import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { useState } from 'react';
import * as SelecteurImage from 'expo-image-picker'; // Outil pour choisir des photos

// Progress bar
import ProgressBar from './components/ProgressBar.web';

/**
 * les petits morceaux d'interface qu'on réutilise.
 */

// 1. Le cadre qui affiche la photo choisie
const CadrePhoto = ({ lienImage }) => (
    <View style={styles.zoneImage}>
      {lienImage ? (
          <Image source={{ uri: lienImage }} style={styles.photoAffichee} />
      ) : (
          <Text style={{ color: '#ff0000', fontWeight: 'bold' }}>Aucune image sélectionnée</Text>
      )}
    </View>
);

// 2. Un modèle de bouton personnalisée
const BoutonAction = ({ titre, action, couleur, styleSpecifique }) => (
    <TouchableOpacity
        style={[styles.boutonBase, { backgroundColor: couleur }, styleSpecifique]}
        onPress={action}
    >
      <Text style={styles.texteBouton}>{titre}</Text>
    </TouchableOpacity>
);

/**
 *  LE CŒUR DE L'APPLICATION
 */
export default function App() {
  // --- LA MÉMOIRE ---
  const [texteInfo, setTexteInfo] = useState("En attente d'une intégrale");
  const [photo, setPhoto] = useState(null);

  // --- LES ACTIONS ---

  // Fonction pour ouvrir la galerie du téléphone ou de l'ordi
  const choisirUnePhoto = async () => {
    let resultat = await SelecteurImage.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true, // Permet de recadrer l'image sur l'intégrale
      quality: 1,
    });

    if (!resultat.canceled) {
      setPhoto(resultat.assets[0].uri); // On mémorise le chemin de la photo
      setTexteInfo("Image chargée ! Analyse en cours...");
    }
  };

  // --- L'APPARENCE ---
  return (
      <View style={styles.fond}>
        {/* Titres du haut */}
        <Text style={styles.titrePrincipal}>Analyse d'intégrales complètes</Text>
        <Text style={styles.sousTitre}>propulsé par l'Intelligence Artificielle</Text>

        {/* Affichage de la photo (on utilise notre outil créé plus haut) */}
        <CadrePhoto lienImage={photo} />

        {/* Barre de progression energy */}
        <ProgressBar value={67} preset="energy" />

        {/* Boîte qui affiche le message d'état */}
        <View style={styles.boiteStatut}>
          <Text style={styles.texteStatut}>{texteInfo}</Text>
        </View>

        {/* Zone où on range les boutons */}
        <View style={styles.zoneBoutons}>
          <BoutonAction
              titre="Tester la connexion"
              couleur="#0033ff"
              action={() => setTexteInfo("La connexion est bonne")}
              styleSpecifique={{ marginBottom: 15 }}
          />

          <BoutonAction
              titre="Charger une photo"
              couleur="#0033ff"
              action={choisirUnePhoto}
          />
        </View>

        <StatusBar style="light" />
      </View>
  );
}

/**
 * LE DESIGN
 */
const styles = StyleSheet.create({
  fond: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  titrePrincipal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  sousTitre: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 0,
    letterSpacing: 1,
  },
  zoneImage: {
    width: 300,
    height: 200,
    backgroundColor: '#2e2e2e',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    overflow: 'hidden',
  },
  photoAffichee: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  boiteStatut: {
    backgroundColor: '#2e2e2e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
    minWidth: 280,
    alignItems: 'center',
  },
  texteStatut: {
    color: '#35b43a',
    fontSize: 16,
    fontWeight: 'bold'
  },
  zoneBoutons: {
    width: '100%',
    alignItems: 'center',
  },
  boutonBase: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 280,
    alignItems: 'center',
    elevation: 3,
  },
  texteBouton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});