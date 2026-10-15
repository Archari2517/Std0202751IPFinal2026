import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { ArcKhe_API_URL } from '../config';

function ArcKhe_showAlert(ArcKhe_title, ArcKhe_message) {
  if (Platform.OS === 'web') window.alert(`${ArcKhe_title}\n${ArcKhe_message}`);
  else Alert.alert(ArcKhe_title, ArcKhe_message);
}

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
    <View style={ArcKhe_styles.container}>
      <Text style={ArcKhe_styles.title}>HR Manager</Text>
      <TextInput
        style={ArcKhe_styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={ArcKhe_username}
        onChangeText={ArcKhe_setUsername}
      />
      <TextInput
        style={ArcKhe_styles.input}
        placeholder="Password"
        secureTextEntry
        value={ArcKhe_password}
        onChangeText={ArcKhe_setPassword}
      />
      <TouchableOpacity style={ArcKhe_styles.button} onPress={ArcKhe_handleLogin} disabled={ArcKhe_loading}>
        {ArcKhe_loading ? <ActivityIndicator color="#fff" /> : <Text style={ArcKhe_styles.buttonText}>Login</Text>}
      </TouchableOpacity>
    </View>
  );
}

const ArcKhe_styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f4f6fb' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccd', borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#2f6fed', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
