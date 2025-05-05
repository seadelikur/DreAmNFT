// navigation/MainNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeNavigator from './HomeNavigator';
import MarketplaceNavigator from './MarketplaceNavigator';
import ProfileNavigator from './ProfileNavigator';
import Colors from '../constants/Colors';
import RecordDreamScreen from '../screens/RecordDreamScreen';
import DreamStationsNavigator from './DreamStationsNavigator';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarStyle: { paddingBottom: 5 }
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeNavigator}
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home" size={26} color={color} />
        }}
      />
      <Tab.Screen
        name="Record"
        component={RecordDreamScreen}
        options={{
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="microphone" size={26} color={color} />
        }}
      />
      <Tab.Screen
        name="MarketplaceTab"
        component={MarketplaceNavigator}
        options={{
          title: 'Market',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="store" size={26} color={color} />
        }}
      />
      <Tab.Screen
        name="StationsTab"
        component={DreamStationsNavigator}
        options={{
          title: 'Stations',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="radio" size={26} color={color} />
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account" size={26} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}