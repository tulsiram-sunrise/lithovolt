import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { ordersAPI } from '../../services/api';

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
			setOrders(response.data || []);
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

	const handleAction = async (orderId, action) => {
		try {
			if (action === 'ACCEPT') {
				await ordersAPI.acceptOrder(orderId);
			} else if (action === 'REJECT') {
				await ordersAPI.rejectOrder(orderId);
			} else if (action === 'FULFILL') {
				await ordersAPI.fulfillOrder(orderId);
			}
			await loadOrders();
		} catch (err) {
			setError('Unable to update order.');
		}
	};

	useEffect(() => {
		loadOrders();
	}, []);

	return (
		<ScrollView
			contentContainerStyle={styles.container}
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
		>
			<Text style={styles.title}>Orders</Text>

			<TextInput
				style={styles.searchInput}
				placeholder="Search by order id"
				placeholderTextColor="#94a3b8"
				value={search}
				onChangeText={setSearch}
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
					<TouchableOpacity onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}>
						<Text style={styles.cardTitle}>Order #{order.id}</Text>
						<View style={[styles.badge, statusBadge(order.status)]}>
							<Text style={styles.badgeText}>{order.status}</Text>
						</View>
						<Text style={styles.cardMeta}>Consumer: {order.consumer_name || order.consumer}</Text>
						<Text style={styles.cardMeta}>Items: {order.total_items || order.items?.length || 0}</Text>
						{order.created_at ? <Text style={styles.cardMeta}>Created: {formatDate(order.created_at)}</Text> : null}
					</TouchableOpacity>

					<View style={styles.actionRow}>
						<TouchableOpacity
							style={styles.secondaryButton}
							onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
						>
							<Text style={styles.secondaryButtonText}>Details</Text>
						</TouchableOpacity>
						{order.status === 'PENDING' ? (
							<>
								<TouchableOpacity style={styles.secondaryButton} onPress={() => handleAction(order.id, 'ACCEPT')}>
									<Text style={styles.secondaryButtonText}>Accept</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.rejectButton} onPress={() => handleAction(order.id, 'REJECT')}>
									<Text style={styles.rejectButtonText}>Reject</Text>
								</TouchableOpacity>
							</>
						) : null}
						{order.status === 'ACCEPTED' ? (
							<TouchableOpacity style={styles.secondaryButton} onPress={() => handleAction(order.id, 'FULFILL')}>
								<Text style={styles.secondaryButtonText}>Fulfill</Text>
							</TouchableOpacity>
						) : null}
						{order.status === 'FULFILLED' ? (
							<TouchableOpacity
								style={styles.secondaryButton}
								onPress={() => navigation.navigate('IssueWarranty', { orderId: order.id })}
							>
								<Text style={styles.secondaryButtonText}>Issue Warranty</Text>
							</TouchableOpacity>
						) : null}
					</View>
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
	if (normalized === 'CANCELLED') {
		return { backgroundColor: '#e2e8f0' };
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
	cardMeta: {
		fontSize: 12,
		color: '#64748b',
		marginTop: 6,
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
	actionRow: {
		flexDirection: 'row',
		marginTop: 12,
	},
	secondaryButton: {
		backgroundColor: '#e0f2fe',
		paddingVertical: 8,
		paddingHorizontal: 14,
		borderRadius: 10,
		marginRight: 8,
	},
	secondaryButtonText: {
		color: '#0f172a',
		fontWeight: '600',
	},
	rejectButton: {
		backgroundColor: '#fee2e2',
		paddingVertical: 8,
		paddingHorizontal: 14,
		borderRadius: 10,
	},
	rejectButtonText: {
		color: '#b91c1c',
		fontWeight: '600',
	},
	emptyText: {
		color: '#64748b',
	},
	errorText: {
		color: '#dc2626',
		marginBottom: 10,
	},
});