import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { inventoryAPI, ordersAPI } from '../../services/api';

export default function DashboardScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    pendingOrders: 0,
    acceptedOrders: 0,
    fulfilledOrders: 0,
    allocatedSerials: 0,
    soldSerials: 0,
  });
  const [error, setError] = useState('');

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError('');
      const [pending, accepted, fulfilled, allocated, sold] = await Promise.all([
        ordersAPI.getOrders({ status: 'PENDING' }),
        ordersAPI.getOrders({ status: 'ACCEPTED' }),
        ordersAPI.getOrders({ status: 'FULFILLED' }),
        inventoryAPI.getInventory({ status: 'ALLOCATED' }),
        inventoryAPI.getInventory({ status: 'SOLD' }),
      ]);

      setMetrics({
        pendingOrders: pending.data?.length || 0,
        acceptedOrders: accepted.data?.length || 0,
        fulfilledOrders: fulfilled.data?.length || 0,
        allocatedSerials: allocated.data?.length || 0,
        soldSerials: sold.data?.length || 0,
      });
    } catch (err) {
      setError('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Wholesaler Dashboard</Text>

      {loading ? <ActivityIndicator color="#0284c7" /> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Pending Orders</Text>
          <Text style={styles.cardValue}>{metrics.pendingOrders}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Accepted Orders</Text>
          <Text style={styles.cardValue}>{metrics.acceptedOrders}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Fulfilled Orders</Text>
          <Text style={styles.cardValue}>{metrics.fulfilledOrders}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Allocated Serials</Text>
          <Text style={styles.cardValue}>{metrics.allocatedSerials}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Sold Serials</Text>
          <Text style={styles.cardValue}>{metrics.soldSerials}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Inventory')}>
          <Text style={styles.buttonText}>Inventory</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Orders')}>
          <Text style={styles.buttonText}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Sales')}>
          <Text style={styles.buttonText}>Sales</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f1f5f9',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginRight: '4%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardLabel: {
    color: '#64748b',
    fontSize: 12,
  },
  cardValue: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
  },
  actions: {
    marginTop: 12,
  },
  button: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626',
    marginBottom: 10,
  },
});
