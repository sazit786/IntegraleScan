import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Modal, TextInput, ActivityIndicator, Image } from 'react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import ProgressBar from './components/ProgressBar.web';

export default function App() {
  // --- ÉTATS DE L'APPLICATION (STATES) ---
  const [ecranActuel, setEcranActuel] = useState('splash'); // Gère la navigation (splash, auth, login, app)
  const [langue, setLangue] = useState('FR');
  const [estEnChargement, setEstEnChargement] = useState(false); // Pour le petit cercle de chargement au login
  const [imageSelectionnee, setImageSelectionnee] = useState(null); // Stocke l'URI de la photo
  const [estMenuVisible, setEstMenuVisible] = useState(false); // Affiche/Masque les paramètres
  const [prenomUtilisateur, setPrenomUtilisateur] = useState("");
  const [nomUtilisateur, setNomUtilisateur] = useState("");

  // --- SYSTÈME DE TRADUCTION ---
  const traductions = {
    FR: {
      bienvenue: "BIENVENUE", connecter: "SE CONNECTER", skip: "IGNORER",
      prenom: "Prénom", nom: "Nom", entrer: "CONFIRMER", retour: "RETOUR",
      titre: "ANALYSE", veille: "SYSTÈME EN VEILLE", analyse: "ANALYSE OCR EN COURS...",
      charger: "CHARGER UNE IMAGE", demarche: "VOIR LA DÉMARCHE",
      params: "PARAMÈTRES", langueLabel: "LANGUE", fermer: "APPLIQUER",
      placeholder: "SCANNER UNE ÉQUATION"
    },
    EN: {
      bienvenue: "WELCOME", connecter: "LOG IN", skip: "SKIP",
      prenom: "First Name", nom: "Last Name", entrer: "CONFIRM", retour: "BACK",
      titre: "ANALYSIS", veille: "SYSTEM STANDBY", analyse: "OCR ANALYSIS IN PROGRESS...",
      charger: "UPLOAD IMAGE", demarche: "VIEW STEP-BY-STEP",
      params: "SETTINGS", langueLabel: "LANGUAGE", fermer: "APPLY",
      placeholder: "SCAN EQUATION"
    }
  };

  const texte = traductions[langue];

  // --- LOGIQUE AU DÉMARRAGE ---
  useEffect(() => {
    // On reste sur le logo 2 secondes puis on va vers l'authentification
    const timerSplash = setTimeout(() => setEcranActuel('auth'), 2000);
    return () => clearTimeout(timerSplash);
  }, []);

  // --- FONCTIONS ACTIONS ---
  const gererConnexion = () => {
    if (!prenomUtilisateur || !nomUtilisateur) return alert("Veuillez remplir tous les champs");
    setEstEnChargement(true);
    setTimeout(() => {
      setEstEnChargement(false);
      setEcranActuel('app');
    }, 1000);
  };

  const ouvrirGalerie = async () => {
    let resultat = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Correction : syntaxe moderne
      allowsEditing: true,
      quality: 1,
    });

    if (!resultat.canceled) {
      setImageSelectionnee(resultat.assets[0].uri);
    }
  };

  // --- RENDU : ÉCRAN DE CHARGEMENT (SPLASH) ---
  if (ecranActuel === 'splash') {
    return (
        <View style={styles.fondCentral}>
          <ActivityIndicator size="large" color="#0055FF" />
          <Text style={styles.logoSplash}>INTEGRAL<Text style={{color:'#0055FF'}}>SCAN</Text></Text>
        </View>
    );
  }

  // --- RENDU : CHOIX CONNEXION / IGNORER (AUTH) ---
  if (ecranActuel === 'auth') {
    return (
        <View style={styles.fondPrincipal}>
          <View style={styles.barreLangue}>
            <TouchableOpacity onPress={() => setLangue('FR')}><Text style={[styles.texteLangue, langue==='FR' && {color:'#0055FF'}]}>FR</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setLangue('EN')}><Text style={[styles.texteLangue, langue==='EN' && {color:'#0055FF'}]}>EN</Text></TouchableOpacity>
          </View>
          <Text style={styles.titreMarqueLarge}>INTEGRAL<Text style={styles.texteAccent}>SCAN</Text></Text>
          <View style={{marginTop: 50, gap: 15}}>
            <TouchableOpacity style={styles.boutonPlein} onPress={() => setEcranActuel('login')}><Text style={styles.texteBoutonPlein}>{texte.connecter}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.boutonVide} onPress={() => setEcranActuel('app')}><Text style={styles.texteBoutonVide}>{texte.skip}</Text></TouchableOpacity>
          </View>
        </View>
    );
  }

  // --- RENDU : FORMULAIRE DE CONNEXION (LOGIN) ---
  if (ecranActuel === 'login') {
    return (
        <View style={styles.fondPrincipal}>
          <Text style={styles.titreMarqueLarge}>{texte.bienvenue}</Text>
          <View style={{marginTop: 30}}>
            <TextInput style={styles.champSaisie} placeholder={texte.prenom} placeholderTextColor="#444" onChangeText={setPrenomUtilisateur} />
            <TextInput style={styles.champSaisie} placeholder={texte.nom} placeholderTextColor="#444" onChangeText={setNomUtilisateur} />
            <TouchableOpacity style={styles.boutonPlein} onPress={gererConnexion}>
              {estEnChargement ? <ActivityIndicator color="#FFF"/> : <Text style={styles.texteBoutonPlein}>{texte.entrer}</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEcranActuel('auth')} style={{marginTop: 20, alignItems:'center'}}><Text style={{color:'#555'}}>{texte.retour}</Text></TouchableOpacity>
          </View>
        </View>
    );
  }

  // --- RENDU : INTERFACE PRINCIPALE (APP) ---
  return (
      <View style={styles.fondPrincipal}>
        {/* FENÊTRE PARAMÈTRES (MODAL) */}
        <Modal visible={estMenuVisible} animationType="fade" transparent={true}>
          <View style={styles.surcoucheModal}>
            <View style={styles.contenuModal}>
              <Text style={styles.titreModal}>{texte.params}</Text>
              <View style={styles.itemParametre}>
                <Text style={styles.labelParametre}>{texte.langueLabel}</Text>
                <View style={styles.selecteurLangue}>
                  <TouchableOpacity style={[styles.boutonLangueModal, langue === 'FR' && styles.boutonLangueActif]} onPress={() => setLangue('FR')}>
                    <Text style={styles.texteLangueModal}>FR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.boutonLangueModal, langue === 'EN' && styles.boutonLangueActif]} onPress={() => setLangue('EN')}>
                    <Text style={styles.texteLangueModal}>EN</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={styles.boutonFermerModal} onPress={() => setEstMenuVisible(false)}>
                <Text style={styles.texteBoutonFermer}>{texte.fermer}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* EN-TÊTE */}
        <View style={styles.enTete}>
          <View style={{width: 24}} />
          <Text style={styles.titreMarque}>INTEGRAL<Text style={styles.texteAccent}>{texte.titre}</Text></Text>
          <TouchableOpacity onPress={() => setEstMenuVisible(true)}><Text style={{fontSize:20}}>⚙️</Text></TouchableOpacity>
        </View>

        {prenomUtilisateur ? <Text style={styles.salutationUser}>{texte.bienvenue}, {prenomUtilisateur}</Text> : null}

        /* ZONE D'AFFICHAGE DE L'IMAGE (Réparé : la balise Image est de retour) */
        <View style={styles.cadreImage}>
          {imageSelectionnee ? (
              <Image source={{ uri: imageSelectionnee }} style={{width:'100%', height:'100%', borderRadius:12}} />
          ) : (
              <Text style={{color:'#222', fontSize:10, fontWeight:'bold'}}>{texte.placeholder}</Text>
          )}
        </View>

        <View style={{width:300, marginBottom:20}}>
          <ProgressBar value={imageSelectionnee ? 100 : 0} preset="energy"/>
        </View>

        {/* BARRE DE STATUT (DYNAMIQUE) */}
        <View style={styles.boiteStatut}>
          <View style={[styles.indicateurStatut, {backgroundColor: imageSelectionnee ? '#0055FF' : '#00FF66'}]} />
          <Text style={{color:'#EEE', fontSize:12}}>{imageSelectionnee ? texte.analyse : texte.veille}</Text>
        </View>

        {/* BOUTONS D'ACTION */}
        <View style={{gap: 12}}>
          <TouchableOpacity style={styles.boutonPlein} onPress={ouvrirGalerie}>
            <Text style={styles.texteBoutonPlein}>{texte.charger}</Text>
          </TouchableOpacity>

          <TouchableOpacity
              style={[styles.boutonVide, {opacity: imageSelectionnee ? 1 : 0.3}]}
              disabled={!imageSelectionnee}
              onPress={() => alert("Fonctionnalité d'analyse bientôt disponible")}
          >
            <Text style={styles.texteBoutonVide}>{texte.demarche}</Text>
          </TouchableOpacity>
        </View>

        <StatusBar style="light" />
      </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  fondPrincipal: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', padding: 20 },
  fondCentral: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },
  logoSplash: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: 4, marginTop: 20 },
  titreMarqueLarge: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', letterSpacing: 3 },
  titreMarque: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', letterSpacing: 2 },
  texteAccent: { color: '#0055FF' },
  barreLangue: { flexDirection: 'row', gap: 20, position: 'absolute', top: 60 },
  texteLangue: { color: '#444', fontWeight: 'bold' },
  champSaisie: { width: 300, height: 55, backgroundColor: '#111', borderRadius: 12, paddingHorizontal: 15, color: '#fff', marginBottom: 15, borderWidth: 1, borderColor: '#222' },
  boutonPlein: { backgroundColor: '#0055FF', width: 300, paddingVertical: 18, borderRadius: 12, alignItems: 'center' },
  texteBoutonPlein: { color: '#FFF', fontWeight: '900', letterSpacing: 1 },
  boutonVide: { width: 300, paddingVertical: 18, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  texteBoutonVide: { color: '#444', fontWeight: 'bold' },
  enTete: { flexDirection: 'row', width: 300, justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  salutationUser: { color: '#555', fontSize: 10, marginBottom: 15, textTransform: 'uppercase', fontWeight: 'bold' },
  cadreImage: { width: 300, height: 200, backgroundColor: '#111', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#222' },
  boiteStatut: { flexDirection: 'row', backgroundColor: '#111', padding: 12, borderRadius: 8, marginBottom: 25, width: 300, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  indicateurStatut: { width: 6, height: 6, borderRadius: 3, marginRight: 10 },
  surcoucheModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  contenuModal: { width: 300, backgroundColor: '#151515', padding: 25, borderRadius: 20, borderWidth: 1, borderColor: '#222' },
  titreModal: { color: '#FFF', fontSize: 16, fontWeight: '900', marginBottom: 25, textAlign: 'center' },
  itemParametre: { marginBottom: 20 },
  labelParametre: { color: '#555', fontSize: 10, fontWeight: 'bold', marginBottom: 10 },
  selecteurLangue: { flexDirection: 'row', backgroundColor: '#0A0A0A', borderRadius: 8, padding: 4 },
  boutonLangueModal: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  boutonLangueActif: { backgroundColor: '#0055FF' },
  texteLangueModal: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  boutonFermerModal: { backgroundColor: '#FFF', paddingVertical: 12, borderRadius: 10, marginTop: 10, alignItems: 'center' },
  texteBoutonFermer: { color: '#000', fontWeight: 'bold', fontSize: 13 }
});