import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { warrantyAPI } from '../../services/api';
import { NeonScroll } from '../../components/layout/NeonBackground';
import { neonTheme } from '../../styles/neonTheme';

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
      const payload = response.data;
      const list = Array.isArray(payload) ? payload : payload?.results || [];
      setClaims(list);
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
    <NeonScroll
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      testID="consumer-claims"
    >
      <Text style={styles.title}>My Claims</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by serial or warranty"
        placeholderTextColor="#94a3b8"
        value={search}
        onChangeText={setSearch}
        testID="claims-search"
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
          testID={`claim-card-${claim.id}`}
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
    marginBottom: 16,
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: neonTheme.colors.border,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: neonTheme.colors.surface,
  },
  filterChipActive: {
    backgroundColor: neonTheme.colors.accent,
    borderColor: neonTheme.colors.accent,
  },
  filterChipText: {
    color: neonTheme.colors.text,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: neonTheme.fonts.bodyStrong,
  },
  filterChipTextActive: {
    color: '#07110b',
  },
  card: {
    borderWidth: 1,
    borderColor: neonTheme.colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: neonTheme.colors.surface,
  },
  cardTitle: {
    fontSize: 15,
    color: neonTheme.colors.text,
    fontFamily: neonTheme.fonts.bodyStrong,
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
    color: '#07110b',
    fontFamily: neonTheme.fonts.bodyStrong,
  },
  cardMeta: {
    fontSize: 12,
    color: neonTheme.colors.muted,
    marginTop: 6,
  },
  errorText: {
    color: neonTheme.colors.danger,
    marginBottom: 10,
    fontFamily: neonTheme.fonts.bodyStrong,
  },
  emptyText: {
    color: neonTheme.colors.muted,
    fontFamily: neonTheme.fonts.body,
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
