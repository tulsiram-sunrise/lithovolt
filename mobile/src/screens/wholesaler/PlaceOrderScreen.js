import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { inventoryAPI, ordersAPI } from '../../services/api';
import { NeonScroll } from '../../components/layout/NeonBackground';
import { neonTheme } from '../../styles/neonTheme';

export default function PlaceOrderScreen({ navigation }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);

  const loadModels = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await inventoryAPI.getModels({ is_active: true });
      const payload = response.data;
      const list = Array.isArray(payload) ? payload : payload?.results || [];
      setModels(list);
    } catch (err) {
      setError('Unable to load battery models.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const filteredModels = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return models;
    }
    return models.filter((item) => item.name.toLowerCase().includes(term) || item.sku.toLowerCase().includes(term));
  }, [models, search]);

  const updateQuantity = (modelId, value) => {
    const qty = Math.max(1, Number(value) || 1);
    setCart((prev) => {
      const existing = prev.find((item) => item.modelId === modelId);
      if (existing) {
        return prev.map((item) => (item.modelId === modelId ? { ...item, quantity: qty } : item));
      }
      return [...prev, { modelId, quantity: qty }];
    });
  };

  const handleAdd = (model) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.modelId === model.id);
      if (existing) {
        return prev.map((item) => (item.modelId === model.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...prev, { modelId: model.id, quantity: 1 }];
    });
  };

  const handleRemove = (modelId) => {
    setCart((prev) => prev.filter((item) => item.modelId !== modelId));
  };

  const handleSubmit = async () => {
    if (cart.length === 0) {
      setError('Add at least one battery model.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const items = cart.map((item) => ({
        product_type: 'BATTERY_MODEL',
        battery_model_id: item.modelId,
        quantity: item.quantity,
      }));
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
      <Text style={styles.subtitle}>Select battery models to order from Lithovolt.</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search model or SKU"
        placeholderTextColor="#94a3b8"
        value={search}
        onChangeText={setSearch}
        testID="order-search"
      />

      {loading ? <ActivityIndicator color={neonTheme.colors.accent} /> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Battery Models</Text>
        {filteredModels.map((model) => (
          <View key={model.id} style={styles.card}>
            <View>
              <Text style={styles.cardTitle}>{model.name}</Text>
              <Text style={styles.cardMeta}>SKU: {model.sku}</Text>
            </View>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => handleAdd(model)}>
              <Text style={styles.secondaryButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {cart.length === 0 ? <Text style={styles.emptyText}>No items added.</Text> : null}
        {cart.map((item) => {
          const model = models.find((m) => m.id === item.modelId);
          return (
            <View key={item.modelId} style={styles.cartRow}>
              <View>
                <Text style={styles.cartTitle}>{model?.name || 'Model'}</Text>
                <Text style={styles.cartMeta}>SKU: {model?.sku || '-'}</Text>
              </View>
              <View style={styles.cartActions}>
                <TextInput
                  style={styles.qtyInput}
                  keyboardType="numeric"
                  value={String(item.quantity)}
                  onChangeText={(value) => updateQuantity(item.modelId, value)}
                />
                <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(item.modelId)}>
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
  section: {
    backgroundColor: neonTheme.colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: neonTheme.colors.border,
    marginBottom: 16,
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
