import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, TextInput, RefreshControl } from 'react-native';
import { warrantyAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function HomeScreen({ navigation }) {
	const user = useAuthStore((state) => state.user);
	const [loading, setLoading] = useState(false);
	const [warranties, setWarranties] = useState([]);
	const [error, setError] = useState('');
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('ALL');
	const [refreshing, setRefreshing] = useState(false);

	const fetchWarranties = async () => {
		try {
			setLoading(true);
			setError('');
			const response = await warrantyAPI.getWarranties();
			setWarranties(response.data || []);
		} catch (err) {
			setError('Failed to load warranties.');
		} finally {
			setLoading(false);
		}
	};

	const handleRefresh = async () => {
		try {
			setRefreshing(true);
			await fetchWarranties();
		} finally {
			setRefreshing(false);
		}
	};

	const filteredWarranties = useMemo(() => {
		const term = search.trim().toLowerCase();
		return warranties.filter((item) => {
			const status = (item.status || '').toUpperCase();
			const serial = (item.serial || item.serial_number || '').toLowerCase();
			const model = (item.battery_model_name || item.battery_model || '').toLowerCase();
			const statusMatch = statusFilter === 'ALL' || status === statusFilter;
			const textMatch = !term || serial.includes(term) || model.includes(term);
			return statusMatch && textMatch;
		});
	}, [search, statusFilter, warranties]);

	useEffect(() => {
		fetchWarranties();
	}, []);

	return (
		<ScrollView
			contentContainerStyle={styles.container}
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
		>
			<View style={styles.header}>
				<Image
					source={require('../../../assets/Lithovolt-logo.png')}
					style={styles.logo}
					resizeMode="contain"
				/>
				<Text style={styles.title}>Welcome{user?.first_name ? `, ${user.first_name}` : ''}</Text>
				<Text style={styles.subtitle}>Track and verify your battery warranty.</Text>
			</View>

			<View style={styles.actions}>
				<TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('ScanQR')}>
					<Text style={styles.primaryButtonText}>Scan Warranty QR</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('WarrantyActivate')}>
					<Text style={styles.primaryButtonText}>Activate Warranty</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Claims')}>
					<Text style={styles.secondaryButtonText}>My Claims</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.secondaryButton} onPress={fetchWarranties}>
					<Text style={styles.secondaryButtonText}>Refresh Warranties</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Settings')}>
					<Text style={styles.secondaryButtonText}>Settings</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>My Warranties</Text>

				<TextInput
					style={styles.searchInput}
					placeholder="Search by serial or model"
					placeholderTextColor="#94a3b8"
					value={search}
					onChangeText={setSearch}
				/>

				<View style={styles.filterRow}>
					{['ALL', 'ACTIVE', 'EXPIRED', 'VOID'].map((option) => (
						<TouchableOpacity
							key={option}
							style={[
								styles.filterChip,
								statusFilter === option ? styles.filterChipActive : null,
							]}
							onPress={() => setStatusFilter(option)}
						>
							<Text
								style={[
									styles.filterChipText,
									statusFilter === option ? styles.filterChipTextActive : null,
								]}
							>
								{option}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{loading ? (
					<ActivityIndicator color="#0284c7" />
				) : null}
				{error ? <Text style={styles.errorText}>{error}</Text> : null}
				{!loading && filteredWarranties.length === 0 ? (
					<Text style={styles.emptyText}>No warranties found yet.</Text>
				) : null}
				{filteredWarranties.map((item) => (
					<TouchableOpacity
						key={item.id}
						style={styles.card}
						onPress={() => navigation.navigate('WarrantyDetails', { warranty: item })}
					>
						<Text style={styles.cardTitle}>{item.serial}</Text>
						<Text style={styles.cardSubtitle}>{item.battery_model_name || item.battery_model}</Text>
						<View style={[styles.badge, statusBadge(item.status)]}>
							<Text style={styles.badgeText}>{item.status}</Text>
						</View>
						{item.start_date ? (
							<Text style={styles.cardMeta}>Start: {formatDate(item.start_date)}</Text>
						) : null}
						{item.end_date ? (
							<Text style={styles.cardMeta}>End: {formatDate(item.end_date)}</Text>
						) : null}
					</TouchableOpacity>
				))}
			</View>
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
		if (normalized === 'ACTIVE') {
			return { backgroundColor: '#dcfce7' };
		}
		if (normalized === 'EXPIRED') {
			return { backgroundColor: '#fee2e2' };
		}
		if (normalized === 'VOID') {
			return { backgroundColor: '#e2e8f0' };
		}
		return { backgroundColor: '#fef3c7' };
	};

const styles = StyleSheet.create({
	container: {
		padding: 20,
		paddingBottom: 40,
		backgroundColor: '#f1f5f9',
	},
	header: {
		alignItems: 'center',
		marginBottom: 24,
	},
	logo: {
		width: 120,
		height: 120,
		marginBottom: 10,
	},
	title: {
		fontSize: 24,
		fontWeight: '700',
		color: '#0f172a',
	},
	subtitle: {
		fontSize: 14,
		color: '#475569',
		marginTop: 6,
		textAlign: 'center',
	},
	actions: {
		marginBottom: 24,
	},
	primaryButton: {
		backgroundColor: '#0284c7',
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: 'center',
		marginBottom: 12,
	},
	primaryButtonText: {
		color: '#fff',
		fontWeight: '600',
		fontSize: 16,
	},
	secondaryButton: {
		backgroundColor: '#e2e8f0',
		paddingVertical: 12,
		borderRadius: 12,
		alignItems: 'center',
	},
	secondaryButtonText: {
		color: '#0f172a',
		fontWeight: '600',
	},
	section: {
		backgroundColor: '#fff',
		borderRadius: 16,
		padding: 16,
		shadowColor: '#0f172a',
		shadowOpacity: 0.06,
		shadowRadius: 12,
		elevation: 2,
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
	cardSubtitle: {
		fontSize: 13,
		color: '#475569',
		marginTop: 4,
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
	errorText: {
		color: '#dc2626',
		marginBottom: 10,
	},
	emptyText: {
		color: '#64748b',
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
});