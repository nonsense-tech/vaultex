import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import DepositScreen from '../screens/DepositScreen';

const config = Platform.select({
  web: { headerMode: 'screen' },
  default: {},
});

const HomeStack = createStackNavigator(
  {
    Home: HomeScreen,
  },
  config
);

HomeStack.navigationOptions = {
  tabBarLabel: 'Wallet',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-wallet`
          : 'md-wallet'
      }
    />
  ),
};

HomeStack.path = '';

const DepositStack = createStackNavigator(
  {
    Settings: DepositScreen,
  },
  config
);

DepositStack.navigationOptions = {
  tabBarLabel: 'Deposit',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-code-download' : 'md-code-download'} />
  ),
};

DepositStack.path = '';

const tabNavigator = createBottomTabNavigator({
  HomeStack,
  DepositStack,
});

tabNavigator.path = '';

export default tabNavigator;
