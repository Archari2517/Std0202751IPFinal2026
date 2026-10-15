import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, Alert,
  ActivityIndicator, StyleSheet, Platform,
} from 'react-native';
import { ArcKhe_API_URL } from '../config';

function ArcKhe_showAlert(ArcKhe_title, ArcKhe_message) {
  if (Platform.OS === 'web') window.alert(`${ArcKhe_title}\n${ArcKhe_message}`);
  else Alert.alert(ArcKhe_title, ArcKhe_message);
}

function ArcKhe_confirm(ArcKhe_title, ArcKhe_message, ArcKhe_onYes) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${ArcKhe_title}\n${ArcKhe_message}`)) ArcKhe_onYes();
    return;
  }
  Alert.alert(ArcKhe_title, ArcKhe_message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: ArcKhe_onYes },
  ]);
}

export default function ArcKhe_DashboardScreen({ navigation }) {
  const [ArcKhe_employees, ArcKhe_setEmployees] = useState([]);
  const [ArcKhe_listLoading, ArcKhe_setListLoading] = useState(true);
  const [ArcKhe_name, ArcKhe_setName] = useState('');
  const [ArcKhe_position, ArcKhe_setPosition] = useState('');
  const [ArcKhe_salary, ArcKhe_setSalary] = useState('');
  const [ArcKhe_clusters, ArcKhe_setClusters] = useState(null);
  const [ArcKhe_analyzing, ArcKhe_setAnalyzing] = useState(false);

  const ArcKhe_loadEmployees = useCallback(async () => {
    try {
      const ArcKhe_res = await fetch(`${ArcKhe_API_URL}/api/employees`);
      if (!ArcKhe_res.ok) throw new Error('bad response');
      ArcKhe_setEmployees(await ArcKhe_res.json());
    } catch (ArcKhe_err) {
      ArcKhe_showAlert('Error', 'Cannot load employees');
    } finally {
      ArcKhe_setListLoading(false);
    }
  }, []);

  useEffect(() => {
    ArcKhe_loadEmployees();
  }, [ArcKhe_loadEmployees]);

  const ArcKhe_handleAdd = async () => {
    const ArcKhe_nameTrim = ArcKhe_name.trim();
    const ArcKhe_positionTrim = ArcKhe_position.trim();
    const ArcKhe_salaryNum = Number(ArcKhe_salary);
    if (!ArcKhe_nameTrim || !ArcKhe_positionTrim || !ArcKhe_salary.trim()) {
      ArcKhe_showAlert('Validation', 'Please fill in name, position and salary');
      return;
    }
    if (!Number.isFinite(ArcKhe_salaryNum) || ArcKhe_salaryNum <= 0) {
      ArcKhe_showAlert('Validation', 'Salary must be a positive number');
      return;
    }
    try {
      const ArcKhe_res = await fetch(`${ArcKhe_API_URL}/api/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: ArcKhe_nameTrim, position: ArcKhe_positionTrim, salary: ArcKhe_salaryNum }),
      });
      const ArcKhe_data = await ArcKhe_res.json().catch(() => ({}));
      if (!ArcKhe_res.ok) {
        ArcKhe_showAlert('Error', ArcKhe_data.message || 'Cannot add employee');
        return;
      }
      ArcKhe_setEmployees((ArcKhe_prev) => [...ArcKhe_prev, ArcKhe_data]);
      ArcKhe_setName('');
      ArcKhe_setPosition('');
      ArcKhe_setSalary('');
      ArcKhe_setClusters(null); // ข้อมูลเปลี่ยน ผลวิเคราะห์เดิมไม่ตรงแล้ว
    } catch (ArcKhe_err) {
      ArcKhe_showAlert('Network error', 'Cannot connect to the server');
    }
  };

  const ArcKhe_handleToggle = async (ArcKhe_id) => {
    try {
      const ArcKhe_res = await fetch(`${ArcKhe_API_URL}/api/employees/${ArcKhe_id}/status`, { method: 'PUT' });
      const ArcKhe_data = await ArcKhe_res.json().catch(() => ({}));
      if (!ArcKhe_res.ok) {
        ArcKhe_showAlert('Error', ArcKhe_data.message || 'Cannot update status');
        return;
      }
      ArcKhe_setEmployees((ArcKhe_prev) => ArcKhe_prev.map((e) => (e.id === ArcKhe_data.id ? ArcKhe_data : e)));
    } catch (ArcKhe_err) {
      ArcKhe_showAlert('Network error', 'Cannot connect to the server');
    }
  };

  const ArcKhe_doDelete = async (ArcKhe_id) => {
    try {
      const ArcKhe_res = await fetch(`${ArcKhe_API_URL}/api/employees/${ArcKhe_id}`, { method: 'DELETE' });
      if (!ArcKhe_res.ok) {
        const ArcKhe_data = await ArcKhe_res.json().catch(() => ({}));
        ArcKhe_showAlert('Error', ArcKhe_data.message || 'Cannot delete employee');
        return;
      }
      ArcKhe_setEmployees((ArcKhe_prev) => ArcKhe_prev.filter((e) => e.id !== ArcKhe_id));
      ArcKhe_setClusters(null);
    } catch (ArcKhe_err) {
      ArcKhe_showAlert('Network error', 'Cannot connect to the server');
    }
  };

  const ArcKhe_handleDelete = (ArcKhe_id) => {
    ArcKhe_confirm('Are you sure?', 'This employee will be permanently deleted.', () => ArcKhe_doDelete(ArcKhe_id));
  };

  const ArcKhe_handleAnalyze = async () => {
    ArcKhe_setAnalyzing(true);
    ArcKhe_setClusters(null);
    try {
      const ArcKhe_res = await fetch(`${ArcKhe_API_URL}/api/employees/salary-clusters`);
      const ArcKhe_data = await ArcKhe_res.json().catch(() => ({}));
      if (!ArcKhe_res.ok || !ArcKhe_data.success) {
        ArcKhe_showAlert('Error', ArcKhe_data.message || 'Cannot analyze salary structure');
        return;
      }
      ArcKhe_setClusters(ArcKhe_data.clusters);
    } catch (ArcKhe_err) {
      ArcKhe_showAlert('Network error', 'Cannot connect to the server');
    } finally {
      ArcKhe_setAnalyzing(false);
    }
  };

  const ArcKhe_renderHeader = () => (
    <View>
      <Text style={ArcKhe_styles.sectionTitle}>Add Employee</Text>
      <TextInput style={ArcKhe_styles.input} placeholder="Name" value={ArcKhe_name} onChangeText={ArcKhe_setName} />
      <TextInput style={ArcKhe_styles.input} placeholder="Position" value={ArcKhe_position} onChangeText={ArcKhe_setPosition} />
      <TextInput
        style={ArcKhe_styles.input}
        placeholder="Salary"
        keyboardType="numeric"
        value={ArcKhe_salary}
        onChangeText={ArcKhe_setSalary}
      />
      <TouchableOpacity style={ArcKhe_styles.primaryBtn} onPress={ArcKhe_handleAdd}>
        <Text style={ArcKhe_styles.btnText}>Add Employee</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[ArcKhe_styles.primaryBtn, ArcKhe_styles.analyzeBtn]} onPress={ArcKhe_handleAnalyze} disabled={ArcKhe_analyzing}>
        <Text style={ArcKhe_styles.btnText}>Analyze Salary Structure</Text>
      </TouchableOpacity>

      {ArcKhe_analyzing && <ActivityIndicator size="large" color="#2f6fed" style={{ marginVertical: 12 }} />}

      {ArcKhe_clusters && (
        <View>
          <Text style={ArcKhe_styles.sectionTitle}>Salary Tiers</Text>
          <View style={ArcKhe_styles.clusterRow}>
            {ArcKhe_clusters.map((c) => (
              <View key={c.group} style={ArcKhe_styles.clusterCard}>
                <Text style={ArcKhe_styles.clusterTier}>{c.group}</Text>
                <Text style={ArcKhe_styles.clusterCount}>{c.count}</Text>
                <Text style={ArcKhe_styles.clusterLabel}>employees</Text>
                <Text style={ArcKhe_styles.clusterSalary}>{Number(c.centroid).toLocaleString()}</Text>
                <Text style={ArcKhe_styles.clusterLabel}>avg salary</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Text style={ArcKhe_styles.sectionTitle}>Employees ({ArcKhe_employees.length})</Text>
      {ArcKhe_listLoading && <ActivityIndicator style={{ marginVertical: 12 }} />}
    </View>
  );

  const ArcKhe_renderItem = ({ item: ArcKhe_item }) => (
    <View style={ArcKhe_styles.card}>
      <Text style={ArcKhe_styles.cardName}>{ArcKhe_item.name}</Text>
      <Text>{ArcKhe_item.position}</Text>
      <Text>
        Status:{' '}
        <Text style={{ color: ArcKhe_item.status === 'Active' ? '#1a8f3c' : '#d9822b', fontWeight: 'bold' }}>
          {ArcKhe_item.status}
        </Text>
      </Text>
      <Text>Salary: {Number(ArcKhe_item.salary).toLocaleString()}</Text>
      <View style={ArcKhe_styles.btnRow}>
        <TouchableOpacity style={[ArcKhe_styles.smallBtn, { backgroundColor: '#2f6fed' }]} onPress={() => ArcKhe_handleToggle(ArcKhe_item.id)}>
          <Text style={ArcKhe_styles.btnText}>Toggle Status</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[ArcKhe_styles.smallBtn, { backgroundColor: '#d33' }]} onPress={() => ArcKhe_handleDelete(ArcKhe_item.id)}>
          <Text style={ArcKhe_styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      style={ArcKhe_styles.container}
      contentContainerStyle={{ padding: 16 }}
      data={ArcKhe_employees}
      keyExtractor={(ArcKhe_item) => ArcKhe_item.id}
      renderItem={ArcKhe_renderItem}
      ListHeaderComponent={ArcKhe_renderHeader}
      ListFooterComponent={
        <TouchableOpacity style={[ArcKhe_styles.primaryBtn, { backgroundColor: '#666', marginTop: 8 }]} onPress={() => navigation.replace('Login')}>
          <Text style={ArcKhe_styles.btnText}>Logout</Text>
        </TouchableOpacity>
      }
      keyboardShouldPersistTaps="handled"
    />
  );
}

const ArcKhe_styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccd', borderRadius: 8, padding: 10, marginBottom: 8 },
  primaryBtn: { backgroundColor: '#2f6fed', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  analyzeBtn: { backgroundColor: '#7a3fe0', marginTop: 12 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10, elevation: 2 },
  cardName: { fontSize: 16, fontWeight: 'bold' },
  btnRow: { flexDirection: 'row', marginTop: 8 },
  smallBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginRight: 8 },
  clusterRow: { flexDirection: 'row', justifyContent: 'space-between' },
  clusterCard: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10, marginHorizontal: 3, alignItems: 'center', elevation: 2 },
  clusterTier: { fontWeight: 'bold', color: '#7a3fe0', marginBottom: 4 },
  clusterCount: { fontSize: 24, fontWeight: 'bold' },
  clusterSalary: { fontSize: 16, fontWeight: 'bold', marginTop: 6 },
  clusterLabel: { fontSize: 11, color: '#777' },
});
