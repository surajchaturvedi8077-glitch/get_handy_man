import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, unwrap } from './apiClient';
import * as invoiceService from './invoiceService';

const STORAGE_KEY = 'trady_expenses_v2';

export const EXPENSE_CATEGORIES = [
  { id: 'Fuel', label: 'Fuel', iconBg: '#E7F1FF', iconColor: '#1565D8' },
  { id: 'Materials', label: 'Materials', iconBg: '#E6F7ED', iconColor: '#16A34A' },
  { id: 'Tools', label: 'Tools', iconBg: '#FFF3E0', iconColor: '#EA580C' },
  { id: 'Tolls', label: 'Tolls', iconBg: '#F1EBFF', iconColor: '#7C3AED' },
  { id: 'Parking', label: 'Parking', iconBg: '#E0F7FA', iconColor: '#0284C7' },
  { id: 'Other', label: 'Other', iconBg: '#F3F4F6', iconColor: '#4B5563' },
];

export function calcGstFromIncl(amountIncl, hasGst = true) {
  const num = parseFloat(amountIncl) || 0;
  if (!hasGst || num <= 0) return 0;
  return Math.round((num / 11 + Number.EPSILON) * 100) / 100;
}

export function getExpenseSubtitle(exp) {
  switch (exp.category) {
    case 'Fuel':
      return exp.serviceStation || exp.vehicle || 'Service station';
    case 'Materials':
      return exp.supplier || exp.description || 'Hardware store';
    case 'Tools':
      return exp.toolName || exp.supplier || 'Tool supplier';
    case 'Tolls':
      return exp.provider || exp.tripReference || 'Toll account';
    case 'Parking':
      return exp.location || exp.vehicle || 'Parking';
    case 'Other':
    default:
      return exp.expenseName || exp.supplier || exp.notes || 'General expense';
  }
}

export async function listAllExpenses() {
  let localList = [];
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    localList = raw ? JSON.parse(raw) : [];
  } catch (e) {
    localList = [];
  }

  // Also pull any material/other costs attached to invoices so nothing is lost
  let invoiceExpenses = [];
  try {
    const invoices = await invoiceService.listInvoices('all');
    if (Array.isArray(invoices)) {
      invoices.forEach((inv) => {
        (inv.costs?.materials || []).forEach((m, idx) => {
          if (Number(m.cost) > 0) {
            const amt = Number(m.cost);
            invoiceExpenses.push({
              _id: `inv-mat-${inv._id}-${idx}`,
              category: 'Materials',
              date: inv.date || inv.createdAt || new Date().toISOString(),
              amount: amt,
              gstOption: '10%',
              gstAmount: calcGstFromIncl(amt, true),
              paymentMethod: 'Card',
              supplier: m.name || 'Hardware store',
              description: `Invoice #${inv.number} (${inv.customer})`,
              linkedJobId: inv.jobId || null,
              linkedJobName: inv.customer || '',
              receiptUri: m.photoUrl || null,
              fromInvoice: true,
              invoiceId: inv._id,
            });
          }
        });
        (inv.costs?.other || []).forEach((o, idx) => {
          if (Number(o.cost) > 0) {
            const amt = Number(o.cost);
            invoiceExpenses.push({
              _id: `inv-oth-${inv._id}-${idx}`,
              category: 'Other',
              date: inv.date || inv.createdAt || new Date().toISOString(),
              amount: amt,
              gstOption: '10%',
              gstAmount: calcGstFromIncl(amt, true),
              paymentMethod: 'Card',
              expenseName: o.name || 'Other expense',
              supplier: `Invoice #${inv.number}`,
              receiptUri: o.photoUrl || null,
              fromInvoice: true,
              invoiceId: inv._id,
            });
          }
        });
      });
    }
  } catch (e) {}

  const combined = [...localList, ...invoiceExpenses];
  combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return combined;
}

export async function createExpense(payload) {
  const newExpense = {
    _id: `exp-${Date.now()}-${Math.round(Math.random() * 1e5)}`,
    createdAt: new Date().toISOString(),
    ...payload,
  };

  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const current = raw ? JSON.parse(raw) : [];
  const updated = [newExpense, ...current];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Optional non-blocking sync if backend route exists
  try {
    await unwrap(apiClient.post('/api/expenses', newExpense));
  } catch (e) {}

  return newExpense;
}

export async function deleteExpense(id) {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const current = raw ? JSON.parse(raw) : [];
  const updated = current.filter((item) => item._id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  try {
    await unwrap(apiClient.delete(`/api/expenses/${id}`));
  } catch (e) {}
  return true;
}