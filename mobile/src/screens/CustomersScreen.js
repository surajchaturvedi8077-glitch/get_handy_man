import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../components/layout/ScreenHeader';
import Button from '../components/ui/Button';
import FieldLabel from '../components/ui/FieldLabel';
import { apiClient, unwrap } from '../services/apiClient';
import useToast from '../hooks/useToast';
import { colors } from '../theme/colors';

export default function CustomersScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { showToast } = useToast();

  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', notes: '' });

  const loadCustomers = async () => {
    try {
       const data = await unwrap(apiClient.get('/api/customers'));
       setCustomers(data);
    } catch(e) {}
  };

  useFocusEffect(useCallback(() => { loadCustomers(); }, []));

  const openModal = (customer = null) => {
    if (customer) {
      setEditingId(customer._id);
      setForm(customer);
    } else {
      setEditingId(null);
      setForm({ name: '', phone: '', email: '', address: '', notes: '' });
    }
    setModalVisible(true);
  };

  const saveCustomer = async () => {
    if (!form.name) return Alert.alert("Required", "Customer Name is required.");
    try {
      if (editingId) {
        await unwrap(apiClient.put(`/api/customers/${editingId}`, form));
        showToast('Customer Profile Updated');
      } else {
        await unwrap(apiClient.post('/api/customers', form));
        showToast('New Customer Saved');
      }
      setModalVisible(false);
      loadCustomers();
    } catch (e) { Alert.alert('Error', 'Could not save customer'); }
  };

  const deleteCustomer = (id) => {
    Alert.alert("Delete Customer", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          await unwrap(apiClient.delete(`/api/customers/${id}`));
          showToast('Customer deleted');
          loadCustomers();
      }}
    ]);
  };

  const filtered = customers.filter(c => 
    searchQuery === '' ||
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader 
        title="REGULAR CUSTOMERS" 
        onBack={() => navigation.goBack()} 
        rightAction={
          <TouchableOpacity onPress={() => openModal()} style={styles.addBtn}>
            <Text style={{color: '#fff', fontSize: 13, fontWeight: 'bold'}}>+ Add</Text>
          </TouchableOpacity>
        } 
      />
      
      <View style={{ padding: 16, paddingBottom: 0 }}>
         <TextInput style={styles.searchBar} placeholder="Search customers..." value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
         {filtered.length === 0 && <Text style={styles.empty}>No customers found.</Text>}
         {filtered.map(c => (
           <View key={c._id} style={styles.card}>
             <View style={{ flex: 1 }}>
               <Text style={styles.name}>{c.name}</Text>
               <Text style={styles.detail}>{c.phone || 'No phone'}  •  {c.email || 'No email'}</Text>
               <Text style={styles.detail}>{c.address || 'No address saved'}</Text>
               {c.notes ? <Text style={styles.notes}>Notes: {c.notes}</Text> : null}
             </View>
             
             {/* QUICK ACTION BUTTONS */}
             <View style={styles.actions}>
               <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Enquiries', { screen: 'NewQuote', params: { customer: c } })} style={styles.actionBtn}>
                 <Text style={styles.actionBtnText}>📝 Quote</Text>
               </TouchableOpacity>
               <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Home', { screen: 'NewJob', params: { customer: c } })} style={styles.actionBtn}>
                 <Text style={styles.actionBtnText}>🛠️ Job</Text>
               </TouchableOpacity>
               <TouchableOpacity onPress={() => openModal(c)} style={styles.iconBtn}><Text style={{fontSize: 16}}>✏️</Text></TouchableOpacity>
               <TouchableOpacity onPress={() => deleteCustomer(c._id)} style={styles.iconBtn}><Text style={{fontSize: 16}}>🗑️</Text></TouchableOpacity>
             </View>
           </View>
         ))}
      </ScrollView>

      {/* CUSTOMER EDITING MODAL */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.screen}>
           <ScreenHeader title={editingId ? "EDIT CUSTOMER" : "NEW CUSTOMER"} onBack={() => setModalVisible(false)} />
           <ScrollView contentContainerStyle={{ padding: 16 }}>
             <FieldLabel>Name *</FieldLabel>
             <TextInput style={styles.input} value={form.name} onChangeText={v => setForm({...form, name: v})} />
             <FieldLabel>Phone</FieldLabel>
             <TextInput style={styles.input} value={form.phone} onChangeText={v => setForm({...form, phone: v})} keyboardType="phone-pad" />
             <FieldLabel>Email</FieldLabel>
             <TextInput style={styles.input} value={form.email} onChangeText={v => setForm({...form, email: v})} keyboardType="email-address" autoCapitalize="none" />
             <FieldLabel>Address</FieldLabel>
             <TextInput style={styles.input} value={form.address} onChangeText={v => setForm({...form, address: v})} />
             <FieldLabel>Internal Notes</FieldLabel>
             <TextInput style={[styles.input, {height: 80, textAlignVertical: 'top'}]} multiline value={form.notes} onChangeText={v => setForm({...form, notes: v})} />
             
             <Button variant="primary" onPress={saveCustomer} style={{ marginTop: 10 }}>Save Customer Profile</Button>
             <Button variant="outline" onPress={() => setModalVisible(false)} style={{marginTop: 10, borderColor: colors.red}}>
               <Text style={{color: colors.red, fontWeight: 'bold'}}>Cancel</Text>
             </Button>
           </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.offwhite },
  searchBar: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: colors.charcoal },
  content: { padding: 16 },
  addBtn: { backgroundColor: colors.orange, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 10, padding: 14, marginBottom: 12 },
  name: { fontSize: 15, fontWeight: '800', color: colors.charcoal, marginBottom: 4 },
  detail: { fontSize: 11.5, color: colors.gray, marginBottom: 2 },
  notes: { fontSize: 11, color: colors.orangeDeep, marginTop: 4, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12, alignItems: 'center' },
  actionBtn: { backgroundColor: colors.blueTint, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  actionBtnText: { color: colors.blue, fontSize: 11, fontWeight: '700' },
  iconBtn: { backgroundColor: colors.grayLight, padding: 6, borderRadius: 8 },
  input: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, backgroundColor: '#fff', marginBottom: 12, color: colors.charcoal },
  empty: { textAlign: 'center', color: colors.gray, marginTop: 40, fontSize: 13 }
});