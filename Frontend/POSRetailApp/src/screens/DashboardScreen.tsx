import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AppDispatch } from '@/store';
import { selectUser, selectUserRole } from '@/store/slices/authSlice';
import { selectCartItemCount } from '@/store/slices/cartSlice';
import { fetchDailySalesReport } from '@/store/slices/salesSlice';

const DashboardScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);
  const cartItemCount = useSelector(selectCartItemCount);
  const [refreshing, setRefreshing] = React.useState(false);
  const [salesData, setSalesData] = React.useState({
    totalSales: 0,
    transactionCount: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load today's sales data
      const result = await dispatch(fetchDailySalesReport(undefined)).unwrap();
      setSalesData({
        totalSales: result.totalSales,
        transactionCount: result.transactionCount,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const quickActions = [
    {
      title: 'New Sale',
      icon: 'point-of-sale',
      color: '#4CAF50',
      onPress: () => navigation.navigate('Sales' as never),
      roles: ['Admin', 'Cashier'],
    },
    {
      title: 'Scan Product',
      icon: 'qr-code-scanner',
      color: '#FF9800',
      onPress: () => navigation.navigate('BarcodeScanner' as never),
      roles: ['Admin', 'Cashier', 'InventoryManager'],
    },
    {
      title: 'Add Product',
      icon: 'add-box',
      color: '#2196F3',
      onPress: () => navigation.navigate('AddProduct' as never),
      roles: ['Admin', 'InventoryManager'],
    },
    {
      title: 'View Reports',
      icon: 'analytics',
      color: '#9C27B0',
      onPress: () => navigation.navigate('Reports' as never),
      roles: ['Admin', 'Cashier', 'InventoryManager'],
    },
  ];

  const filteredActions = quickActions.filter(action =>
    action.roles.includes(userRole || '')
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userNameText}>{user?.username}</Text>
          <Text style={styles.roleText}>{user?.role}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="attach-money" size={32} color="#4CAF50" />
            <Text style={styles.statValue}>
              ${salesData.totalSales.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Today's Sales</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="receipt" size={32} color="#2196F3" />
            <Text style={styles.statValue}>{salesData.transactionCount}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="shopping-cart" size={32} color="#FF9800" />
            <Text style={styles.statValue}>{cartItemCount}</Text>
            <Text style={styles.statLabel}>Cart Items</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {filteredActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionCard, { borderLeftColor: action.color }]}
                onPress={action.onPress}
              >
                <Icon name={action.icon} size={32} color={action.color} />
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityText}>
              No recent activity to display
            </Text>
            <Text style={styles.activitySubtext}>
              Start by making a sale or managing inventory
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  welcomeSection: {
    backgroundColor: '#2196F3',
    padding: 24,
    paddingTop: 32,
  },
  welcomeText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userNameText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  roleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: -20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  activitySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default DashboardScreen;