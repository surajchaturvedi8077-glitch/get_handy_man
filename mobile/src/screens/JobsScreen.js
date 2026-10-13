import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import JobListItem from '../components/jobs/JobListItem';
import SegmentedControl from '../components/ui/SegmentedControl';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import useJobs from '../hooks/useJobs';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function JobsScreen() {
  const navigation = useNavigation();
  const [filter, setFilter] = useState('accepted'); // Assigned | Complete | All
  const { jobs, loading, error } = useJobs('all');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysArray = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  // Map Job Counts per day
  const jobsPerDay = {};
  jobs.forEach(j => {
    if (!j.scheduledDate) return;
    const d = new Date(j.scheduledDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const dayNum = d.getDate();
      jobsPerDay[dayNum] = (jobsPerDay[dayNum] || 0) + 1;
    }
  });

  // Filter Jobs based on selected calendar date AND tab filter
  const filteredJobs = jobs.filter(j => {
    let dateMatch = false;
    if (j.scheduledDate) {
      const jd = new Date(j.scheduledDate);
      dateMatch = jd.getFullYear() === selectedDate.getFullYear() && 
                  jd.getMonth() === selectedDate.getMonth() && 
                  jd.getDate() === selectedDate.getDate();
    }

    let tabMatch = false;
    if (filter === 'all') tabMatch = true;
    else if (filter === 'accepted') tabMatch = (j.status === 'accepted' || j.status === 'pending');
    else if (filter === 'complete') tabMatch = (j.status === 'complete');
    
    return dateMatch && tabMatch;
  });

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>JOBS DASHBOARD</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home', { screen: 'NewJob' })} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ New Job</Text>
          </TouchableOpacity>
        </View>
        
        {/* COMBINED CALENDAR TOP HALF */}
        <View style={styles.calendarContainer}>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth} style={styles.monthBtn}><Text style={styles.monthBtnText}>◀</Text></TouchableOpacity>
            <Text style={styles.monthTitle}>{MONTH_NAMES[month]} {year}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.monthBtn}><Text style={styles.monthBtnText}>▶</Text></TouchableOpacity>
          </View>
          <View style={styles.daysHeader}>
            {['S','M','T','W','T','F','S'].map((d, i) => ( <Text key={i} style={styles.dayHeadText}>{d}</Text> ))}
          </View>
          <View style={styles.grid}>
            {Array.from({ length: firstDayIndex }).map((_, i) => ( <View key={`empty-${i}`} style={{ width: (width - 28) / 7, height: 46 }} /> ))}
            {daysArray.map(day => {
              const isSelectedCell = selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day;
              const count = jobsPerDay[day] || 0;
              return (
                <TouchableOpacity key={day} style={[styles.dayCell, isSelectedCell && styles.selectedCell]} onPress={() => setSelectedDate(new Date(year, month, day))}>
                  <Text style={[styles.dayText, isSelectedCell && { color: '#fff', fontWeight: '800' }]}>{day}</Text>
                  {count > 0 && (
                    <View style={[styles.badge, count >= 2 ? { backgroundColor: isSelectedCell ? '#fff' : colors.charcoal2 } : {}]}>
                      <Text style={[styles.badgeText, count >= 2 ? { color: isSelectedCell ? colors.orangeDeep : '#fff' } : {}]}>{count}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </SafeAreaView>

      {/* COMBINED LIST BOTTOM HALF */}
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.listContainer}>
          <Text style={styles.selectedDateTitle}>{selectedDate.toDateString()}</Text>
          <View style={styles.tabs}>
            <SegmentedControl 
              options={[{ value: 'accepted', label: 'Assigned' }, { value: 'complete', label: 'Completed' }, { value: 'all', label: 'All' }]} 
              value={filter} 
              onChange={setFilter} 
            />
          </View>
          
          {loading && <LoadingState />}
          {error && <ErrorState>{error}</ErrorState>}
          
          {!loading && !error && filteredJobs.length > 0 && ( 
            filteredJobs.map(j => <JobListItem key={j._id} job={j} />) 
          )}

          {!loading && !error && filteredJobs.length === 0 && (
            <Text style={styles.emptyText}>No jobs assigned for this day.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.offwhite },
  header: { backgroundColor: colors.charcoal, paddingHorizontal: 16, paddingBottom: 14 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  addBtn: { backgroundColor: colors.orange, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  addBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  content: { flex: 1 },
  
  calendarContainer: { paddingBottom: 10 },
  monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  monthBtn: { padding: 4 },
  monthBtnText: { fontSize: 14, fontWeight: 'bold', color: '#C7CCD4' },
  monthTitle: { fontSize: 15, fontWeight: '800', color: '#fff' },
  daysHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 6 },
  dayHeadText: { fontSize: 10, color: '#C7CCD4', fontWeight: '700', width: (width - 32) / 7, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: (width - 32) / 7, height: 42, alignItems: 'center', paddingTop: 6, borderRadius: 8 },
  selectedCell: { backgroundColor: colors.orange },
  dayText: { fontSize: 12, fontWeight: '500', color: '#fff' },
  badge: { backgroundColor: colors.charcoal2, borderRadius: 6, paddingHorizontal: 4, paddingVertical: 1, marginTop: 2 },
  badgeText: { fontSize: 8, fontWeight: '800', color: '#C7CCD4' },

  listContainer: { padding: 16 },
  selectedDateTitle: { fontSize: 14, fontWeight: '800', color: colors.charcoal, marginBottom: 12 },
  tabs: { marginBottom: 14 },
  emptyText: { textAlign: 'center', color: colors.gray, marginTop: 30, fontSize: 12.5 },
});