import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import ScreenHeader from '../components/layout/ScreenHeader';
import JobListItem from '../components/jobs/JobListItem';
import useJobs from '../hooks/useJobs';
import { colors } from '../theme/colors';

export default function DayDetailScreen() {
  const { params } = useRoute();
  const { jobs } = useJobs('all');

  // Filter jobs to match the specific day tapped on the calendar
  const dayJobs = jobs.filter(j => {
    const dayMatch = j.when?.match(/\b(\d{1,2})\b/);
    return dayMatch && parseInt(dayMatch[1], 10) === params?.day;
  });

  return (
    <View style={styles.screen}>
      <ScreenHeader title={`SEPTEMBER ${params?.day || ''}`} />
      <ScrollView contentContainerStyle={styles.content}>
        {dayJobs.length > 0 ? (
          dayJobs.map(job => <JobListItem key={job._id} job={job} />)
        ) : (
          <View style={styles.empty}>
            <Text style={{ color: colors.gray, fontSize: 12.5 }}>No jobs this day.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.offwhite },
  content: { padding: 14 },
  empty: { alignItems: 'center', marginTop: 40 }
});