import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { neonTheme } from '../styles/neonTheme';

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
import WholesalerPlaceOrder from '../screens/wholesaler/PlaceOrderScreen';
import WholesalerProfileScreen from '../screens/wholesaler/WholesalerProfileScreen';
import WholesalerSettingsScreen from '../screens/wholesaler/WholesalerSettingsScreen';
import WholesalerProductsScreen from '../screens/wholesaler/ProductsScreen';

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
import WholesalerRegisterScreen from '../screens/consumer/WholesalerRegisterScreen';
import ConsumerProductsScreen from '../screens/consumer/ProductsScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function AuthStack() {
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

function WholesalerOrdersStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Orders" component={WholesalerOrders} />
      <Stack.Screen name="OrderDetails" component={WholesalerOrderDetails} />
      <Stack.Screen name="IssueWarranty" component={WholesalerIssueWarranty} />
      <Stack.Screen name="WholesalerProfile" component={WholesalerProfileScreen} />
    </Stack.Navigator>
  );
}

function WholesalerDrawer() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="Dashboard" component={WholesalerDashboard} />
      <Drawer.Screen name="PlaceOrder" component={WholesalerPlaceOrder} />
      <Drawer.Screen name="Products" component={WholesalerProductsScreen} />
      <Drawer.Screen name="Inventory" component={WholesalerInventory} />
      <Drawer.Screen name="Orders" component={WholesalerOrdersStack} />
      <Drawer.Screen name="Sales" component={WholesalerSales} />
      <Drawer.Screen name="WholesalerProfile" component={WholesalerProfileScreen} />
      <Drawer.Screen name="Settings" component={WholesalerSettingsScreen} />
    </Drawer.Navigator>
  );
}

function ConsumerTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ScanQR') {
            iconName = 'qr-code';
          } else if (route.name === 'Products') {
            iconName = focused ? 'bag' : 'bag-outline';
          } else if (route.name === 'Claims') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: neonTheme.colors.accent,
        tabBarInactiveTintColor: neonTheme.colors.muted,
        tabBarStyle: {
          backgroundColor: neonTheme.colors.card,
          borderTopColor: neonTheme.colors.border,
          borderTopWidth: 1,
          paddingBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          paddingBottom: 4,
        },
        sceneContainerStyle: {
          backgroundColor: 'transparent',
        },
      })}
    >
      <Tabs.Screen name="Home" component={ConsumerHome} options={{ title: 'Home' }} />
      <Tabs.Screen name="ScanQR" component={ScanQRScreen} options={{ title: 'Scan' }} />
      <Tabs.Screen name="Products" component={ConsumerProductsScreen} options={{ title: 'Products' }} />
      <Tabs.Screen name="Claims" component={ConsumerClaimsScreen} options={{ title: 'Claims' }} />
      <Tabs.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tabs.Navigator>
  );
}

function ConsumerStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ConsumerTabs" component={ConsumerTabs} options={{ headerShown: false }} />
      <Stack.Screen name="WarrantyDetails" component={WarrantyDetails} />
      <Stack.Screen name="WarrantyClaim" component={WarrantyClaimScreen} />
      <Stack.Screen name="WarrantyActivate" component={WarrantyActivateScreen} />
      <Stack.Screen name="ClaimDetails" component={ClaimDetailsScreen} />
      <Stack.Screen name="AttachmentViewer" component={AttachmentViewerScreen} />
      <Stack.Screen name="Profile" component={ConsumerProfileScreen} />
      <Stack.Screen name="WholesalerRegister" component={WholesalerRegisterScreen} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <AuthStack />;
  }

  if (user?.role === 'WHOLESALER') {
    return <WholesalerDrawer />;
  }

  return <ConsumerStack />;
}
