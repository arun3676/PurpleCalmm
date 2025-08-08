import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, Platform } from 'react-native';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { loadSettings, saveSettings } from '../utils/storage';
import PawButton from '../components/PawButton';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { loadEntries } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const { colors, themeName, setThemeName, vibe, setVibe, reduceMotion, setReduceMotion } = useAppTheme();
  const [quote, setQuote] = useState('');
  const [image, setImage] = useState('');
  const [durMigraine, setDurMigraine] = useState('15');

  useEffect(() => {
    (async () => {
      const s = await loadSettings();
      if (s?.defaultDurations?.migraineTimer) setDurMigraine(String(s.defaultDurations.migraineTimer));
    })();
  }, []);

  async function addComfort() {
    const s = (await loadSettings()) || {};
    const quotes = s.comfortPack?.quotes ?? [];
    const images = s.comfortPack?.images ?? [];
    if (quote.trim()) quotes.push(quote.trim());
    if (image.trim()) images.push(image.trim());
    await saveSettings({ comfortPack: { quotes, images } });
    setQuote('');
    setImage('');
  }

  async function exportData() {
    const entries = await loadEntries();
    const s = (await loadSettings()) || {};
    const json = JSON.stringify({ entries, settings: s }, null, 2);
    if (Platform.OS === 'web') {
      await Clipboard.setStringAsync(json);
      alert('Copied JSON to clipboard.');
      return;
    }
    const file = FileSystem.cacheDirectory + 'purrple-calm-export.json';
    await FileSystem.writeAsStringAsync(file, json, { encoding: FileSystem.EncodingType.UTF8 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file);
    } else {
      await Clipboard.setStringAsync(json);
      alert('Copied JSON to clipboard.');
    }
  }

  async function saveDurations() {
    await saveSettings({ defaultDurations: { migraineTimer: Number(durMigraine) } });
    alert('Saved defaults.');
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={[textStyles.body, { color: colors.accent }]}>← Back</Text>
      </Pressable>

      <Text style={[textStyles.h1, { color: colors.text, marginTop: 12 }]}>Settings</Text>

      <View style={{ marginTop: 16 }}>
        <Text style={[textStyles.h2, { color: colors.text }]}>Theme</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <PawButton label="Purple" onPress={() => setThemeName('purple')} />
          <PawButton label="V-Jazz" onPress={() => setThemeName('vjazz')} />
        </View>
        <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 4 }]}>Current: {themeName}</Text>
      </View>

      <View style={{ marginTop: 16, flexDirection: 'row', gap: 12 }}>
        <PawButton label={vibe ? 'V-vibe: ON' : 'V-vibe: OFF'} onPress={() => setVibe(!vibe)} />
        <PawButton label={reduceMotion ? 'Reduce Motion: ON' : 'Reduce Motion: OFF'} onPress={() => setReduceMotion(!reduceMotion)} />
      </View>

      <View style={{ marginTop: 16 }}>
        <Text style={[textStyles.h2, { color: colors.text }]}>Default Durations</Text>
        <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[textStyles.body, { color: colors.mutedText }]}>Migraine Timer (min)</Text>
          <TextInput
            keyboardType="number-pad"
            value={durMigraine}
            onChangeText={setDurMigraine}
            style={{ backgroundColor: colors.surface, color: colors.text, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, width: 72 }}
          />
          <PawButton label="Save" onPress={saveDurations} />
        </View>
      </View>

      <View style={{ marginTop: 16 }}>
        <Text style={[textStyles.h2, { color: colors.text }]}>Comfort Pack</Text>
        <TextInput
          placeholder="Add quote"
          value={quote}
          onChangeText={setQuote}
          placeholderTextColor={colors.mutedText}
          style={{ backgroundColor: colors.surface, color: colors.text, borderRadius: 8, padding: 10, marginTop: 8 }}
        />
        <TextInput
          placeholder="Add image URL"
          value={image}
          onChangeText={setImage}
          placeholderTextColor={colors.mutedText}
          style={{ backgroundColor: colors.surface, color: colors.text, borderRadius: 8, padding: 10, marginTop: 8 }}
        />
        <View style={{ marginTop: 8 }}>
          <PawButton label="Add" onPress={addComfort} />
        </View>
      </View>

      <View style={{ marginTop: 16 }}>
        <Text style={[textStyles.h2, { color: colors.text }]}>Data</Text>
        <PawButton label="Export JSON" onPress={exportData} />
      </View>
    </View>
  );
}
