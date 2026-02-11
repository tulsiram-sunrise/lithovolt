import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ordersAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function OrderDetailsScreen({ navigation, route }) {
  const orderId = route.params?.orderId;
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invoiceError, setInvoiceError] = useState('');
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const token = useAuthStore((state) => state.token);
  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000/api';

  const loadOrder = async () => {
    if (!orderId) {
      setError('Order not found.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const [orderResponse, itemsResponse] = await Promise.all([
        ordersAPI.getOrder(orderId),
        ordersAPI.getOrderItems(orderId),
      ]);
      setOrder(orderResponse.data);
      setItems(itemsResponse.data || []);
    } catch (err) {
      setError('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const handleInvoiceDownload = async () => {
    if (!order?.id) {
      return;
    }

    try {
      setDownloadingInvoice(true);
      setInvoiceError('');
      const target = `${FileSystem.documentDirectory}invoice_${order.id}.pdf`;
      const url = `${apiUrl}/orders/${order.id}/invoice/`;
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const result = await FileSystem.downloadAsync(url, target, { headers });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri);
      }
    } catch (err) {
      setInvoiceError('Unable to download invoice.');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#0284c7" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.container} testID="wholesaler-order-details">
      <Text style={styles.title}>Order #{order.id}</Text>
      <View style={[styles.badge, statusBadge(order.status)]}>
        <Text style={styles.badgeText}>{order.status}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Consumer</Text>
        <Text style={styles.value}>{order.consumer_name || order.consumer}</Text>

        <Text style={styles.label}>Items</Text>
        {items.length === 0 ? (
          <Text style={styles.emptyText}>No items found.</Text>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.battery_model_name || item.accessory_name}
              </Text>
              <Text style={styles.itemMeta}>Qty: {item.quantity}</Text>
            </View>
          ))
        )}

        {order.created_at ? (
          <>
            <Text style={styles.label}>Created</Text>
            <Text style={styles.value}>{formatDate(order.created_at)}</Text>
          </>
        ) : null}
      </View>

      {invoiceError ? <Text style={styles.errorText}>{invoiceError}</Text> : null}

      <TouchableOpacity style={styles.secondaryButton} onPress={handleInvoiceDownload} disabled={downloadingInvoice} testID="order-download-invoice">
        {downloadingInvoice ? (
          <ActivityIndicator color="#0284c7" />
        ) : (
          <Text style={styles.secondaryButtonText}>Download Invoice</Text>
        )}
      </TouchableOpacity>

      {order.status === 'FULFILLED' ? (
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('IssueWarranty', { orderId: order.id })}
          testID="order-issue-warranty"
        >
          <Text style={styles.buttonText}>Issue Warranty</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const formatDate = (value) => {
  if (!value) {
    return 'N/A';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString();
};

const statusBadge = (status) => {
  const normalized = (status || '').toUpperCase();
  if (normalized === 'PENDING') {
    return { backgroundColor: '#fef3c7' };
  }
  if (normalized === 'ACCEPTED') {
    return { backgroundColor: '#e0f2fe' };
  }
  if (normalized === 'FULFILLED') {
    return { backgroundColor: '#dcfce7' };
  }
  if (normalized === 'REJECTED') {
    return { backgroundColor: '#fee2e2' };
  }
  return { backgroundColor: '#e2e8f0' };
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f1f5f9',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
  },
  itemRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  itemMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  linkText: {
    color: '#0284c7',
    fontWeight: '600',
  },
  emptyText: {
    color: '#64748b',
    marginTop: 6,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  errorText: {
    color: '#dc2626',
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontWeight: '600',
  },
});
