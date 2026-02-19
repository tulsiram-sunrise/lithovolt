import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Picker } from 'react-native';
import { inventoryAPI, ordersAPI } from '../../services/api';
import { NeonScroll } from '../../components/layout/NeonBackground';
import { neonTheme } from '../../styles/neonTheme';

export default function PlaceOrderScreen({ navigation }) {
  const [models, setModels] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [productType, setProductType] = useState('BATTERY_MODEL');
  const [cart, setCart] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [modelsRes, accessoriesRes, productsRes] = await Promise.all([
        inventoryAPI.getModels({ is_active: true }),
        inventoryAPI.getAccessories({ is_active: true }),
        inventoryAPI.getProducts(),
      ]);
      
      const parsePayload = (res) => {
        const payload = res.data;
        return Array.isArray(payload) ? payload : payload?.results || [];
      };

      setModels(parsePayload(modelsRes));
      setAccessories(parsePayload(accessoriesRes));
      setProducts(parsePayload(productsRes));
    } catch (err) {
      setError('Unable to load inventory items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Get available items based on product type
  const availableItems = useMemo(() => {
    const list =
      productType === 'BATTERY_MODEL' ? models :
      productType === 'ACCESSORY' ? accessories :
      products;

    const term = search.trim().toLowerCase();
    if (!term) {
      return list;
    }
    return list.filter((item) => item.name.toLowerCase().includes(term) || item.sku.toLowerCase().includes(term));
  }, [models, accessories, products, productType, search]);

  const getItemKey = (item, type) => `${type}-${item.id}`;

  const updateQuantity = (itemId, value) => {
    const qty = Math.max(1, Number(value) || 1);
    setCart((prev) => {
      const key = getItemKey({ id: itemId }, productType);
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) => (item.key === key ? { ...item, quantity: qty } : item));
      }
      return [...prev, { key, itemId, productType, quantity: qty }];
    });
  };

  const handleAdd = (item) => {
    const key = getItemKey(item, productType);
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.key === key);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.key === key ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...prev, { key, itemId: item.id, productType, quantity: 1 }];
    });
  };

  const handleRemove = (key) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const handleSubmit = async () => {
    if (cart.length === 0) {
      setError('Add at least one item to your order.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const items = cart.map((item) => {
        const base = { product_type: item.productType, quantity: item.quantity };
        if (item.productType === 'BATTERY_MODEL') base.battery_model_id = item.itemId;
        if (item.productType === 'ACCESSORY') base.accessory_id = item.itemId;
        if (item.productType === 'PRODUCT') base.product_id = item.itemId;
        return base;
      });
      const response = await ordersAPI.createOrder({ items });
      navigation.navigate('Orders');
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.detail || 'Unable to place order.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <NeonScroll contentContainerStyle={styles.container} testID="wholesaler-place-order">
      <Text style={styles.title}>Place Order</Text>
      <Text style={styles.subtitle}>Select items to add to your order.</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Item Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={productType}
            onValueChange={setProductType}
            style={styles.picker}
          >
            <Picker.Item label="Battery Models" value="BATTERY_MODEL" />
            <Picker.Item label="Accessories" value="ACCESSORY" />
            <Picker.Item label="Products" value="PRODUCT" />
          </Picker>
        </View>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search name or SKU"
        placeholderTextColor="#94a3b8"
        value={search}
        onChangeText={setSearch}
        testID="order-search"
      />

      {loading ? <ActivityIndicator color={neonTheme.colors.accent} /> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {productType === 'BATTERY_MODEL' ? 'Battery Models' : productType === 'ACCESSORY' ? 'Accessories' : 'Products'}
        </Text>
        {availableItems.map((item) => (
          <View key={item.id} style={styles.card}>
            <View>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>SKU: {item.sku}</Text>
            </View>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => handleAdd(item)}>
              <Text style={styles.secondaryButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items ({cart.length})</Text>
        {cart.length === 0 ? <Text style={styles.emptyText}>No items added.</Text> : null}
        {cart.map((item) => {
          const allItemsList = item.productType === 'BATTERY_MODEL' ? models : item.productType === 'ACCESSORY' ? accessories : products;
          const itemData = allItemsList.find((m) => m.id === item.itemId);
          return (
            <View key={item.key} style={styles.cartRow}>
              <View>
                <Text style={styles.cartTitle}>{itemData?.name || 'Item'}</Text>
                <Text style={styles.cartMeta}>SKU: {itemData?.sku || '-'}</Text>
                <Text style={styles.cartMeta}>Type: {item.productType === 'BATTERY_MODEL' ? 'Battery' : item.productType === 'ACCESSORY' ? 'Accessory' : 'Product'}</Text>
              </View>
              <View style={styles.cartActions}>
                <TextInput
                  style={styles.qtyInput}
                  keyboardType="numeric"
                  value={String(item.quantity)}
                  onChangeText={(value) => updateQuantity(item.itemId, value)}
                />
                <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(item.key)}>
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#07110b" /> : <Text style={styles.buttonText}>Submit Order</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>Back</Text>
      </TouchableOpacity>
    </NeonScroll>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: neonTheme.colors.text,
    fontFamily: neonTheme.fonts.heading,
    marginBottom: 6,
  },
  subtitle: {
    color: neonTheme.colors.muted,
    fontFamily: neonTheme.fonts.body,
    marginBottom: 12,
  },
  section: {
    backgroundColor: neonTheme.colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: neonTheme.colors.border,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    color: neonTheme.colors.text,
    fontFamily: neonTheme.fonts.heading,
    marginBottom: 8,
  },
  pickerContainer: {
    borderColor: neonTheme.colors.border,
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: neonTheme.colors.surface,
  },
  picker: {
    color: neonTheme.colors.text,
  },
  searchInput: {
    backgroundColor: neonTheme.colors.surface,
    borderColor: neonTheme.colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: neonTheme.colors.text,
    fontFamily: neonTheme.fonts.body,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    color: neonTheme.colors.text,
    fontFamily: neonTheme.fonts.heading,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: neonTheme.colors.border,
  },
  cardTitle: {
    fontSize: 14,
    color: neonTheme.colors.text,
    fontFamily: neonTheme.fonts.bodyStrong,
  },
  cardMeta: {
    fontSize: 12,
    color: neonTheme.colors.muted,
    fontFamily: neonTheme.fonts.body,
  },
  secondaryButton: {
    backgroundColor: neonTheme.colors.surfaceAlt,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: neonTheme.colors.border,
  },
  secondaryButtonText: {
    color: neonTheme.colors.text,
    fontFamily: neonTheme.fonts.bodyStrong,
  },
  cartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: neonTheme.colors.border,
  },
  cartTitle: {
    color: neonTheme.colors.text,
    fontFamily: neonTheme.fonts.bodyStrong,
  },
  cartMeta: {
    color: neonTheme.colors.muted,
    fontFamily: neonTheme.fonts.body,
    fontSize: 12,
  },
  cartActions: {
    alignItems: 'flex-end',
  },
  qtyInput: {
    width: 70,
    textAlign: 'center',
    backgroundColor: neonTheme.colors.surface,
    borderColor: neonTheme.colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    color: neonTheme.colors.text,
    fontFamily: neonTheme.fonts.body,
    marginBottom: 6,
  },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: neonTheme.colors.danger,
  },
  removeButtonText: {
    color: neonTheme.colors.danger,
    fontFamily: neonTheme.fonts.bodyStrong,
  },
  button: {
    backgroundColor: neonTheme.colors.accent,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: neonTheme.colors.accentGlow,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  buttonText: {
    color: '#07110b',
    fontWeight: '600',
    fontFamily: neonTheme.fonts.bodyStrong,
  },
  linkButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  linkText: {
    color: neonTheme.colors.muted,
    fontFamily: neonTheme.fonts.body,
  },
  emptyText: {
    color: neonTheme.colors.muted,
    fontFamily: neonTheme.fonts.body,
  },
  errorText: {
    color: neonTheme.colors.danger,
    marginBottom: 10,
    fontFamily: neonTheme.fonts.bodyStrong,
  },
});
