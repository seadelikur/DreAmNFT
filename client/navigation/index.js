// navigation/index.js
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppContext } from '../AppContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

export default function Navigation() {
  const { userState } = useContext(AppContext);

  return (
    <NavigationContainer>
      {userState.isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}