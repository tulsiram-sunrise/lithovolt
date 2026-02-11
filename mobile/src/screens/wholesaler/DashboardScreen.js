import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { inventoryAPI, ordersAPI } from '../../services/api';
import { NeonScroll } from '../../components/layout/NeonBackground';
import { neonTheme } from '../../styles/neonTheme';

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

      const pendingList = Array.isArray(pending.data) ? pending.data : pending.data?.results || [];
      const acceptedList = Array.isArray(accepted.data) ? accepted.data : accepted.data?.results || [];
      const fulfilledList = Array.isArray(fulfilled.data) ? fulfilled.data : fulfilled.data?.results || [];
      const allocatedList = Array.isArray(allocated.data) ? allocated.data : allocated.data?.results || [];
      const soldList = Array.isArray(sold.data) ? sold.data : sold.data?.results || [];

      setMetrics({
        pendingOrders: pendingList.length,
        acceptedOrders: acceptedList.length,
        fulfilledOrders: fulfilledList.length,
        allocatedSerials: allocatedList.length,
        soldSerials: soldList.length,
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
    <NeonScroll contentContainerStyle={styles.container} testID="wholesaler-dashboard">
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
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Inventory')} testID="dashboard-inventory">
          <Text style={styles.buttonText}>Inventory</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Orders')} testID="dashboard-orders">
          <Text style={styles.buttonText}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Sales')} testID="dashboard-sales">
          <Text style={styles.buttonText}>Sales</Text>
        </TouchableOpacity>
      </View>
    </NeonScroll>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: neonTheme.colors.text,
    fontFamily: neonTheme.fonts.heading,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    width: '48%',
    backgroundColor: neonTheme.colors.card,
    borderRadius: 14,
    padding: 14,
    marginRight: '4%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: neonTheme.colors.border,
  },
  cardLabel: {
    color: neonTheme.colors.muted,
    fontFamily: neonTheme.fonts.body,
    fontSize: 12,
  },
  cardValue: {
    color: neonTheme.colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
    fontFamily: neonTheme.fonts.heading,
  },
  actions: {
    marginTop: 12,
  },
  button: {
    backgroundColor: neonTheme.colors.accent,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
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
  errorText: {
    color: neonTheme.colors.danger,
    marginBottom: 10,
  },
});
