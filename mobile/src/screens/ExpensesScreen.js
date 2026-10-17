import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Switch, Modal, Image, Alert, Platform, KeyboardAvoidingView,
  ActivityIndicator, LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import useJobs from '../hooks/useJobs';
import useSettings from '../hooks/useSettings';
import useToast from '../hooks/useToast';
import {
  EXPENSE_CATEGORIES, calcGstFromIncl, getExpenseSubtitle,
  getExpenseDetailsList, resolveReceiptUri, listAllExpenses,
  createExpense, updateExpense, deleteExpense,
} from '../services/expenseService';
import { money } from '../utils/money';

const BLUE = '#1565D8';
const NAVY = '#173156';
const TEXT_DARK = '#111827';
const TEXT_GRAY = '#6B7280';
const BORDER_COLOR = '#E5E7EB';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatShortDate = (val) => {
  const d = val ? new Date(val) : new Date();
  return isNaN(d.getTime()) ? '' : `${String(d.getDate()).padStart(2, '0')} ${SHORT_MONTHS[d.getMonth()]}`;
};

const formatFullDate = (val) => {
  const d = val ? new Date(val) : new Date();
  return isNaN(d.getTime()) ? '' : `${String(d.getDate()).padStart(2, '0')} ${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

function TradyTopBar({ onExportPress, showExport = true }) {
  return (
    <View style={styles.tradyTopBar}>
      <View>
        <Text style={styles.tradyBrandText}>Trady</Text>
        <View style={styles.tradyUnderline} />
      </View>
      {showExport && (
        <TouchableOpacity style={styles.exportIconBtn} onPress={onExportPress} hitSlop={10}>
          <Text style={styles.exportIconText}>📄↑</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function ExpensesScreen() {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { jobs } = useJobs('all');
  const { settings } = useSettings();

  const [screenMode, setScreenMode] = useState('list'); // 'list' | 'add' | 'export' | 'preview'
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [fullscreenImageUri, setFullscreenImageUri] = useState(null);
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  // Filters
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewAll, setViewAll] = useState(false);

  // Form State
  const [addCategory, setAddCategory] = useState('Materials');
  const [expDate, setExpDate] = useState(new Date());
  const [showExpDatePicker, setShowExpDatePicker] = useState(false);
  const [amountStr, setAmountStr] = useState('');
  const [gstOption, setGstOption] = useState('10%');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [serviceStation, setServiceStation] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [litres, setLitres] = useState('');
  const [supplier, setSupplier] = useState('');
  const [description, setDescription] = useState('');
  const [linkedJob, setLinkedJob] = useState(null);
  const [toolName, setToolName] = useState('');
  const [warrantyNotes, setWarrantyNotes] = useState('');
  const [provider, setProvider] = useState('');
  const [tripReference, setTripReference] = useState('');
  const [location, setLocation] = useState('');
  const [expenseName, setExpenseName] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptAsset, setReceiptAsset] = useState(null);
  const [savingExpense, setSavingExpense] = useState(false);

  // Modals
  const [jobModalVisible, setJobModalVisible] = useState(false);
  const [providerModalVisible, setProviderModalVisible] = useState(false);
  const [typeModalVisible, setTypeModalVisible] = useState(false);

  // Export State
  const [rangePreset, setRangePreset] = useState('Custom range');
  const [fromDate, setFromDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [toDate, setToDate] = useState(new Date());
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [rangePickerTarget, setRangePickerTarget] = useState('from');
  const [exportExpenseType, setExportExpenseType] = useState('All expense types');
  const [incSummary, setIncSummary] = useState(true);
  const [incItemised, setIncItemised] = useState(true);
  const [incGstBreakdown, setIncGstBreakdown] = useState(true);
  const [incReceipts, setIncReceipts] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      setExpenses(await listAllExpenses());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const switchScreen = (nextMode) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setScreenMode(nextMode);
  };

  const openAddExpense = (defaultCat) => {
    setEditingExpenseId(null);
    setAddCategory(defaultCat || selectedCategoryFilter || 'Materials');
    setExpDate(new Date());
    setAmountStr('');
    setGstOption('10%');
    setPaymentMethod('Card');
    setServiceStation('');
    setVehicle('');
    setLitres('');
    setSupplier('');
    setDescription('');
    setLinkedJob(null);
    setToolName('');
    setWarrantyNotes('');
    setProvider('');
    setTripReference('');
    setLocation('');
    setExpenseName('');
    setNotes('');
    setReceiptAsset(null);
    switchScreen('add');
  };

  const openEditExpense = (exp) => {
    setSelectedExpense(null);
    setEditingExpenseId(exp._id);
    setAddCategory(exp.category || 'Materials');
    setExpDate(exp.date ? new Date(exp.date) : new Date());
    setAmountStr(String(exp.amount || ''));
    setGstOption(exp.gstOption || '10%');
    setPaymentMethod(exp.paymentMethod || 'Card');
    setServiceStation(exp.serviceStation || '');
    setVehicle(exp.vehicle || '');
    setLitres(exp.litres || '');
    setSupplier(exp.supplier || '');
    setDescription(exp.description || '');
    setLinkedJob(jobs.find((j) => j._id === exp.linkedJobId) || null);
    setToolName(exp.toolName || '');
    setWarrantyNotes(exp.warrantyNotes || '');
    setProvider(exp.provider || '');
    setTripReference(exp.tripReference || '');
    setLocation(exp.location || '');
    setExpenseName(exp.expenseName || '');
    setNotes(exp.notes || '');
    setReceiptAsset(exp.receiptUri ? { uri: exp.receiptUri, persistUri: exp.receiptUri } : null);
    switchScreen('add');
  };

  const shiftMonth = (dir) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + dir, 1));
  };

  const monthExpenses = useMemo(() => {
    const y = currentMonthDate.getFullYear();
    const m = currentMonthDate.getMonth();
    return expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === y && d.getMonth() === m;
    });
  }, [expenses, currentMonthDate]);

  const categoryFilteredExpenses = useMemo(() => {
    return monthExpenses.filter((e) => {
      const catMatch = !selectedCategoryFilter || e.category === selectedCategoryFilter;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return catMatch;
      return catMatch && (getExpenseSubtitle(e).toLowerCase().includes(q) || (e.category || '').toLowerCase().includes(q));
    });
  }, [monthExpenses, selectedCategoryFilter, searchQuery]);

  const monthTotals = useMemo(() => {
    const source = selectedCategoryFilter ? categoryFilteredExpenses : monthExpenses;
    return {
      total: source.reduce((s, e) => s + (Number(e.amount) || 0), 0),
      gst: source.reduce((s, e) => s + (Number(e.gstAmount) || 0), 0),
    };
  }, [monthExpenses, categoryFilteredExpenses, selectedCategoryFilter]);

  const displayedList = useMemo(() => (viewAll ? categoryFilteredExpenses : categoryFilteredExpenses.slice(0, 8)), [categoryFilteredExpenses, viewAll]);
  const calculatedGst = useMemo(() => calcGstFromIncl(amountStr, gstOption === '10%'), [amountStr, gstOption]);

  const handlePickedAsset = (res) => {
    if (!res.canceled && res.assets?.length > 0) {
      const asset = res.assets[0];
      const dataUri = asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : asset.uri;
      setReceiptAsset({ ...asset, persistUri: dataUri });
    }
  };

  const pickReceiptFromLibrary = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return Alert.alert('Permission needed', 'Allow photo library access to attach receipts.');
      handlePickedAsset(await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.35, base64: true }));
    } catch (e) { Alert.alert('Error', 'Could not open image gallery.'); }
  };

  const takeReceiptPhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return Alert.alert('Permission needed', 'Allow camera access to take receipt photos.');
      handlePickedAsset(await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.35, base64: true }));
    } catch (e) { Alert.alert('Error', 'Could not open camera.'); }
  };

  const promptReceiptAttachment = () => {
    Alert.alert('Attach Receipt Photo', 'Choose how you want to attach your receipt:', [
      { text: '📷 Take Photo', onPress: takeReceiptPhoto },
      { text: '🖼️ Choose from Gallery', onPress: pickReceiptFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSaveExpense = async () => {
    const numAmt = parseFloat(amountStr);
    if (!numAmt || numAmt <= 0) return Alert.alert('Enter Amount', 'Please enter a valid expense amount greater than $0.00.');
    setSavingExpense(true);
    try {
      const payload = {
        category: addCategory,
        date: expDate.toISOString(),
        amount: numAmt,
        gstOption,
        gstAmount: calculatedGst,
        paymentMethod,
        serviceStation: serviceStation.trim(),
        vehicle: vehicle.trim(),
        litres: litres.trim(),
        supplier: supplier.trim(),
        description: description.trim(),
        linkedJobId: linkedJob?._id || null,
        linkedJobName: linkedJob ? `${linkedJob.name} — ${linkedJob.service || 'Job'}` : '',
        toolName: toolName.trim(),
        warrantyNotes: warrantyNotes.trim(),
        provider: provider.trim(),
        tripReference: tripReference.trim(),
        location: location.trim(),
        expenseName: expenseName.trim(),
        notes: notes.trim(),
        receiptUri: receiptAsset?.persistUri || receiptAsset?.uri || null,
      };
      if (editingExpenseId) {
        await updateExpense(editingExpenseId, payload);
        showToast(`✅ ${addCategory} expense updated!`);
      } else {
        await createExpense(payload);
        showToast(`✅ ${addCategory} expense saved!`);
      }
      await loadData();
      switchScreen('list');
    } catch (e) {
      Alert.alert('Error', 'Could not save expense.');
    } finally {
      setSavingExpense(false);
    }
  };

  const handleSelectRangePreset = (preset) => {
    setRangePreset(preset);
    const now = new Date();
    if (preset === 'This month') {
      setFromDate(new Date(now.getFullYear(), now.getMonth(), 1));
      setToDate(now);
    } else if (preset === 'Last month') {
      setFromDate(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      setToDate(new Date(now.getFullYear(), now.getMonth(), 0));
    } else if (preset === 'This financial year') {
      const fyStartYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
      setFromDate(new Date(fyStartYear, 6, 1));
      setToDate(now);
    }
  };

  const reportExpenses = useMemo(() => {
    const startMs = new Date(fromDate).setHours(0, 0, 0, 0);
    const endMs = new Date(toDate).setHours(23, 59, 59, 999);
    return expenses
      .filter((e) => {
        const t = new Date(e.date).getTime();
        return t >= startMs && t <= endMs && (exportExpenseType === 'All expense types' || e.category === exportExpenseType);
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [expenses, fromDate, toDate, exportExpenseType]);

  const reportTotals = useMemo(() => ({
    total: reportExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0),
    gst: reportExpenses.reduce((s, e) => s + (Number(e.gstAmount) || 0), 0),
  }), [reportExpenses]);

  const reportFileName = useMemo(() => {
    const fDay = String(fromDate.getDate()).padStart(2, '0');
    const tDay = String(toDate.getDate()).padStart(2, '0');
    return `Trady_Expenses_${fDay}-${tDay}_${SHORT_MONTHS[toDate.getMonth()]}_${toDate.getFullYear()}.pdf`;
  }, [fromDate, toDate]);

  const generateExpenseReportHtml = () => {
    const rowsHtml = reportExpenses.map((e) => {
      const detailPairs = getExpenseDetailsList(e).map((d) => `${d.label}: ${d.value}`).join(' • ');
      return `
        <tr>
          <td>${formatShortDate(e.date)}</td>
          <td>
            <div style="font-weight:700;color:#111827;">${e.category}</div>
            <div style="color:#4B5563;font-size:10.5px;margin-top:2px;">${detailPairs || getExpenseSubtitle(e)}</div>
            <div style="color:#6B7280;font-size:9.5px;margin-top:1px;">Payment: ${e.paymentMethod || 'Card'}</div>
          </td>
          <td class="right">$${Number(e.amount || 0).toFixed(2)}</td>
          ${incGstBreakdown ? `<td class="right">$${Number(e.gstAmount || 0).toFixed(2)}</td>` : ''}
        </tr>`;
    }).join('');

    const expensesWithReceipts = reportExpenses.filter((e) => resolveReceiptUri(e.receiptUri));
    const receiptsHtml = incReceipts && expensesWithReceipts.length > 0
      ? `<div style="margin-top:28px;page-break-inside:avoid;">
          <h3 style="font-size:14px;color:#111827;border-bottom:1.5px solid #E5E7EB;padding-bottom:6px;">Attached Receipt Images (${expensesWithReceipts.length})</h3>
          <div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:12px;">
            ${expensesWithReceipts.map((e) => {
              const detailLine = getExpenseDetailsList(e).map((d) => `${d.label}: ${d.value}`).join(' • ');
              return `
                <div style="width:46%;border:1px solid #E5E7EB;border-radius:8px;padding:10px;page-break-inside:avoid;">
                  <div style="font-size:11px;font-weight:800;color:#111827;">${formatFullDate(e.date)} · ${e.category} ($${Number(e.amount).toFixed(2)})</div>
                  <div style="font-size:10px;color:#6B7280;margin-top:2px;margin-bottom:6px;">${detailLine || getExpenseSubtitle(e)}</div>
                  <img src="${resolveReceiptUri(e.receiptUri)}" style="width:100%;max-height:220px;object-fit:contain;border-radius:6px;" />
                </div>`;
            }).join('')}
          </div>
        </div>`
      : '';

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 36px; color: #111827; margin: 0; }
            .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #E5E7EB; padding-bottom: 18px; }
            .brand { font-size: 24px; font-weight: 800; color: #111827; }
            .brand-bar { width: 28px; height: 3px; background: #1565D8; margin-top: 2px; border-radius: 2px; }
            .meta { text-align: right; }
            .meta-title { font-size: 13px; font-weight: 800; color: #111827; letter-spacing: 0.5px; }
            .meta-sub { font-size: 11px; color: #6B7280; margin-top: 3px; }
            .summary { display: flex; gap: 48px; margin-top: 22px; margin-bottom: 22px; }
            .sum-label { font-size: 11px; color: #6B7280; font-weight: 600; }
            .sum-val { font-size: 22px; font-weight: 800; color: #111827; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
            th { background: #F3F4F6; color: #374151; font-weight: 700; text-align: left; padding: 10px 12px; border-bottom: 1px solid #E5E7EB; }
            td { padding: 10px 12px; border-bottom: 1px solid #F3F4F6; color: #111827; vertical-align: top; }
            .total-row td { background: #EEF2FF; font-weight: 800; border-top: 1.5px solid #CBD5E1; }
            .right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="top">
            <div>
              <div class="brand">${settings?.businessName || 'Trady'}</div>
              <div class="brand-bar"></div>
              ${settings?.abn ? `<div style="font-size:11px;color:#4B5563;font-weight:700;margin-top:6px;">ABN: ${settings.abn}</div>` : ''}
            </div>
            <div class="meta">
              <div class="meta-title">EXPENSE REPORT</div>
              <div class="meta-sub">${formatFullDate(fromDate)} – ${formatFullDate(toDate)}</div>
              <div class="meta-sub">Amounts in AUD</div>
            </div>
          </div>
          ${incSummary ? `<div class="summary"><div><div class="sum-label">Total expenses</div><div class="sum-val">$${reportTotals.total.toFixed(2)}</div></div>${incGstBreakdown ? `<div><div class="sum-label">GST paid</div><div class="sum-val">$${reportTotals.gst.toFixed(2)}</div></div>` : ''}</div>` : ''}
          ${incItemised ? `<table><thead><tr><th>Date</th><th>Type & Details</th><th class="right">Amount</th>${incGstBreakdown ? '<th class="right">GST</th>' : ''}</tr></thead><tbody>${rowsHtml || `<tr><td colspan="4" style="text-align:center;color:#6B7280;">No expenses in this period</td></tr>`}<tr class="total-row"><td colspan="2">Total</td><td class="right">$${reportTotals.total.toFixed(2)}</td>${incGstBreakdown ? `<td class="right">$${reportTotals.gst.toFixed(2)}</td>` : ''}</tr></tbody></table>` : ''}
          ${receiptsHtml}
        </body>
      </html>`;
  };

  const handleDownloadOrSharePdf = async () => {
    setDownloadingPdf(true);
    try {
      const { uri } = await Print.printToFileAsync({ html: generateExpenseReportHtml(), base64: false });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: reportFileName, UTI: '.pdf' });
      } else {
        Alert.alert('PDF Generated', `Saved to: ${uri}`);
      }
    } catch (e) {
      Alert.alert('PDF Error', 'Could not generate expense report PDF.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // VIEW 2: ADD / EDIT EXPENSE
  if (screenMode === 'add') {
    const baseName = addCategory === 'Tolls' ? 'Toll expense' : `${addCategory} expense`;
    return (
      <SafeAreaView edges={['top']} style={styles.whiteScreen}>
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => switchScreen('list')} style={styles.backBtn} hitSlop={10}>
            <Text style={styles.backChevron}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>{editingExpenseId ? `Edit ${baseName}` : baseName}</Text>
        </View>

        <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {EXPENSE_CATEGORIES.map((cat) => {
              const active = addCategory === cat.id;
              return (
                <TouchableOpacity key={cat.id} onPress={() => setAddCategory(cat.id)} style={[styles.catPill, active && styles.catPillActive]}>
                  <Text style={[styles.catPillText, active && styles.catPillTextActive]}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
          <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets={true}>
            <View style={styles.twoColRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldCaption}>Date</Text>
                <TouchableOpacity style={styles.dateBox} onPress={() => setShowExpDatePicker(true)}>
                  <Text style={styles.dateBoxText}>{formatFullDate(expDate)}</Text>
                  <Text style={{ fontSize: 14 }}>📅</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldCaption}>Amount (incl. GST)</Text>
                <View style={styles.amountInputWrap}>
                  <Text style={styles.dollarPrefix}>$</Text>
                  <TextInput style={styles.amountInput} value={amountStr} onChangeText={setAmountStr} placeholder="0.00" placeholderTextColor="#9CA3AF" keyboardType="decimal-pad" />
                </View>
              </View>
            </View>

            <View style={styles.twoColRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldCaption}>GST</Text>
                <View style={styles.segmentedBar}>
                  {['10%', 'No GST'].map((opt) => (
                    <TouchableOpacity key={opt} style={[styles.segBtn, gstOption === opt && styles.segBtnActive]} onPress={() => setGstOption(opt)}>
                      <Text style={[styles.segBtnText, gstOption === opt && styles.segBtnTextActive]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldCaption}>GST amount</Text>
                <View style={styles.readonlyBox}>
                  <Text style={styles.readonlyText}>${calculatedGst.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.fieldCaption}>Payment</Text>
            <View style={[styles.segmentedBar, { marginBottom: 14 }]}>
              {['Card', 'Cash', 'Bank'].map((mode) => (
                <TouchableOpacity key={mode} style={[styles.segBtn, paymentMethod === mode && styles.segBtnActive]} onPress={() => setPaymentMethod(mode)}>
                  <Text style={[styles.segBtnText, paymentMethod === mode && styles.segBtnTextActive]}>{mode}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {addCategory === 'Fuel' && (
              <>
                <View style={styles.twoColRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldCaption}>Service station</Text>
                    <TextInput style={styles.textInput} value={serviceStation} onChangeText={setServiceStation} placeholder="Enter details" placeholderTextColor="#9CA3AF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldCaption}>Vehicle (optional)</Text>
                    <TextInput style={styles.textInput} value={vehicle} onChangeText={setVehicle} placeholder="Enter details" placeholderTextColor="#9CA3AF" />
                  </View>
                </View>
                <Text style={styles.fieldCaption}>Litres (optional)</Text>
                <TextInput style={styles.textInput} value={litres} onChangeText={setLitres} placeholder="Enter details" placeholderTextColor="#9CA3AF" keyboardType="decimal-pad" />
              </>
            )}

            {addCategory === 'Materials' && (
              <>
                <Text style={styles.fieldCaption}>Supplier</Text>
                <TextInput style={styles.textInput} value={supplier} onChangeText={setSupplier} placeholder="Enter details" placeholderTextColor="#9CA3AF" />
                <Text style={styles.fieldCaption}>Description</Text>
                <TextInput style={styles.textInput} value={description} onChangeText={setDescription} placeholder="Enter details" placeholderTextColor="#9CA3AF" />
                <Text style={styles.fieldCaption}>Link to job (optional)</Text>
                <TouchableOpacity style={styles.dropdownBox} onPress={() => setJobModalVisible(true)}>
                  <Text style={{ fontSize: 13.5, color: linkedJob ? TEXT_DARK : '#9CA3AF' }}>{linkedJob ? `${linkedJob.name} — ${linkedJob.service || 'Job'}` : 'Select'}</Text>
                  <Text style={styles.dropdownArrow}>⌄</Text>
                </TouchableOpacity>
              </>
            )}

            {addCategory === 'Tools' && (
              <>
                <Text style={styles.fieldCaption}>Supplier</Text>
                <TextInput style={styles.textInput} value={supplier} onChangeText={setSupplier} placeholder="Enter details" placeholderTextColor="#9CA3AF" />
                <Text style={styles.fieldCaption}>Tool / equipment name</Text>
                <TextInput style={styles.textInput} value={toolName} onChangeText={setToolName} placeholder="Enter details" placeholderTextColor="#9CA3AF" />
                <Text style={styles.fieldCaption}>Warranty / notes (optional)</Text>
                <TextInput style={styles.textInput} value={warrantyNotes} onChangeText={setWarrantyNotes} placeholder="Enter details" placeholderTextColor="#9CA3AF" />
              </>
            )}

            {addCategory === 'Tolls' && (
              <>
                <View style={styles.twoColRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldCaption}>Provider</Text>
                    <TouchableOpacity style={styles.dropdownBox} onPress={() => setProviderModalVisible(true)}>
                      <Text style={{ fontSize: 13.5, color: provider ? TEXT_DARK : '#9CA3AF' }}>{provider || 'Enter details'}</Text>
                      <Text style={styles.dropdownArrow}>⌄</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldCaption}>Vehicle (optional)</Text>
                    <TextInput style={styles.textInput} value={vehicle} onChangeText={setVehicle} placeholder="Enter details" placeholderTextColor="#9CA3AF" />
                  </View>
                </View>
                <Text style={styles.fieldCaption}>Trip / statement reference (optional)</Text>
                <TextInput style={styles.textInput} value={tripReference} onChangeText={setTripReference} placeholder="Enter details" placeholderTextColor="#9CA3AF" />
              </>
            )}

            {addCategory === 'Parking' && (
              <>
                <View style={styles.twoColRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldCaption}>Location</Text>
                    <TextInput style={styles.textInput} value={location} onChangeText={setLocation} placeholder="Enter details" placeholderTextColor="#9CA3AF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldCaption}>Vehicle (optional)</Text>
                    <TextInput style={styles.textInput} value={vehicle} onChangeText={setVehicle} placeholder="Enter details" placeholderTextColor="#9CA3AF" />
                  </View>
                </View>
                <Text style={styles.fieldCaption}>Link to job (optional)</Text>
                <TouchableOpacity style={styles.dropdownBox} onPress={() => setJobModalVisible(true)}>
                  <Text style={{ fontSize: 13.5, color: linkedJob ? TEXT_DARK : '#9CA3AF' }}>{linkedJob ? `${linkedJob.name} — ${linkedJob.service || 'Job'}` : 'Select'}</Text>
                  <Text style={styles.dropdownArrow}>⌄</Text>
                </TouchableOpacity>
              </>
            )}

            {addCategory === 'Other' && (
              <>
                <Text style={styles.fieldCaption}>Expense name</Text>
                <TextInput style={styles.textInput} value={expenseName} onChangeText={setExpenseName} placeholder="Enter details" placeholderTextColor="#9CA3AF" />
                <Text style={styles.fieldCaption}>Supplier (optional)</Text>
                <TextInput style={styles.textInput} value={supplier} onChangeText={setSupplier} placeholder="Enter details" placeholderTextColor="#9CA3AF" />
                <Text style={styles.fieldCaption}>Notes (optional)</Text>
                <TextInput style={styles.textInput} value={notes} onChangeText={setNotes} placeholder="Enter details" placeholderTextColor="#9CA3AF" />
              </>
            )}

            <TouchableOpacity style={styles.attachReceiptBtn} onPress={promptReceiptAttachment}>
              <Text style={styles.attachReceiptIcon}>📷</Text>
              <Text style={styles.attachReceiptText}>
                {receiptAsset ? 'Receipt attached (Tap to replace)' : 'Attach receipt (Camera or Gallery)'}
              </Text>
            </TouchableOpacity>

            {(receiptAsset?.persistUri || receiptAsset?.uri) && (
              <View style={styles.attachedPreviewCard}>
                <Image source={{ uri: receiptAsset.persistUri || receiptAsset.uri }} style={styles.attachedPreviewImage} resizeMode="cover" />
                <TouchableOpacity style={styles.removeReceiptBtn} onPress={() => setReceiptAsset(null)}>
                  <Text style={{ color: '#DC2626', fontWeight: '700', fontSize: 12 }}>Remove Receipt</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.primaryBlueBtn} onPress={handleSaveExpense} disabled={savingExpense}>
              <Text style={styles.primaryBlueBtnText}>{savingExpense ? 'Saving...' : editingExpenseId ? 'Update Expense' : 'Save Expense'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        {showExpDatePicker && (
          <DateTimePicker value={expDate} mode="date" display="default" onChange={(ev, sel) => { setShowExpDatePicker(false); if (sel) setExpDate(sel); }} />
        )}

        <Modal visible={jobModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Select Job to Link</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                <TouchableOpacity style={styles.modalOption} onPress={() => { setLinkedJob(null); setJobModalVisible(false); }}>
                  <Text style={styles.modalOptionText}>None (Unlinked)</Text>
                </TouchableOpacity>
                {jobs.map((j) => (
                  <TouchableOpacity key={j._id} style={styles.modalOption} onPress={() => { setLinkedJob(j); setJobModalVisible(false); }}>
                    <Text style={styles.modalOptionText}>{j.name} — {j.service || 'Handyman Job'} ({j.when || 'Scheduled'})</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={[styles.primaryBlueBtn, { marginTop: 12 }]} onPress={() => setJobModalVisible(false)}>
                <Text style={styles.primaryBlueBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={providerModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Select Toll Provider</Text>
              {['Linkt', 'E-Toll (Service NSW)', 'EastLink', 'Roam', 'Other Toll Provider'].map((p) => (
                <TouchableOpacity key={p} style={styles.modalOption} onPress={() => { setProvider(p); setProviderModalVisible(false); }}>
                  <Text style={styles.modalOptionText}>{p}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={[styles.primaryBlueBtn, { marginTop: 12 }]} onPress={() => setProviderModalVisible(false)}>
                <Text style={styles.primaryBlueBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // VIEW 3: EXPORT EXPENSES
  if (screenMode === 'export') {
    const PRESETS = ['This month', 'Last month', 'This financial year', 'Custom range'];
    return (
      <SafeAreaView edges={['top']} style={styles.whiteScreen}>
        <TradyTopBar showExport={false} />
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => switchScreen('list')} style={styles.backBtn} hitSlop={10}>
            <Text style={styles.backChevron}>‹</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.exportTitle}>Export Expenses</Text>
            <Text style={styles.exportSubtitle}>Create a PDF expense report</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.formContent}>
          <Text style={styles.sectionTitleSmall}>Date range</Text>
          <View style={styles.presetGrid}>
            {PRESETS.map((preset) => {
              const active = rangePreset === preset;
              return (
                <TouchableOpacity key={preset} style={[styles.presetBtn, active && styles.presetBtnActive]} onPress={() => handleSelectRangePreset(preset)}>
                  <Text style={[styles.presetBtnText, active && styles.presetBtnTextActive]}>{preset}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldCaption}>From</Text>
          <TouchableOpacity style={styles.dropdownBox} onPress={() => { setRangePreset('Custom range'); setRangePickerTarget('from'); setShowRangePicker(true); }}>
            <Text style={styles.dateBoxText}>📅  {formatFullDate(fromDate)}</Text>
            <Text style={styles.dropdownArrow}>⌄</Text>
          </TouchableOpacity>

          <Text style={styles.fieldCaption}>To</Text>
          <TouchableOpacity style={styles.dropdownBox} onPress={() => { setRangePreset('Custom range'); setRangePickerTarget('to'); setShowRangePicker(true); }}>
            <Text style={styles.dateBoxText}>📅  {formatFullDate(toDate)}</Text>
            <Text style={styles.dropdownArrow}>⌄</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionTitleSmall, { marginTop: 8 }]}>Expense types</Text>
          <TouchableOpacity style={styles.dropdownBox} onPress={() => setTypeModalVisible(true)}>
            <Text style={styles.dateBoxText}>☰  {exportExpenseType}</Text>
            <Text style={styles.dropdownArrow}>⌄</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionTitleSmall, { marginTop: 8 }]}>Include in report</Text>
          <View style={styles.includeCard}>
            <View style={styles.includeRow}>
              <Text style={styles.includeIcon}>📋</Text>
              <Text style={styles.includeLabel}>Expense summary</Text>
              <Switch value={incSummary} onValueChange={setIncSummary} trackColor={{ false: '#D1D5DB', true: BLUE }} thumbColor="#fff" />
            </View>
            <View style={styles.includeRow}>
              <Text style={styles.includeIcon}>☰</Text>
              <Text style={styles.includeLabel}>Itemised expenses</Text>
              <Switch value={incItemised} onValueChange={setIncItemised} trackColor={{ false: '#D1D5DB', true: BLUE }} thumbColor="#fff" />
            </View>
            <View style={styles.includeRow}>
              <Text style={styles.includeIcon}>%</Text>
              <Text style={styles.includeLabel}>GST breakdown</Text>
              <Switch value={incGstBreakdown} onValueChange={setIncGstBreakdown} trackColor={{ false: '#D1D5DB', true: BLUE }} thumbColor="#fff" />
            </View>
            <View style={[styles.includeRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.includeIcon}>🖼️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.includeLabel}>Receipt images</Text>
                <Text style={styles.includeSub}>Include attached receipt photos in PDF.</Text>
              </View>
              <Switch value={incReceipts} onValueChange={setIncReceipts} trackColor={{ false: '#D1D5DB', true: BLUE }} thumbColor="#fff" />
            </View>
          </View>

          <TouchableOpacity style={[styles.primaryBlueBtn, { marginTop: 18 }]} onPress={() => switchScreen('preview')}>
            <Text style={styles.primaryBlueBtnText}>📄  Generate PDF</Text>
          </TouchableOpacity>
        </ScrollView>

        {showRangePicker && (
          <DateTimePicker
            value={rangePickerTarget === 'from' ? fromDate : toDate}
            mode="date"
            display="default"
            onChange={(ev, sel) => {
              setShowRangePicker(false);
              if (sel) rangePickerTarget === 'from' ? setFromDate(sel) : setToDate(sel);
            }}
          />
        )}

        <Modal visible={typeModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Select Expense Types</Text>
              {['All expense types', ...EXPENSE_CATEGORIES.map((c) => c.id)].map((t) => (
                <TouchableOpacity key={t} style={styles.modalOption} onPress={() => { setExportExpenseType(t); setTypeModalVisible(false); }}>
                  <Text style={styles.modalOptionText}>{t}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={[styles.primaryBlueBtn, { marginTop: 12 }]} onPress={() => setTypeModalVisible(false)}>
                <Text style={styles.primaryBlueBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // VIEW 4: PDF PREVIEW
  if (screenMode === 'preview') {
    const previewReceipts = reportExpenses.filter((e) => resolveReceiptUri(e.receiptUri));
    return (
      <SafeAreaView edges={['top']} style={styles.whiteScreen}>
        <TradyTopBar showExport={false} />
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => switchScreen('export')} style={styles.backBtn} hitSlop={10}>
            <Text style={styles.backChevron}>‹</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.exportTitle}>PDF Preview</Text>
            <Text style={styles.exportSubtitle}>Review your expense report before downloading.</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.formContent}>
          <View style={styles.pdfOuterFrame}>
            <View style={styles.pdfPaperCard}>
              <View style={styles.pdfHeaderRow}>
                <View>
                  <Text style={styles.pdfBrand}>{settings?.businessName || 'Trady'}</Text>
                  <View style={styles.tradyUnderline} />
                  {settings?.abn ? <Text style={{ fontSize: 9.5, color: TEXT_GRAY, fontWeight: '700', marginTop: 4 }}>ABN: {settings.abn}</Text> : null}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.pdfReportHeading}>EXPENSE REPORT</Text>
                  <Text style={styles.pdfReportSub}>{formatFullDate(fromDate)} – {formatFullDate(toDate)}</Text>
                  <Text style={styles.pdfReportSub}>Amounts in AUD</Text>
                </View>
              </View>

              <View style={styles.pdfDivider} />

              {incSummary && (
                <View style={styles.pdfSummaryRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pdfSumLabel}>Total expenses</Text>
                    <Text style={styles.pdfSumValue}>{money(reportTotals.total)}</Text>
                  </View>
                  {incGstBreakdown && (
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pdfSumLabel}>GST paid</Text>
                      <Text style={styles.pdfSumValue}>{money(reportTotals.gst)}</Text>
                    </View>
                  )}
                </View>
              )}

              {incItemised && (
                <View style={styles.pdfTable}>
                  <View style={styles.pdfTableHeader}>
                    <Text style={[styles.pdfTh, { flex: 1.0 }]}>Date</Text>
                    <Text style={[styles.pdfTh, { flex: 1.8 }]}>Type & Details</Text>
                    <Text style={[styles.pdfTh, { flex: 1.0, textAlign: 'right' }]}>Amount</Text>
                    {incGstBreakdown && <Text style={[styles.pdfTh, { flex: 0.8, textAlign: 'right' }]}>GST</Text>}
                  </View>
                  {reportExpenses.length === 0 ? (
                    <View style={styles.pdfTr}>
                      <Text style={{ fontSize: 11, color: TEXT_GRAY, paddingVertical: 8 }}>No expenses in this date range.</Text>
                    </View>
                  ) : (
                    reportExpenses.map((item) => {
                      const detailStr = getExpenseDetailsList(item).map((d) => `${d.label}: ${d.value}`).join(' • ');
                      return (
                        <View key={item._id} style={styles.pdfTr}>
                          <Text style={[styles.pdfTd, { flex: 1.0 }]}>{formatShortDate(item.date)}</Text>
                          <View style={{ flex: 1.8, paddingRight: 4 }}>
                            <Text style={[styles.pdfTd, { fontWeight: '700' }]}>{item.category}</Text>
                            <Text style={{ fontSize: 9.5, color: TEXT_GRAY, marginTop: 1 }}>{detailStr || getExpenseSubtitle(item)}</Text>
                          </View>
                          <Text style={[styles.pdfTd, { flex: 1.0, textAlign: 'right' }]}>${Number(item.amount || 0).toFixed(2)}</Text>
                          {incGstBreakdown && <Text style={[styles.pdfTd, { flex: 0.8, textAlign: 'right' }]}>${Number(item.gstAmount || 0).toFixed(2)}</Text>}
                        </View>
                      );
                    })
                  )}
                  <View style={[styles.pdfTr, styles.pdfTotalRow]}>
                    <Text style={[styles.pdfTdBold, { flex: 2.8 }]}>Total</Text>
                    <Text style={[styles.pdfTdBold, { flex: 1.0, textAlign: 'right' }]}>${reportTotals.total.toFixed(2)}</Text>
                    {incGstBreakdown && <Text style={[styles.pdfTdBold, { flex: 0.8, textAlign: 'right' }]}>${reportTotals.gst.toFixed(2)}</Text>}
                  </View>
                </View>
              )}

              {incReceipts && previewReceipts.length > 0 && (
                <View style={{ marginTop: 16 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: TEXT_DARK, marginBottom: 8 }}>Attached Receipt Images ({previewReceipts.length})</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {previewReceipts.map((r) => (
                      <TouchableOpacity key={`rec-${r._id}`} onPress={() => setFullscreenImageUri(resolveReceiptUri(r.receiptUri))} style={styles.pdfReceiptCard}>
                        <Text style={{ fontSize: 9.5, fontWeight: '700', color: TEXT_DARK }}>{formatShortDate(r.date)} · {r.category}</Text>
                        <Text style={{ fontSize: 8.5, color: TEXT_GRAY }} numberOfLines={1}>{getExpenseSubtitle(r)}</Text>
                        <Image source={{ uri: resolveReceiptUri(r.receiptUri) }} style={{ width: '100%', height: 90, borderRadius: 6, marginTop: 4 }} resizeMode="cover" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.pdfFileName}>{reportFileName}</Text>
          <Text style={styles.pdfFileSize}>Size: ~45 KB • PDF</Text>

          <TouchableOpacity style={styles.primaryBlueBtn} onPress={handleDownloadOrSharePdf} disabled={downloadingPdf}>
            {downloadingPdf ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBlueBtnText}>⬇️  Download PDF</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineBlueBtn} onPress={handleDownloadOrSharePdf} disabled={downloadingPdf}>
            <Text style={styles.outlineBlueBtnText}>🔗  Share PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center', paddingVertical: 10 }} onPress={() => switchScreen('export')}>
            <Text style={{ color: BLUE, fontWeight: '700', fontSize: 13.5 }}>Edit report options</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // VIEW 1: MAIN EXPENSES DASHBOARD
  const currentMonthLabel = `${MONTH_NAMES[currentMonthDate.getMonth()]} ${currentMonthDate.getFullYear()}`;

  return (
    <SafeAreaView edges={['top']} style={styles.whiteScreen}>
      <TradyTopBar onExportPress={() => switchScreen('export')} showExport={true} />

      <ScrollView contentContainerStyle={styles.mainContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.mainHeading}>Expenses</Text>

        <View style={styles.monthBar}>
          <TouchableOpacity onPress={() => shiftMonth(-1)} style={styles.monthArrowBtn} hitSlop={10}>
            <Text style={styles.monthArrowText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabelText}>{currentMonthLabel}  ⌄</Text>
          <TouchableOpacity onPress={() => shiftMonth(1)} style={styles.monthArrowBtn} hitSlop={10}>
            <Text style={styles.monthArrowText}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navyCard}>
          <Text style={styles.navyCardTopCaption}>{selectedCategoryFilter ? `${selectedCategoryFilter} expenses` : 'Total expenses'}</Text>
          <Text style={styles.navyCardBigAmount}>{money(monthTotals.total)}</Text>
          <Text style={styles.navyCardSubCaption}>Including GST</Text>
          <View style={styles.navyCardDivider} />
          <Text style={styles.navyCardTopCaption}>GST paid</Text>
          <Text style={styles.navyCardGstAmount}>{money(monthTotals.gst)}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.FilterPillsRow}>
          {EXPENSE_CATEGORIES.map((cat) => {
            const active = selectedCategoryFilter === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catPill, active && styles.catPillActive]}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setSelectedCategoryFilter(active ? null : cat.id);
                }}
              >
                <Text style={[styles.catPillText, active && styles.catPillTextActive]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.searchBarWrap}>
          <Text style={{ fontSize: 13, marginRight: 8, opacity: 0.6 }}>🔍</Text>
          <TextInput
            style={styles.searchBarInput}
            placeholder="Search supplier, description, vehicle..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {!!searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
              <Text style={{ color: TEXT_GRAY, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.recentHeaderRow}>
          <Text style={styles.recentTitle}>{selectedCategoryFilter ? `${selectedCategoryFilter} expenses` : 'Recent expenses'}</Text>
          <TouchableOpacity onPress={() => setViewAll(!viewAll)}>
            <Text style={styles.viewAllLink}>{viewAll ? 'Show less ‹' : 'View all ›'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentListCard}>
          {loading ? (
            <View style={{ padding: 24, alignItems: 'center' }}><ActivityIndicator color={BLUE} /></View>
          ) : displayedList.length === 0 ? (
            <View style={{ padding: 26, alignItems: 'center' }}>
              <Text style={{ color: TEXT_GRAY, fontSize: 13 }}>No expenses recorded for {currentMonthLabel}.</Text>
            </View>
          ) : (
            displayedList.map((item, idx) => {
              const catMeta = EXPENSE_CATEGORIES.find((c) => c.id === item.category) || EXPENSE_CATEGORIES[5];
              const isLast = idx === displayedList.length - 1;
              const resolvedThumb = resolveReceiptUri(item.receiptUri);
              const extraDetails = getExpenseDetailsList(item);

              return (
                <TouchableOpacity key={item._id} style={[styles.expenseRow, isLast && { borderBottomWidth: 0 }]} onPress={() => setSelectedExpense(item)}>
                  {resolvedThumb ? (
                    <Image source={{ uri: resolvedThumb }} style={styles.receiptThumbBox} />
                  ) : (
                    <View style={[styles.receiptIconBox, { backgroundColor: catMeta.iconBg }]}>
                      <Text style={[styles.receiptGlyph, { color: catMeta.iconColor }]}>🧾</Text>
                    </View>
                  )}
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.expRowTitle}>{item.category}</Text>
                      {resolvedThumb && (
                        <View style={styles.photoAttachedPill}>
                          <Text style={styles.photoAttachedPillText}>📷 Receipt</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.expRowSub} numberOfLines={2}>{formatShortDate(item.date)} • {getExpenseSubtitle(item)}</Text>
                    {extraDetails.length > 1 && (
                      <Text style={styles.expRowMeta} numberOfLines={1}>{extraDetails.map((d) => `${d.label}: ${d.value}`).join(' · ')}</Text>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end', marginRight: 6 }}>
                    <Text style={styles.expRowAmount}>{money(item.amount)}</Text>
                    <Text style={{ fontSize: 10.5, color: TEXT_GRAY }}>GST {money(item.gstAmount)}</Text>
                  </View>
                  <Text style={styles.expRowChevron}>›</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBarWrap}>
        <TouchableOpacity style={styles.primaryBlueBtn} onPress={() => openAddExpense(selectedCategoryFilter || 'Materials')}>
          <Text style={styles.primaryBlueBtnText}>＋  Add Expense</Text>
        </TouchableOpacity>
      </View>

      {/* EXPENSE DETAILS & RECEIPT MODAL */}
      <Modal visible={!!selectedExpense} transparent animationType="slide" onRequestClose={() => setSelectedExpense(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '90%' }]}>
            {selectedExpense && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailModalHeader}>
                  <View>
                    <Text style={styles.detailModalCategory}>{selectedExpense.category} Expense</Text>
                    <Text style={styles.detailModalDate}>{formatFullDate(selectedExpense.date)}</Text>
                  </View>
                  <Text style={styles.detailModalAmount}>{money(selectedExpense.amount)}</Text>
                </View>

                <View style={styles.detailInfoBox}>
                  <View style={styles.detailInfoRow}>
                    <Text style={styles.detailInfoLabel}>Payment Method</Text>
                    <Text style={styles.detailInfoVal}>{selectedExpense.paymentMethod || 'Card'}</Text>
                  </View>
                  <View style={styles.detailInfoRow}>
                    <Text style={styles.detailInfoLabel}>GST ({selectedExpense.gstOption || '10%'})</Text>
                    <Text style={styles.detailInfoVal}>{money(selectedExpense.gstAmount)}</Text>
                  </View>
                  {getExpenseDetailsList(selectedExpense).map((d, i) => (
                    <View key={i} style={styles.detailInfoRow}>
                      <Text style={styles.detailInfoLabel}>{d.label}</Text>
                      <Text style={styles.detailInfoVal}>{d.value}</Text>
                    </View>
                  ))}
                </View>

                {selectedExpense.linkedJobId && (
                  <TouchableOpacity
                    style={[styles.outlineBlueBtn, { marginTop: 12, paddingVertical: 10 }]}
                    onPress={() => {
                      const jobId = selectedExpense.linkedJobId;
                      setSelectedExpense(null);
                      navigation.getParent()?.navigate('Jobs', { screen: 'JobDetail', params: { id: String(jobId) }, initial: false });
                    }}
                  >
                    <Text style={styles.outlineBlueBtnText}>🛠️ Open Linked Job</Text>
                  </TouchableOpacity>
                )}

                {resolveReceiptUri(selectedExpense.receiptUri) ? (
                  <View style={{ marginTop: 14 }}>
                    <Text style={styles.sectionTitleSmall}>Attached Receipt Image (Tap to enlarge)</Text>
                    <TouchableOpacity onPress={() => setFullscreenImageUri(resolveReceiptUri(selectedExpense.receiptUri))}>
                      <Image source={{ uri: resolveReceiptUri(selectedExpense.receiptUri) }} style={styles.fullReceiptImage} resizeMode="contain" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.noReceiptBox}>
                    <Text style={{ color: TEXT_GRAY, fontSize: 12.5 }}>No receipt image attached to this expense.</Text>
                  </View>
                )}

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
                  {!selectedExpense.fromInvoice && (
                    <>
                      <TouchableOpacity style={[styles.outlineBlueBtn, { flex: 1, marginTop: 0 }]} onPress={() => openEditExpense(selectedExpense)}>
                        <Text style={styles.outlineBlueBtnText}>✏️ Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.outlineBlueBtn, { flex: 1, marginTop: 0, borderColor: '#DC2626' }]}
                        onPress={async () => {
                          const idToDel = selectedExpense._id;
                          setSelectedExpense(null);
                          await deleteExpense(idToDel);
                          loadData();
                          showToast('Expense deleted');
                        }}
                      >
                        <Text style={[styles.outlineBlueBtnText, { color: '#DC2626' }]}>🗑️ Delete</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  <TouchableOpacity style={[styles.primaryBlueBtn, { flex: 1 }]} onPress={() => setSelectedExpense(null)}>
                    <Text style={styles.primaryBlueBtnText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* FULLSCREEN RECEIPT ZOOM MODAL */}
      <Modal visible={!!fullscreenImageUri} transparent animationType="fade" onRequestClose={() => setFullscreenImageUri(null)}>
        <View style={styles.fullscreenOverlay}>
          <TouchableOpacity style={styles.fullscreenCloseBtn} onPress={() => setFullscreenImageUri(null)}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>✕ Close Receipt</Text>
          </TouchableOpacity>
          {fullscreenImageUri && <Image source={{ uri: fullscreenImageUri }} style={{ width: '94%', height: '78%' }} resizeMode="contain" />}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  whiteScreen: { flex: 1, backgroundColor: '#FFFFFF' },
  tradyTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 8, paddingBottom: 6 },
  tradyBrandText: { fontSize: 22, fontWeight: '800', color: TEXT_DARK, letterSpacing: -0.4 },
  tradyUnderline: { width: 26, height: 3, backgroundColor: BLUE, borderRadius: 2, marginTop: 1 },
  exportIconBtn: { padding: 6, borderRadius: 8, borderWidth: 1, borderColor: BORDER_COLOR },
  exportIconText: { fontSize: 15, color: TEXT_DARK, fontWeight: '700' },
  mainContent: { paddingHorizontal: 18, paddingBottom: 100 },
  mainHeading: { fontSize: 28, fontWeight: '800', color: TEXT_DARK, marginTop: 6, marginBottom: 12 },
  monthBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F1F5F9', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 14 },
  monthArrowBtn: { paddingHorizontal: 6 },
  monthArrowText: { fontSize: 20, color: TEXT_DARK, fontWeight: '600' },
  monthLabelText: { fontSize: 15, fontWeight: '700', color: TEXT_DARK },
  navyCard: { backgroundColor: NAVY, borderRadius: 14, padding: 18, marginBottom: 16 },
  navyCardTopCaption: { color: '#CBD5E1', fontSize: 13, fontWeight: '600' },
  navyCardBigAmount: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', marginTop: 4 },
  navyCardSubCaption: { color: '#94A3B8', fontSize: 12.5, marginTop: 2 },
  navyCardDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 12 },
  navyCardGstAmount: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 2 },
  FilterPillsRow: { gap: 8, paddingBottom: 12 },
  catPill: { backgroundColor: '#F1F5F9', paddingHorizontal: 15, paddingVertical: 9, borderRadius: 999 },
  catPillActive: { backgroundColor: BLUE },
  catPillText: { fontSize: 13, fontWeight: '700', color: TEXT_DARK },
  catPillTextActive: { color: '#FFFFFF' },
  searchBarWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 10, paddingHorizontal: 12, marginBottom: 14, backgroundColor: '#F8FAFC' },
  searchBarInput: { flex: 1, paddingVertical: 9, fontSize: 13, color: TEXT_DARK },
  recentHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  recentTitle: { fontSize: 18, fontWeight: '800', color: TEXT_DARK },
  viewAllLink: { fontSize: 13.5, fontWeight: '700', color: BLUE },
  recentListCard: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: BORDER_COLOR, overflow: 'hidden' },
  expenseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  receiptIconBox: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  receiptThumbBox: { width: 44, height: 44, borderRadius: 10, marginRight: 12, borderWidth: 1, borderColor: BORDER_COLOR },
  receiptGlyph: { fontSize: 18 },
  expRowTitle: { fontSize: 15, fontWeight: '700', color: TEXT_DARK },
  expRowSub: { fontSize: 12.5, color: TEXT_GRAY, marginTop: 2 },
  expRowMeta: { fontSize: 11, color: BLUE, marginTop: 2, fontWeight: '600' },
  expRowAmount: { fontSize: 15.5, fontWeight: '800', color: TEXT_DARK },
  expRowChevron: { fontSize: 18, color: TEXT_GRAY },
  photoAttachedPill: { backgroundColor: '#EBF3FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  photoAttachedPillText: { fontSize: 9.5, fontWeight: '700', color: BLUE },
  bottomBarWrap: { position: 'absolute', left: 18, right: 18, bottom: 14 },
  primaryBlueBtn: { backgroundColor: BLUE, borderRadius: 10, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  primaryBlueBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  outlineBlueBtn: { backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1.5, borderColor: BLUE, paddingVertical: 13, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  outlineBlueBtnText: { color: BLUE, fontSize: 14.5, fontWeight: '800' },
  subHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  backBtn: { paddingRight: 6 },
  backChevron: { fontSize: 26, color: TEXT_DARK, fontWeight: '600' },
  subHeaderTitle: { fontSize: 18, fontWeight: '800', color: TEXT_DARK },
  exportTitle: { fontSize: 20, fontWeight: '800', color: TEXT_DARK },
  exportSubtitle: { fontSize: 12.5, color: TEXT_GRAY, marginTop: 2 },
  formContent: { paddingHorizontal: 16, paddingBottom: 120 },
  twoColRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  fieldCaption: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6 },
  dateBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: '#FFF' },
  dateBoxText: { fontSize: 13.5, fontWeight: '600', color: TEXT_DARK },
  amountInputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: '#FFF' },
  dollarPrefix: { fontSize: 14, fontWeight: '700', color: TEXT_DARK, marginRight: 2 },
  amountInput: { flex: 1, fontSize: 14, fontWeight: '700', color: TEXT_DARK },
  segmentedBar: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 8, padding: 3, height: 42 },
  segBtn: { flex: 1, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  segBtnActive: { backgroundColor: BLUE },
  segBtnText: { fontSize: 12.5, fontWeight: '700', color: '#374151' },
  segBtnTextActive: { color: '#FFFFFF' },
  readonlyBox: { borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 8, paddingHorizontal: 12, height: 42, justifyContent: 'center', backgroundColor: '#F8FAFC' },
  readonlyText: { fontSize: 13.5, color: TEXT_GRAY, fontWeight: '600' },
  textInput: { borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 8, paddingHorizontal: 12, height: 44, fontSize: 13.5, color: TEXT_DARK, backgroundColor: '#FFF', marginBottom: 12 },
  dropdownBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: '#FFF', marginBottom: 12 },
  dropdownArrow: { fontSize: 16, color: TEXT_GRAY, fontWeight: '700' },
  attachReceiptBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 10, paddingVertical: 12, marginTop: 8, marginBottom: 12, backgroundColor: '#FFF', gap: 8 },
  attachReceiptIcon: { fontSize: 16 },
  attachReceiptText: { fontSize: 13.5, fontWeight: '700', color: BLUE },
  attachedPreviewCard: { alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 10, padding: 10, marginBottom: 14 },
  attachedPreviewImage: { width: 160, height: 160, borderRadius: 8 },
  removeReceiptBtn: { marginTop: 8, paddingVertical: 4, paddingHorizontal: 10 },
  sectionTitleSmall: { fontSize: 13.5, fontWeight: '800', color: TEXT_DARK, marginBottom: 8 },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  presetBtn: { width: '48.5%', backgroundColor: '#F1F5F9', paddingVertical: 11, borderRadius: 8, alignItems: 'center' },
  presetBtnActive: { backgroundColor: BLUE },
  presetBtnText: { fontSize: 13, fontWeight: '700', color: TEXT_DARK },
  presetBtnTextActive: { color: '#FFFFFF' },
  includeCard: { borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 12, backgroundColor: '#FFF', paddingHorizontal: 12 },
  includeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  includeIcon: { fontSize: 16, width: 28, color: TEXT_DARK, fontWeight: '700' },
  includeLabel: { flex: 1, fontSize: 13.5, fontWeight: '600', color: TEXT_DARK },
  includeSub: { fontSize: 11, color: TEXT_GRAY, marginTop: 2 },
  pdfOuterFrame: { backgroundColor: '#E5E7EB', borderRadius: 12, padding: 14, marginBottom: 12 },
  pdfPaperCard: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 16, elevation: 2 },
  pdfHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pdfBrand: { fontSize: 18, fontWeight: '800', color: TEXT_DARK },
  pdfReportHeading: { fontSize: 11, fontWeight: '800', color: TEXT_DARK },
  pdfReportSub: { fontSize: 9.5, color: TEXT_GRAY, marginTop: 1 },
  pdfDivider: { height: 1, backgroundColor: BORDER_COLOR, marginVertical: 12 },
  pdfSummaryRow: { flexDirection: 'row', marginBottom: 14 },
  pdfSumLabel: { fontSize: 10.5, color: TEXT_GRAY, fontWeight: '600' },
  pdfSumValue: { fontSize: 18, fontWeight: '800', color: TEXT_DARK, marginTop: 2 },
  pdfTable: { borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 6, overflow: 'hidden' },
  pdfTableHeader: { flexDirection: 'row', backgroundColor: '#F3F4F6', paddingVertical: 8, paddingHorizontal: 10 },
  pdfTh: { fontSize: 10, fontWeight: '700', color: '#374151' },
  pdfTr: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6', alignItems: 'center' },
  pdfTotalRow: { backgroundColor: '#EEF2FF' },
  pdfTd: { fontSize: 10.5, color: TEXT_DARK },
  pdfTdBold: { fontSize: 11, fontWeight: '800', color: TEXT_DARK },
  pdfReceiptCard: { width: '47%', borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 8, padding: 6 },
  pdfFileName: { fontSize: 13, fontWeight: '800', color: TEXT_DARK, marginTop: 2 },
  pdfFileSize: { fontSize: 11.5, color: TEXT_GRAY, marginBottom: 14, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(17,24,39,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: TEXT_DARK, marginBottom: 12 },
  modalOption: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalOptionText: { fontSize: 14, color: TEXT_DARK, fontWeight: '600' },
  detailModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: BORDER_COLOR, paddingBottom: 12, marginBottom: 12 },
  detailModalCategory: { fontSize: 18, fontWeight: '800', color: TEXT_DARK },
  detailModalDate: { fontSize: 12.5, color: TEXT_GRAY, marginTop: 2 },
  detailModalAmount: { fontSize: 22, fontWeight: '800', color: BLUE },
  detailInfoBox: { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: BORDER_COLOR },
  detailInfoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  detailInfoLabel: { fontSize: 12.5, color: TEXT_GRAY, fontWeight: '600' },
  detailInfoVal: { fontSize: 13, color: TEXT_DARK, fontWeight: '700', maxWidth: '62%', textAlign: 'right' },
  fullReceiptImage: { width: '100%', height: 260, borderRadius: 10, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: BORDER_COLOR },
  noReceiptBox: { padding: 18, backgroundColor: '#F8FAFC', borderRadius: 10, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: BORDER_COLOR },
  fullscreenOverlay: { flex: 1, backgroundColor: 'rgba(9,13,22,0.94)', alignItems: 'center', justifyContent: 'center' },
  fullscreenCloseBtn: { position: 'absolute', top: 54, right: 20, backgroundColor: 'rgba(255,255,255,0.18)', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, zIndex: 10 },
});