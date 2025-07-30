import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BarcodeScannerScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Icon name="qr-code-scanner" size={80} color="#FF9800" />
        <Text style={styles.title}>Barcode Scanner</Text>
        <Text style={styles.subtitle}>Camera Integration Required</Text>
        <Text style={styles.description}>
          This screen would use react-native-camera to scan product barcodes
          and automatically add products to the cart or search for them.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 16, marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#FF9800', marginBottom: 16 },
  description: { fontSize: 16, color: '#999', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  backButton: { backgroundColor: '#FF9800', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 24 },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default BarcodeScannerScreen;