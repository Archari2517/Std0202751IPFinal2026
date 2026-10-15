import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { ArcKhe_API_URL } from '../config';
import {
  ArcKhe_COLORS, ArcKhe_MAX_WIDTH, ArcKhe_HardBox, ArcKhe_Button, ArcKhe_Input,
  ArcKhe_Background, ArcKhe_AppBar, ArcKhe_Pill, ArcKhe_showAlert,
} from '../components/ArcKhe_UI';

export default function ArcKhe_AddEmployeeScreen({ navigation, route }) {
  const ArcKhe_editing = route && route.params ? route.params.employee : null; // null = add mode
  const [ArcKhe_name, ArcKhe_setName] = useState(ArcKhe_editing ? ArcKhe_editing.name : '');
  const [ArcKhe_position, ArcKhe_setPosition] = useState(ArcKhe_editing ? ArcKhe_editing.position : '');
  const [ArcKhe_salary, ArcKhe_setSalary] = useState(ArcKhe_editing ? String(ArcKhe_editing.salary) : '');
  const [ArcKhe_saving, ArcKhe_setSaving] = useState(false);

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
    ArcKhe_setSaving(true);
    try {
      const ArcKhe_url = ArcKhe_editing
        ? `${ArcKhe_API_URL}/api/employees/${ArcKhe_editing.id}`
        : `${ArcKhe_API_URL}/api/employees`;
      const ArcKhe_res = await fetch(ArcKhe_url, {
        method: ArcKhe_editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: ArcKhe_nameTrim, position: ArcKhe_positionTrim, salary: ArcKhe_salaryNum }),
      });
      const ArcKhe_data = await ArcKhe_res.json().catch(() => ({}));
      if (!ArcKhe_res.ok) {
        ArcKhe_showAlert('Error', ArcKhe_data.message || (ArcKhe_editing ? 'Cannot update employee' : 'Cannot add employee'));
        return;
      }
      // Dashboard reloads the list automatically when it comes back into focus (add + edit)
      navigation.goBack();
    } catch (ArcKhe_err) {
      ArcKhe_showAlert('Network error', 'Cannot connect to the server');
    } finally {
      ArcKhe_setSaving(false);
    }
  };

  return (
    <ArcKhe_Background>
      <ArcKhe_AppBar
        title={ArcKhe_editing ? 'Edit Employee' : 'Add Employee'}
        subtitle={ArcKhe_editing ? 'Update employee details' : 'Create a new team member'}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={ArcKhe_styles.content} keyboardShouldPersistTaps="handled">
        <ArcKhe_HardBox radius={22} offset={6} innerStyle={{ padding: 20 }}>
          <ArcKhe_Pill
            label={ArcKhe_editing ? `Editing #${ArcKhe_editing.id}` : 'New teammate'}
            fill={ArcKhe_editing ? ArcKhe_COLORS.yellow : ArcKhe_COLORS.green}
            style={{ marginBottom: 10 }}
          />
          <Text style={ArcKhe_styles.title}>Employee details</Text>
          <Text style={ArcKhe_styles.sub}>
            {ArcKhe_editing ? 'Change the fields you need, then save.' : 'Fill in all fields to add them to the team.'}
          </Text>

          <ArcKhe_Input placeholder="Name" value={ArcKhe_name} onChangeText={ArcKhe_setName} />
          <ArcKhe_Input placeholder="Position" value={ArcKhe_position} onChangeText={ArcKhe_setPosition} />
          <ArcKhe_Input placeholder="Salary" keyboardType="numeric" value={ArcKhe_salary} onChangeText={ArcKhe_setSalary} />

          <ArcKhe_Button onPress={ArcKhe_handleAdd} disabled={ArcKhe_saving} style={{ marginTop: 6 }}>
            {ArcKhe_saving ? <ActivityIndicator color="#fff" /> : <Text style={ArcKhe_styles.btnText}>{ArcKhe_editing ? 'Save Changes' : 'Save Employee'}</Text>}
          </ArcKhe_Button>
          <ArcKhe_Button
            label="Cancel"
            color={ArcKhe_COLORS.white}
            textColor={ArcKhe_COLORS.ink}
            onPress={() => navigation.goBack()}
            style={{ marginTop: 10 }}
          />
        </ArcKhe_HardBox>
      </ScrollView>
    </ArcKhe_Background>
  );
}

const ArcKhe_styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 24, paddingBottom: 40, width: '100%', maxWidth: ArcKhe_MAX_WIDTH, alignSelf: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: '#111' },
  sub: { color: '#555', marginTop: 2, marginBottom: 16 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
