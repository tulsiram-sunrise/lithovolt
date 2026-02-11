import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { warrantyAPI } from '../../services/api';
import { NeonBackground } from '../../components/layout/NeonBackground';
import { neonTheme } from '../../styles/neonTheme';

export default function ScanQRScreen({ navigation }) {
	const [permission, requestPermission] = useCameraPermissions();
	const [scanned, setScanned] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [lastSerial, setLastSerial] = useState('');

	useEffect(() => {
		if (!permission) {
			return;
		}
		if (!permission.granted) {
			requestPermission();
		}
	}, [permission, requestPermission]);

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

	if (!permission) {
		return (
			<NeonBackground style={styles.centered}>
				<ActivityIndicator color={neonTheme.colors.accent} />
				<Text style={styles.helpText}>Requesting camera access...</Text>
			</NeonBackground>
		);
	}

	if (!permission.granted) {
		return (
			<NeonBackground style={styles.centered}>
				<Text style={styles.errorText}>Camera permission denied.</Text>
			</NeonBackground>
		);
	}

	return (
		<NeonBackground style={styles.container}>
			<CameraView
				onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
				barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
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
		</NeonBackground>
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
		backgroundColor: 'rgba(10, 18, 14, 0.85)',
		borderRadius: 16,
		padding: 16,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: neonTheme.colors.border,
	},
	title: {
		color: neonTheme.colors.text,
		fontSize: 18,
		fontWeight: '700',
		fontFamily: neonTheme.fonts.heading,
	},
	subtitle: {
		color: neonTheme.colors.muted,
		fontFamily: neonTheme.fonts.body,
		marginTop: 6,
		marginBottom: 12,
		textAlign: 'center',
	},
	button: {
		marginTop: 12,
		backgroundColor: neonTheme.colors.accent,
		paddingVertical: 10,
		paddingHorizontal: 24,
		borderRadius: 10,
	},
	buttonText: {
		color: '#07110b',
		fontWeight: '600',
		fontFamily: neonTheme.fonts.bodyStrong,
	},
	secondaryButton: {
		marginTop: 10,
		backgroundColor: neonTheme.colors.surface,
		paddingVertical: 10,
		paddingHorizontal: 24,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: neonTheme.colors.border,
	},
	secondaryButtonText: {
		color: neonTheme.colors.text,
		fontWeight: '600',
		fontFamily: neonTheme.fonts.bodyStrong,
	},
	errorText: {
		color: neonTheme.colors.danger,
		marginTop: 8,
	},
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	helpText: {
		marginTop: 8,
		color: neonTheme.colors.muted,
		fontFamily: neonTheme.fonts.body,
	},
});