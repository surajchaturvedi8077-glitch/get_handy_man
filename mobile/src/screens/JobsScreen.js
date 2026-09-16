/**
 * JobsScreen.js
 * ------------------------------------------------------------------
 * The jobs list screen: filter tabs + JobList.
 * ------------------------------------------------------------------
 */
import { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import ScreenHeader from '../components/layout/ScreenHeader';
import JobFilterTabs from '../components/jobs/JobFilterTabs';
import JobList from '../components/jobs/JobList';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import useJobs from '../hooks/useJobs';

export default function JobsScreen() {
  const [filter, setFilter] = useState('all');
  const { jobs, loading, error } = useJobs(filter);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="JOBS" showBack={false} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tabs}>
          <JobFilterTabs value={filter} onChange={setFilter} />
        </View>
        {loading && <LoadingState />}
        {error && <ErrorState>{error}</ErrorState>}
        {!loading && !error && <JobList jobs={jobs} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  tabs: { marginBottom: 14 },
});
