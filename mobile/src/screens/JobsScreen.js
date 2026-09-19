import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import JobListItem from '../components/jobs/JobListItem';
import SegmentedControl from '../components/ui/SegmentedControl';
import LoadingState from '../components/ui/LoadingState';
import useJobs from '../hooks/useJobs';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// FIXED: Prevents Hermes Engine Fatal Crash by never returning NaN during sorting
const safeTime = (dateStr) => {
  if (!dateStr) return 0;
  const time = new Date(dateStr).getTime();
  return isNaN(time) ? 0 : time;
};

export default function JobsScreen() {
  const navigation = useNavigation();
  const { jobs, loading } = useJobs('all');
  
  const [viewMode, setViewMode] = useState('list'); 
  const [listFilter, setListFilter] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState('');

  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysArray = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  const jobsPerDay = {};
  jobs.forEach(j => {
    if (!j.scheduledDate) return;
    const d = new Date(j.scheduledDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const dayNum = d.getDate();
      jobsPerDay[dayNum] = (jobsPerDay[dayNum] || 0) + 1;
    }
  });

  const filteredJobs = jobs.filter(j => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = q === '' || 
      (j.name && j.name.toLowerCase().includes(q)) ||
      (j.address && j.address.toLowerCase().includes(q)) ||
      (Array.isArray(j.services) && j.services.some(s => s && s.toLowerCase().includes(q))) ||
      (typeof j.service === 'string' && j.service.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (listFilter === 'complete') return j.status === 'complete';
    if (listFilter === 'incomplete') return j.status !== 'complete';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isJobToday = j.scheduledDate && new Date(j.scheduledDate).toDateString() === today.toDateString();
    
    if (listFilter === 'today') return j.status !== 'complete' && isJobToday;
    if (listFilter === 'upcoming') {
      if (!j.scheduledDate) return true;
      const jobDate = new Date(j.scheduledDate);
      jobDate.setHours(0, 0, 0, 0);
      return j.status !== 'complete' && jobDate > today;
    }
    return true;
  }).sort((a, b) => safeTime(a.scheduledDate) - safeTime(b.scheduledDate)); // CRASH PREVENTED HERE

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text style={styles.title}>JOBS</Text>
        <SegmentedControl 
          options={[{ value: 'list', label: 'List' }, { value: 'calendar', label: 'Calendar' }]}
          value={viewMode} onChange={setViewMode} dark 
        />
      </SafeAreaView>

      {loading ? ( <LoadingState /> ) : (
        <ScrollView style={styles.content}>
          {viewMode === 'list' ? (
            <View style={styles.listContainer}>
              <TextInput style={styles.searchBar} placeholder="Search jobs by client, address..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor={colors.gray} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {['all', 'today', 'upcoming', 'complete', 'incomplete'].map(f => (
                  <TouchableOpacity key={f} style={[styles.filterChip, listFilter === f && styles.filterChipActive]} onPress={() => setListFilter(f)}>
                    <Text style={[styles.filterText, listFilter === f && styles.filterTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {filteredJobs.length > 0 ? ( filteredJobs.map(j => <JobListItem key={j._id} job={j} />) ) : ( <Text style={styles.emptyText}>No jobs match this filter.</Text> )}
            </View>
          ) : (
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
                  const isTodayCell = new Date().toDateString() === new Date(year, month, day).toDateString();
                  const count = jobsPerDay[day] || 0;
                  return (
                    <TouchableOpacity key={day} style={[styles.dayCell, isTodayCell && styles.todayCell]} onPress={() => navigation.navigate('DayDetail', { day, year, month })}>
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
  searchBar: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, marginBottom: 12, color: colors.charcoal },
  filterScroll: { flexDirection: 'row', marginBottom: 14 },
  filterChip: { paddingVertical: 6, paddingHorizontal: 13, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.grayLight, marginRight: 8 },
  filterChipActive: { backgroundColor: colors.charcoal, borderColor: colors.charcoal },
  filterText: { fontSize: 11, fontWeight: '700', color: colors.gray },
  filterTextActive: { color: '#fff' },
  emptyText: { textAlign: 'center', color: colors.gray, marginTop: 30, fontSize: 12.5 },
  calendarContainer: { padding: 14 },
  monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.grayLight },
  monthBtn: { padding: 8 },
  monthBtnText: { fontSize: 14, fontWeight: 'bold', color: colors.charcoal },
  monthTitle: { fontSize: 15, fontWeight: '800', color: colors.charcoal },
  daysHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  dayHeadText: { fontSize: 10, color: colors.gray, fontWeight: '700', width: (width - 28) / 7, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: (width - 28) / 7, height: 46, alignItems: 'center', paddingTop: 4 },
  todayCell: { backgroundColor: colors.orangeTint, borderRadius: 8, borderWidth: 1, borderColor: colors.orange },
  dayText: { fontSize: 11, fontWeight: '500', color: colors.charcoal },
  badge: { backgroundColor: colors.grayLight, borderRadius: 6, paddingHorizontal: 4, paddingVertical: 1, marginTop: 2 },
  badgeText: { fontSize: 8, fontWeight: '800', color: colors.gray }
});