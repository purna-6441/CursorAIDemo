import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ReceiptScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Icon name="receipt" size={80} color="#4CAF50" />
        <Text style={styles.title}>Receipt Generated</Text>
        <Text style={styles.subtitle}>Transaction Complete</Text>
        <Text style={styles.description}>
          Receipt would be displayed here with transaction details
          and options to print or share via email/SMS.
        </Text>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.navigate('Dashboard' as never)}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 16, marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#4CAF50', marginBottom: 16 },
  description: { fontSize: 16, color: '#999', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  doneButton: { backgroundColor: '#4CAF50', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 24 },
  doneButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ReceiptScreen;