import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import JobFilterTabs from '../components/jobs/JobFilterTabs';
import JobListItem from '../components/jobs/JobListItem';
import SegmentedControl from '../components/ui/SegmentedControl';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import useJobs from '../hooks/useJobs';
import { colors } from '../theme/colors';

const safeTime = (dateStr) => {
  if (!dateStr) return Number.MAX_SAFE_INTEGER; 
  const time = new Date(dateStr).getTime();
  return isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
};

export default function JobsScreen() {
  const navigation = useNavigation();
  const [viewMode, setViewMode] = useState('list'); 
  const [filter, setFilter] = useState('accepted');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [showPastJobs, setShowPastJobs] = useState(false);

  const { jobs, loading, error } = useJobs('all');

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
      else if (filter === 'accepted') tabMatch = (j.status !== 'complete'); // Groups all active into Assigned
      else if (filter === 'complete') tabMatch = (j.status === 'complete');
      
      return searchMatch && tabMatch;
    });
  }, [jobs, searchQuery, filter]);

  const { upcomingJobs, pastJobs } = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const upcoming = [];
    const past = [];

    baseFilteredJobs.forEach(job => {
      if (!job.scheduledDate) { upcoming.push(job); return; }
      const jd = new Date(job.scheduledDate);
      jd.setHours(0,0,0,0);
      if (jd.getTime() >= today.getTime()) upcoming.push(job);
      else past.push(job);
    });

    upcoming.sort((a, b) => safeTime(a.scheduledDate) - safeTime(b.scheduledDate));
    past.sort((a, b) => safeTime(b.scheduledDate) - safeTime(a.scheduledDate));

    return { upcomingJobs: upcoming, pastJobs: past };
  }, [baseFilteredJobs]);

  const calendarJobs = useMemo(() => {
    return baseFilteredJobs.filter(j => {
      if (!j.scheduledDate) return false;
      return j.scheduledDate.startsWith(selectedDateStr);
    });
  }, [baseFilteredJobs, selectedDateStr]);

  const markedDates = useMemo(() => {
    const marks = {};
    jobs.forEach(j => {
      if (j.scheduledDate && j.status !== 'complete') {
        const dStr = j.scheduledDate.split('T')[0];
        marks[dStr] = { marked: true, dotColor: colors.orange };
      }
    });
    marks[selectedDateStr] = { ...marks[selectedDateStr], selected: true, selectedColor: colors.orange };
    return marks;
  }, [jobs, selectedDateStr]);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>JOBS DASHBOARD</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home', { screen: 'NewJob' })} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ New Job</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {loading && <View style={{padding: 20}}><LoadingState /></View>}
      {error && <View style={{padding: 20}}><ErrorState>{error}</ErrorState></View>}

      {!loading && !error && (
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.listContainer}>
            
            <SegmentedControl options={[{ value: 'list', label: 'Timeline List' }, { value: 'calendar', label: 'Calendar' }]} value={viewMode} onChange={setViewMode} />
            <View style={styles.tabs}><JobFilterTabs value={filter} onChange={setFilter} /></View>
            <TextInput style={styles.searchBar} placeholder="Search jobs by client, address..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor={colors.gray} />

            {/* TIMELINE LIST */}
            {viewMode === 'list' && (
              <>
                <Text style={styles.timelineLabel}>Today & Upcoming</Text>
                {upcomingJobs.length > 0 ? (
                  upcomingJobs.map(j => <JobListItem key={j._id} job={j} />)
                ) : (
                  <Text style={styles.emptyText}>No upcoming jobs in this category.</Text>
                )}

                <TouchableOpacity style={styles.pastToggleBtn} onPress={() => setShowPastJobs(!showPastJobs)}>
                  <Text style={styles.pastToggleText}>{showPastJobs ? "Hide Past Jobs ▲" : "Show Past Jobs ▼"}</Text>
                </TouchableOpacity>

                {showPastJobs && pastJobs.map(j => <JobListItem key={j._id} job={j} />)}
                {showPastJobs && pastJobs.length === 0 && <Text style={styles.emptyText}>No past jobs.</Text>}
              </>
            )}

            {/* ROBUST CALENDAR VIEW */}
            {viewMode === 'calendar' && (
              <>
                <View style={styles.calendarContainer}>
                  <Calendar
                    current={selectedDateStr}
                    onDayPress={day => setSelectedDateStr(day.dateString)}
                    markedDates={markedDates}
                    theme={{
                      selectedDayBackgroundColor: colors.orange,
                      todayTextColor: colors.orangeDeep,
                      arrowColor: colors.charcoal,
                      textDayFontWeight: '500',
                      textMonthFontWeight: 'bold',
                      textDayHeaderFontWeight: 'bold'
                    }}
                  />
                </View>

                <Text style={styles.selectedDateTitle}>Selected: {selectedDateStr}</Text>
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
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  title: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  addBtn: { backgroundColor: colors.orange, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  addBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  content: { flex: 1 },
  listContainer: { padding: 16, paddingBottom: 80 },
  tabs: { marginVertical: 14 },
  searchBar: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, marginBottom: 16, color: colors.charcoal },
  timelineLabel: { fontSize: 12, fontWeight: '800', color: colors.blue, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 },
  pastToggleBtn: { backgroundColor: colors.charcoal2, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginVertical: 16 },
  pastToggleText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  calendarContainer: { backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: colors.grayLight, marginBottom: 16 },
  selectedDateTitle: { fontSize: 14, fontWeight: '800', color: colors.charcoal, marginBottom: 12, marginTop: 4 },
  emptyText: { textAlign: 'center', color: colors.gray, marginTop: 10, fontSize: 12.5 },
});