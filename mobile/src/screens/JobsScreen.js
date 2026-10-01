import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import JobFilterTabs from '../components/jobs/JobFilterTabs';
import JobListItem from '../components/jobs/JobListItem';
import SegmentedControl from '../components/ui/SegmentedControl';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import useJobs from '../hooks/useJobs';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// FIXED: Replaced 'Infinity' with a massive valid number to prevent Hermes crashes
const safeTime = (dateStr) => {
  if (!dateStr) return 999999999999999;
  const time = new Date(dateStr).getTime();
  return isNaN(time) ? 999999999999999 : time;
};

// Reads the job's scheduled date from whichever field the API uses
const getJobDate = (job) =>
  job?.scheduledDate || job?.scheduled_date || job?.date || job?.startDate || job?.start_date || null;

// Text used for the search box
const getSearchText = (job) =>
  [
    job?.customerName,
    job?.customer_name,
    job?.customer?.name,
    job?.title,
    job?.address,
    job?.jobNumber,
    job?.job_number,
    job?.id,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const toDayKey = (date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

export default function JobsScreen() {
  const navigation = useNavigation();
  const { params } = useRoute(); // <-- GRAB PARAMS
  const [viewMode, setViewMode] = useState('list'); 
  const [filter, setFilter] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const { jobs, loading, error } = useJobs(filter);

  // FIXED: Automatically filter the list to show the customer's chain of jobs if clicked from Customers Screen
  React.useEffect(() => {
    if (params?.searchCustomer) {
      setSearchQuery(params.searchCustomer);
      setFilter('all'); // Force 'all' so we see past completed jobs too
      setViewMode('list');
    }
  }, [params?.searchCustomer]);

  // Search + sort (earliest scheduled first, undated jobs last)
  const visibleJobs = useMemo(() => {
    const list = Array.isArray(jobs) ? jobs : [];
    const q = searchQuery.trim().toLowerCase();
    const filtered = q ? list.filter((job) => getSearchText(job).includes(q)) : list;
    return [...filtered].sort((a, b) => safeTime(getJobDate(a)) - safeTime(getJobDate(b)));
  }, [jobs, searchQuery]);

  // Job count per day for the calendar badges
  const jobsPerDay = useMemo(() => {
    const counts = {};
    visibleJobs.forEach((job) => {
      const raw = getJobDate(job);
      if (!raw) return;
      const d = new Date(raw);
      if (isNaN(d.getTime())) return;
      const key = toDayKey(d);
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [visibleJobs]);

  const goToMonth = (delta) => {
    let m = calMonth + delta;
    let y = calYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setCalMonth(m);
    setCalYear(y);
  };

  const openJob = (job) => {
    navigation.navigate('JobDetail', { jobId: job.id, job });
  };

  const renderList = () => (
    <ScrollView style={styles.content} contentContainerStyle={styles.listContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.tabs}>
        <JobFilterTabs value={filter} onChange={setFilter} />
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="Search by customer, address or job number"
        placeholderTextColor={colors.gray}
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCorrect={false}
        clearButtonMode="while-editing"
      />

      {visibleJobs.length === 0 ? (
        <Text style={styles.emptyText}>
          {searchQuery ? 'No jobs match your search.' : 'No jobs found.'}
        </Text>
      ) : (
        visibleJobs.map((job, index) => (
          <JobListItem
            key={String(job.id ?? index)}
            job={job}
            onPress={() => openJob(job)}
          />
        ))
      )}
    </ScrollView>
  );

  const renderCalendar = () => {
    const firstWeekday = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstWeekday; i++) {
      cells.push(<View key={`blank-${i}`} style={styles.dayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${calYear}-${calMonth}-${day}`;
      const count = jobsPerDay[key] || 0;
      const isToday =
        day === today.getDate() &&
        calMonth === today.getMonth() &&
        calYear === today.getFullYear();

      cells.push(
        <View key={key} style={[styles.dayCell, isToday && styles.todayCell]}>
          <Text style={styles.dayText}>{day}</Text>
          {count > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{count}</Text>
            </View>
          )}
        </View>
      );
    }

    return (
      <ScrollView style={styles.content} contentContainerStyle={styles.calendarContainer}>
        <View style={styles.monthNav}>
          <TouchableOpacity style={styles.monthBtn} onPress={() => goToMonth(-1)}>
            <Text style={styles.monthBtnText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{MONTH_NAMES[calMonth]} {calYear}</Text>
          <TouchableOpacity style={styles.monthBtn} onPress={() => goToMonth(1)}>
            <Text style={styles.monthBtnText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.daysHeader}>
          {DAY_NAMES.map((d, i) => (
            <Text key={`dayname-${i}`} style={styles.dayHeadText}>{d}</Text>
          ))}
        </View>

        <View style={styles.grid}>{cells}</View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>JOBS</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddJob')}>
            <Text style={styles.addBtnText}>+ NEW JOB</Text>
          </TouchableOpacity>
        </View>
        <SegmentedControl
          options={[
            { label: 'List', value: 'list' },
            { label: 'Calendar', value: 'calendar' },
          ]}
          value={viewMode}
          onChange={setViewMode}
        />
      </View>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={typeof error === 'string' ? error : error?.message} />
      ) : viewMode === 'list' ? (
        renderList()
      ) : (
        renderCalendar()
      )}
    </SafeAreaView>
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
  listContainer: { padding: 14 },
  tabs: { marginBottom: 14 },
  searchBar: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, marginBottom: 16, color: colors.charcoal },
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