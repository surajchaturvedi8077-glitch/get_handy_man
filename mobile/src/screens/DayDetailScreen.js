import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ScreenHeader from '../components/layout/ScreenHeader';
import JobListItem from '../components/jobs/JobListItem';
import useJobs from '../hooks/useJobs';
import { colors } from '../theme/colors';

const MONTH_NAMES = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

export default function DayDetailScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { jobs } = useJobs('all');

  const dayJobs = jobs.filter(j => {
    if (!j.scheduledDate) return false;
    const jd = new Date(j.scheduledDate);
    return jd.getFullYear() === params?.year && 
           jd.getMonth() === params?.month && 
           jd.getDate() === params?.day;
  });

  const monthName = MONTH_NAMES[params?.month] || '';

  return (
    <View style={styles.screen}>
      <ScreenHeader title={`${monthName} ${params?.day || ''}`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {dayJobs.length > 0 ? (
          dayJobs.map(job => <JobListItem key={job._id} job={job} />)
        ) : (
          <View style={styles.empty}>
            <Text style={{ color: colors.gray, fontSize: 12.5 }}>No jobs assigned for this day.</Text>
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