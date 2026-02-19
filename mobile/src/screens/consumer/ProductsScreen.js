import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl, Dimensions } from 'react-native';
import { inventoryAPI } from '../../services/api';
import { NeonScroll } from '../../components/layout/NeonBackground';
import { neonTheme } from '../../styles/neonTheme';

const { width } = Dimensions.get('window');
const columnCount = 2;
const itemWidth = (width - 32 - 8) / columnCount;

export default function ProductsScreen({ navigation }) {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState('');
	const [search, setSearch] = useState('');

	const fetchProducts = async () => {
		try {
			setLoading(true);
			setError('');
			const response = await inventoryAPI.getProducts();
			const payload = response.data;
			const list = Array.isArray(payload) ? payload : payload?.results || [];
			setProducts(list);
		} catch (err) {
			setError('Failed to load products.');
		} finally {
			setLoading(false);
		}
	};

	const handleRefresh = async () => {
		try {
			setRefreshing(true);
			await fetchProducts();
		} finally {
			setRefreshing(false);
		}
	};

	const filteredProducts = useMemo(() => {
		const term = search.trim().toLowerCase();
		return products.filter((item) => {
			const name = (item.name || '').toLowerCase();
			const sku = (item.sku || '').toLowerCase();
			return !term || name.includes(term) || sku.includes(term);
		});
	}, [search, products]);

	useEffect(() => {
		fetchProducts();
	}, []);

	const ProductCard = ({ product }) => (
		<TouchableOpacity 
			style={styles.productCard}
			onPress={() => {
				// Can add product detail screen later if needed
			}}
		>
			<View style={styles.productContent}>
				<Text style={styles.productName}>{product.name}</Text>
				<Text style={styles.productSku}>SKU: {product.sku}</Text>
				{product.description && (
					<Text style={styles.productDesc} numberOfLines={2}>
						{product.description}
					</Text>
				)}
				<View style={styles.priceRow}>
					<Text style={styles.productPrice}>₹{(product.price || 0).toFixed(2)}</Text>
					<Text style={styles.productStock}>
						{product.available_quantity || 0} in stock
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	);

	return (
		<NeonScroll
			testID="consumer-products"
			contentContainerStyle={styles.container}
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
		>
			<View style={styles.header}>
				<Text style={styles.title}>Products</Text>
				<Text style={styles.subtitle}>Browse all available products.</Text>
			</View>

			<TextInput
				style={styles.searchInput}
				placeholder="Search product or SKU"
				placeholderTextColor="#94a3b8"
				value={search}
				onChangeText={setSearch}
				testID="products-search"
			/>

			{error ? <Text style={styles.errorText}>{error}</Text> : null}
			{loading && !refreshing ? <ActivityIndicator color={neonTheme.colors.accent} size="large" style={styles.loader} /> : null}

			{!loading && filteredProducts.length === 0 ? (
				<Text style={styles.emptyText}>{search ? 'No products found.' : 'No products available.'}</Text>
			) : (
				<View style={styles.grid}>
					{filteredProducts.map((product) => (
						<ProductCard key={product.id} product={product} />
					))}
				</View>
			)}
		</NeonScroll>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		paddingBottom: 40,
	},
	header: {
		marginBottom: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: '700',
		color: neonTheme.colors.accent,
		fontFamily: 'Orbitron_700Bold',
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 14,
		color: neonTheme.colors.muted,
		fontFamily: 'SpaceGrotesk_400Regular',
	},
	searchInput: {
		backgroundColor: neonTheme.colors.card,
		borderColor: neonTheme.colors.border,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		color: neonTheme.colors.text,
		marginBottom: 16,
		fontSize: 14,
		fontFamily: 'SpaceGrotesk_400Regular',
	},
	loader: {
		marginVertical: 20,
	},
	errorText: {
		color: neonTheme.colors.error,
		fontSize: 12,
		marginBottom: 12,
		fontFamily: 'SpaceGrotesk_400Regular',
	},
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
	},
	productCard: {
		width: itemWidth,
		marginBottom: 12,
		backgroundColor: neonTheme.colors.card,
		borderColor: neonTheme.colors.border,
		borderWidth: 1,
		borderRadius: 8,
		padding: 8,
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4,
		elevation: 3,
	},
	productContent: {
		flex: 1,
	},
	productName: {
		fontSize: 12,
		fontWeight: '700',
		color: neonTheme.colors.text,
		fontFamily: 'Orbitron_600SemiBold',
		marginBottom: 4,
	},
	productSku: {
		fontSize: 10,
		color: neonTheme.colors.muted,
		fontFamily: 'SpaceGrotesk_400Regular',
		marginBottom: 4,
	},
	productDesc: {
		fontSize: 10,
		color: neonTheme.colors.muted,
		fontFamily: 'SpaceGrotesk_400Regular',
		marginBottom: 6,
	},
	priceRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	productPrice: {
		fontSize: 14,
		fontWeight: '700',
		color: neonTheme.colors.accent,
		fontFamily: 'Orbitron_700Bold',
	},
	productStock: {
		fontSize: 10,
		color: neonTheme.colors.muted,
		fontFamily: 'SpaceGrotesk_400Regular',
	},
	emptyText: {
		textAlign: 'center',
		color: neonTheme.colors.muted,
		fontSize: 14,
		marginTop: 20,
		fontFamily: 'SpaceGrotesk_400Regular',
	},
});
