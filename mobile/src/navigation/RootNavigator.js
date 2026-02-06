import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Wholesaler Screens
import WholesalerDashboard from '../screens/wholesaler/DashboardScreen';
import WholesalerInventory from '../screens/wholesaler/InventoryScreen';
import WholesalerOrders from '../screens/wholesaler/OrdersScreen';
import WholesalerSales from '../screens/wholesaler/SalesScreen';

// Consumer Screens
import ConsumerHome from '../screens/consumer/HomeScreen';
import ScanQRScreen from '../screens/consumer/ScanQRScreen';
import WarrantyDetails from '../screens/consumer/WarrantyDetailsScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

  if (user?.role === 'WHOLESALER') {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Dashboard" component={WholesalerDashboard} />
        <Stack.Screen name="Inventory" component={WholesalerInventory} />
        <Stack.Screen name="Orders" component={WholesalerOrders} />
        <Stack.Screen name="Sales" component={WholesalerSales} />
      </Stack.Navigator>
    );
  }

  // Consumer
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={ConsumerHome} />
      <Stack.Screen name="ScanQR" component={ScanQRScreen} />
      <Stack.Screen name="WarrantyDetails" component={WarrantyDetails} />
    </Stack.Navigator>
  );
}
