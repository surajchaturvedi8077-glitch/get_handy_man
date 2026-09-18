import { Linking, Platform, Alert } from 'react-native';

export const openPhone = async (phone) => {
  if (!phone) return Alert.alert('No phone number provided');
  const cleanPhone = phone.replace(/\s+/g, ''); 
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

// UPDATED: Routes using exact lat/lng GPS coordinates if available
export const openMaps = async (address, lat, lng) => {
  if (!address && !lat) return Alert.alert('No address provided');
  
  let url = '';
  if (lat && lng) {
    url = Platform.OS === 'ios' 
      ? `maps:0,0?q=${lat},${lng}(${encodeURIComponent(address)})` 
      : `https://maps.google.com/?q=${lat},${lng}`;
  } else {
    url = Platform.OS === 'ios' 
      ? `maps:0,0?q=${encodeURIComponent(address)}` 
      : `https://maps.google.com/?q=${encodeURIComponent(address)}`;
  }
    
  try {
    await Linking.openURL(url);
  } catch (err) {
    Alert.alert('Error', 'Could not open maps.');
  }
};