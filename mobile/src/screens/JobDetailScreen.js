const { job, loading, error, saveDetails, complete, remove } = useJob(params?.id);
  
  const [isEditingJob, setIsEditingJob] = useState(false); 
  const [optionsOpen, setOptionsOpen] = useState(false); 
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false); 
  const [generating, setGenerating] = useState(false);

  if (loading) return <View style={styles.screen}><ScreenHeader title="JOB DETAILS" onBack={() => navigation.navigate('JobsList')} /><LoadingState /></View>;
  if (error || !job) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="JOB DETAILS" onBack={() => navigation.navigate('JobsList')} />
        <View style={{ padding: 24 }}>
          <Text style={{ color: colors.red, fontWeight: '700', textAlign: 'center', marginBottom: 16 }}>
            {error || 'This job could not be found or was deleted.'}
          </Text>
          <Button variant="primary" onPress={() => navigation.navigate('JobsList')}>Back to Jobs List</Button>
        </View>
      </View>
    );
  }