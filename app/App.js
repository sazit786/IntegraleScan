import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image, Modal, Platform } from 'react-native';
import { useState } from 'react';
import * as SelecteurImage from 'expo-image-picker';
import * as SelecteurFichier from 'expo-document-picker';

// Progress bar
import ProgressBar from './components/ProgressBar';

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
  const [menuVisible, setMenuVisible] = useState(false);

  // --- LES ACTIONS ---

  // Sur web : ouvre directement le sélecteur de fichiers, sans menu
  const gererBoutonCharger = () => {
    if (Platform.OS === 'web') {
      choisirDepuisGalerie();
    } else {
      setMenuVisible(true);
    }
  };

  // Ouvrir depuis la galerie
  const choisirDepuisGalerie = async () => {
    setMenuVisible(false);
    const resultat = await SelecteurImage.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });
    if (!resultat.canceled) {
      setPhoto(resultat.assets[0].uri);
      setTexteInfo("Image chargée ! Analyse en cours...");
    }
  };

  // Prendre une photo avec l'appareil
  const prendreUnePhoto = async () => {
    setMenuVisible(false);
    const permission = await SelecteurImage.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      setTexteInfo("Permission caméra refusée.");
      return;
    }
    const resultat = await SelecteurImage.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });
    if (!resultat.canceled) {
      setPhoto(resultat.assets[0].uri);
      setTexteInfo("Photo prise ! Analyse en cours...");
    }
  };

  // Choisir un fichier (PDF, image depuis Drive, iCloud, etc.)
  const choisirUnFichier = async () => {
    setMenuVisible(false);
    const resultat = await SelecteurFichier.getDocumentAsync({
      type: 'image/*',
      copyToCacheDirectory: true,
    });
    if (!resultat.canceled) {
      setPhoto(resultat.assets[0].uri);
      setTexteInfo("Fichier chargé ! Analyse en cours...");
    }
  };

  // --- L'APPARENCE ---
  return (
      <View style={styles.fond}>
        {/* Titres du haut */}
        <Text style={styles.titrePrincipal}>Analyse d'intégrales complètes</Text>
        <Text style={styles.sousTitres}>propulsé par l'Intelligence Artificielle</Text>

        {/* Affichage de la photo (on utilise notre outil créé plus haut) */}
        <CadrePhoto lienImage={photo} />

        {/* Barre de progression energy */}
        <Text style={styles.texteProgression}>Progression:</Text>
        <ProgressBar value={67} preset="energy"/>

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
              titre="Charger une image"
              couleur="#0033ff"
              action={gererBoutonCharger}
              styleSpecifique={{ marginBottom: 15 }}
          />

          <BoutonAction
              titre="Voir la démarche"
              couleur="#0033ff"
              //to do
          />
        </View>

        {/* Menu de sélection de la source d'image */}
        <Modal
            visible={menuVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity
              style={styles.fondModal}
              activeOpacity={1}
              onPress={() => setMenuVisible(false)}
          >
            <View style={styles.carteMenu}>
              <Text style={styles.titreMenu}>Choisir une source</Text>

              <BoutonAction
                  titre="📷  Appareil photo"
                  couleur="#0033ff"
                  action={prendreUnePhoto}
                  styleSpecifique={{ marginBottom: 12 }}
              />
              <BoutonAction
                  titre="🖼️  Galerie"
                  couleur="#0033ff"
                  action={choisirDepuisGalerie}
                  styleSpecifique={{ marginBottom: 12 }}
              />
              <BoutonAction
                  titre="📁  Fichier"
                  couleur="#0033ff"
                  action={choisirUnFichier}
                  styleSpecifique={{ marginBottom: 12 }}
              />
              <BoutonAction
                  titre="Annuler"
                  couleur="#444444"
                  action={() => setMenuVisible(false)}
              />
            </View>
          </TouchableOpacity>
        </Modal>

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
    marginBottom: 10,
  },
  sousTitres: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 15,
    letterSpacing: 1,
  },
  zoneImage: {
    width: 300,
    height: 200,
    backgroundColor: '#2e2e2e',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    overflow: 'hidden',
  },
  photoAffichee: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  texteProgression: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 5,
    letterSpacing: 1,
    width: 300,
    textAlign: 'left',
  },
  boiteStatut: {
    backgroundColor: '#2e2e2e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    minWidth: 300,
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
  fondModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carteMenu: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 24,
    width: 340,
    alignItems: 'center',
  },
  titreMenu: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  boutonBase: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 300,
    alignItems: 'center',
    elevation: 3,
  },
  texteBouton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});