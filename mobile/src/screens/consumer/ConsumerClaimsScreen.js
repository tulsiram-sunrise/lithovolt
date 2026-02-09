import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { warrantyAPI } from '../../services/api';

export default function ConsumerClaimsScreen({ navigation }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await warrantyAPI.getClaims();
      setClaims(response.data || []);
    } catch (err) {
      setError('Failed to load claims.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchClaims();
    } finally {
      setRefreshing(false);
    }
  };

  const filteredClaims = useMemo(() => {
    const term = search.trim().toLowerCase();
    return claims.filter((item) => {
      const status = (item.status || '').toUpperCase();
      const serial = (item.serial || item.serial_number || item.warranty_serial || '').toLowerCase();
      const number = (item.warranty_number || '').toLowerCase();
      const statusMatch = statusFilter === 'ALL' || status === statusFilter;
      const textMatch = !term || serial.includes(term) || number.includes(term);
      return statusMatch && textMatch;
    });
  }, [claims, search, statusFilter]);

  useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <Text style={styles.title}>My Claims</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by serial or warranty"
        placeholderTextColor="#94a3b8"
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filterRow}>
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.filterChip, statusFilter === option ? styles.filterChipActive : null]}
            onPress={() => setStatusFilter(option)}
          >
            <Text
              style={[styles.filterChipText, statusFilter === option ? styles.filterChipTextActive : null]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator color="#0284c7" /> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {!loading && filteredClaims.length === 0 ? (
        <Text style={styles.emptyText}>No claims found.</Text>
      ) : null}

      {filteredClaims.map((claim) => (
        <TouchableOpacity
          key={claim.id}
          style={styles.card}
          onPress={() => navigation.navigate('ClaimDetails', { claim })}
        >
          <Text style={styles.cardTitle}>Claim #{claim.id}</Text>
          <View style={[styles.badge, statusBadge(claim.status)]}>
            <Text style={styles.badgeText}>{claim.status}</Text>
          </View>
          {claim.warranty_number ? (
            <Text style={styles.cardMeta}>Warranty: {claim.warranty_number}</Text>
          ) : null}
          {claim.warranty_serial || claim.serial || claim.serial_number ? (
            <Text style={styles.cardMeta}>Serial: {claim.warranty_serial || claim.serial || claim.serial_number}</Text>
          ) : null}
          {claim.created_at ? (
            <Text style={styles.cardMeta}>Created: {formatDate(claim.created_at)}</Text>
          ) : null}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

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
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  filterChipActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  filterChipText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  card: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  cardMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
  },
  errorText: {
    color: '#dc2626',
    marginBottom: 10,
  },
  emptyText: {
    color: '#64748b',
  },
});

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
  if (normalized === 'APPROVED') {
    return { backgroundColor: '#dcfce7' };
  }
  if (normalized === 'REJECTED') {
    return { backgroundColor: '#fee2e2' };
  }
  if (normalized === 'PENDING') {
    return { backgroundColor: '#fef3c7' };
  }
  return { backgroundColor: '#e2e8f0' };
};
