import React from 'react';
import { View, Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';

import { Colors, FontFamily, FontSize } from '@theme/tokens';

// Screens
import HomeScreen from '@screens/HomeScreen';
import ContactDetailScreen from '@screens/ContactDetailScreen';
import AddTransactionScreen from '@screens/AddTransactionScreen';
import AddContactScreen from '@screens/AddContactScreen';
import SplitScreen from '@screens/SplitScreen';
import SplitBillScreen from '@screens/SplitBillScreen';
import SplitGroupScreen from '@screens/SplitGroupScreen';
import SplitLoanScreen from '@screens/SplitLoanScreen';
import SettingsScreen from '@screens/SettingsScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  ContactDetail: { contactId: string; contactName: string };
  AddTransaction: { contactId?: string; contactName?: string };
  AddContact: undefined;
  Split: undefined;
  SplitBill: undefined;
  SplitGroup: undefined;
  SplitLoan: undefined;
  Settings: undefined;
};

export type TabParamList = {
  Home: undefined;
  Contacts: undefined;
  Split: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({
  name,
  focused,
  ionName,
}: {
  name?: string;
  focused: boolean;
  ionName?: string;
}) {
  const color = focused ? Colors.primary : Colors.mutedLight;
  if (ionName) {
    return <Ionicons name={ionName as any} size={22} color={color} />;
  }
  return <MaterialIcons name={name as any} size={22} color={color} />;
}

function BottomTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor:
            Platform.OS === 'ios' ? 'transparent' : 'rgba(255,255,255,0.94)',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              tint="light"
              style={{
                flex: 1,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                overflow: 'hidden',
                borderTopWidth: 0,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.06,
                shadowRadius: 16,
              }}
            />
          ) : null,
        tabBarLabelStyle: {
          fontFamily: FontFamily.bodySemiBold,
          fontSize: 10,
          marginTop: 2,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.mutedLight,
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

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: Colors.surface },
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
