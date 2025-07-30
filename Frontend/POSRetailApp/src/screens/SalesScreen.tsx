import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AppDispatch } from '@/store';
import { fetchProducts, selectProducts, selectProductsLoading } from '@/store/slices/productSlice';
import { addItem, selectCartItems, selectCartItemCount } from '@/store/slices/cartSlice';
import { Product } from '@/types';

const SalesScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const products = useSelector(selectProducts);
  const cartItems = useSelector(selectCartItems);
  const cartItemCount = useSelector(selectCartItemCount);
  const isLoading = useSelector(selectProductsLoading);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [products, searchQuery]);

  const handleAddToCart = (product: Product) => {
    if (product.quantity <= 0) {
      Alert.alert('Out of Stock', 'This product is currently out of stock.');
      return;
    }

    const existingItem = cartItems.find(item => item.product.id === product.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;

    if (currentQuantity >= product.quantity) {
      Alert.alert(
        'Insufficient Stock',
        `Only ${product.quantity} items available in stock.`
      );
      return;
    }

    dispatch(addItem({ product, quantity: 1 }));
  };

  const handleScanBarcode = () => {
    navigation.navigate('BarcodeScanner' as never);
  };

  const handleViewCart = () => {
    navigation.navigate('Cart' as never);
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => handleAddToCart(item)}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productSku}>SKU: {item.sku}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          <Text style={[
            styles.productStock,
            { color: item.quantity <= 10 ? '#f44336' : '#4CAF50' }
          ]}>
            Stock: {item.quantity}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.addButton,
          { backgroundColor: item.quantity <= 0 ? '#ccc' : '#4CAF50' }
        ]}
        onPress={() => handleAddToCart(item)}
        disabled={item.quantity <= 0}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Cart */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={24} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.scanButton} onPress={handleScanBarcode}>
            <Icon name="qr-code-scanner" size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.cartButton} onPress={handleViewCart}>
          <Icon name="shopping-cart" size={24} color="#fff" />
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>
          Products ({filteredProducts.length})
        </Text>
        
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
          refreshing={isLoading}
          onRefresh={() => dispatch(fetchProducts({}))}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="inventory" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try adjusting your search' : 'Add products to get started'}
              </Text>
            </View>
          }
        />
      </View>

      {/* Quick Cart Summary */}
      {cartItemCount > 0 && (
        <View style={styles.cartSummary}>
          <View style={styles.cartSummaryContent}>
            <Text style={styles.cartSummaryText}>
              {cartItemCount} item{cartItemCount !== 1 ? 's' : ''} in cart
            </Text>
            <TouchableOpacity style={styles.viewCartButton} onPress={handleViewCart}>
              <Text style={styles.viewCartButtonText}>View Cart</Text>
              <Icon name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  scanButton: {
    padding: 8,
  },
  cartButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#f44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  productsList: {
    paddingBottom: 100,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productSku: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  productStock: {
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    borderRadius: 8,
    padding: 12,
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  cartSummary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cartSummaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  cartSummaryText: {
    fontSize: 16,
    color: '#333',
  },
  viewCartButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default SalesScreen;