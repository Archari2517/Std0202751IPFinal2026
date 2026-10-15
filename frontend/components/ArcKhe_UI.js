import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, Platform, StatusBar, StyleSheet,
} from 'react-native';

// ---------- theme ----------
export const ArcKhe_COLORS = {
  bg: '#cfe9fb',      // light blue backdrop
  ink: '#111111',     // black outline / text
  blue: '#2f6bff',    // main action
  yellow: '#ffe98a',
  green: '#b9f0c8',
  lilac: '#dcd2ff',
  pink: '#ffc9c9',
  white: '#ffffff',
};
const ArcKhe_C = ArcKhe_COLORS;
export const ArcKhe_MAX_WIDTH = 560; // mobile-first: keep content phone-width on web

// ---------- alerts (web uses window.*, native uses Alert) ----------
export function ArcKhe_showAlert(ArcKhe_title, ArcKhe_message) {
  if (Platform.OS === 'web') window.alert(`${ArcKhe_title}\n${ArcKhe_message}`);
  else Alert.alert(ArcKhe_title, ArcKhe_message);
}

export function ArcKhe_confirm(ArcKhe_title, ArcKhe_message, ArcKhe_onYes) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${ArcKhe_title}\n${ArcKhe_message}`)) ArcKhe_onYes();
    return;
  }
  Alert.alert(ArcKhe_title, ArcKhe_message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: ArcKhe_onYes },
  ]);
}

// ---------- box: thick black outline + rounded corners + hard offset shadow ----------
export function ArcKhe_HardBox({ children, style, innerStyle, fill = ArcKhe_C.white, radius = 18, offset = 4 }) {
  return (
    <View style={[{ paddingRight: offset, paddingBottom: offset }, style]}>
      <View
        style={{
          position: 'absolute', top: offset, left: offset, right: 0, bottom: 0,
          backgroundColor: ArcKhe_C.ink, borderRadius: radius,
        }}
      />
      <View style={[{ backgroundColor: fill, borderWidth: 2.5, borderColor: ArcKhe_C.ink, borderRadius: radius }, innerStyle]}>
        {children}
      </View>
    </View>
  );
}

// ---------- button ----------
export function ArcKhe_Button({ label, onPress, color = ArcKhe_C.blue, textColor = '#fff', disabled, small, style, children }) {
  return (
    <TouchableOpacity activeOpacity={0.75} onPress={onPress} disabled={disabled} style={[disabled && { opacity: 0.6 }, style]}>
      <ArcKhe_HardBox
        fill={color}
        radius={small ? 10 : 14}
        offset={small ? 3 : 4}
        innerStyle={{
          paddingVertical: small ? 8 : 14,
          paddingHorizontal: small ? 12 : 16,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children || <Text style={{ color: textColor, fontWeight: '800', fontSize: small ? 13 : 16 }}>{label}</Text>}
      </ArcKhe_HardBox>
    </TouchableOpacity>
  );
}

// ---------- text input ----------
export function ArcKhe_Input(props) {
  return (
    <ArcKhe_HardBox radius={12} offset={3} style={{ marginBottom: 10 }} innerStyle={{ paddingHorizontal: 14 }}>
      <TextInput
        placeholderTextColor="#888"
        {...props}
        style={[
          { paddingVertical: 12, fontSize: 16, color: ArcKhe_C.ink },
          Platform.OS === 'web' ? { outlineStyle: 'none' } : null,
        ]}
      />
    </ArcKhe_HardBox>
  );
}

// ---------- pill / badge ----------
export function ArcKhe_Pill({ label, fill = ArcKhe_C.green, style }) {
  return (
    <View
      style={[{
        backgroundColor: fill, borderWidth: 2, borderColor: ArcKhe_C.ink, borderRadius: 999,
        paddingHorizontal: 10, paddingVertical: 2, alignSelf: 'flex-start',
      }, style]}
    >
      <Text style={{ color: ArcKhe_C.ink, fontWeight: '800', fontSize: 12 }}>{label}</Text>
    </View>
  );
}

// ---------- decorative background: light blue + floating pastel shapes ----------
const ArcKhe_DECOR = [
  { t: 'blob', c: ArcKhe_C.yellow, size: 220, top: -70, right: -70, o: 0.55 },
  { t: 'blob', c: ArcKhe_C.green, size: 180, bottom: 90, left: -80, o: 0.55 },
  { t: 'blob', c: ArcKhe_C.white, size: 130, top: '42%', right: -40, o: 0.6 },
  { t: 'dot', c: ArcKhe_C.yellow, size: 14, top: '14%', left: '8%' },
  { t: 'dot', c: ArcKhe_C.white, size: 10, top: '22%', right: '14%' },
  { t: 'dot', c: ArcKhe_C.green, size: 12, top: '58%', left: '12%' },
  { t: 'dot', c: ArcKhe_C.yellow, size: 9, top: '72%', right: '18%' },
  { t: 'dot', c: ArcKhe_C.white, size: 12, top: '88%', left: '30%' },
  { t: 'dot', c: ArcKhe_C.green, size: 8, top: '33%', left: '45%' },
  { t: 'star', c: ArcKhe_C.yellow, ch: '★', size: 26, top: '10%', right: '30%' },
  { t: 'star', c: ArcKhe_C.white, ch: '✦', size: 24, top: '48%', left: '6%' },
  { t: 'star', c: ArcKhe_C.yellow, ch: '✦', size: 20, top: '80%', right: '8%' },
  { t: 'star', c: ArcKhe_C.white, ch: '★', size: 18, top: '64%', right: '40%' },
  { t: 'ring', c: ArcKhe_C.white, size: 34, top: '30%', left: '14%' },
  { t: 'ring', c: ArcKhe_C.green, size: 26, top: '92%', right: '12%' },
  { t: 'arch', c: ArcKhe_C.white, size: 70, top: '6%', left: '34%' },
  { t: 'arch', c: ArcKhe_C.yellow, size: 56, top: '68%', left: '2%' },
];

function ArcKhe_Shape({ d }) {
  const pos = { position: 'absolute' };
  ['top', 'bottom', 'left', 'right'].forEach((k) => { if (d[k] !== undefined) pos[k] = d[k]; });
  if (d.t === 'blob') {
    return <View style={[pos, { width: d.size, height: d.size, borderRadius: d.size / 2, backgroundColor: d.c, opacity: d.o }]} />;
  }
  if (d.t === 'dot') {
    return <View style={[pos, { width: d.size, height: d.size, borderRadius: d.size / 2, backgroundColor: d.c }]} />;
  }
  if (d.t === 'ring') {
    return <View style={[pos, { width: d.size, height: d.size, borderRadius: d.size / 2, borderWidth: 4, borderColor: d.c }]} />;
  }
  if (d.t === 'arch') {
    return (
      <View
        style={[pos, {
          width: d.size, height: d.size / 2, borderTopLeftRadius: d.size, borderTopRightRadius: d.size,
          borderWidth: 5, borderBottomWidth: 0, borderColor: d.c,
        }]}
      />
    );
  }
  return <Text style={[pos, { color: d.c, fontSize: d.size }]}>{d.ch}</Text>;
}

export function ArcKhe_Background({ children }) {
  return (
    <View style={{ flex: 1, backgroundColor: ArcKhe_C.bg }}>
      <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
        {ArcKhe_DECOR.map((d, i) => <ArcKhe_Shape key={i} d={d} />)}
      </View>
      {children}
    </View>
  );
}

// ---------- header bar ----------
export function ArcKhe_AppBar({ title, subtitle, onBack, right }) {
  const ArcKhe_top = Platform.OS === 'web' ? 14 : Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 54;
  return (
    <View style={[ArcKhe_uiStyles.bar, { paddingTop: ArcKhe_top }]}>
      <View style={ArcKhe_uiStyles.barInner}>
        <View style={ArcKhe_uiStyles.barLeft}>
          {onBack ? <ArcKhe_Button small label="←" color={ArcKhe_C.yellow} textColor={ArcKhe_C.ink} onPress={onBack} style={{ marginRight: 8 }} /> : null}
          <View style={{ flexShrink: 1 }}>
            <Text style={ArcKhe_uiStyles.barTitle}>{title}</Text>
            {subtitle ? <Text style={ArcKhe_uiStyles.barSub}>{subtitle}</Text> : null}
          </View>
        </View>
        {right}
      </View>
    </View>
  );
}

const ArcKhe_uiStyles = StyleSheet.create({
  bar: {
    backgroundColor: ArcKhe_C.white, borderBottomWidth: 3, borderBottomColor: ArcKhe_C.ink,
    paddingBottom: 12, paddingHorizontal: 16,
  },
  barInner: {
    width: '100%', maxWidth: ArcKhe_MAX_WIDTH, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  barLeft: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  barTitle: { fontSize: 20, fontWeight: '900', color: ArcKhe_C.ink },
  barSub: { fontSize: 12, color: '#555', marginTop: 1 },
});
