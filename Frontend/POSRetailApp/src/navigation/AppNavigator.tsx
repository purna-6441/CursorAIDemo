import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';

import { RootStackParamList } from '@/types';
import { checkAuthStatus, selectIsAuthenticated, selectAuthLoading } from '@/store/slices/authSlice';
import { AppDispatch } from '@/store';

// Screens
import LoginScreen from '@/screens/LoginScreen';
import MainTabNavigator from './MainTabNavigator';
import ProductDetailScreen from '@/screens/ProductDetailScreen';
import AddProductScreen from '@/screens/AddProductScreen';
import EditProductScreen from '@/screens/EditProductScreen';
import CartScreen from '@/screens/CartScreen';
import PaymentScreen from '@/screens/PaymentScreen';
import ReceiptScreen from '@/screens/ReceiptScreen';
import BarcodeScannerScreen from '@/screens/BarcodeScannerScreen';
import LoadingScreen from '@/screens/LoadingScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{ title: 'Product Details' }}
            />
            <Stack.Screen
              name="AddProduct"
              component={AddProductScreen}
              options={{ title: 'Add Product' }}
            />
            <Stack.Screen
              name="EditProduct"
              component={EditProductScreen}
              options={{ title: 'Edit Product' }}
            />
            <Stack.Screen
              name="Cart"
              component={CartScreen}
              options={{ title: 'Shopping Cart' }}
            />
            <Stack.Screen
              name="Payment"
              component={PaymentScreen}
              options={{ title: 'Payment' }}
            />
            <Stack.Screen
              name="Receipt"
              component={ReceiptScreen}
              options={{ title: 'Receipt' }}
            />
            <Stack.Screen
              name="BarcodeScanner"
              component={BarcodeScannerScreen}
              options={{ title: 'Scan Barcode' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;