import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ArcKhe_API_URL } from '../config';
import {
  ArcKhe_COLORS, ArcKhe_MAX_WIDTH, ArcKhe_HardBox, ArcKhe_Button, ArcKhe_Background,
  ArcKhe_AppBar, ArcKhe_Pill, ArcKhe_showAlert, ArcKhe_confirm,
} from '../components/ArcKhe_UI';
import ArcKhe_SalaryChart from '../components/ArcKhe_SalaryChart';

const ArcKhe_C = ArcKhe_COLORS;
const ArcKhe_tierFills = [ArcKhe_C.yellow, ArcKhe_C.green, ArcKhe_C.lilac];
const ArcKhe_avatarFills = [ArcKhe_C.yellow, ArcKhe_C.green, ArcKhe_C.lilac, ArcKhe_C.pink];

export default function ArcKhe_DashboardScreen({ navigation }) {
  const [ArcKhe_employees, ArcKhe_setEmployees] = useState([]);
  const [ArcKhe_listLoading, ArcKhe_setListLoading] = useState(true);
  const [ArcKhe_clusters, ArcKhe_setClusters] = useState(null);
  const [ArcKhe_analyzing, ArcKhe_setAnalyzing] = useState(false);
  const [ArcKhe_showChart, ArcKhe_setShowChart] = useState(false); // chart is optional: only shown when the user taps the button

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

  // reload every time this screen is shown (first load + coming back from Add Employee)
  useFocusEffect(
    useCallback(() => {
      ArcKhe_loadEmployees();
      ArcKhe_setClusters(null); // data may have changed, old analysis is stale
    }, [ArcKhe_loadEmployees])
  );

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
    ArcKhe_setShowChart(false);
    try {
      const [ArcKhe_res] = await Promise.all([
        fetch(`${ArcKhe_API_URL}/api/employees/salary-clusters`),
        new Promise((resolve) => setTimeout(resolve, 800)), // keep the loading indicator visible for at least 0.8s
      ]);
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

  const ArcKhe_activeCount = ArcKhe_employees.filter((e) => e.status === 'Active').length;
  const ArcKhe_leaveCount = ArcKhe_employees.length - ArcKhe_activeCount;

  const ArcKhe_renderHeader = () => (
    <View>
      {/* summary */}
      <View style={ArcKhe_styles.statRow}>
        {[
          ['Total', ArcKhe_employees.length, ArcKhe_C.yellow],
          ['Active', ArcKhe_activeCount, ArcKhe_C.green],
          ['On Leave', ArcKhe_leaveCount, ArcKhe_C.white],
        ].map(([label, value, fill]) => (
          <ArcKhe_HardBox key={label} fill={fill} radius={16} offset={4} style={{ flex: 1 }} innerStyle={ArcKhe_styles.statInner}>
            <Text style={ArcKhe_styles.statNum}>{value}</Text>
            <Text style={ArcKhe_styles.statLabel}>{label}</Text>
          </ArcKhe_HardBox>
        ))}
      </View>

      {/* salary analysis card */}
      <ArcKhe_HardBox radius={22} offset={6} style={{ marginBottom: 18 }} innerStyle={{ padding: 18 }}>
        <ArcKhe_Pill label="K-Means · 3 tiers" fill={ArcKhe_C.lilac} style={{ marginBottom: 8 }} />
        <Text style={ArcKhe_styles.cardTitle}>Salary Analysis</Text>
        <Text style={ArcKhe_styles.cardSub}>Group everyone's salary into 3 tiers automatically.</Text>

        <ArcKhe_Button label="Analyze Salary Structure" onPress={ArcKhe_handleAnalyze} disabled={ArcKhe_analyzing} style={{ marginTop: 14 }} />

        {ArcKhe_analyzing && <ActivityIndicator size="large" color={ArcKhe_C.blue} style={{ marginTop: 16 }} />}

        {ArcKhe_clusters && (
          <View style={ArcKhe_styles.tierRow}>
            {ArcKhe_clusters.map((c, i) => (
              <ArcKhe_HardBox
                key={c.group}
                fill={ArcKhe_tierFills[i % 3]}
                radius={14}
                offset={3}
                style={{ flex: 1 }}
                innerStyle={ArcKhe_styles.tierInner}
              >
                <Text style={ArcKhe_styles.tierName}>{c.group}</Text>
                <Text style={ArcKhe_styles.tierCount}>{c.count}</Text>
                <Text style={ArcKhe_styles.tierLabel}>employees</Text>
                <Text style={ArcKhe_styles.tierSalary}>{Number(c.centroid).toLocaleString()}</Text>
                <Text style={ArcKhe_styles.tierLabel}>avg salary</Text>
              </ArcKhe_HardBox>
            ))}
          </View>
        )}

        {ArcKhe_clusters && (
          <ArcKhe_Button
            small
            label={ArcKhe_showChart ? 'Hide Chart ▴' : 'Show Chart ▾'}
            color={ArcKhe_C.yellow}
            textColor={ArcKhe_C.ink}
            onPress={() => ArcKhe_setShowChart((v) => !v)}
            style={{ marginTop: 16, alignSelf: 'flex-start' }}
          />
        )}
        {ArcKhe_clusters && ArcKhe_showChart && <ArcKhe_SalaryChart clusters={ArcKhe_clusters} employees={ArcKhe_employees} />}
      </ArcKhe_HardBox>

      {/* list title + add button */}
      <View style={ArcKhe_styles.listHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={ArcKhe_styles.sectionTitle}>Employees</Text>
          <ArcKhe_Pill label={String(ArcKhe_employees.length)} fill={ArcKhe_C.white} style={{ marginLeft: 8 }} />
        </View>
        <ArcKhe_Button small label="+ Add Employee" onPress={() => navigation.navigate('AddEmployee')} />
      </View>
      {ArcKhe_listLoading && <ActivityIndicator style={{ marginVertical: 12 }} color={ArcKhe_C.ink} />}
    </View>
  );

  const ArcKhe_renderItem = ({ item: ArcKhe_item, index: ArcKhe_index }) => {
    const ArcKhe_isActive = ArcKhe_item.status === 'Active';
    return (
      <ArcKhe_HardBox radius={18} offset={4} style={{ marginBottom: 12 }} innerStyle={ArcKhe_styles.empInner}>
        <View style={[ArcKhe_styles.avatar, { backgroundColor: ArcKhe_avatarFills[ArcKhe_index % 4] }]}>
          <Text style={ArcKhe_styles.avatarText}>{(ArcKhe_item.name || '?').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={ArcKhe_styles.empTop}>
            <Text style={ArcKhe_styles.empName} numberOfLines={1}>{ArcKhe_item.name}</Text>
            <ArcKhe_Pill label={ArcKhe_item.status} fill={ArcKhe_isActive ? ArcKhe_C.green : ArcKhe_C.pink} style={{ marginLeft: 8 }} />
          </View>
          <Text style={ArcKhe_styles.empPos}>{ArcKhe_item.position}</Text>
          <Text style={ArcKhe_styles.empSalary}>Salary: {Number(ArcKhe_item.salary).toLocaleString()}</Text>
          <View style={ArcKhe_styles.btnRow}>
            <ArcKhe_Button
              small
              label="Toggle Status"
              color={ArcKhe_C.yellow}
              textColor={ArcKhe_C.ink}
              onPress={() => ArcKhe_handleToggle(ArcKhe_item.id)}
              style={{ marginRight: 8 }}
            />
            <ArcKhe_Button
              small
              label="Edit"
              color={ArcKhe_C.white}
              textColor={ArcKhe_C.ink}
              onPress={() => navigation.navigate('AddEmployee', { employee: ArcKhe_item })}
              style={{ marginRight: 8 }}
            />
            <ArcKhe_Button
              small
              label="Delete"
              color={ArcKhe_C.pink}
              textColor={ArcKhe_C.ink}
              onPress={() => ArcKhe_handleDelete(ArcKhe_item.id)}
            />
          </View>
        </View>
      </ArcKhe_HardBox>
    );
  };

  return (
    <ArcKhe_Background>
      <ArcKhe_AppBar
        title="HR Manager"
        subtitle="Salary Analytics Dashboard"
        right={<ArcKhe_Button small label="Logout" color={ArcKhe_C.white} textColor={ArcKhe_C.ink} onPress={() => navigation.replace('Login')} />}
      />
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={ArcKhe_styles.content}
        data={ArcKhe_employees}
        keyExtractor={(ArcKhe_item) => ArcKhe_item.id}
        renderItem={ArcKhe_renderItem}
        ListHeaderComponent={ArcKhe_renderHeader()}
        ListEmptyComponent={
          !ArcKhe_listLoading ? <Text style={ArcKhe_styles.empty}>No employees yet. Tap "+ Add Employee" to start.</Text> : null
        }
        keyboardShouldPersistTaps="handled"
      />
    </ArcKhe_Background>
  );
}

const ArcKhe_styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 20, paddingBottom: 40, width: '100%', maxWidth: ArcKhe_MAX_WIDTH, alignSelf: 'center' },

  statRow: { flexDirection: 'row', marginBottom: 16 },
  statInner: { paddingVertical: 12, alignItems: 'center' },
  statNum: { fontSize: 26, fontWeight: '900', color: '#111' },
  statLabel: { fontSize: 12, fontWeight: '700', color: '#111' },

  cardTitle: { fontSize: 22, fontWeight: '900', color: '#111' },
  cardSub: { color: '#555', marginTop: 2 },

  tierRow: { flexDirection: 'row', marginTop: 18 },
  tierInner: { paddingVertical: 10, paddingHorizontal: 4, alignItems: 'center' },
  tierName: { fontWeight: '900', color: '#111', marginBottom: 2 },
  tierCount: { fontSize: 24, fontWeight: '900', color: '#111' },
  tierSalary: { fontSize: 16, fontWeight: '900', marginTop: 6, color: '#111' },
  tierLabel: { fontSize: 11, color: '#333' },

  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#111' },

  empInner: { flexDirection: 'row', padding: 14 },
  avatar: {
    width: 46, height: 46, borderRadius: 23, borderWidth: 2.5, borderColor: '#111',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: { fontWeight: '900', fontSize: 18, color: '#111' },
  empTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  empName: { fontSize: 16, fontWeight: '900', color: '#111', flexShrink: 1 },
  empPos: { color: '#444', marginTop: 2 },
  empSalary: { color: '#111', fontWeight: '700', marginTop: 2 },
  btnRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  empty: { textAlign: 'center', color: '#333', marginTop: 12 },
});
