import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import JobListItem from '../components/jobs/JobListItem';
import SegmentedControl from '../components/ui/SegmentedControl';
import LoadingState from '../components/ui/LoadingState';
import useJobs from '../hooks/useJobs';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function JobsScreen() {
  const navigation = useNavigation();
  const { jobs, loading } = useJobs('all');
  
  const [viewMode, setViewMode] = useState('list'); 
  const [listFilter, setListFilter] = useState('all'); 

  // --- REAL DATE FILTERING & SORTING ---
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of day for comparison

  const isToday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };

  const filteredJobs = jobs.filter(j => {
    if (listFilter === 'complete') return j.status === 'complete';
    if (listFilter === 'incomplete') return j.status !== 'complete';
    
    const isJobToday = isToday(j.scheduledDate);
    
    if (listFilter === 'today') return j.status !== 'complete' && isJobToday;
    if (listFilter === 'upcoming') {
      if (!j.scheduledDate) return true; // Unscheduled jobs count as upcoming
      const jobDate = new Date(j.scheduledDate);
      jobDate.setHours(0, 0, 0, 0);
      return j.status !== 'complete' && jobDate > today;
    }
    return true; // 'all'
  }).sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate)); // Chronological sort

  // Calendar Logic (Mocked month matching prototype)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
  const jobsPerDay = {};
  jobs.forEach(j => {
    const dayMatch = j.when?.match(/\b(\d{1,2})\b/);
    const day = dayMatch ? parseInt(dayMatch[1], 10) : 4; 
    jobsPerDay[day] = (jobsPerDay[day] || 0) + 1;
  });

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text style={styles.title}>JOBS</Text>
        <SegmentedControl 
          options={[{ value: 'list', label: 'List' }, { value: 'calendar', label: 'Calendar' }]}
          value={viewMode} 
          onChange={setViewMode} 
          dark 
        />
      </SafeAreaView>

      {loading ? (
        <LoadingState />
      ) : (
        <ScrollView style={styles.content}>
          {viewMode === 'list' ? (
            <View style={styles.listContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {['all', 'today', 'upcoming', 'complete', 'incomplete'].map(f => (
                  <TouchableOpacity 
                    key={f} 
                    style={[styles.filterChip, listFilter === f && styles.filterChipActive]}
                    onPress={() => setListFilter(f)}
                  >
                    <Text style={[styles.filterText, listFilter === f && styles.filterTextActive]}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {filteredJobs.length > 0 ? (
                filteredJobs.map(j => <JobListItem key={j._id} job={j} />)
              ) : (
                <Text style={styles.emptyText}>No jobs match this filter.</Text>
              )}
            </View>
          ) : (
            <View style={styles.calendarContainer}>
              <View style={styles.daysHeader}>
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <Text key={i} style={styles.dayHeadText}>{d}</Text>
                ))}
              </View>
              <View style={styles.grid}>
                <View style={{ width: (width - 28) / 7 * 2 }} /> 
                {daysInMonth.map(day => {
                  const isTodayCell = day === today.getDate();
                  const count = jobsPerDay[day] || 0;
                  return (
                    <TouchableOpacity 
                      key={day} 
                      style={[styles.dayCell, isTodayCell && styles.todayCell]}
                      onPress={() => navigation.navigate('DayDetail', { day })}
                    >
                      <Text style={[styles.dayText, isTodayCell && { color: colors.orangeDeep, fontWeight: '800' }]}>{day}</Text>
                      {count > 0 && (
                        <View style={[styles.badge, count >= 2 ? { backgroundColor: colors.charcoal2 } : {}]}>
                          <Text style={[styles.badgeText, count >= 2 ? { color: '#fff' } : {}]}>{count}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.offwhite },
  header: { backgroundColor: colors.charcoal, paddingHorizontal: 16, paddingBottom: 14 },
  title: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 1, marginBottom: 10 },
  content: { flex: 1 },
  listContainer: { padding: 14 },
  filterScroll: { flexDirection: 'row', marginBottom: 14 },
  filterChip: { paddingVertical: 6, paddingHorizontal: 13, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.grayLight, marginRight: 8 },
  filterChipActive: { backgroundColor: colors.charcoal, borderColor: colors.charcoal },
  filterText: { fontSize: 11, fontWeight: '700', color: colors.gray },
  filterTextActive: { color: '#fff' },
  emptyText: { textAlign: 'center', color: colors.gray, marginTop: 30, fontSize: 12.5 },
  calendarContainer: { padding: 14 },
  daysHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  dayHeadText: { fontSize: 10, color: colors.gray, fontWeight: '700', width: (width - 28) / 7, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: (width - 28) / 7, height: 46, alignItems: 'center', paddingTop: 4 },
  todayCell: { backgroundColor: colors.orangeTint, borderRadius: 8, borderWidth: 1, borderColor: colors.orange },
  dayText: { fontSize: 11, fontWeight: '500', color: colors.charcoal },
  badge: { backgroundColor: colors.grayLight, borderRadius: 6, paddingHorizontal: 4, paddingVertical: 1, marginTop: 2 },
  badgeText: { fontSize: 8, fontWeight: '800', color: colors.gray }
});