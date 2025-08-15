import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text, Pressable } from 'react-native';

type Props = {
  visible: boolean;
  level: number; // Changed to allow any value from 0 to 0.8
  onLevelChange: (lvl: number) => void;
  onExit: () => void;
  reduceMotion?: boolean;
};

export default function DimOverlay({ visible, level, onLevelChange, onExit, reduceMotion }: Props) {
  const a = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const to = visible ? level : 0;
    if (reduceMotion) {
      a.setValue(to);
    } else {
      Animated.timing(a, { toValue: to, duration: 180, useNativeDriver: false }).start();
    }
  }, [visible, level, reduceMotion]);

  return (
    <Animated.View pointerEvents={visible ? 'auto' : 'none'}
      style={[StyleSheet.absoluteFill, { backgroundColor: 'black', opacity: a }]}>
      {visible && (
        <View style={s.panel}>
          <Text style={s.title}>Migraine-Friendly Brightness</Text>
          <Text style={s.subtitle}>Current: {Math.round(level * 100)}% dim</Text>
          
          {/* Preset buttons */}
          <View style={s.row}>
            {[
              { label: 'Mild', value: 0.2 },
              { label: 'Medium', value: 0.5 },
              { label: 'Strong', value: 0.8 }
            ].map(({ label, value }) => (
              <Pressable key={label}
                accessibilityLabel={`Set ${label} dim ${Math.round(value * 100)}%`}
                onPress={() => onLevelChange(value)}
                style={[s.chip, Math.abs(level - value) < 0.05 && s.chipOn]}>
                <Text style={[s.chipText, Math.abs(level - value) < 0.05 && s.chipTextOn]}>
                  {label}
                </Text>
                <Text style={[s.chipSubtext, Math.abs(level - value) < 0.05 && s.chipTextOn]}>
                  {Math.round(value * 100)}%
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Fine adjustment controls */}
          <View style={s.adjustRow}>
            <Pressable 
              onPress={() => onLevelChange(Math.max(0, level - 0.1))}
              style={[s.adjustBtn, { opacity: level <= 0 ? 0.3 : 1 }]}
              disabled={level <= 0}>
              <Text style={s.adjustText}>−10%</Text>
            </Pressable>
            
            <View style={s.levelDisplay}>
              <Text style={s.levelText}>{Math.round(level * 100)}%</Text>
              <Text style={s.levelLabel}>dimmed</Text>
            </View>
            
            <Pressable 
              onPress={() => onLevelChange(Math.min(0.8, level + 0.1))}
              style={[s.adjustBtn, { opacity: level >= 0.8 ? 0.3 : 1 }]}
              disabled={level >= 0.8}>
              <Text style={s.adjustText}>+10%</Text>
            </Pressable>
          </View>

          {/* Action buttons */}
          <View style={s.buttonRow}>
            <Pressable 
              onPress={() => onLevelChange(0)} 
              style={[s.actionBtn, s.normalBtn]}>
              <Text style={s.actionText}>Normal</Text>
            </Pressable>
            <Pressable 
              accessibilityLabel="Exit dim mode" 
              onPress={onExit} 
              style={[s.actionBtn, s.exitBtn]}>
              <Text style={s.exitText}>Done</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  panel: { 
    position: 'absolute', 
    bottom: 24, 
    left: 16, 
    right: 16, 
    alignItems: 'center',
    backgroundColor: 'rgba(38, 38, 38, 0.95)',
    borderRadius: 20,
    padding: 20,
  },
  title: { 
    color: '#f5f5f5', 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 4 
  },
  subtitle: { 
    color: '#a1a1aa', 
    fontSize: 14, 
    marginBottom: 20 
  },
  row: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 20 
  },
  chip: { 
    paddingVertical: 12, 
    paddingHorizontal: 18, 
    borderRadius: 16, 
    backgroundColor: '#404040',
    alignItems: 'center',
    minWidth: 80,
  },
  chipOn: { 
    backgroundColor: '#8b5cf6' 
  },
  chipText: { 
    color: '#e5e5e5', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  chipSubtext: { 
    color: '#a1a1aa', 
    fontSize: 12, 
    marginTop: 2 
  },
  chipTextOn: { 
    color: 'white', 
    fontWeight: '700' 
  },
  
  adjustRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 20, 
    marginBottom: 20 
  },
  adjustBtn: { 
    backgroundColor: '#404040', 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 12 
  },
  adjustText: { 
    color: '#e5e5e5', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  levelDisplay: { 
    alignItems: 'center', 
    backgroundColor: '#262626', 
    paddingVertical: 16, 
    paddingHorizontal: 24, 
    borderRadius: 16, 
    minWidth: 100 
  },
  levelText: { 
    color: '#8b5cf6', 
    fontSize: 24, 
    fontWeight: '800' 
  },
  levelLabel: { 
    color: '#a1a1aa', 
    fontSize: 12, 
    marginTop: 2 
  },
  
  buttonRow: { 
    flexDirection: 'row', 
    gap: 12, 
    width: '100%' 
  },
  actionBtn: { 
    flex: 1, 
    paddingVertical: 14, 
    borderRadius: 14, 
    alignItems: 'center' 
  },
  normalBtn: { 
    backgroundColor: '#404040' 
  },
  exitBtn: { 
    backgroundColor: '#8b5cf6' 
  },
  actionText: { 
    color: '#e5e5e5', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  exitText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: '700' 
  },
});


