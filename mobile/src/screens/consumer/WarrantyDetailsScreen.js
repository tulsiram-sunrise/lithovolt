import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function WarrantyDetailsScreen({ navigation, route }) {
	const warranty = route.params?.warranty;

	if (!warranty) {
		return (
			<View style={styles.centered}>
				<Text style={styles.errorText}>No warranty data available.</Text>
			</View>
		);
	}

	return (
		<ScrollView contentContainerStyle={styles.container}>
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

			<TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
				<Text style={styles.buttonText}>Back to Home</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={[styles.button, styles.secondaryButton]}
				onPress={() => navigation.navigate('WarrantyClaim', { warranty })}
			>
				<Text style={[styles.buttonText, styles.secondaryButtonText]}>Submit Claim</Text>
			</TouchableOpacity>
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
		backgroundColor: '#f1f5f9',
		flexGrow: 1,
	},
	title: {
		fontSize: 22,
		fontWeight: '700',
		color: '#0f172a',
		marginBottom: 16,
	},
	card: {
		backgroundColor: '#fff',
		borderRadius: 16,
		padding: 16,
		marginBottom: 24,
		shadowColor: '#0f172a',
		shadowOpacity: 0.06,
		shadowRadius: 12,
		elevation: 2,
	},
	label: {
		fontSize: 12,
		color: '#64748b',
		marginTop: 12,
	},
	value: {
		fontSize: 16,
		color: '#0f172a',
		fontWeight: '600',
	},
	badge: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
		alignSelf: 'flex-start',
		marginTop: 6,
	},
	badgeText: {
		fontSize: 12,
		fontWeight: '600',
		color: '#0f172a',
	},
	button: {
		backgroundColor: '#0284c7',
		paddingVertical: 12,
		borderRadius: 12,
		alignItems: 'center',
		marginBottom: 12,
	},
	buttonText: {
		color: '#fff',
		fontWeight: '600',
	},
	secondaryButton: {
		backgroundColor: '#e2e8f0',
	},
	secondaryButtonText: {
		color: '#0f172a',
	},
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
		backgroundColor: '#f1f5f9',
	},
	errorText: {
		color: '#dc2626',
	},
});