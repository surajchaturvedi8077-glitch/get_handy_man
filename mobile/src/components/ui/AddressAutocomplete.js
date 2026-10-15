import React, { useState, useRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function AddressAutocomplete({
  value,
  onChangeText,
  onSelectAddress,
  placeholder = 'Search Australian address...',
  style,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const searchAddress = (text) => {
    onChangeText(text);
    if (!text || text.trim().length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        // 1. Primary Free API: OpenStreetMap Nominatim (Australia-filtered, address breakdown)
        const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=au&limit=5&q=${encodeURIComponent(text)}`;
        const res = await fetch(nomUrl, {
          headers: {
            'Accept-Language': 'en-AU,en;q=0.9',
            'User-Agent': 'TradyWorkerApp/1.0 (au.com.gethandyman.worker)',
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map((item, idx) => {
              const addr = item.address || {};
              const street = [addr.house_number, addr.road].filter(Boolean).join(' ');
              const suburb = addr.suburb || addr.town || addr.city || addr.village || '';
              const state = addr.state || '';
              const postcode = addr.postcode || '';
              const cleanLabel = [street || item.name, suburb, state, postcode]
                .filter(Boolean)
                .join(', ') || item.display_name;

              return {
                id: String(item.place_id || idx),
                label: cleanLabel,
                fullLabel: item.display_name,
                suburb,
                postcode,
                lat: item.lat ? parseFloat(item.lat) : null,
                lng: item.lon ? parseFloat(item.lon) : null,
              };
            });
            setSuggestions(mapped);
            setLoading(false);
            return;
          }
        }

        // 2. Fallback Free API: Photon Komoot (Australia bounding box)
        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(text)}&limit=5&lang=en&bbox=112.9,-43.7,153.7,-10.0`;
        const pRes = await fetch(photonUrl);
        if (pRes.ok) {
          const pData = await pRes.json();
          const features = pData.features || [];
          const mapped = features.map((f, idx) => {
            const p = f.properties || {};
            const coords = f.geometry?.coordinates || [];
            const street = [p.housenumber, p.street || p.name].filter(Boolean).join(' ');
            const suburb = p.city || p.Town || p.district || '';
            const state = p.state || '';
            const postcode = p.postcode || '';
            const label = [street, suburb, state, postcode].filter(Boolean).join(', ');
            return {
              id: String(p.osm_id || idx),
              label: label || p.name || text,
              suburb,
              postcode,
              lat: coords[1] || null,
              lng: coords[0] || null,
            };
          });
          setSuggestions(mapped);
        }
      } catch (err) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleSelect = (item) => {
    setSuggestions([]);
    onChangeText(item.label);
    if (onSelectAddress) {
      onSelectAddress(item);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchBar}>
        <Text style={styles.pinIcon}>📍</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={searchAddress}
          placeholder={placeholder}
          placeholderTextColor={colors.gray}
        />
        {loading && <ActivityIndicator size="small" color={colors.orange} style={{ marginRight: 6 }} />}
        {!!value && !loading && (
          <TouchableOpacity
            onPress={() => {
              onChangeText('');
              setSuggestions([]);
            }}
            hitSlop={8}
          >
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {suggestions.length > 0 && (
        <View style={styles.dropdown}>
          {suggestions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.dropdownItem}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.itemPin}>📍</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.mainText} numberOfLines={2}>{item.label}</Text>
                {item.fullLabel && item.fullLabel !== item.label ? (
                  <Text style={styles.subText} numberOfLines={1}>{item.fullLabel}</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 10, zIndex: 50 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.grayLight,
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  pinIcon: { fontSize: 14, marginRight: 6 },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.charcoal,
  },
  clearBtn: { fontSize: 14, color: colors.gray, paddingHorizontal: 4, fontWeight: '700' },
  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.grayLight,
    borderRadius: 8,
    marginTop: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLight,
  },
  itemPin: { fontSize: 13, marginRight: 8 },
  mainText: { fontSize: 12.5, fontWeight: '700', color: colors.charcoal },
  subText: { fontSize: 10.5, color: colors.gray, marginTop: 1 },
});