import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, TextInput, RefreshControl } from 'react-native';
import { warrantyAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { NeonScroll } from '../../components/layout/NeonBackground';
import { neonTheme } from '../../styles/neonTheme';

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
			const payload = response.data;
			const list = Array.isArray(payload) ? payload : payload?.results || [];
			setWarranties(list);
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
		<NeonScroll
			testID="consumer-home"
			contentContainerStyle={styles.container}
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
		>
			<View style={styles.header}>
				<Image
					source={require('../../../assets/logo.png')}
					style={styles.logo}
					resizeMode="contain"
				/>
				<Text style={styles.title}>Welcome{user?.first_name ? `, ${user.first_name}` : ''}</Text>
				<Text style={styles.subtitle}>Track and verify your battery warranty.</Text>
			</View>

			<View style={styles.actions}>
				<TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('ScanQR')} testID="home-scan-qr">
					<Text style={styles.primaryButtonText}>Scan Warranty QR</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('WarrantyActivate')} testID="home-activate">
					<Text style={styles.primaryButtonText}>Activate Warranty</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Claims')} testID="home-claims">
					<Text style={styles.secondaryButtonText}>My Claims</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.secondaryButton} onPress={fetchWarranties} testID="home-refresh">
					<Text style={styles.secondaryButtonText}>Refresh Warranties</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Settings')} testID="home-settings">
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
					testID="home-search"
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
						testID={`warranty-card-${item.id}`}
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
	if (normalized === 'ACTIVE') {
		return { backgroundColor: neonTheme.colors.accent };
	}
	if (normalized === 'EXPIRED') {
		return { backgroundColor: '#2a1518' };
	}
	if (normalized === 'VOID') {
		return { backgroundColor: neonTheme.colors.surfaceAlt };
	}
	return { backgroundColor: '#fef3c7' };
};

const styles = StyleSheet.create({
	container: {
		padding: 20,
		paddingBottom: 40,
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
		color: neonTheme.colors.text,
		fontFamily: neonTheme.fonts.heading,
	},
	subtitle: {
		color: neonTheme.colors.muted,
		fontFamily: neonTheme.fonts.body,
		marginTop: 6,
		textAlign: 'center',
	},
	actions: {
		marginBottom: 24,
	},
	primaryButton: {
		backgroundColor: neonTheme.colors.accent,
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: 'center',
		shadowColor: neonTheme.colors.accentGlow,
		shadowOpacity: 0.3,
		shadowRadius: 16,
		shadowOffset: { width: 0, height: 8 },
		elevation: 6,
		marginBottom: 12,
	},
	primaryButtonText: {
		color: '#07110b',
		fontWeight: '600',
		fontFamily: neonTheme.fonts.bodyStrong,
		fontSize: 16,
	},
	secondaryButton: {
		backgroundColor: neonTheme.colors.surface,
		paddingVertical: 12,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: neonTheme.colors.border,
		alignItems: 'center',
		marginBottom: 10,
	},
	secondaryButtonText: {
		color: neonTheme.colors.text,
		fontFamily: neonTheme.fonts.bodyStrong,
		fontWeight: '600',
	},
	section: {
		marginTop: 10,
	},
	sectionTitle: {
		fontSize: 16,
		color: neonTheme.colors.text,
		fontFamily: neonTheme.fonts.heading,
		marginBottom: 12,
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
		backgroundColor: neonTheme.colors.card,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: neonTheme.colors.border,
		padding: 14,
		marginBottom: 12,
	},
	cardTitle: {
		fontSize: 15,
		color: neonTheme.colors.text,
		fontFamily: neonTheme.fonts.bodyStrong,
	},
	cardSubtitle: {
		fontSize: 13,
		color: neonTheme.colors.muted,
		marginTop: 4,
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
	cardMeta: {
		fontSize: 12,
		color: neonTheme.colors.muted,
		marginTop: 6,
		fontFamily: neonTheme.fonts.body,
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