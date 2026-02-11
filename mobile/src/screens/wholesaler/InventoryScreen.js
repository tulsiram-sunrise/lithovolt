import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { inventoryAPI } from '../../services/api';
import { NeonScroll } from '../../components/layout/NeonBackground';
import { neonTheme } from '../../styles/neonTheme';

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
			const serialPayload = serialResponse.data;
			const allocationPayload = allocationResponse.data;
			setSerials(Array.isArray(serialPayload) ? serialPayload : serialPayload?.results || []);
			setAllocations(Array.isArray(allocationPayload) ? allocationPayload : allocationPayload?.results || []);
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
		<NeonScroll
			contentContainerStyle={styles.container}
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
			testID="wholesaler-inventory"
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
					testID="inventory-search"
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
		</NeonScroll>
	);
}

const statusBadge = (status) => {
	const normalized = (status || '').toUpperCase();
	if (normalized === 'ALLOCATED') {
		return { backgroundColor: neonTheme.colors.accent };
	}
	if (normalized === 'SOLD') {
		return { backgroundColor: '#1b3a2c' };
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
	section: {
		backgroundColor: neonTheme.colors.card,
		borderRadius: 16,
		padding: 16,
		borderWidth: 1,
		borderColor: neonTheme.colors.border,
		marginBottom: 16,
	},
	sectionTitle: {
		fontWeight: '700',
		color: neonTheme.colors.text,
		fontFamily: neonTheme.fonts.heading,
		marginBottom: 12,
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
	cardMeta: {
		fontSize: 12,
		color: neonTheme.colors.muted,
		marginTop: 6,
		fontFamily: neonTheme.fonts.body,
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
		fontSize: 12,
		fontWeight: '600',
		color: neonTheme.colors.text,
		fontFamily: neonTheme.fonts.bodyStrong,
	},
	filterChipTextActive: {
		color: '#07110b',
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