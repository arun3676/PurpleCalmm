import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useSettings } from '../providers/SettingsProvider';
import { playSong, stopAndUnload } from '../utils/audio';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const THEMES: Array<{key:'purple'|'vjazz', label:string}> = [
  { key:'purple', label:'Purple' },
  { key:'vjazz',  label:'V-Jazz' },
];

function Chip({ onPress, active, label, style }: any){
  return (
    <Pressable onPress={onPress} style={[{
      backgroundColor: active ? '#7c4dff' : '#ece6ff',
      paddingVertical:10, paddingHorizontal:14, borderRadius:14, marginRight:10, marginBottom:10
    }, style]}>
      <Text style={{ color: '#1a102b', fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export default function SettingsScreen({ navigation }: Props){
  const { colors, darkMode, setDarkMode } = useAppTheme();
  const {
    theme, setTheme,
    reduceMotion, setReduceMotion,
    migraineDefaultMinutes, setMigraineDefaultMinutes,
    voice, setVoice,
    masterVolume, setMasterVolume
  } = useSettings();

  const [mins, setMins] = React.useState<number>(migraineDefaultMinutes || 10);
  const [toast, setToast] = React.useState<string | null>(null);
  function showToast(msg:string){ setToast(msg); setTimeout(()=>setToast(null), 1200); }

  async function saveMinutes(n:number){
    const v = Math.max(1, Math.min(120, Math.floor(n)));
    await setMigraineDefaultMinutes(v);
    setMins(v);
    showToast(`Default migraine timer: ${v} min`);
  }

  async function testGoodnight(){
    try {
      const h = await playSong('goodnight_' + voice, masterVolume, false);
      setTimeout(()=> { try{ stopAndUnload(h); }catch{} }, 1200);
    } catch {
      showToast('Audio ready on next tap');
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding:16, paddingBottom:40 }}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={[textStyles.body, { color: colors.accent }]}>← Back</Text>
      </Pressable>
      <Text style={{ fontSize:28, fontWeight:'700', marginBottom:10, color: colors.text }}>Settings</Text>

      <Text style={{ fontSize:18, fontWeight:'700', marginTop:8, color: colors.text }}>Theme</Text>
      <View style={{ flexDirection:'row', flexWrap:'wrap', marginTop:8 }}>
        {THEMES.map(t => (
          <Chip key={t.key} label={t.label} active={theme===t.key}
            onPress={() => setTheme(t.key)} />
        ))}
      </View>

      <Text style={{ fontSize:18, fontWeight:'700', marginTop:20, color: colors.text }}>Comfort</Text>
      <View style={{ flexDirection:'row', alignItems:'center', marginTop:8 }}>
        <Chip label={`Reduce Motion: ${reduceMotion ? 'ON' : 'OFF'}`}
          active={reduceMotion}
          onPress={() => setReduceMotion(!reduceMotion)} />
      </View>

      <View style={{ flexDirection:'row', alignItems:'center', marginTop:8 }}>
        <Chip label={`Reduce Motion: ${reduceMotion ? 'ON' : 'OFF'}`}
          active={reduceMotion}
          onPress={() => setReduceMotion(!reduceMotion)} />
        <Chip label={`Night Mode: ${darkMode ? 'ON' : 'OFF'}`}
          active={darkMode}
          onPress={() => setDarkMode(!darkMode)} />
      </View>

      <Text style={{ fontSize:18, fontWeight:'700', marginTop:24, color: colors.text }}>Volume</Text>
      <View style={{ flexDirection:'row', alignItems:'center', gap:10, marginTop:6 }}>
        <Chip label="−" onPress={()=> setMasterVolume(Math.max(0, +(masterVolume-0.05).toFixed(2)))} />
        <Text style={{ width:70, textAlign:'center', color: colors.text }}>{Math.round(masterVolume*100)}%</Text>
        <Chip label="+" onPress={()=> setMasterVolume(Math.min(1, +(masterVolume+0.05).toFixed(2)))} />
      </View>


      {toast && (
        <View style={{
          position:'absolute', left:16, right:16, bottom:16,
          backgroundColor:'rgba(0,0,0,0.8)', borderRadius:12, paddingVertical:8, paddingHorizontal:12
        }}>
          <Text style={{ color:'#fff', textAlign:'center' }}>{toast}</Text>
        </View>
      )}
    </ScrollView>
  );
}
