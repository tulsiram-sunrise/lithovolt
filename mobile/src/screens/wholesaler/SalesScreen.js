import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, RefreshControl } from 'react-native';
import { ordersAPI } from '../../services/api';

export default function SalesScreen() {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState('');
	const [search, setSearch] = useState('');

	const loadSales = async () => {
		try {
			setLoading(true);
			setError('');
			const response = await ordersAPI.getOrders({ status: 'FULFILLED' });
			const payload = response.data;
			const list = Array.isArray(payload) ? payload : payload?.results || [];
			setOrders(list);
		} catch (err) {
			setError('Failed to load sales.');
		} finally {
			setLoading(false);
		}
	};

	const handleRefresh = async () => {
		try {
			setRefreshing(true);
			await loadSales();
		} finally {
			setRefreshing(false);
		}
	};

	const filteredOrders = useMemo(() => {
		const term = search.trim();
		return orders.filter((order) => !term || String(order.id).includes(term));
	}, [orders, search]);

	useEffect(() => {
		loadSales();
	}, []);

	return (
		<ScrollView
			contentContainerStyle={styles.container}
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
			testID="wholesaler-sales"
		>
			<Text style={styles.title}>Sales</Text>

			<TextInput
				style={styles.searchInput}
				placeholder="Search by order id"
				placeholderTextColor="#94a3b8"
				value={search}
				onChangeText={setSearch}
				testID="sales-search"
			/>

			{loading ? <ActivityIndicator color="#0284c7" /> : null}
			{error ? <Text style={styles.errorText}>{error}</Text> : null}
			{!loading && filteredOrders.length === 0 ? (
				<Text style={styles.emptyText}>No sales found.</Text>
			) : null}

			{filteredOrders.map((order) => (
				<View key={order.id} style={styles.card}>
					<Text style={styles.cardTitle}>Order #{order.id}</Text>
					<Text style={styles.cardMeta}>Consumer: {order.consumer_name || order.consumer}</Text>
					<Text style={styles.cardMeta}>Items: {order.total_items || order.items?.length || 0}</Text>
					{order.fulfilled_at ? <Text style={styles.cardMeta}>Fulfilled: {formatDate(order.fulfilled_at)}</Text> : null}
				</View>
			))}
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
	cardMeta: {
		fontSize: 12,
		color: '#64748b',
		marginTop: 6,
	},
	emptyText: {
		color: '#64748b',
	},
	errorText: {
		color: '#dc2626',
		marginBottom: 10,
	},
});