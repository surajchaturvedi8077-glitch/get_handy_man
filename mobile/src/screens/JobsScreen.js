import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import JobFilterTabs from '../components/jobs/JobFilterTabs';
import JobListItem from '../components/jobs/JobListItem';
import SegmentedControl from '../components/ui/SegmentedControl';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import useJobs from '../hooks/useJobs';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const safeTime = (dateStr) => {
  if (!dateStr) return Number.MAX_SAFE_INTEGER; 
  const time = new Date(dateStr).getTime();
  return isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
};

export default function JobsScreen() {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  
  const [viewMode, setViewMode] = useState('list'); 
  const [filter, setFilter] = useState('accepted');
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolledToToday, setScrolledToToday] = useState(false);

  const { jobs, loading, error } = useJobs('all');

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
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

  const baseFilteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const q = searchQuery.toLowerCase();
      const searchMatch = q === '' || 
        (j.name && j.name.toLowerCase().includes(q)) ||
        (j.address && j.address.toLowerCase().includes(q)) ||
        (Array.isArray(j.services) && j.services.some(s => {
          const sName = typeof s === 'string' ? s : s?.name || '';
          return sName.toLowerCase().includes(q);
        })) ||
        (typeof j.service === 'string' && j.service.toLowerCase().includes(q));

      let tabMatch = false;
      if (filter === 'all') tabMatch = true;
      else if (filter === 'accepted') tabMatch = (j.status === 'accepted' || j.status === 'pending');
      else if (filter === 'complete') tabMatch = (j.status === 'complete');
      
      return searchMatch && tabMatch;
    });
  }, [jobs, searchQuery, filter]);

  const calendarJobs = useMemo(() => {
    return baseFilteredJobs.filter(j => {
      if (!j.scheduledDate) return false;
      const jd = new Date(j.scheduledDate);
      return jd.getFullYear() === selectedDate.getFullYear() && 
             jd.getMonth() === selectedDate.getMonth() && 
             jd.getDate() === selectedDate.getDate();
    });
  }, [baseFilteredJobs, selectedDate]);

  const { pastJobs, upcomingJobs } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const past = [];
    const upcoming = [];

    baseFilteredJobs.forEach(job => {
      if (!job.scheduledDate) {
        upcoming.push(job);
        return;
      }
      const jd = new Date(job.scheduledDate);
      jd.setHours(0, 0, 0, 0);
      if (jd.getTime() < today.getTime()) {
        past.push(job);
      } else {
        upcoming.push(job);
      }
    });

    past.sort((a, b) => safeTime(b.scheduledDate) - safeTime(a.scheduledDate));
    upcoming.sort((a, b) => safeTime(a.scheduledDate) - safeTime(b.scheduledDate));

    return { pastJobs: past, upcomingJobs: upcoming };
  }, [baseFilteredJobs]);

  useEffect(() => { setScrolledToToday(false); }, [filter, viewMode, searchQuery]);

  const firstTodayJobId = useMemo(() => {
    const todayTimestamp = new Date().setHours(0, 0, 0, 0);
    const job = upcomingJobs.find(j => safeTime(j.scheduledDate) >= todayTimestamp);
    return job ? job._id : null;
  }, [upcomingJobs]);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>JOBS DASHBOARD</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home', { screen: 'NewJob' })} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ New Job</Text>
          </TouchableOpacity>
        </View>
        
        <SegmentedControl options={[{ value: 'list', label: 'Timeline List' }, { value: 'calendar', label: 'Calendar' }]} value={viewMode} onChange={setViewMode} dark />
        
        {viewMode === 'calendar' && (
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
        )}
      </SafeAreaView>

      {loading && <View style={{padding: 20}}><LoadingState /></View>}
      {error && <View style={{padding: 20}}><ErrorState>{error}</ErrorState></View>}

      {!loading && !error && (
        <ScrollView ref={scrollViewRef} style={styles.content} keyboardShouldPersistTaps="handled">
          
          <View style={styles.listContainer}>
            {/* TABS & SEARCH (Scrolls freely with the list) */}
            {viewMode === 'calendar' && <Text style={styles.selectedDateTitle}>{selectedDate.toDateString()}</Text>}
            <View style={styles.tabs}><JobFilterTabs value={filter} onChange={setFilter} /></View>
            <TextInput style={styles.searchBar} placeholder="Search jobs by client, address..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor={colors.gray} />

            {/* TIMELINE LIST */}
            {viewMode === 'list' && (
              <>
                {pastJobs.length > 0 && (
                  <View style={styles.pastSection}>
                    <Text style={styles.timelineLabel}>⇧ Past Jobs (Scroll Up)</Text>
                    {pastJobs.map(j => <JobListItem key={j._id} job={j} />)}
                  </View>
                )}
                
                <Text style={[styles.timelineLabel, { color: colors.blue }]}>Today & Upcoming</Text>
                {upcomingJobs.length > 0 ? (
                  upcomingJobs.map(j => (
                    <View 
                      key={j._id}
                      onLayout={(event) => {
                        if (j._id === firstTodayJobId && !scrolledToToday && scrollViewRef.current) {
                          scrollViewRef.current.scrollTo({ y: event.nativeEvent.layout.y, animated: false });
                          setScrolledToToday(true);
                        }
                      }}
                    >
                      <JobListItem job={j} />
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No upcoming jobs in this category.</Text>
                )}
              </>
            )}

            {/* CALENDAR LIST */}
            {viewMode === 'calendar' && (
              <>
                {calendarJobs.length > 0 ? (
                  calendarJobs.map(j => <JobListItem key={j._id} job={j} />)
                ) : (
                  <Text style={styles.emptyText}>No jobs assigned for this day.</Text>
                )}
              </>
            )}

          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.offwhite },
  header: { backgroundColor: colors.charcoal, paddingHorizontal: 16, paddingBottom: 14 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 4 },
  title: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  addBtn: { backgroundColor: colors.orange, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  addBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  content: { flex: 1 },
  
  calendarContainer: { paddingTop: 16, paddingBottom: 4 },
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
  tabs: { marginBottom: 14 },
  searchBar: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, marginBottom: 16, color: colors.charcoal },
  
  timelineLabel: { fontSize: 11, fontWeight: '800', color: colors.gray, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10, marginTop: 4 },
  pastSection: { opacity: 0.85, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.grayLight, marginBottom: 14 },
  selectedDateTitle: { fontSize: 14, fontWeight: '800', color: colors.charcoal, marginBottom: 12 },
  emptyText: { textAlign: 'center', color: colors.gray, marginTop: 30, fontSize: 12.5 },
});