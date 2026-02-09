import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { inventoryAPI } from '../../services/api';

export default function InventoryScreen() {
	const [serials, setSerials] = useState([]);
	const [allocations, setAllocations] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState('');
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('ALL');

	const loadData = async () => {
		try {
			setLoading(true);
			setError('');
			const [serialResponse, allocationResponse] = await Promise.all([
				inventoryAPI.getInventory(),
				inventoryAPI.getAllocations(),
			]);
			setSerials(serialResponse.data || []);
			setAllocations(allocationResponse.data || []);
		} catch (err) {
			setError('Failed to load inventory.');
		} finally {
			setLoading(false);
		}
	};

	const handleRefresh = async () => {
		try {
			setRefreshing(true);
			await loadData();
		} finally {
			setRefreshing(false);
		}
	};

	const filteredSerials = useMemo(() => {
		const term = search.trim().toLowerCase();
		return serials.filter((item) => {
			const status = (item.status || '').toUpperCase();
			const serial = (item.serial_number || '').toLowerCase();
			const model = (item.battery_model_name || '').toLowerCase();
			const statusMatch = statusFilter === 'ALL' || status === statusFilter;
			const textMatch = !term || serial.includes(term) || model.includes(term);
			return statusMatch && textMatch;
		});
	}, [search, statusFilter, serials]);

	useEffect(() => {
		loadData();
	}, []);

	return (
		<ScrollView
			contentContainerStyle={styles.container}
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
		>
			<Text style={styles.title}>Inventory</Text>

			{loading ? <ActivityIndicator color="#0284c7" /> : null}
			{error ? <Text style={styles.errorText}>{error}</Text> : null}

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Allocated Stock</Text>
				{allocations.map((allocation) => (
					<View key={allocation.id} style={styles.card}>
						<Text style={styles.cardTitle}>{allocation.battery_model_name}</Text>
						<Text style={styles.cardMeta}>Qty: {allocation.quantity}</Text>
						{allocation.notes ? <Text style={styles.cardMeta}>Notes: {allocation.notes}</Text> : null}
					</View>
				))}
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Serials</Text>
				<TextInput
					style={styles.searchInput}
					placeholder="Search serial or model"
					placeholderTextColor="#94a3b8"
					value={search}
					onChangeText={setSearch}
				/>

				<View style={styles.filterRow}>
					{['ALL', 'ALLOCATED', 'SOLD'].map((option) => (
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

				{filteredSerials.length === 0 && !loading ? (
					<Text style={styles.emptyText}>No serials found.</Text>
				) : null}

				{filteredSerials.map((serial) => (
					<View key={serial.id} style={styles.card}>
						<Text style={styles.cardTitle}>{serial.serial_number}</Text>
						<Text style={styles.cardMeta}>Model: {serial.battery_model_name}</Text>
						<View style={[styles.badge, statusBadge(serial.status)]}>
							<Text style={styles.badgeText}>{serial.status}</Text>
						</View>
					</View>
				))}
			</View>
		</ScrollView>
	);
}

const statusBadge = (status) => {
	const normalized = (status || '').toUpperCase();
	if (normalized === 'ALLOCATED') {
		return { backgroundColor: '#e0f2fe' };
	}
	if (normalized === 'SOLD') {
		return { backgroundColor: '#dcfce7' };
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
	section: {
		backgroundColor: '#fff',
		borderRadius: 16,
		padding: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: '#e2e8f0',
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '700',
		color: '#0f172a',
		marginBottom: 12,
	},
	card: {
		borderWidth: 1,
		borderColor: '#e2e8f0',
		borderRadius: 12,
		padding: 12,
		marginBottom: 12,
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
	emptyText: {
		color: '#64748b',
	},
	errorText: {
		color: '#dc2626',
		marginBottom: 10,
	},
});