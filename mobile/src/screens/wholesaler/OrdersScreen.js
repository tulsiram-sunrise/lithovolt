import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { ordersAPI } from '../../services/api';
import { NeonScroll } from '../../components/layout/NeonBackground';
import { neonTheme } from '../../styles/neonTheme';

export default function OrdersScreen({ navigation }) {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState('');
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('ALL');

	const loadOrders = async () => {
		try {
			setLoading(true);
			setError('');
			const response = await ordersAPI.getOrders();
			const payload = response.data;
			const list = Array.isArray(payload) ? payload : payload?.results || [];
			setOrders(list);
		} catch (err) {
			setError('Failed to load orders.');
		} finally {
			setLoading(false);
		}
	};

	const handleRefresh = async () => {
		try {
			setRefreshing(true);
			await loadOrders();
		} finally {
			setRefreshing(false);
		}
	};

	const filteredOrders = useMemo(() => {
		const term = search.trim();
		return orders.filter((order) => {
			const status = (order.status || '').toUpperCase();
			const idMatch = !term || String(order.id).includes(term);
			const statusMatch = statusFilter === 'ALL' || status === statusFilter;
			return idMatch && statusMatch;
		});
	}, [orders, search, statusFilter]);

	useEffect(() => {
		loadOrders();
	}, []);

	return (
		<NeonScroll
			contentContainerStyle={styles.container}
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
			testID="wholesaler-orders"
		>
			<Text style={styles.title}>Orders</Text>

			<TextInput
				style={styles.searchInput}
				placeholder="Search by order id"
				placeholderTextColor="#94a3b8"
				value={search}
				onChangeText={setSearch}
				testID="orders-search"
			/>

			<View style={styles.filterRow}>
				{['ALL', 'PENDING', 'ACCEPTED', 'FULFILLED', 'REJECTED', 'CANCELLED'].map((option) => (
					<TouchableOpacity
						key={option}
						style={[styles.filterChip, statusFilter === option ? styles.filterChipActive : null]}
						onPress={() => setStatusFilter(option)}
					>
						<Text style={[styles.filterChipText, statusFilter === option ? styles.filterChipTextActive : null]}>
							{option}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			{loading ? <ActivityIndicator color="#0284c7" /> : null}
			{error ? <Text style={styles.errorText}>{error}</Text> : null}
			{!loading && filteredOrders.length === 0 ? (
				<Text style={styles.emptyText}>No orders found.</Text>
			) : null}

			{filteredOrders.map((order) => (
				<View key={order.id} style={styles.card}>
					<TouchableOpacity onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })} testID={`order-card-${order.id}`}>
						<Text style={styles.cardTitle}>Order #{order.id}</Text>
						<View style={[styles.badge, statusBadge(order.status)]}>
							<Text style={styles.badgeText}>{order.status}</Text>
						</View>
						<Text style={styles.cardMeta}>Placed by: {order.consumer_name || order.consumer}</Text>
						<Text style={styles.cardMeta}>Items: {order.total_items || order.items?.length || 0}</Text>
						{order.created_at ? <Text style={styles.cardMeta}>Created: {formatDate(order.created_at)}</Text> : null}
					</TouchableOpacity>
				</View>
			))}
		</NeonScroll>
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
		return { backgroundColor: neonTheme.colors.surfaceAlt };
	}
	if (normalized === 'ACCEPTED') {
		return { backgroundColor: neonTheme.colors.accent };
	}
	if (normalized === 'FULFILLED') {
		return { backgroundColor: '#1b3a2c' };
	}
	if (normalized === 'REJECTED') {
		return { backgroundColor: '#2a1518' };
	}
	if (normalized === 'CANCELLED') {
		return { backgroundColor: neonTheme.colors.surfaceAlt };
	}
	return { backgroundColor: neonTheme.colors.surfaceAlt };
};

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
		fontWeight: '700',
		color: neonTheme.colors.text,
		fontFamily: neonTheme.fonts.bodyStrong,
	},
	cardMeta: {
		fontSize: 12,
		color: neonTheme.colors.muted,
		marginTop: 6,
		fontFamily: neonTheme.fonts.body,
	},
	badge: {
		alignSelf: 'flex-start',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
		marginTop: 6,
	},
	badgeText: {
		fontWeight: '600',
		color: '#07110b',
		fontFamily: neonTheme.fonts.bodyStrong,
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