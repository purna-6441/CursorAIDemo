import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LoadingScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Icon name="store" size={80} color="#2196F3" />
        <Text style={styles.title}>POS Retail</Text>
        <ActivityIndicator
          size="large"
          color="#2196F3"
          style={styles.loader}
        />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 16,
    marginBottom: 32,
  },
  loader: {
    marginVertical: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});

export default LoadingScreen;