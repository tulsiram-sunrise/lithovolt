import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { warrantyAPI } from '../../services/api';

export default function ScanQRScreen({ navigation }) {
	const [hasPermission, setHasPermission] = useState(null);
	const [scanned, setScanned] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [lastSerial, setLastSerial] = useState('');

	useEffect(() => {
		const requestPermission = async () => {
			const { status } = await BarCodeScanner.requestPermissionsAsync();
			setHasPermission(status === 'granted');
		};
		requestPermission();
	}, []);

	const handleBarCodeScanned = async ({ data }) => {
		if (scanned) {
			return;
		}

		setScanned(true);
		setLoading(true);
		setError('');

		try {
			const serial = data?.trim();
			setLastSerial(serial);
			const response = await warrantyAPI.verifyWarranty(serial);
			navigation.navigate('WarrantyDetails', { warranty: response.data });
		} catch (err) {
			setError('Unable to verify warranty. You can activate it manually.');
		} finally {
			setLoading(false);
		}
	};

	if (hasPermission === null) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator color="#0284c7" />
				<Text style={styles.helpText}>Requesting camera access...</Text>
			</View>
		);
	}

	if (hasPermission === false) {
		return (
			<View style={styles.centered}>
				<Text style={styles.errorText}>Camera permission denied.</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<BarCodeScanner
				onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
				style={StyleSheet.absoluteFillObject}
			/>

			<View style={styles.overlay}>
				<Text style={styles.title}>Scan Warranty QR</Text>
				<Text style={styles.subtitle}>Align the QR inside the frame.</Text>
				{loading ? <ActivityIndicator color="#fff" /> : null}
				{error ? <Text style={styles.errorText}>{error}</Text> : null}

				{scanned ? (
					<TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
						<Text style={styles.buttonText}>Scan Again</Text>
					</TouchableOpacity>
				) : null}

				{lastSerial ? (
					<TouchableOpacity
						style={styles.secondaryButton}
						onPress={() => navigation.navigate('WarrantyActivate', { serial_number: lastSerial })}
					>
						<Text style={styles.secondaryButtonText}>Activate with serial</Text>
					</TouchableOpacity>
				) : null}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	overlay: {
		position: 'absolute',
		bottom: 40,
		left: 20,
		right: 20,
		backgroundColor: 'rgba(15, 23, 42, 0.75)',
		borderRadius: 16,
		padding: 16,
		alignItems: 'center',
	},
	title: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '700',
	},
	subtitle: {
		color: '#cbd5f5',
		marginTop: 6,
		marginBottom: 12,
		textAlign: 'center',
	},
	button: {
		marginTop: 12,
		backgroundColor: '#0284c7',
		paddingVertical: 10,
		paddingHorizontal: 24,
		borderRadius: 10,
	},
	buttonText: {
		color: '#fff',
		fontWeight: '600',
	},
	secondaryButton: {
		marginTop: 10,
		backgroundColor: '#e2e8f0',
		paddingVertical: 10,
		paddingHorizontal: 24,
		borderRadius: 10,
	},
	secondaryButtonText: {
		color: '#0f172a',
		fontWeight: '600',
	},
	errorText: {
		color: '#fca5a5',
		marginTop: 8,
	},
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
		backgroundColor: '#0f172a',
	},
	helpText: {
		marginTop: 8,
		color: '#e2e8f0',
	},
});