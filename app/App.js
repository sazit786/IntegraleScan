import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import * as SelecteurImage from 'expo-image-picker';

import ProgressBar from './components/ProgressBar.web';

export default function App() {
  const [etape, setEtape] = useState('splash');
  const [langue, setLangue] = useState('FR');
  const [chargement, setChargement] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");

  const t = {
    FR: {
      bienvenue: "BIENVENUE", connecter: "SE CONNECTER", skip: "IGNORER",
      prenom: "Prénom", nom: "Nom", entrer: "CONFIRMER", retour: "RETOUR",
      titre: "ANALYSE", sousTitre: "Intelligence Artificielle",
      veille: "SYSTÈME EN VEILLE", charger: "CHARGER UNE IMAGE",
      params: "PARAMÈTRES", langueLabel: "LANGUE", fermer: "APPLIQUER",
      placeholder: "SCANNER UNE ÉQUATION"
    },
    EN: {
      bienvenue: "WELCOME", connecter: "LOG IN", skip: "SKIP",
      prenom: "First Name", nom: "Last Name", entrer: "CONFIRM", retour: "BACK",
      titre: "ANALYSIS", sousTitre: "Artificial Intelligence",
      veille: "SYSTEM STANDBY", charger: "UPLOAD IMAGE",
      params: "SETTINGS", langueLabel: "LANGUAGE", fermer: "APPLY",
      placeholder: "SCAN EQUATION"
    }
  };

  const cur = t[langue];

  useEffect(() => {
    const timer = setTimeout(() => setEtape('auth'), 2000);
    return () => clearTimeout(timer);
  }, []);

  const executerConnexion = () => {
    if (!prenom || !nom) return alert("Champs requis");
    setChargement(true);
    setTimeout(() => {
      setChargement(false);
      setEtape('app');
    }, 1000);
  };

  const choisirUnePhoto = async () => {
    let resultat = await SelecteurImage.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });
    if (!resultat.canceled) setPhoto(resultat.assets[0].uri);
  };

  if (etape === 'splash') {
    return (
        <View style={styles.fondCentral}>
          <ActivityIndicator size="large" color="#0055FF" />
          <Text style={styles.logoSplash}>INTEGRAL<Text style={{color:'#0055FF'}}>SCAN</Text></Text>
        </View>
    );
  }

  if (etape === 'auth') {
    return (
        <View style={styles.fond}>
          <View style={styles.langBar}>
            <TouchableOpacity onPress={() => setLangue('FR')}><Text style={[styles.langTxt, langue==='FR' && {color:'#0055FF'}]}>FR</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setLangue('EN')}><Text style={[styles.langTxt, langue==='EN' && {color:'#0055FF'}]}>EN</Text></TouchableOpacity>
          </View>
          <Text style={styles.brandTitleLarge}>INTEGRAL<Text style={styles.accentText}>SCAN</Text></Text>
          <View style={{marginTop: 50, gap: 15}}>
            <TouchableOpacity style={styles.btnPlein} onPress={() => setEtape('login')}><Text style={styles.txtPlein}>{cur.connecter}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnVide} onPress={() => setEtape('app')}><Text style={styles.txtVide}>{cur.skip}</Text></TouchableOpacity>
          </View>
        </View>
    );
  }

  if (etape === 'login') {
    return (
        <View style={styles.fond}>
          <Text style={styles.brandTitleLarge}>{cur.bienvenue}</Text>
          <View style={{marginTop: 30}}>
            <TextInput style={styles.input} placeholder={cur.prenom} placeholderTextColor="#444" onChangeText={setPrenom} />
            <TextInput style={styles.input} placeholder={cur.nom} placeholderTextColor="#444" onChangeText={setNom} />
            <TouchableOpacity style={styles.btnPlein} onPress={executerConnexion}>
              {chargement ? <ActivityIndicator color="#FFF"/> : <Text style={styles.txtPlein}>{cur.entrer}</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEtape('auth')} style={{marginTop: 20, alignItems:'center'}}><Text style={{color:'#555'}}>{cur.retour}</Text></TouchableOpacity>
          </View>
        </View>
    );
  }

  return (
      <SafeAreaView style={styles.fond}>
        {/* --- AJOUT DE LA MODAL ICI --- */}
        <Modal visible={menuVisible} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{cur.params}</Text>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>{cur.langueLabel}</Text>
                <View style={styles.langSwitch}>
                  <TouchableOpacity
                      style={[styles.langBtn, langue === 'FR' && styles.langBtnActive]}
                      onPress={() => setLangue('FR')}
                  >
                    <Text style={styles.langText}>FR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                      style={[styles.langBtn, langue === 'EN' && styles.langBtnActive]}
                      onPress={() => setLangue('EN')}
                  >
                    <Text style={styles.langText}>EN</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={styles.btnFermer} onPress={() => setMenuVisible(false)}>
                <Text style={styles.btnFermerText}>{cur.fermer}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={styles.header}>
          <View style={{width: 24}} />
          <Text style={styles.brandTitle}>INTEGRAL<Text style={styles.accentText}>{cur.titre}</Text></Text>
          <TouchableOpacity onPress={() => setMenuVisible(true)}><Text style={{fontSize:20}}>⚙️</Text></TouchableOpacity>
        </View>

        {prenom ? <Text style={styles.userGreet}>{cur.bienvenue}, {prenom}</Text> : null}

        <View style={styles.zoneImage}>
          {photo ? <Image source={{ uri: photo }} style={{width:'100%', height:'100%', borderRadius:12}} /> : <Text style={{color:'#222', fontSize:10, fontWeight:'bold'}}>{cur.placeholder}</Text>}
        </View>

        <View style={{width:300, marginBottom:20}}>
          <ProgressBar value={67} preset="energy"/>
        </View>

        <View style={styles.boiteStatut}>
          <View style={styles.statusIndicator} />
          <Text style={{color:'#EEE', fontSize:12}}>{cur.veille}</Text>
        </View>

        <TouchableOpacity style={styles.btnPlein} onPress={choisirUnePhoto}><Text style={styles.txtPlein}>{cur.charger}</Text></TouchableOpacity>

        <StatusBar style="light" />
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fond: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', padding: 20 },
  fondCentral: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },
  logoSplash: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: 4, marginTop: 20 },
  brandTitleLarge: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', letterSpacing: 3 },
  brandTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', letterSpacing: 2 },
  accentText: { color: '#0055FF' },
  langBar: { flexDirection: 'row', gap: 20, position: 'absolute', top: 60 },
  langTxt: { color: '#444', fontWeight: 'bold' },
  input: { width: 300, height: 55, backgroundColor: '#111', borderRadius: 12, paddingHorizontal: 15, color: '#fff', marginBottom: 15, borderWidth: 1, borderColor: '#222' },
  btnPlein: { backgroundColor: '#0055FF', width: 300, paddingVertical: 18, borderRadius: 12, alignItems: 'center' },
  txtPlein: { color: '#FFF', fontWeight: '900', letterSpacing: 1 },
  btnVide: { width: 300, paddingVertical: 18, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  txtVide: { color: '#444', fontWeight: 'bold' },
  header: { flexDirection: 'row', width: 300, justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  userGreet: { color: '#555', fontSize: 10, marginBottom: 15, textTransform: 'uppercase', fontWeight: 'bold' },
  zoneImage: { width: 300, height: 200, backgroundColor: '#111', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#222' },
  boiteStatut: { flexDirection: 'row', backgroundColor: '#111', padding: 12, borderRadius: 8, marginBottom: 25, width: 300, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  statusIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00FF66', marginRight: 10 },

  // NOUVEAUX STYLES POUR LA MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: 300, backgroundColor: '#151515', padding: 25, borderRadius: 20, borderWidth: 1, borderColor: '#222' },
  modalTitle: { color: '#FFF', fontSize: 16, fontWeight: '900', marginBottom: 25, textAlign: 'center' },
  settingItem: { marginBottom: 20 },
  settingLabel: { color: '#555', fontSize: 10, fontWeight: 'bold', marginBottom: 10 },
  langSwitch: { flexDirection: 'row', backgroundColor: '#0A0A0A', borderRadius: 8, padding: 4 },
  langBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  langBtnActive: { backgroundColor: '#0055FF' },
  langText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  btnFermer: { backgroundColor: '#FFF', paddingVertical: 12, borderRadius: 10, marginTop: 10, alignItems: 'center' },
  btnFermerText: { color: '#000', fontWeight: 'bold', fontSize: 13 }
});