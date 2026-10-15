import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArcKhe_COLORS, ArcKhe_HardBox, ArcKhe_Pill } from './ArcKhe_UI';

const ArcKhe_C = ArcKhe_COLORS;
const ArcKhe_FILLS = [ArcKhe_C.yellow, ArcKhe_C.green, ArcKhe_C.lilac];
const ArcKhe_fmt = (ArcKhe_n) => Number(ArcKhe_n).toLocaleString();

// Draws the K-Means result with plain Views (no chart library needed).
// clusters : [{ group, centroid, count }]  (from /api/employees/salary-clusters)
// employees: [{ salary, ... }]             (each salary is placed under its nearest centroid)
export default function ArcKhe_SalaryChart({ clusters, employees }) {
  const ArcKhe_salaries = (employees || []).map((e) => Number(e.salary)).filter((n) => Number.isFinite(n));
  if (!clusters || ArcKhe_salaries.length === 0) return null;

  const ArcKhe_active = clusters.map((c, i) => ({ ...c, idx: i })).filter((c) => c.count > 0);
  const ArcKhe_members = clusters.map(() => []);
  ArcKhe_salaries.forEach((v) => {
    let ArcKhe_best = null;
    ArcKhe_active.forEach((c) => {
      if (ArcKhe_best === null || Math.abs(v - c.centroid) < Math.abs(v - clusters[ArcKhe_best].centroid)) ArcKhe_best = c.idx;
    });
    if (ArcKhe_best !== null) ArcKhe_members[ArcKhe_best].push(v);
  });

  const ArcKhe_min = Math.min(...ArcKhe_salaries);
  const ArcKhe_max = Math.max(...ArcKhe_salaries);
  const ArcKhe_span = ArcKhe_max - ArcKhe_min;
  const ArcKhe_pct = (v) => (ArcKhe_span === 0 ? 50 : ((v - ArcKhe_min) / ArcKhe_span) * 100);
  const ArcKhe_maxCount = Math.max(1, ...clusters.map((c) => c.count));

  return (
    <ArcKhe_HardBox fill="#fffdf2" radius={16} offset={3} style={{ marginTop: 16 }} innerStyle={{ padding: 14 }}>
      {/* ---- chart 1: salary distribution ---- */}
      <Text style={ArcKhe_s.title}>Salary Distribution</Text>
      <Text style={ArcKhe_s.hint}>Each dot is an employee · black line = tier average</Text>

      {ArcKhe_active.map((c) => (
        <View key={c.group} style={{ marginTop: 12 }}>
          <View style={ArcKhe_s.captionRow}>
            <ArcKhe_Pill label={c.group} fill={ArcKhe_FILLS[c.idx % 3]} />
            <Text style={ArcKhe_s.caption}>avg {ArcKhe_fmt(c.centroid)} · {c.count} {c.count === 1 ? 'employee' : 'employees'}</Text>
          </View>
          <View style={ArcKhe_s.lane}>
            <View style={ArcKhe_s.track} />
            <View style={[ArcKhe_s.centroid, { left: `${ArcKhe_pct(c.centroid)}%` }]} />
            {ArcKhe_members[c.idx].map((v, i) => (
              <View
                key={i}
                testID="ArcKhe_dot"
                style={[ArcKhe_s.dot, { left: `${ArcKhe_pct(v)}%`, backgroundColor: ArcKhe_FILLS[c.idx % 3] }]}
              />
            ))}
          </View>
        </View>
      ))}
      <View style={ArcKhe_s.axis}>
        <Text style={ArcKhe_s.axisText}>{ArcKhe_fmt(ArcKhe_min)}</Text>
        <Text style={ArcKhe_s.axisText}>salary</Text>
        <Text style={ArcKhe_s.axisText}>{ArcKhe_fmt(ArcKhe_max)}</Text>
      </View>

      {/* ---- chart 2: employees per tier ---- */}
      <Text style={[ArcKhe_s.title, { marginTop: 20 }]}>Employees per tier</Text>
      {clusters.map((c, i) => (
        <View key={c.group} style={ArcKhe_s.barRow}>
          <Text style={ArcKhe_s.barLabel}>{c.group}</Text>
          <View style={ArcKhe_s.barTrack}>
            {c.count > 0 ? (
              <View style={[ArcKhe_s.barFill, { width: `${(c.count / ArcKhe_maxCount) * 100}%`, backgroundColor: ArcKhe_FILLS[i % 3] }]} />
            ) : null}
          </View>
          <Text style={ArcKhe_s.barCount}>{c.count}</Text>
        </View>
      ))}
    </ArcKhe_HardBox>
  );
}

const ArcKhe_s = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '900', color: '#111' },
  hint: { fontSize: 12, color: '#555', marginTop: 2 },
  captionRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 },
  caption: { fontSize: 12, color: '#333', marginLeft: 8, fontWeight: '600' },
  lane: { height: 30, marginHorizontal: 12, justifyContent: 'center' },
  track: { position: 'absolute', left: 0, right: 0, top: 13, height: 4, borderRadius: 2, backgroundColor: '#d9dde6' },
  centroid: { position: 'absolute', top: 0, bottom: 0, width: 4, marginLeft: -2, borderRadius: 2, backgroundColor: '#111' },
  dot: {
    position: 'absolute', top: 3, width: 24, height: 24, marginLeft: -12,
    borderRadius: 12, borderWidth: 2.5, borderColor: '#111',
  },
  axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 2 },
  axisText: { fontSize: 11, color: '#555', fontWeight: '700' },
  barRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  barLabel: { width: 52, fontSize: 12, fontWeight: '800', color: '#111' },
  barTrack: { flex: 1, height: 24, justifyContent: 'center' },
  barFill: { height: 24, minWidth: 10, borderWidth: 2.5, borderColor: '#111', borderRadius: 8 },
  barCount: { width: 28, textAlign: 'right', fontWeight: '900', color: '#111' },
});
