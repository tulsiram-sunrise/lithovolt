import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NeonScroll } from '../../components/layout/NeonBackground';
import { neonTheme } from '../../styles/neonTheme';

export default function WarrantyDetailsScreen({ navigation, route }) {
	const warranty = route.params?.warranty;

	if (!warranty) {
		return (
			<NeonScroll contentContainerStyle={styles.centered}>
				<Text style={styles.errorText}>No warranty data available.</Text>
			</NeonScroll>
		);
	}

	return (
		<NeonScroll contentContainerStyle={styles.container} testID="warranty-details">
			<Text style={styles.title}>Warranty Details</Text>

			<View style={styles.card}>
				<Text style={styles.label}>Serial Number</Text>
				<Text style={styles.value}>{warranty.serial || warranty.serial_number}</Text>

				<Text style={styles.label}>Battery Model</Text>
				<Text style={styles.value}>{warranty.battery_model_name || warranty.battery_model}</Text>

				<Text style={styles.label}>Status</Text>
				<View style={[styles.badge, statusBadge(warranty.status)]}>
					<Text style={styles.badgeText}>{warranty.status}</Text>
				</View>

				<Text style={styles.label}>Start Date</Text>
				<Text style={styles.value}>{formatDate(warranty.start_date)}</Text>

				<Text style={styles.label}>End Date</Text>
				<Text style={styles.value}>{formatDate(warranty.end_date)}</Text>
			</View>

			<TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')} testID="warranty-back-home">
				<Text style={styles.buttonText}>Back to Home</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={[styles.button, styles.secondaryButton]}
				onPress={() => navigation.navigate('WarrantyClaim', { warranty })}
				testID="warranty-submit-claim"
			>
				<Text style={[styles.buttonText, styles.secondaryButtonText]}>Submit Claim</Text>
			</TouchableOpacity>
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
		flexGrow: 1,
	},
	centered: {
		flexGrow: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	title: {
		fontSize: 22,
		fontWeight: '700',
		color: neonTheme.colors.text,
		fontFamily: neonTheme.fonts.heading,
		marginBottom: 16,
	},
	card: {
		backgroundColor: neonTheme.colors.card,
		borderRadius: 16,
		marginBottom: 24,
		borderWidth: 1,
		borderColor: neonTheme.colors.border,
		padding: 16,
	},
	label: {
		fontSize: 12,
		color: neonTheme.colors.muted,
		marginTop: 12,
		fontFamily: neonTheme.fonts.body,
	},
	value: {
		fontSize: 16,
		color: neonTheme.colors.text,
		fontWeight: '600',
		fontFamily: neonTheme.fonts.bodyStrong,
		marginTop: 4,
	},
	badge: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
		alignSelf: 'flex-start',
		marginTop: 6,
	},
	badgeText: {
		fontWeight: '600',
		color: '#07110b',
		fontFamily: neonTheme.fonts.bodyStrong,
	},
	button: {
		backgroundColor: neonTheme.colors.accent,
		paddingVertical: 12,
		borderRadius: 12,
		alignItems: 'center',
		marginBottom: 12,
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
	secondaryButton: {
		backgroundColor: neonTheme.colors.surface,
		borderWidth: 1,
		borderColor: neonTheme.colors.border,
	},
	secondaryButtonText: {
		color: neonTheme.colors.text,
		fontFamily: neonTheme.fonts.bodyStrong,
	},
	errorText: {
		color: neonTheme.colors.danger,
		fontFamily: neonTheme.fonts.bodyStrong,
	},
});