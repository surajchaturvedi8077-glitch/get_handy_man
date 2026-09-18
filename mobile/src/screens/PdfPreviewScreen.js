import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import ScreenHeader from '../components/layout/ScreenHeader';
import { colors } from '../theme/colors';
import useToast from '../hooks/useToast';

export default function PdfPreviewScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { html, title } = params;
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      showToast('Generating PDF...');
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { 
        UTI: '.pdf', 
        mimeType: 'application/pdf',
        dialogTitle: title || 'Document.pdf'
      });
    } catch (err) {
      Alert.alert("Error", "Could not share the PDF.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="PREVIEW INVOICE" onBack={() => navigation.goBack()} />
      
      <WebView 
        source={{ html }} 
        style={styles.webview} 
        originWhitelist={['*']}
        scalesPageToFit={true}
        showsVerticalScrollIndicator={false}
      />
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} disabled={sharing}>
          {sharing ? <ActivityIndicator color="#fff" /> : <Text style={styles.shareText}>Share PDF</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  webview: { flex: 1 },
  footer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderColor: colors.grayLight, gap: 12, backgroundColor: '#fff' },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1.5, borderColor: colors.charcoal, alignItems: 'center' },
  cancelText: { fontWeight: '700', color: colors.charcoal },
  shareBtn: { flex: 2, paddingVertical: 12, borderRadius: 8, backgroundColor: colors.orange, alignItems: 'center' },
  shareText: { fontWeight: '700', color: '#fff' }
});