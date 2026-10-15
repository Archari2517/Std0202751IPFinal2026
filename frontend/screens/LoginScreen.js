import React, { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { ArcKhe_API_URL } from '../config';
import {
  ArcKhe_COLORS, ArcKhe_HardBox, ArcKhe_Button, ArcKhe_Input, ArcKhe_Background, ArcKhe_showAlert,
} from '../components/ArcKhe_UI';

export default function ArcKhe_LoginScreen({ navigation }) {
  const [ArcKhe_username, ArcKhe_setUsername] = useState('');
  const [ArcKhe_password, ArcKhe_setPassword] = useState('');
  const [ArcKhe_loading, ArcKhe_setLoading] = useState(false);

  const ArcKhe_handleLogin = async () => {
    if (!ArcKhe_username.trim() || !ArcKhe_password) {
      ArcKhe_showAlert('Login failed', 'Please enter username and password');
      return;
    }
    ArcKhe_setLoading(true);
    try {
      const ArcKhe_res = await fetch(`${ArcKhe_API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: ArcKhe_username.trim(), password: ArcKhe_password }),
      });
      const ArcKhe_data = await ArcKhe_res.json().catch(() => ({}));
      if (ArcKhe_res.status === 200 && ArcKhe_data.success) {
        navigation.replace('Dashboard');
      } else {
        ArcKhe_showAlert('Login failed', ArcKhe_data.message || 'Invalid username or password');
      }
    } catch (ArcKhe_err) {
      ArcKhe_showAlert('Network error', 'Cannot connect to the server');
    } finally {
      ArcKhe_setLoading(false);
    }
  };

  return (
    <ArcKhe_Background>
      <View style={ArcKhe_styles.center}>
        <View style={ArcKhe_styles.wrap}>
          <ArcKhe_HardBox radius={24} offset={6} innerStyle={{ padding: 22 }}>
            <View style={ArcKhe_styles.logoRow}>
              <ArcKhe_HardBox fill={ArcKhe_COLORS.yellow} radius={16} offset={3} innerStyle={ArcKhe_styles.logo}>
                <Text style={ArcKhe_styles.logoText}>HR</Text>
              </ArcKhe_HardBox>
            </View>
            <Text style={ArcKhe_styles.title}>HR Manager</Text>
            <Text style={ArcKhe_styles.sub}>Sign in to manage your team</Text>

            <ArcKhe_Input placeholder="Username" autoCapitalize="none" value={ArcKhe_username} onChangeText={ArcKhe_setUsername} />
            <ArcKhe_Input placeholder="Password" secureTextEntry value={ArcKhe_password} onChangeText={ArcKhe_setPassword} />

            <ArcKhe_Button onPress={ArcKhe_handleLogin} disabled={ArcKhe_loading} style={{ marginTop: 6 }}>
              {ArcKhe_loading ? <ActivityIndicator color="#fff" /> : <Text style={ArcKhe_styles.btnText}>Login</Text>}
            </ArcKhe_Button>
          </ArcKhe_HardBox>
        </View>
      </View>
    </ArcKhe_Background>
  );
}

const ArcKhe_styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  wrap: { width: '100%', maxWidth: 420 },
  logoRow: { alignItems: 'center', marginBottom: 12 },
  logo: { width: 68, height: 68, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 26, fontWeight: '900', color: '#111' },
  title: { fontSize: 28, fontWeight: '900', textAlign: 'center', color: '#111' },
  sub: { textAlign: 'center', color: '#555', marginTop: 2, marginBottom: 20 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
