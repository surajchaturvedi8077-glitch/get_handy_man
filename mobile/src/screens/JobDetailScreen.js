import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ScreenHeader from '../components/layout/ScreenHeader';
import JobStatusBadge from '../components/jobs/JobStatusBadge';
import JobDetailForm from '../components/jobs/JobDetailForm';
import Button from '../components/ui/Button';
import LoadingState from '../components/ui/LoadingState';
import useJob from '../hooks/useJob';
import useToast from '../hooks/useToast';
import { openPhone, openEmail, openMaps } from '../utils/linking';
import { money } from '../utils/money';
import { colors } from '../theme/colors';
import * as invoiceService from '../services/invoiceService';

export default function JobDetailScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { job, loading, saveDetails, complete, remove } = useJob(params.id);
  
  const [editingPrice, setEditingPrice] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false); 
  const [priceInput, setPriceInput] = useState('0');
  const [optionsOpen, setOptionsOpen] = useState(false); 
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (loading || !job) return <View style={styles.screen}><LoadingState /></View>;

  const handleSaveDetails = async (payload) => {
    try {
      await saveDetails(payload);

      // SYNCHRONIZE JOB COST DIRECTLY TO LINKED INVOICE
      if (payload.labour !== undefined && job.invoiceId) {
        try {
          const inv = await invoiceService.getInvoice(job.invoiceId);
          if (inv && inv.items && inv.items.length > 0) {
            const updatedItems = [...inv.items];
            updatedItems[0].amt = payload.labour; // Syncs the new price to the first line item
            await invoiceService.updateInvoice(job.invoiceId, { items: updatedItems });
          }
        } catch (invErr) {
          console.log("Invoice sync failed silently", invErr);
        }
      }

      setIsEditingJob(false);
      setEditingPrice(false); 
      showToast('Job details saved');
    } catch (err) {
      let errorText = 'An unknown error occurred.';
      if (err.response?.data?.errors) errorText = err.response.data.errors.join('\n');
      else if (err.response?.data?.message) errorText = err.response.data.message;
      else if (err.message) errorText = err.message;
      Alert.alert("Backend Error", errorText);
    }
  };

  const handleComplete = async () => {
    try {
      const { invoice } = await complete();
      showToast('Job marked complete');
      navigation.getParent()?.navigate('Invoices', { screen: 'InvoiceDetail', params: { id: invoice._id } });
    } catch (err) {
      let errorText = 'An unknown error occurred.';
      if (err.response?.data?.errors) errorText = err.response.data.errors.join('\n');
      else if (err.response?.data?.message) errorText = err.response.data.message;
      else if (err.message) errorText = err.message;
      Alert.alert("Backend Error", errorText);
    }
  };

  const handleDelete = async () => {
    setOptionsOpen(false);
    setConfirmDelete(false);
    await remove();
    showToast('Job deleted');
    navigation.navigate('JobsList');
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader 
        title="JOB DETAILS" 
        onBack={() => navigation.navigate('JobsList')} 
        rightAction={
          <TouchableOpacity onPress={() => setOptionsOpen(true)} style={{ padding: 4 }}><Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>⋮</Text></TouchableOpacity>
        } 
      />
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.customerStrip}>
          <View style={styles.avatar}><Text style={{ color: '#fff', fontSize: 18 }}>👤</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.customerName}>{job.name}</Text>
            <JobStatusBadge job={job} />
          </View>
          <TouchableOpacity style={styles.actionIcon} onPress={() => openPhone(job.phone)}><Text>📞</Text></TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon} onPress={() => openEmail(job.email)}><Text>✉️</Text></TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {job.needsDetails || isEditingJob ? (
          <JobDetailForm job={job} onSave={handleSaveDetails} />
        ) : (
          <>
            <View style={styles.fieldRow}>
              <Text style={styles.icon}>📅</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Date & time</Text>
                <Text style={styles.value}>{job.when || 'Not set'} {job.exactTime ? ` at ${job.exactTime}` : ''}</Text>
              </View>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.icon}>📍</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Location</Text>
                <Text style={styles.value}>{job.address}</Text>
              </View>
              <Button variant="outline" style={{ paddingVertical: 6, paddingHorizontal: 12 }} onPress={() => openMaps(job.address)}>Locate</Button>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.icon}>📝</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Services</Text>
                <Text style={styles.value}>
                  {(Array.isArray(job.services) && job.services.length > 0) ? job.services.join(', ') : (job.service || 'None')}
                </Text>
              </View>
            </View>

            {(job.extraFields && job.extraFields.length > 0) && (
              <View style={styles.fieldRow}>
                <Text style={styles.icon}>📋</Text>
                <View style={{ flex: 1 }}>
                  {job.extraFields.map((f, idx) => (
                    <View key={idx} style={{ marginBottom: 4 }}>
                      <Text style={styles.label}>{f.label}</Text>
                      <Text style={styles.value}>{f.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.priceCard}>
              {editingPrice ? (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput style={styles.priceInput} value={priceInput} onChangeText={setPriceInput} keyboardType="numeric" autoFocus />
                  <Button variant="primary" style={{ paddingVertical: 8, paddingHorizontal: 14 }} onPress={() => handleSaveDetails({ labour: Number(priceInput) })}>Save</Button>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View><Text style={styles.labelOrange}>Labour Price</Text><Text style={styles.priceText}>{money(job.labour)}</Text></View>
                  <TouchableOpacity style={styles.editBtn} onPress={() => { setPriceInput(String(job.labour)); setEditingPrice(true); }}><Text>✏️</Text></TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.buttonRow}>
              <Button variant="outline" style={{ flex: 1 }} onPress={() => setIsEditingJob(true)}>Edit Details</Button>
              {job.status === 'complete' ? (
                <Button variant="dark" style={{ flex: 1 }} onPress={() => navigation.getParent()?.navigate('Invoices', { screen: 'InvoiceDetail', params: { id: job.invoiceId } })}>View Invoice</Button>
              ) : (
                <Button variant="green" style={{ flex: 1 }} onPress={handleComplete}>Mark complete</Button>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {optionsOpen && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOptionsOpen(false)}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <TouchableOpacity style={styles.sheetRow} onPress={() => { setOptionsOpen(false); setIsEditingJob(true); }}>
              <View style={[styles.sheetIconBox, { backgroundColor: colors.blueTint }]}><Text>✏️</Text></View>
              <Text style={[styles.sheetText, { color: colors.blue }]}>Edit job details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetRow} onPress={() => { setOptionsOpen(false); setConfirmDelete(true); }}>
              <View style={[styles.sheetIconBox, { backgroundColor: colors.redTint }]}><Text>🗑️</Text></View>
              <Text style={[styles.sheetText, { color: colors.red }]}>Delete job</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {confirmDelete && (
        <View style={styles.overlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Delete this job?</Text>
            <Text style={styles.confirmSub}>Are you sure you want to delete it? This can't be undone.</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button variant="outline" style={{ flex: 1 }} onPress={() => setConfirmDelete(false)}>Cancel</Button>
              <Button variant="primary" style={{ flex: 1, backgroundColor: colors.red }} onPress={handleDelete}>Delete</Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  customerStrip: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.charcoal, alignItems: 'center', justifyContent: 'center' },
  customerName: { fontWeight: '800', fontSize: 14, marginBottom: 4 },
  actionIcon: { width: 34, height: 34, borderRadius: 8, backgroundColor: colors.orangeTint, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: colors.grayLight, marginVertical: 14 },
  fieldRow: { flexDirection: 'row', gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.grayLight, alignItems: 'center' },
  icon: { width: 34, textAlign: 'center', fontSize: 17 },
  label: { fontSize: 10, fontWeight: '700', color: colors.gray, textTransform: 'uppercase', marginBottom: 2 },
  labelOrange: { fontSize: 10, fontWeight: '700', color: colors.orangeDeep, textTransform: 'uppercase', marginBottom: 2 },
  value: { fontSize: 13, color: colors.charcoal },
  priceCard: { backgroundColor: colors.orangeTint, borderRadius: 10, padding: 12, marginTop: 12 },
  priceText: { fontSize: 18, fontWeight: '800', color: colors.charcoal },
  editBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  priceInput: { flex: 1, borderWidth: 1.5, borderColor: colors.orange, borderRadius: 8, padding: 8, backgroundColor: '#fff', fontSize: 14, fontWeight: '700' },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  overlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(17,24,39,0.4)', justifyContent: 'flex-end', zIndex: 50 },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingBottom: 30, paddingTop: 10 },
  handle: { width: 36, height: 4, backgroundColor: colors.grayLight, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  sheetIconBox: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sheetText: { fontSize: 14, fontWeight: '600' },
  confirmBox: { backgroundColor: '#fff', margin: 20, borderRadius: 14, padding: 20, alignSelf: 'center', top: '30%', position: 'absolute', width: '90%' },
  confirmTitle: { fontWeight: '800', fontSize: 15, marginBottom: 6 },
  confirmSub: { fontSize: 12.5, color: colors.gray, marginBottom: 18, lineHeight: 18 }
});