import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity, Modal, TextInput, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import ProgressBar from './components/ProgressBar.web';
import MathDisplay from './components/MathDisplay';

// --- IMPORTS DE TES NOUVEAUX FICHIERS ---
import { traductions } from './src/traductions';
import { styles } from './src/styles';

export default function App() {
  const [ecranActuel, setEcranActuel] = useState('splash');
  const [langue, setLangue] = useState('FR');
  const [estEnChargement, setEstEnChargement] = useState(false);
  const [imageSelectionnee, setImageSelectionnee] = useState(null);
  const [estMenuVisible, setEstMenuVisible] = useState(false);
  const [prenomUtilisateur, setPrenomUtilisateur] = useState("");
  const [nomUtilisateur, setNomUtilisateur] = useState("");
  const [estEnAnalyse, setEstEnAnalyse] = useState(false);
  const [reponse, setReponse] = useState(null);
  const [demarche, setDemarche] = useState(null);
  const [estDemarcheVisible, setEstDemarcheVisible] = useState(false);

  const texte = traductions[langue];

  const cleanDemarche = (text) => {
    if (!text) return '';
    // Gère les \frac avec accolades imbriquées (ex: \frac{2x}{x^{2} + 1})
    const expandFrac = (t) => {
      return t.replace(/\\frac\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g,
        (_, num, den) => `(${num})/(${den})`);
    };
    let result = text;
    // Appliquer plusieurs fois pour les fracs imbriquées
    for (let i = 0; i < 3; i++) result = expandFrac(result);
    return result
      .replace(/\\int_\{([^}]+)\}\^\{([^}]+)\}/g, '∫[$1→$2]')
      .replace(/\\int/g, '∫')
      .replace(/\\log\b/g, 'log')
      .replace(/\\ln\b/g, 'ln')
      .replace(/\\left\(/g, '(').replace(/\\right\)/g, ')')
      .replace(/\\left\[/g, '[').replace(/\\right\]/g, ']')
      .replace(/\\left\|/g, '|').replace(/\\right\|/g, '|')
      .replace(/\\left/g, '').replace(/\\right/g, '')
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
      .replace(/\\cdot/g, '·')
      .replace(/\\,/g, ' ')
      .replace(/\\\\/g, '\n')
      .replace(/\$/g, '')
      .replace(/\{/g, '').replace(/\}/g, '');
  };

  useEffect(() => {
    const timerSplash = setTimeout(() => setEcranActuel('auth'), 2000);
    return () => clearTimeout(timerSplash);
  }, []);

  const gererConnexion = () => {
    if (!prenomUtilisateur || !nomUtilisateur) return alert("Veuillez remplir tous les champs");
    setEstEnChargement(true);
    setTimeout(() => {
      setEstEnChargement(false);
      setEcranActuel('app');
    }, 1000);
  };

  const analyserImage = async () => {
    if (!imageSelectionnee || estEnAnalyse) return;
    setEstEnAnalyse(true);
    setReponse(null);
    setDemarche(null);
    try {
      // Convertir l'image en base64
      const res = await fetch(imageSelectionnee);
      const blob = await res.blob();
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
      });

      // Envoyer au webhook n8n
      const webhookRes = await fetch('https://n8n.srvnt.ca/webhook/dca5a6c3-9cec-4215-83e7-334ef0f3c2da', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const data = await webhookRes.json();
      setReponse(data.reponse);
      setDemarche(data.demarche);
      setEstDemarcheVisible(true);
    } catch (e) {
      alert("Erreur lors de l'analyse : " + e.message);
    } finally {
      setEstEnAnalyse(false);
    }
  };

  const ouvrirGalerie = async () => {
    let resultat = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!resultat.canceled) {
      setImageSelectionnee(resultat.assets[0].uri);
    }
  };

  if (ecranActuel === 'splash') {
    return (
        <View style={styles.fondCentral}>
          <ActivityIndicator size="large" color="#0055FF" />
          <Text style={styles.logoSplash}>INTEGRAL<Text style={{color:'#0055FF'}}>SCAN</Text></Text>
        </View>
    );
  }

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

  return (
      <View style={styles.fondPrincipal}>
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

        <View style={styles.enTete}>
          <View style={{width: 24}} />
          <Text style={styles.titreMarque}>INTEGRAL<Text style={styles.texteAccent}>{texte.titre}</Text></Text>
          <TouchableOpacity onPress={() => setEstMenuVisible(true)}><Text style={{fontSize:20}}>⚙️</Text></TouchableOpacity>
        </View>

        {prenomUtilisateur ? <Text style={styles.salutationUser}>{texte.bienvenue}, {prenomUtilisateur}</Text> : null}

        <View style={styles.cadreImage}>
          {imageSelectionnee ? (
              <Image source={{ uri: String(imageSelectionnee) }} style={{width:'100%', height:'100%', borderRadius:12}} />
          ) : (
              <Text style={{color:'#222', fontSize:10, fontWeight:'bold'}}>{texte.placeholder}</Text>
          )}
        </View>

        <View style={{width:300, marginBottom:20}}>
          <ProgressBar value={reponse ? 100 : estEnAnalyse ? 50 : imageSelectionnee ? 10 : 0} preset="energy"/>
        </View>

        <View style={styles.boiteStatut}>
          <View style={[styles.indicateurStatut, {backgroundColor: reponse ? '#00FF66' : estEnAnalyse ? '#FF9900' : imageSelectionnee ? '#0055FF' : '#333'}]} />
          <Text style={{color:'#EEE', fontSize:12}}>
            {reponse ? texte.termine : estEnAnalyse ? texte.analyse : imageSelectionnee ? texte.pret : texte.veille}
          </Text>
        </View>

        <View style={{gap: 12}}>
          <TouchableOpacity style={styles.boutonPlein} onPress={ouvrirGalerie}>
            <Text style={styles.texteBoutonPlein}>{texte.charger}</Text>
          </TouchableOpacity>

          <TouchableOpacity
              style={[styles.boutonPlein, {opacity: imageSelectionnee && !estEnAnalyse ? 1 : 0.3, backgroundColor: '#003399'}]}
              disabled={!imageSelectionnee || estEnAnalyse}
              onPress={analyserImage}
          >
            {estEnAnalyse
              ? <ActivityIndicator color="#FFF"/>
              : <Text style={styles.texteBoutonPlein}>{texte.analyser}</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
              style={[styles.boutonVide, {opacity: reponse ? 1 : 0.3}]}
              disabled={!reponse}
              onPress={() => setEstDemarcheVisible(true)}
          >
            <Text style={styles.texteBoutonVide}>{texte.demarche}</Text>
          </TouchableOpacity>
        </View>

        {/* Modal démarche */}
        <Modal visible={estDemarcheVisible} animationType="slide" transparent={true}>
          <View style={styles.surcoucheModal}>
            <View style={[styles.contenuModal, {maxHeight: '80%'}]}>
              <Text style={styles.titreModal}>{texte.demarche}</Text>
              {reponse && <MathDisplay latex={reponse} />}
              <ScrollView>
                <Text style={{color:'#CCC', fontSize:12, fontFamily:'monospace', lineHeight:20}}>{cleanDemarche(demarche)}</Text>
              </ScrollView>
              <TouchableOpacity style={[styles.boutonFermerModal, {marginTop:15}]} onPress={() => setEstDemarcheVisible(false)}>
                <Text style={styles.texteBoutonFermer}>{texte.fermer}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <StatusBar style="light" />
      </View>
  );
}