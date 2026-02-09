import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OtpLoginScreen from '../screens/auth/OtpLoginScreen';
import PasswordResetRequestScreen from '../screens/auth/PasswordResetRequestScreen';
import PasswordResetConfirmScreen from '../screens/auth/PasswordResetConfirmScreen';

// Wholesaler Screens
import WholesalerDashboard from '../screens/wholesaler/DashboardScreen';
import WholesalerInventory from '../screens/wholesaler/InventoryScreen';
import WholesalerOrders from '../screens/wholesaler/OrdersScreen';
import WholesalerSales from '../screens/wholesaler/SalesScreen';
import WholesalerOrderDetails from '../screens/wholesaler/OrderDetailsScreen';
import WholesalerIssueWarranty from '../screens/wholesaler/IssueWarrantyScreen';

// Consumer Screens
import ConsumerHome from '../screens/consumer/HomeScreen';
import ScanQRScreen from '../screens/consumer/ScanQRScreen';
import WarrantyDetails from '../screens/consumer/WarrantyDetailsScreen';
import WarrantyClaimScreen from '../screens/consumer/WarrantyClaimScreen';
import WarrantyActivateScreen from '../screens/consumer/WarrantyActivateScreen';
import ConsumerClaimsScreen from '../screens/consumer/ConsumerClaimsScreen';
import ClaimDetailsScreen from '../screens/consumer/ClaimDetailsScreen';
import ConsumerProfileScreen from '../screens/consumer/ConsumerProfileScreen';
import SettingsScreen from '../screens/consumer/SettingsScreen';
import AttachmentViewerScreen from '../screens/consumer/AttachmentViewerScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="OtpLogin" component={OtpLoginScreen} />
        <Stack.Screen name="PasswordResetRequest" component={PasswordResetRequestScreen} />
        <Stack.Screen name="PasswordResetConfirm" component={PasswordResetConfirmScreen} />
      </Stack.Navigator>
    );
  }

  if (user?.role === 'WHOLESALER') {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Dashboard" component={WholesalerDashboard} />
        <Stack.Screen name="Inventory" component={WholesalerInventory} />
        <Stack.Screen name="Orders" component={WholesalerOrders} />
        <Stack.Screen name="OrderDetails" component={WholesalerOrderDetails} />
        <Stack.Screen name="IssueWarranty" component={WholesalerIssueWarranty} />
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
      <Stack.Screen name="WarrantyClaim" component={WarrantyClaimScreen} />
      <Stack.Screen name="WarrantyActivate" component={WarrantyActivateScreen} />
      <Stack.Screen name="Claims" component={ConsumerClaimsScreen} />
      <Stack.Screen name="ClaimDetails" component={ClaimDetailsScreen} />
      <Stack.Screen name="AttachmentViewer" component={AttachmentViewerScreen} />
      <Stack.Screen name="Profile" component={ConsumerProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
