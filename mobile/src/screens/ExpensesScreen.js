import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import useJobs from '../hooks/useJobs';
import useSettings from '../hooks/useSettings';
import useToast from '../hooks/useToast';
import {
  EXPENSE_CATEGORIES,
  calcGstFromIncl,
  getExpenseSubtitle,
  listAllExpenses,
  createExpense,
  deleteExpense,
} from '../services/expenseService';
import { money } from '../utils/money';

const BLUE = '#1565D8';
const NAVY = '#173156';
const TEXT_DARK = '#111827';
const TEXT_GRAY = '#6B7280';
const BORDER_COLOR = '#E5E7EB';
const BG_LIGHT = '#F8FAFC';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatShortDate(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')} ${SHORT_MONTHS[d.getMonth()]}`;
}

function formatFullDate(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')} ${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

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
  const { showToast } = useToast();
  const { jobs } = useJobs('all');
  const { settings } = useSettings();

  // Screen mode: 'list' | 'add' | 'export' | 'preview'
  const [screenMode, setScreenMode] = useState('list');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Main List Filters
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null); // null = All
  const [viewAll, setViewAll] = useState(false);

  // Add Expense State
  const [addCategory, setAddCategory] = useState('Materials');
  const [expDate, setExpDate] = useState(new Date());
  const [showExpDatePicker, setShowExpDatePicker] = useState(false);
  const [amountStr, setAmountStr] = useState('');
  const [gstOption, setGstOption] = useState('10%'); // '10%' | 'No GST'
  const [paymentMethod, setPaymentMethod] = useState('Card'); // 'Card' | 'Cash' | 'Bank'

  // Category-specific form fields
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

  // Modals for Job Picker / Provider Picker / Expense Type Picker
  const [jobModalVisible, setJobModalVisible] = useState(false);
  const [providerModalVisible, setProviderModalVisible] = useState(false);
  const [typeModalVisible, setTypeModalVisible] = useState(false);

  // Export Expenses State
  const [rangePreset, setRangePreset] = useState('Custom range'); // 'This month' | 'Last month' | 'This financial year' | 'Custom range'
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [toDate, setToDate] = useState(new Date());
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [rangePickerTarget, setRangePickerTarget] = useState('from');
  const [exportExpenseType, setExportExpenseType] = useState('All expense types');
  const [incSummary, setIncSummary] = useState(true);
  const [incItemised, setIncItemised] = useState(true);
  const [incGstBreakdown, setIncGstBreakdown] = useState(true);
  const [incReceipts, setIncReceipts] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAllExpenses();
      setExpenses(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Reset form helper when opening Add Expense
  const openAddExpense = (defaultCat) => {
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
    setScreenMode('add');
  };

  // Month Navigation
  const shiftMonth = (dir) => {
    const next = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + dir, 1);
    setCurrentMonthDate(next);
  };

  // Filtered expenses for the selected month
  const monthExpenses = useMemo(() => {
    const y = currentMonthDate.getFullYear();
    const m = currentMonthDate.getMonth();
    return expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === y && d.getMonth() === m;
    });
  }, [expenses, currentMonthDate]);

  // Summary card totals (for the selected month & optional category filter)
  const categoryFilteredExpenses = useMemo(() => {
    if (!selectedCategoryFilter) return monthExpenses;
    return monthExpenses.filter((e) => e.category === selectedCategoryFilter);
  }, [monthExpenses, selectedCategoryFilter]);

  const monthTotals = useMemo(() => {
    const total = monthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const gst = monthExpenses.reduce((sum, e) => sum + (Number(e.gstAmount) || 0), 0);
    return { total, gst };
  }, [monthExpenses]);

  const displayedList = useMemo(() => {
    if (viewAll) return categoryFilteredExpenses;
    return categoryFilteredExpenses.slice(0, 6);
  }, [categoryFilteredExpenses, viewAll]);

  // Live GST calculation in Add Expense form
  const calculatedGst = useMemo(() => {
    return calcGstFromIncl(amountStr, gstOption === '10%');
  }, [amountStr, gstOption]);

  const pickReceiptImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        return Alert.alert('Permission needed', 'Allow photo library access to attach receipts.');
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.4,
      });
      if (!res.canceled && res.assets?.length > 0) {
        setReceiptAsset(res.assets[0]);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open image picker.');
    }
  };

  const handleSaveExpense = async () => {
    const numAmt = parseFloat(amountStr);
    if (!numAmt || numAmt <= 0) {
      return Alert.alert('Enter Amount', 'Please enter a valid expense amount greater than $0.00.');
    }

    setSavingExpense(true);
    try {
      await createExpense({
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
        receiptUri: receiptAsset?.uri || null,
      });

      await loadData();
      showToast(`✅ ${addCategory} expense saved!`);
      setScreenMode('list');
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
      // Australian Financial Year starts 1 July
      const fyStartYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
      setFromDate(new Date(fyStartYear, 6, 1));
      setToDate(now);
    }
  };

  // Expenses matching the Export Report filter
  const reportExpenses = useMemo(() => {
    const startMs = new Date(fromDate).setHours(0, 0, 0, 0);
    const endMs = new Date(toDate).setHours(23, 59, 59, 999);

    return expenses
      .filter((e) => {
        const t = new Date(e.date).getTime();
        const dateMatch = t >= startMs && t <= endMs;
        const typeMatch =
          exportExpenseType === 'All expense types' ? true : e.category === exportExpenseType;
        return dateMatch && typeMatch;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [expenses, fromDate, toDate, exportExpenseType]);

  const reportTotals = useMemo(() => {
    const total = reportExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const gst = reportExpenses.reduce((s, e) => s + (Number(e.gstAmount) || 0), 0);
    return { total, gst };
  }, [reportExpenses]);

  const reportFileName = useMemo(() => {
    const fDay = String(fromDate.getDate()).padStart(2, '0');
    const tDay = String(toDate.getDate()).padStart(2, '0');
    const mStr = SHORT_MONTHS[toDate.getMonth()];
    const yStr = toDate.getFullYear();
    return `Trady_Expenses_${fDay}-${tDay}_${mStr}_${yStr}.pdf`;
  }, [fromDate, toDate]);

  const generateExpenseReportHtml = () => {
    const rowsHtml = reportExpenses
      .map(
        (e) => `
        <tr>
          <td>${formatShortDate(e.date)}</td>
          <td>${e.category}${getExpenseSubtitle(e) ? ` — <span style="color:#6B7280;font-size:10px;">${getExpenseSubtitle(e)}</span>` : ''}</td>
          <td class="right">$${Number(e.amount || 0).toFixed(2)}</td>
          ${incGstBreakdown ? `<td class="right">$${Number(e.gstAmount || 0).toFixed(2)}</td>` : ''}
        </tr>
      `
      )
      .join('');

    const receiptsHtml =
      incReceipts && reportExpenses.some((e) => e.receiptUri)
        ? `<div style="margin-top:28px;page-break-inside:avoid;">
            <h3 style="font-size:13px;color:#111827;border-bottom:1px solid #E5E7EB;padding-bottom:6px;">Attached Receipts</h3>
            ${reportExpenses
              .filter((e) => e.receiptUri)
              .map(
                (e) => `
                <div style="margin-top:10px;">
                  <div style="font-size:11px;font-weight:700;">${formatShortDate(e.date)} · ${e.category} ($${Number(e.amount).toFixed(2)})</div>
                  <img src="${e.receiptUri}" style="max-width:220px;max-height:220px;margin-top:4px;border-radius:6px;border:1px solid #E5E7EB;" />
                </div>`
              )
              .join('')}
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
            td { padding: 10px 12px; border-bottom: 1px solid #F3F4F6; color: #111827; }
            .total-row td { background: #EEF2FF; font-weight: 800; border-top: 1.5px solid #CBD5E1; }
            .right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="top">
            <div>
              <div class="brand">${settings?.businessName || 'Trady'}</div>
              <div class="brand-bar"></div>
            </div>
            <div class="meta">
              <div class="meta-title">EXPENSE REPORT</div>
              <div class="meta-sub">${formatFullDate(fromDate)} – ${formatFullDate(toDate)}</div>
              <div class="meta-sub">Amounts in AUD</div>
            </div>
          </div>

          ${
            incSummary
              ? `<div class="summary">
                  <div>
                    <div class="sum-label">Total expenses</div>
                    <div class="sum-val">$${reportTotals.total.toFixed(2)}</div>
                  </div>
                  ${
                    incGstBreakdown
                      ? `<div>
                          <div class="sum-label">GST paid</div>
                          <div class="sum-val">$${reportTotals.gst.toFixed(2)}</div>
                        </div>`
                      : ''
                  }
                </div>`
              : ''
          }

          ${
            incItemised
              ? `<table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th class="right">Amount</th>
                      ${incGstBreakdown ? '<th class="right">GST</th>' : ''}
                    </tr>
                  </thead>
                  <tbody>
                    ${rowsHtml || `<tr><td colspan="4" style="text-align:center;color:#6B7280;">No expenses in this period</td></tr>`}
                    <tr class="total-row">
                      <td colspan="2">Total</td>
                      <td class="right">$${reportTotals.total.toFixed(2)}</td>
                      ${incGstBreakdown ? `<td class="right">$${reportTotals.gst.toFixed(2)}</td>` : ''}
                    </tr>
                  </tbody>
                </table>`
              : ''
          }
          ${receiptsHtml}
        </body>
      </html>
    `;
  };

  const handleDownloadOrSharePdf = async () => {
    setDownloadingPdf(true);
    try {
      const html = generateExpenseReportHtml();
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: reportFileName,
          UTI: '.pdf',
        });
      } else {
        Alert.alert('PDF Generated', `Saved to: ${uri}`);
      }
    } catch (e) {
      Alert.alert('PDF Error', 'Could not generate expense report PDF.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // ============================================================================
  // VIEW 2: ADD EXPENSE SCREEN (All 6 Category Variants)
  // ============================================================================
  if (screenMode === 'add') {
    const headerTitle =
      addCategory === 'Tolls' ? 'Toll expense' : `${addCategory} expense`;

    return (
      <SafeAreaView edges={['top']} style={styles.whiteScreen}>
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setScreenMode('list')} style={styles.backBtn} hitSlop={10}>
            <Text style={styles.backChevron}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>{headerTitle}</Text>
        </View>

        {/* Quick Category Switcher Bar */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {EXPENSE_CATEGORIES.map((cat) => {
              const active = addCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setAddCategory(cat.id)}
                  style={[styles.catPill, active && styles.catPillActive]}
                >
                  <Text style={[styles.catPillText, active && styles.catPillTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={true}
          >
            {/* Row 1: Date & Amount (incl. GST) */}
            <View style={styles.twoColRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldCaption}>Date</Text>
                <TouchableOpacity
                  style={styles.dateBox}
                  onPress={() => setShowExpDatePicker(true)}
                >
                  <Text style={styles.dateBoxText}>{formatFullDate(expDate)}</Text>
                  <Text style={{ fontSize: 14 }}>📅</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.fieldCaption}>Amount (incl. GST)</Text>
                <View style={styles.amountInputWrap}>
                  <Text style={styles.dollarPrefix}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amountStr}
                    onChangeText={setAmountStr}
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>

            {/* Row 2: GST Toggle (10% | No GST) & Auto GST Amount */}
            <View style={styles.twoColRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldCaption}>GST</Text>
                <View style={styles.segmentedTwo}>
                  {['10%', 'No GST'].map((opt) => {
                    const active = gstOption === opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        style={[styles.segBtn, active && styles.segBtnActive]}
                        onPress={() => setGstOption(opt)}
                      >
                        <Text style={[styles.segBtnText, active && styles.segBtnTextActive]}>
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.fieldCaption}>GST amount</Text>
                <View style={[styles.readonlyBox]}>
                  <Text style={styles.readonlyText}>${calculatedGst.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* Row 3: Payment Method (Card | Cash | Bank) */}
            <Text style={styles.fieldCaption}>Payment</Text>
            <View style={[styles.segmentedThree, { marginBottom: 14 }]}>
              {['Card', 'Cash', 'Bank'].map((mode) => {
                const active = paymentMethod === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[styles.segBtn, active && styles.segBtnActive]}
                    onPress={() => setPaymentMethod(mode)}
                  >
                    <Text style={[styles.segBtnText, active && styles.segBtnTextActive]}>
                      {mode}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Category-Specific Fields */}
            {addCategory === 'Fuel' && (
              <>
                <View style={styles.twoColRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldCaption}>Service station</Text>
                    <TextInput
                      style={styles.textInput}
                      value={serviceStation}
                      onChangeText={setServiceStation}
                      placeholder="Enter details"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldCaption}>Vehicle (optional)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={vehicle}
                      onChangeText={setVehicle}
                      placeholder="Enter details"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <Text style={styles.fieldCaption}>Litres (optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={litres}
                  onChangeText={setLitres}
                  placeholder="Enter details"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                />
              </>
            )}

            {addCategory === 'Materials' && (
              <>
                <Text style={styles.fieldCaption}>Supplier</Text>
                <TextInput
                  style={styles.textInput}
                  value={supplier}
                  onChangeText={setSupplier}
                  placeholder="Enter details"
                  placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.fieldCaption}>Description</Text>
                <TextInput
                  style={styles.textInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter details"
                  placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.fieldCaption}>Link to job (optional)</Text>
                <TouchableOpacity
                  style={styles.dropdownBox}
                  onPress={() => setJobModalVisible(true)}
                >
                  <Text
                    style={{
                      fontSize: 13.5,
                      color: linkedJob ? TEXT_DARK : '#9CA3AF',
                    }}
                  >
                    {linkedJob ? `${linkedJob.name} — ${linkedJob.service || 'Job'}` : 'Select'}
                  </Text>
                  <Text style={styles.dropdownArrow}>⌄</Text>
                </TouchableOpacity>
              </>
            )}

            {addCategory === 'Tools' && (
              <>
                <Text style={styles.fieldCaption}>Supplier</Text>
                <TextInput
                  style={styles.textInput}
                  value={supplier}
                  onChangeText={setSupplier}
                  placeholder="Enter details"
                  placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.fieldCaption}>Tool / equipment name</Text>
                <TextInput
                  style={styles.textInput}
                  value={toolName}
                  onChangeText={setToolName}
                  placeholder="Enter details"
                  placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.fieldCaption}>Warranty / notes (optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={warrantyNotes}
                  onChangeText={setWarrantyNotes}
                  placeholder="Enter details"
                  placeholderTextColor="#9CA3AF"
                />
              </>
            )}

            {addCategory === 'Tolls' && (
              <>
                <View style={styles.twoColRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldCaption}>Provider</Text>
                    <TouchableOpacity
                      style={styles.dropdownBox}
                      onPress={() => setProviderModalVisible(true)}
                    >
                      <Text style={{ fontSize: 13.5, color: provider ? TEXT_DARK : '#9CA3AF' }}>
                        {provider || 'Enter details'}
                      </Text>
                      <Text style={styles.dropdownArrow}>⌄</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldCaption}>Vehicle (optional)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={vehicle}
                      onChangeText={setVehicle}
                      placeholder="Enter details"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <Text style={styles.fieldCaption}>Trip / statement reference (optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={tripReference}
                  onChangeText={setTripReference}
                  placeholder="Enter details"
                  placeholderTextColor="#9CA3AF"
                />
              </>
            )}

            {addCategory === 'Parking' && (
              <>
                <View style={styles.twoColRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldCaption}>Location</Text>
                    <TextInput
                      style={styles.textInput}
                      value={location}
                      onChangeText={setLocation}
                      placeholder="Enter details"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldCaption}>Vehicle (optional)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={vehicle}
                      onChangeText={setVehicle}
                      placeholder="Enter details"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <Text style={styles.fieldCaption}>Link to job (optional)</Text>
                <TouchableOpacity
                  style={styles.dropdownBox}
                  onPress={() => setJobModalVisible(true)}
                >
                  <Text
                    style={{
                      fontSize: 13.5,
                      color: linkedJob ? TEXT_DARK : '#9CA3AF',
                    }}
                  >
                    {linkedJob ? `${linkedJob.name} — ${linkedJob.service || 'Job'}` : 'Select'}
                  </Text>
                  <Text style={styles.dropdownArrow}>⌄</Text>
                </TouchableOpacity>
              </>
            )}

            {addCategory === 'Other' && (
              <>
                <Text style={styles.fieldCaption}>Expense name</Text>
                <TextInput
                  style={styles.textInput}
                  value={expenseName}
                  onChangeText={setExpenseName}
                  placeholder="Enter details"
                  placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.fieldCaption}>Supplier (optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={supplier}
                  onChangeText={setSupplier}
                  placeholder="Enter details"
                  placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.fieldCaption}>Notes (optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Enter details"
                  placeholderTextColor="#9CA3AF"
                />
              </>
            )}

            {/* Attach Receipt Button */}
            <TouchableOpacity style={styles.attachReceiptBtn} onPress={pickReceiptImage}>
              <Text style={styles.attachReceiptIcon}>📷</Text>
              <Text style={styles.attachReceiptText}>
                {receiptAsset ? 'Receipt attached (Tap to change)' : 'Attach receipt'}
              </Text>
            </TouchableOpacity>

            {receiptAsset?.uri && (
              <Image
                source={{ uri: receiptAsset.uri }}
                style={{ width: 90, height: 90, borderRadius: 8, marginBottom: 12, alignSelf: 'center' }}
              />
            )}

            {/* Save Expense Primary Button */}
            <TouchableOpacity
              style={styles.primaryBlueBtn}
              onPress={handleSaveExpense}
              disabled={savingExpense}
            >
              <Text style={styles.primaryBlueBtnText}>
                {savingExpense ? 'Saving...' : 'Save Expense'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        {showExpDatePicker && (
          <DateTimePicker
            value={expDate}
            mode="date"
            display="default"
            onChange={(ev, selected) => {
              setShowExpDatePicker(false);
              if (selected) setExpDate(selected);
            }}
          />
        )}

        {/* Link to Job Modal */}
        <Modal visible={jobModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Select Job to Link</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    setLinkedJob(null);
                    setJobModalVisible(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>None (Unlinked)</Text>
                </TouchableOpacity>
                {jobs.map((j) => (
                  <TouchableOpacity
                    key={j._id}
                    style={styles.modalOption}
                    onPress={() => {
                      setLinkedJob(j);
                      setJobModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>
                      {j.name} — {j.service || 'Handyman Job'} ({j.when || 'Scheduled'})
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={[styles.primaryBlueBtn, { marginTop: 12 }]}
                onPress={() => setJobModalVisible(false)}
              >
                <Text style={styles.primaryBlueBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Toll Provider Modal */}
        <Modal visible={providerModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Select Toll Provider</Text>
              {['Linkt', 'E-Toll (Service NSW)', 'EastLink', 'Roam', 'Other Toll Provider'].map(
                (p) => (
                  <TouchableOpacity
                    key={p}
                    style={styles.modalOption}
                    onPress={() => {
                      setProvider(p);
                      setProviderModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{p}</Text>
                  </TouchableOpacity>
                )
              )}
              <TouchableOpacity
                style={[styles.primaryBlueBtn, { marginTop: 12 }]}
                onPress={() => setProviderModalVisible(false)}
              >
                <Text style={styles.primaryBlueBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // VIEW 3: EXPORT EXPENSES SCREEN
  // ============================================================================
  if (screenMode === 'export') {
    const PRESETS = ['This month', 'Last month', 'This financial year', 'Custom range'];

    return (
      <SafeAreaView edges={['top']} style={styles.whiteScreen}>
        <TradyTopBar showExport={false} />
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setScreenMode('list')} style={styles.backBtn} hitSlop={10}>
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
                <TouchableOpacity
                  key={preset}
                  style={[styles.presetBtn, active && styles.presetBtnActive]}
                  onPress={() => handleSelectRangePreset(preset)}
                >
                  <Text style={[styles.presetBtnText, active && styles.presetBtnTextActive]}>
                    {preset}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldCaption}>From</Text>
          <TouchableOpacity
            style={styles.dropdownBox}
            onPress={() => {
              setRangePreset('Custom range');
              setRangePickerTarget('from');
              setShowRangePicker(true);
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 15 }}>📅</Text>
              <Text style={styles.dateBoxText}>{formatFullDate(fromDate)}</Text>
            </View>
            <Text style={styles.dropdownArrow}>⌄</Text>
          </TouchableOpacity>

          <Text style={styles.fieldCaption}>To</Text>
          <TouchableOpacity
            style={styles.dropdownBox}
            onPress={() => {
              setRangePreset('Custom range');
              setRangePickerTarget('to');
              setShowRangePicker(true);
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 15 }}>📅</Text>
              <Text style={styles.dateBoxText}>{formatFullDate(toDate)}</Text>
            </View>
            <Text style={styles.dropdownArrow}>⌄</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionTitleSmall, { marginTop: 8 }]}>Expense types</Text>
          <TouchableOpacity
            style={styles.dropdownBox}
            onPress={() => setTypeModalVisible(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 15 }}>☰</Text>
              <Text style={styles.dateBoxText}>{exportExpenseType}</Text>
            </View>
            <Text style={styles.dropdownArrow}>⌄</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionTitleSmall, { marginTop: 8 }]}>Include in report</Text>
          <View style={styles.includeCard}>
            <View style={styles.includeRow}>
              <Text style={styles.includeIcon}>📋</Text>
              <Text style={styles.includeLabel}>Expense summary</Text>
              <Switch
                value={incSummary}
                onValueChange={setIncSummary}
                trackColor={{ false: '#D1D5DB', true: BLUE }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.includeRow}>
              <Text style={styles.includeIcon}>☰</Text>
              <Text style={styles.includeLabel}>Itemised expenses</Text>
              <Switch
                value={incItemised}
                onValueChange={setIncItemised}
                trackColor={{ false: '#D1D5DB', true: BLUE }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.includeRow}>
              <Text style={styles.includeIcon}>%</Text>
              <Text style={styles.includeLabel}>GST breakdown</Text>
              <Switch
                value={incGstBreakdown}
                onValueChange={setIncGstBreakdown}
                trackColor={{ false: '#D1D5DB', true: BLUE }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.includeRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.includeIcon}>🖼️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.includeLabel}>Receipt images</Text>
                <Text style={styles.includeSub}>Receipt images increase PDF file size.</Text>
              </View>
              <Switch
                value={incReceipts}
                onValueChange={setIncReceipts}
                trackColor={{ false: '#D1D5DB', true: BLUE }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryBlueBtn, { marginTop: 18 }]}
            onPress={() => setScreenMode('preview')}
          >
            <Text style={styles.primaryBlueBtnText}>📄  Generate PDF</Text>
          </TouchableOpacity>
        </ScrollView>

        {showRangePicker && (
          <DateTimePicker
            value={rangePickerTarget === 'from' ? fromDate : toDate}
            mode="date"
            display="default"
            onChange={(ev, selected) => {
              setShowRangePicker(false);
              if (selected) {
                if (rangePickerTarget === 'from') setFromDate(selected);
                else setToDate(selected);
              }
            }}
          />
        )}

        {/* Expense Types Filter Modal */}
        <Modal visible={typeModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Select Expense Types</Text>
              {['All expense types', ...EXPENSE_CATEGORIES.map((c) => c.id)].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={styles.modalOption}
                  onPress={() => {
                    setExportExpenseType(t);
                    setTypeModalVisible(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{t}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.primaryBlueBtn, { marginTop: 12 }]}
                onPress={() => setTypeModalVisible(false)}
              >
                <Text style={styles.primaryBlueBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // VIEW 4: PDF PREVIEW SCREEN
  // ============================================================================
  if (screenMode === 'preview') {
    return (
      <SafeAreaView edges={['top']} style={styles.whiteScreen}>
        <TradyTopBar showExport={false} />
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setScreenMode('export')} style={styles.backBtn} hitSlop={10}>
            <Text style={styles.backChevron}>‹</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.exportTitle}>PDF Preview</Text>
            <Text style={styles.exportSubtitle}>Review your expense report before downloading.</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.formContent}>
          {/* Paper Sheet Preview Frame */}
          <View style={styles.pdfOuterFrame}>
            <View style={styles.pdfPaperCard}>
              <View style={styles.pdfHeaderRow}>
                <View>
                  <Text style={styles.pdfBrand}>{settings?.businessName || 'Trady'}</Text>
                  <View style={styles.tradyUnderline} />
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.pdfReportHeading}>EXPENSE REPORT</Text>
                  <Text style={styles.pdfReportSub}>
                    {formatFullDate(fromDate)} – {formatFullDate(toDate)}
                  </Text>
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
                    <Text style={[styles.pdfTh, { flex: 1.1 }]}>Date</Text>
                    <Text style={[styles.pdfTh, { flex: 1.4 }]}>Type</Text>
                    <Text style={[styles.pdfTh, { flex: 1.1, textAlign: 'right' }]}>Amount</Text>
                    {incGstBreakdown && (
                      <Text style={[styles.pdfTh, { flex: 0.9, textAlign: 'right' }]}>GST</Text>
                    )}
                  </View>

                  {reportExpenses.length === 0 ? (
                    <View style={styles.pdfTr}>
                      <Text style={{ fontSize: 11, color: TEXT_GRAY, paddingVertical: 8 }}>
                        No expenses recorded in this date range.
                      </Text>
                    </View>
                  ) : (
                    reportExpenses.map((item) => (
                      <View key={item._id} style={styles.pdfTr}>
                        <Text style={[styles.pdfTd, { flex: 1.1 }]}>{formatShortDate(item.date)}</Text>
                        <Text style={[styles.pdfTd, { flex: 1.4 }]}>{item.category}</Text>
                        <Text style={[styles.pdfTd, { flex: 1.1, textAlign: 'right' }]}>
                          ${Number(item.amount || 0).toFixed(2)}
                        </Text>
                        {incGstBreakdown && (
                          <Text style={[styles.pdfTd, { flex: 0.9, textAlign: 'right' }]}>
                            ${Number(item.gstAmount || 0).toFixed(2)}
                          </Text>
                        )}
                      </View>
                    ))
                  )}

                  <View style={[styles.pdfTr, styles.pdfTotalRow]}>
                    <Text style={[styles.pdfTdBold, { flex: 2.5 }]}>Total</Text>
                    <Text style={[styles.pdfTdBold, { flex: 1.1, textAlign: 'right' }]}>
                      ${reportTotals.total.toFixed(2)}
                    </Text>
                    {incGstBreakdown && (
                      <Text style={[styles.pdfTdBold, { flex: 0.9, textAlign: 'right' }]}>
                        ${reportTotals.gst.toFixed(2)}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.pdfFileName}>{reportFileName}</Text>
          <Text style={styles.pdfFileSize}>Size: ~45 KB • PDF</Text>

          <TouchableOpacity
            style={styles.primaryBlueBtn}
            onPress={handleDownloadOrSharePdf}
            disabled={downloadingPdf}
          >
            {downloadingPdf ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBlueBtnText}>⬇️  Download PDF</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineBlueBtn}
            onPress={handleDownloadOrSharePdf}
            disabled={downloadingPdf}
          >
            <Text style={styles.outlineBlueBtnText}>🔗  Share PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ alignItems: 'center', paddingVertical: 10 }}
            onPress={() => setScreenMode('export')}
          >
            <Text style={{ color: BLUE, fontWeight: '700', fontSize: 13.5 }}>
              Edit report options
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // VIEW 1: MAIN EXPENSES DASHBOARD SCREEN
  // ============================================================================
  const currentMonthLabel = `${MONTH_NAMES[currentMonthDate.getMonth()]} ${currentMonthDate.getFullYear()}`;

  return (
    <SafeAreaView edges={['top']} style={styles.whiteScreen}>
      <TradyTopBar onExportPress={() => setScreenMode('export')} showExport={true} />

      <ScrollView contentContainerStyle={styles.mainContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.mainHeading}>Expenses</Text>

        {/* Month Selector Pill Bar */}
        <View style={styles.monthBar}>
          <TouchableOpacity onPress={() => shiftMonth(-1)} style={styles.monthArrowBtn} hitSlop={10}>
            <Text style={styles.monthArrowText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabelText}>{currentMonthLabel}  ⌄</Text>
          <TouchableOpacity onPress={() => shiftMonth(1)} style={styles.monthArrowBtn} hitSlop={10}>
            <Text style={styles.monthArrowText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Dark Navy Total & GST Summary Card */}
        <View style={styles.navyCard}>
          <Text style={styles.navyCardTopCaption}>Total expenses</Text>
          <Text style={styles.navyCardBigAmount}>{money(monthTotals.total)}</Text>
          <Text style={styles.navyCardSubCaption}>Including GST</Text>

          <View style={styles.navyCardDivider} />

          <Text style={styles.navyCardTopCaption}>GST paid</Text>
          <Text style={styles.navyCardGstAmount}>{money(monthTotals.gst)}</Text>
        </View>

        {/* 6 Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.FilterPillsRow}
        >
          {EXPENSE_CATEGORIES.map((cat) => {
            const active = selectedCategoryFilter === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catPill, active && styles.catPillActive]}
                onPress={() =>
                  setSelectedCategoryFilter(active ? null : cat.id)
                }
              >
                <Text style={[styles.catPillText, active && styles.catPillTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Recent Expenses Header */}
        <View style={styles.recentHeaderRow}>
          <Text style={styles.recentTitle}>Recent expenses</Text>
          <TouchableOpacity onPress={() => setViewAll(!viewAll)}>
            <Text style={styles.viewAllLink}>{viewAll ? 'Show less ‹' : 'View all ›'}</Text>
          </TouchableOpacity>
        </View>

        {/* Expense Items Card */}
        <View style={styles.recentListCard}>
          {loading ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator color={BLUE} />
            </View>
          ) : displayedList.length === 0 ? (
            <View style={{ padding: 26, alignItems: 'center' }}>
              <Text style={{ color: TEXT_GRAY, fontSize: 13 }}>
                No expenses recorded for {currentMonthLabel}.
              </Text>
            </View>
          ) : (
            displayedList.map((item, idx) => {
              const catMeta =
                EXPENSE_CATEGORIES.find((c) => c.id === item.category) ||
                EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
              const isLast = idx === displayedList.length - 1;

              return (
                <TouchableOpacity
                  key={item._id}
                  style={[styles.expenseRow, isLast && { borderBottomWidth: 0 }]}
                  onPress={() => {
                    if (item.fromInvoice) {
                      Alert.alert(
                        `${item.category} (${money(item.amount)})`,
                        `${getExpenseSubtitle(item)}\n${item.description || ''}`
                      );
                    } else {
                      Alert.alert(
                        `${item.category} — ${money(item.amount)}`,
                        `Date: ${formatFullDate(item.date)}\nDetails: ${getExpenseSubtitle(item)}\nPayment: ${item.paymentMethod || 'Card'}\nGST: ${money(item.gstAmount)}`,
                        [
                          { text: 'Close', style: 'cancel' },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: async () => {
                              await deleteExpense(item._id);
                              loadData();
                              showToast('Expense deleted');
                            },
                          },
                        ]
                      );
                    }
                  }}
                >
                  <View style={[styles.receiptIconBox, { backgroundColor: catMeta.iconBg }]}>
                    <Text style={[styles.receiptGlyph, { color: catMeta.iconColor }]}>🧾</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.expRowTitle}>{item.category}</Text>
                    <Text style={styles.expRowSub} numberOfLines={1}>
                      {formatShortDate(item.date)} • {getExpenseSubtitle(item)}
                    </Text>
                  </View>

                  <Text style={styles.expRowAmount}>{money(item.amount)}</Text>
                  <Text style={styles.expRowChevron}>›</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Bottom Sticky + Add Expense Button */}
      <View style={styles.bottomBarWrap}>
        <TouchableOpacity
          style={styles.primaryBlueBtn}
          onPress={() => openAddExpense(selectedCategoryFilter || 'Materials')}
        >
          <Text style={styles.primaryBlueBtnText}>＋  Add Expense</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  whiteScreen: { flex: 1, backgroundColor: '#FFFFFF' },
  tradyTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 6,
  },
  tradyBrandText: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT_DARK,
    letterSpacing: -0.4,
  },
  tradyUnderline: {
    width: 26,
    height: 3,
    backgroundColor: BLUE,
    borderRadius: 2,
    marginTop: 1,
  },
  exportIconBtn: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  exportIconText: { fontSize: 15, color: TEXT_DARK, fontWeight: '700' },

  mainContent: { paddingHorizontal: 18, paddingBottom: 100 },
  mainHeading: {
    fontSize: 28,
    fontWeight: '800',
    color: TEXT_DARK,
    marginTop: 6,
    marginBottom: 12,
  },
  monthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  monthArrowBtn: { paddingHorizontal: 6 },
  monthArrowText: { fontSize: 20, color: TEXT_DARK, fontWeight: '600' },
  monthLabelText: { fontSize: 15, fontWeight: '700', color: TEXT_DARK },

  navyCard: {
    backgroundColor: NAVY,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
  },
  navyCardTopCaption: { color: '#CBD5E1', fontSize: 13, fontWeight: '600' },
  navyCardBigAmount: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', marginTop: 4 },
  navyCardSubCaption: { color: '#94A3B8', fontSize: 12.5, marginTop: 2 },
  navyCardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 12,
  },
  navyCardGstAmount: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 2 },

  FilterPillsRow: { gap: 8, paddingBottom: 16 },
  catPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 999,
  },
  catPillActive: { backgroundColor: BLUE },
  catPillText: { fontSize: 13, fontWeight: '700', color: TEXT_DARK },
  catPillTextActive: { color: '#FFFFFF' },

  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentTitle: { fontSize: 18, fontWeight: '800', color: TEXT_DARK },
  viewAllLink: { fontSize: 13.5, fontWeight: '700', color: BLUE },

  recentListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    overflow: 'hidden',
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  receiptIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  receiptGlyph: { fontSize: 18 },
  expRowTitle: { fontSize: 15, fontWeight: '700', color: TEXT_DARK },
  expRowSub: { fontSize: 12.5, color: TEXT_GRAY, marginTop: 2 },
  expRowAmount: { fontSize: 15.5, fontWeight: '800', color: TEXT_DARK, marginRight: 8 },
  expRowChevron: { fontSize: 18, color: TEXT_GRAY },

  bottomBarWrap: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 14,
  },
  primaryBlueBtn: {
    backgroundColor: BLUE,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBlueBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },

  outlineBlueBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BLUE,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  outlineBlueBtnText: { color: BLUE, fontSize: 14.5, fontWeight: '800' },

  // Sub-screens (Add / Export / Preview)
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  backBtn: { paddingRight: 6 },
  backChevron: { fontSize: 26, color: TEXT_DARK, fontWeight: '600' },
  subHeaderTitle: { fontSize: 18, fontWeight: '800', color: TEXT_DARK },
  exportTitle: { fontSize: 20, fontWeight: '800', color: TEXT_DARK },
  exportSubtitle: { fontSize: 12.5, color: TEXT_GRAY, marginTop: 2 },

  formContent: { paddingHorizontal: 16, paddingBottom: 120 },
  twoColRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  fieldCaption: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  dateBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#FFF',
  },
  dateBoxText: { fontSize: 13.5, fontWeight: '600', color: TEXT_DARK },
  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#FFF',
  },
  dollarPrefix: { fontSize: 14, fontWeight: '700', color: TEXT_DARK, marginRight: 2 },
  amountInput: { flex: 1, fontSize: 14, fontWeight: '700', color: TEXT_DARK },

  segmentedTwo: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
    height: 42,
  },
  segmentedThree: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
    height: 42,
  },
  segBtn: {
    flex: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segBtnActive: { backgroundColor: BLUE },
  segBtnText: { fontSize: 12.5, fontWeight: '700', color: '#374151' },
  segBtnTextActive: { color: '#FFFFFF' },

  readonlyBox: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  readonlyText: { fontSize: 13.5, color: TEXT_GRAY, fontWeight: '600' },

  textInput: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13.5,
    color: TEXT_DARK,
    backgroundColor: '#FFF',
    marginBottom: 12,
  },
  dropdownBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#FFF',
    marginBottom: 12,
  },
  dropdownArrow: { fontSize: 16, color: TEXT_GRAY, fontWeight: '700' },

  attachReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: '#FFF',
    gap: 8,
  },
  attachReceiptIcon: { fontSize: 16 },
  attachReceiptText: { fontSize: 13.5, fontWeight: '700', color: BLUE },

  // Export Expenses Styles
  sectionTitleSmall: {
    fontSize: 13.5,
    fontWeight: '800',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  presetBtn: {
    width: '48.5%',
    backgroundColor: '#F1F5F9',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  presetBtnActive: { backgroundColor: BLUE },
  presetBtnText: { fontSize: 13, fontWeight: '700', color: TEXT_DARK },
  presetBtnTextActive: { color: '#FFFFFF' },

  includeCard: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
  },
  includeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  includeIcon: { fontSize: 16, width: 28, color: TEXT_DARK, fontWeight: '700' },
  includeLabel: { flex: 1, fontSize: 13.5, fontWeight: '600', color: TEXT_DARK },
  includeSub: { fontSize: 11, color: TEXT_GRAY, marginTop: 2 },

  // PDF Preview Card Styles
  pdfOuterFrame: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  pdfPaperCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  pdfHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pdfBrand: { fontSize: 18, fontWeight: '800', color: TEXT_DARK },
  pdfReportHeading: { fontSize: 11, fontWeight: '800', color: TEXT_DARK },
  pdfReportSub: { fontSize: 9.5, color: TEXT_GRAY, marginTop: 1 },
  pdfDivider: { height: 1, backgroundColor: BORDER_COLOR, marginVertical: 12 },
  pdfSummaryRow: { flexDirection: 'row', marginBottom: 14 },
  pdfSumLabel: { fontSize: 10.5, color: TEXT_GRAY, fontWeight: '600' },
  pdfSumValue: { fontSize: 18, fontWeight: '800', color: TEXT_DARK, marginTop: 2 },
  pdfTable: { borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 6, overflow: 'hidden' },
  pdfTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  pdfTh: { fontSize: 10, fontWeight: '700', color: '#374151' },
  pdfTr: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  pdfTotalRow: { backgroundColor: '#EEF2FF' },
  pdfTd: { fontSize: 10.5, color: TEXT_DARK },
  pdfTdBold: { fontSize: 11, fontWeight: '800', color: TEXT_DARK },
  pdfFileName: { fontSize: 13, fontWeight: '800', color: TEXT_DARK, marginTop: 2 },
  pdfFileSize: { fontSize: 11.5, color: TEXT_GRAY, marginBottom: 14, marginTop: 2 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: TEXT_DARK, marginBottom: 12 },
  modalOption: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalOptionText: { fontSize: 14, color: TEXT_DARK, fontWeight: '600' },
});