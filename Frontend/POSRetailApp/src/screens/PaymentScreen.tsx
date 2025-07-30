import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Icon name="payment" size={80} color="#2196F3" />
        <Text style={styles.title}>Payment Processing</Text>
        <Text style={styles.subtitle}>UI Placeholder</Text>
        <Text style={styles.description}>
          This screen would integrate with payment gateways
          for processing cash and card payments.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 16, marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#666', marginBottom: 16 },
  description: { fontSize: 16, color: '#999', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  backButton: { backgroundColor: '#2196F3', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 24 },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default PaymentScreen;