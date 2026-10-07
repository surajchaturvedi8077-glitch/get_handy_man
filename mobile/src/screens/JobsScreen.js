import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
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
  if (!dateStr) return 9999999999999; 
  const time = new Date(dateStr).getTime();
  return isNaN(time) ? 9999999999999 : time;
};

export default function JobsScreen() {
  const navigation = useNavigation();
  const route = useRoute(); 
  const params = route.params || {};

  const [viewMode, setViewMode] = useState('list'); 
  const [filter, setFilter] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState('');

  const { jobs, loading, error } = useJobs(filter);

  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const filteredJobs = jobs.filter(j => {
    const q = searchQuery.toLowerCase();
    const searchMatch = q === '' || 
      (j.name && j.name.toLowerCase().includes(q)) ||
      (j.address && j.address.toLowerCase().includes(q));
    
    // FIXED: Only filters by 'accepted' (Assigned) and 'complete' now. Confirmed is gone.
    let tabMatch = false;
    if (filter === 'all') tabMatch = true;
    else if (filter === 'accepted') tabMatch = (j.status === 'accepted');
    else if (filter === 'complete') tabMatch = (j.status === 'complete');
    
    return searchMatch && tabMatch;
  }).sort((a, b) => safeTime(a.scheduledDate) - safeTime(b.scheduledDate));

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>JOBS</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home', { screen: 'NewJob' })} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ New Job</Text>
          </TouchableOpacity>
        </View>
        <SegmentedControl options={[{ value: 'list', label: 'List' }, { value: 'calendar', label: 'Calendar' }]} value={viewMode} onChange={setViewMode} dark />
      </SafeAreaView>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {viewMode === 'list' ? (
          <View style={styles.listContainer}>
            <View style={styles.tabs}><JobFilterTabs value={filter} onChange={setFilter} /></View>
            <TextInput style={styles.searchBar} placeholder="Search jobs by client, address..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor={colors.gray} />
            
            {loading && <LoadingState />}
            {error && <ErrorState>{error}</ErrorState>}
            
            {!loading && !error && filteredJobs.length > 0 && ( 
              filteredJobs.map(j => <JobListItem key={j._id} job={j} />) 
            )}

            {!loading && !error && filteredJobs.length === 0 && (
              <Text style={styles.emptyText}>No jobs match this filter.</Text>
            )}
          </View>
        ) : (
          <View style={styles.calendarContainer}>
            <Text style={{textAlign: 'center', marginTop: 50, color: colors.gray}}>Calendar View Selected</Text>
          </View>
        )}
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
  listContainer: { padding: 14 },
  tabs: { marginBottom: 14 },
  searchBar: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, marginBottom: 16, color: colors.charcoal },
  emptyText: { textAlign: 'center', color: colors.gray, marginTop: 30, fontSize: 12.5 },
  calendarContainer: { padding: 14 }
});