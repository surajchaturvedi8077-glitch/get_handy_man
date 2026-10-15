import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import * as enquiryService from '../services/enquiryService';
import { money } from '../utils/money';
import { colors } from '../theme/colors';

const STATUS_STYLES = {
  draft: { label: 'Draft', bg: colors.orangeTint, fg: colors.orangeDeep },
  sent: { label: 'Sent', bg: colors.blueTint, fg: colors.blue },
  accepted: { label: 'Accepted', bg: colors.greenTint, fg: colors.green },
  expired: { label: 'Expired', bg: colors.redTint, fg: colors.red },
};

export function getQuoteStatus(item) {
  if (item.quoteStatus && STATUS_STYLES[item.quoteStatus]) return item.quoteStatus;
  if (item.status === 'quoted') return 'sent';
  if (item.status === 'accepted') return 'accepted';
  if (item.status === 'rejected') return 'expired';
  return 'draft';
}

export function getQuoteNumber(item, fallbackNum = 930) {
  if (item.quoteNumber && item.quoteNumber.startsWith('#GH-')) return item.quoteNumber;
  if (item.when && item.when.startsWith('#GH-')) return item.when;
  return `#GH-${fallbackNum}`;
}

export function formatQuoteDate(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function getQuoteServiceText(item) {
  if (Array.isArray(item.quoteItems) && item.quoteItems.length > 0) {
    const names = item.quoteItems.map((i) => i.name).filter(Boolean);
    if (names.length > 0) return names.join(', ');
  }
  if (Array.isArray(item.services) && item.services.length > 0) {
    return item.services.filter(Boolean).join(', ');
  }
  return item.service || 'General Handyman Services';
}

export function getQuoteTotal(item) {
  if (Number(item.price) > 0) return Number(item.price);
  if (Array.isArray(item.quoteItems) && item.quoteItems.length > 0) {
    return item.quoteItems.reduce((sum, i) => sum + (Number(i.qty) || 1) * (Number(i.amt) || 0), 0);
  }
  return 0;
}

export default function QuotesScreen() {
  const navigation = useNavigation();
  const [rawRecords, setRawRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('draft');
  const [searchQuery, setSearchQuery] = useState('');

  const loadQuotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await enquiryService.listEnquiries('all');
      setRawRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadQuotes();
    }, [loadQuotes])
  );

  // Separate Quotes from raw website enquiries
  const quotes = useMemo(() => {
    const filtered = rawRecords.filter(
      (item) =>
        item.isQuote === true ||
        (item.when && item.when.startsWith('#GH-')) ||
        item.status === 'quoted' ||
        (Array.isArray(item.quoteItems) && item.quoteItems.length > 0) ||
        Number(item.price) > 0
    );

    const totalCount = filtered.length;
    return filtered.map((item, idx) => {
      const computedNum = 925 + (totalCount - idx);
      return {
        ...item,
        _quoteNumber: getQuoteNumber(item, computedNum),
        _quoteStatus: getQuoteStatus(item),
        _serviceText: getQuoteServiceText(item),
        _total: getQuoteTotal(item),
        _dateText: formatQuoteDate(item.createdAt || item.received),
      };
    });
  }, [rawRecords]);

  const counts = useMemo(() => {
    return {
      draft: quotes.filter((q) => q._quoteStatus === 'draft').length,
      sent: quotes.filter((q) => q._quoteStatus === 'sent').length,
      accepted: quotes.filter((q) => q._quoteStatus === 'accepted').length,
    };
  }, [quotes]);

  const displayedQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const statusMatch = tab === 'all' ? true : q._quoteStatus === tab;
      const query = searchQuery.trim().toLowerCase();
      const searchMatch =
        query === '' ||
        (q.name && q.name.toLowerCase().includes(query)) ||
        (q.address && q.address.toLowerCase().includes(query)) ||
        (q._quoteNumber && q._quoteNumber.toLowerCase().includes(query)) ||
        (q._serviceText && q._serviceText.toLowerCase().includes(query));

      return statusMatch && searchMatch;
    });
  }, [quotes, tab, searchQuery]);

  const TABS = [
    { value: 'draft', label: `Draft (${counts.draft})` },
    { value: 'sent', label: `Sent (${counts.sent})` },
    { value: 'accepted', label: `Accepted (${counts.accepted})` },
    { value: 'all', label: 'All' },
  ];

  return (
    <View style={styles.screen}>
      {/* Dark Header matching reference screenshot */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Quotes</Text>
          <TouchableOpacity
            style={styles.newQuoteBtn}
            onPress={() => navigation.navigate('NewQuote', { nextNumber: `#GH-${926 + quotes.length}` })}
          >
            <Text style={styles.newQuoteBtnText}>+ New Quote</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.bodyWrapper}>
        {/* Status Filter Pills with Live Counts */}
        <View style={styles.tabsRow}>
          {TABS.map((t) => {
            const active = tab === t.value;
            return (
              <Pressable
                key={t.value}
                onPress={() => setTab(t.value)}
                style={[styles.tabPill, active && styles.tabPillActive]}
              >
                <Text style={[styles.tabPillText, active && styles.tabPillTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, address or quote #..."
            placeholderTextColor={colors.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {loading && <LoadingState />}
          {error && <ErrorState>{error}</ErrorState>}
          {!loading && !error && displayedQuotes.length === 0 && (
            <EmptyState>No quotes found here.</EmptyState>
          )}

          {!loading &&
            !error &&
            displayedQuotes.map((q) => {
              const badge = STATUS_STYLES[q._quoteStatus] || STATUS_STYLES.draft;
              const isAccepted = q._quoteStatus === 'accepted';

              return (
                <TouchableOpacity
                  key={q._id}
                  activeOpacity={0.75}
                  style={[styles.card, isAccepted && styles.cardAccepted]}
                  onPress={() =>
                    navigation.navigate('QuoteDetail', {
                      id: q._id,
                      quoteNumber: q._quoteNumber,
                    })
                  }
                >
                  <View style={styles.cardTopRow}>
                    <Text style={styles.quoteNumber}>{q._quoteNumber}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: badge.fg }]}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardMiddleRow}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={styles.customerName}>{q.name || 'Customer'}</Text>
                      <Text style={styles.serviceDesc} numberOfLines={1}>
                        {q._serviceText}
                      </Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </View>

                  <View style={styles.cardBottomRow}>
                    <Text style={styles.dateText}>{q._dateText}</Text>
                    <Text style={styles.priceText}>{money(q._total)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.charcoal },
  headerSafe: { backgroundColor: colors.charcoal },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  newQuoteBtn: {
    backgroundColor: colors.orange,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  newQuoteBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13.5,
  },
  bodyWrapper: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 14,
    paddingHorizontal: 14,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tabPill: {
    flex: 1,
    backgroundColor: '#ECEEF1',
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillActive: {
    backgroundColor: colors.orange,
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.charcoal,
  },
  tabPillTextActive: {
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 13.5,
    color: colors.charcoal,
  },
  listContent: {
    paddingBottom: 60,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardAccepted: {
    borderColor: '#86EFAC',
    borderWidth: 1.5,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  quoteNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.charcoalDeep,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  cardMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.charcoalDeep,
    marginBottom: 2,
  },
  serviceDesc: {
    fontSize: 13,
    color: colors.gray,
  },
  chevron: {
    fontSize: 22,
    color: colors.gray,
    fontWeight: '600',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  dateText: {
    fontSize: 12.5,
    color: colors.gray,
  },
  priceText: {
    fontSize: 16.5,
    fontWeight: '800',
    color: colors.charcoalDeep,
  },
});