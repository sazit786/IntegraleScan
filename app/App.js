import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { useState } from 'react';
import * as SelecteurImage from 'expo-image-picker'; // Outil pour choisir des photos

/**
 * les petits morceaux d'interface qu'on réutilise.
 */

// 1. Le cadre qui affiche la photo choisie
const CadrePhoto = ({ lienImage }) => (
    <View style={styles.zoneImage}>
      {lienImage ? (
          <Image source={{ uri: lienImage }} style={styles.photoAffichee} />
      ) : (
          <Text style={{ color: '#555' }}>Aucune image sélectionnée</Text>
      )}
    </View>
);

// 2. Un modèle de bouton personnalisé
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
  const [texteInfo, setTexteInfo] = useState("En attente d'une intégrale...");
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
      setTexteInfo("Image chargée ! Prête pour l'analyse.");
    }
  };

  // --- L'APPARENCE ---
  return (
      <View style={styles.fond}>
        {/* Titres du haut */}
        <Text style={styles.titrePrincipal}>Intégral Scan</Text>
        <Text style={styles.sousTitre}>Analyse par Intelligence Artificielle</Text>

        {/* Affichage de la photo (on utilise notre outil créé plus haut) */}
        <CadrePhoto lienImage={photo} />

        {/* Boîte qui affiche le message d'état */}
        <View style={styles.boiteStatut}>
          <Text style={styles.texteStatut}>{texteInfo}</Text>
        </View>

        {/* Zone où on range les boutons */}
        <View style={styles.zoneBoutons}>
          <BoutonAction
              titre="Tester la connexion"
              couleur="#0A84FF" // Bleu
              action={() => setTexteInfo("Le bouton fonctionne bien ! ✅")}
              styleSpecifique={{ marginBottom: 15 }}
          />

          <BoutonAction
              titre="📁 Charger une photo"
              couleur="#FF9500" // Orange
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
    backgroundColor: '#121212', // Gris très foncé (mode sombre)
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  titrePrincipal: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  sousTitre: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 25,
    letterSpacing: 1,
  },
  zoneImage: {
    width: 300,
    height: 200,
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  photoAffichee: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', // Ajuste l'image sans la déformer
  },
  boiteStatut: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
    minWidth: 280,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50', // Petite bordure verte décorative
  },
  texteStatut: {
    color: '#4CAF50',
    fontSize: 15,
    fontWeight: '600',
  },
  zoneBoutons: {
    width: '100%',
    alignItems: 'center',
  },
  boutonBase: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 240,
    alignItems: 'center',
    // Petit effet de relief
    elevation: 3,
  },
  texteBouton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});