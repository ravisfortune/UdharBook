import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { FontFamily } from '@theme/tokens';
import { useTheme } from '@theme/ThemeContext';
import { useAuthStore } from '@store/useAuthStore';

// Screens — Main
import HomeScreen from '@screens/HomeScreen';
import ContactDetailScreen from '@screens/ContactDetailScreen';
import AddTransactionScreen from '@screens/AddTransactionScreen';
import AddContactScreen from '@screens/AddContactScreen';
import SplitScreen from '@screens/SplitScreen';
import SplitBillScreen from '@screens/SplitBillScreen';
import SplitGroupScreen from '@screens/SplitGroupScreen';
import SplitLoanScreen from '@screens/SplitLoanScreen';
import SettingsScreen from '@screens/SettingsScreen';
import ReportsScreen from '@screens/ReportsScreen';
import UpgradeScreen from '@screens/UpgradeScreen';

// Screens — Auth
import PhoneScreen from '@screens/PhoneScreen';
import OTPScreen from '@screens/OTPScreen';
import GuestSetupScreen from '@screens/GuestSetupScreen';

// ─── Param lists ──────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Phone: undefined;
  OTP: { phone: string };
  GuestSetup: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  ContactDetail: { contactId: string; contactName: string };
  AddTransaction: { contactId?: string; contactName?: string; defaultType?: 'gave' | 'received' };
  AddContact: undefined;
  Split: undefined;
  SplitBill: undefined;
  SplitGroup: undefined;
  SplitLoan: undefined;
  Settings: undefined;
  Upgrade: undefined;
};

export type TabParamList = {
  Home: undefined;
  Contacts: undefined;
  Split: undefined;
  Reports: undefined;
  Settings: undefined;
};

// ─── Stacks ───────────────────────────────────────────────────────────────────

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// ─── Tab icon helper ──────────────────────────────────────────────────────────

// ─── Tab icon helper ──────────────────────────────────────────────────────────

function TabIcon({ name, focused, ionName }: { name?: string; focused: boolean; ionName?: string }) {
  const { colors } = useTheme();
  const color = focused ? colors.primary : colors.mutedLight;
  if (ionName) return <Ionicons name={ionName as any} size={22} color={color} />;
  return <MaterialIcons name={name as any} size={22} color={color} />;
}

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const tabs = [
    { name: 'Home',     icon: 'home',        label: t('nav.home') },
    { name: 'Contacts', icon: 'people',      label: t('nav.contacts') },
    { name: 'Split',    icon: 'call-split',  label: t('nav.split') },
    { name: 'Reports',  icon: 'bar-chart',   label: t('nav.reports') },
    { name: 'Settings', icon: 'settings',    label: t('nav.settings') },
  ];

  return (
    <View style={[
      tabBarStyle.bar,
      {
        paddingBottom: insets.bottom || 6,
        backgroundColor: colors.cardBg,
        shadowColor: colors.primary,
        borderTopColor: colors.border,
      },
    ]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const tab = tabs[index];
        const color = focused ? colors.primary : colors.mutedLight;

        return (
          <TouchableOpacity
            key={route.key}
            style={tabBarStyle.item}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            <MaterialIcons name={tab.icon as any} size={22} color={color} />
            <Text style={[tabBarStyle.label, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabBarStyle = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    elevation: 8,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
    gap: 3,
  },
  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
  },
});

// ─── Bottom tabs ──────────────────────────────────────────────────────────────

function BottomTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('nav.home'),
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactDetailScreen}
        options={{
          tabBarLabel: t('nav.contacts'),
          tabBarIcon: ({ focused }) => (
            <TabIcon name="people" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Split"
        component={SplitScreen}
        options={{
          tabBarLabel: t('nav.split'),
          tabBarIcon: ({ focused }) => (
            <TabIcon name="call-split" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarLabel: t('nav.reports'),
          tabBarIcon: ({ focused }) => (
            <TabIcon name="bar-chart" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t('nav.settings'),
          tabBarIcon: ({ focused }) => (
            <TabIcon ionName={focused ? 'settings' : 'settings-outline'} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Auth navigator ───────────────────────────────────────────────────────────

function AuthNavigator() {
  const { colors } = useTheme();
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.surfaceLowest },
      }}
    >
      <AuthStack.Screen name="Phone" component={PhoneScreen} />
      <AuthStack.Screen name="OTP" component={OTPScreen} />
      <AuthStack.Screen name="GuestSetup" component={GuestSetupScreen} />
    </AuthStack.Navigator>
  );
}

// ─── Main navigator ───────────────────────────────────────────────────────────

function MainNavigator() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.surface },
      }}
    >
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      <Stack.Screen
        name="ContactDetail"
        component={ContactDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
      <Stack.Screen
        name="AddContact"
        component={AddContactScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
      <Stack.Screen
        name="Split"
        component={SplitScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="SplitBill"
        component={SplitBillScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="SplitGroup"
        component={SplitGroupScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="SplitLoan"
        component={SplitLoanScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Upgrade"
        component={UpgradeScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

// ─── Root navigator — switches based on auth session ─────────────────────────

export default function AppNavigator() {
  const session = useAuthStore((s) => s.session);
  const isGuest = useAuthStore((s) => s.isGuest);

  const isLoggedIn = !!session || isGuest;

  return (
    <NavigationContainer>
      {isLoggedIn ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
