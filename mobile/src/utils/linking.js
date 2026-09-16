import { Linking, Platform, Alert } from 'react-native';

export const openPhone = async (phone) => {
  if (!phone) return Alert.alert('No phone number provided');
  const cleanPhone = phone.replace(/\s+/g, ''); // Fixes Android dialer crash
  try {
    await Linking.openURL(`tel:${cleanPhone}`);
  } catch (err) {
    Alert.alert('Error', 'Could not open phone dialer.');
  }
};

export const openEmail = async (email) => {
  if (!email) return Alert.alert('No email provided');
  try {
    await Linking.openURL(`mailto:${email}`);
  } catch (err) {
    Alert.alert('Error', 'Could not open email app.');
  }
};

export const openMaps = async (address) => {
  if (!address) return Alert.alert('No address provided');
  
  // Use universal maps link for Android to ensure the app chooser opens perfectly
  const url = Platform.OS === 'ios' 
    ? `maps:0,0?q=${encodeURIComponent(address)}` 
    : `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    
  try {
    await Linking.openURL(url);
  } catch (err) {
    Alert.alert('Error', 'Could not open maps.');
  }
};