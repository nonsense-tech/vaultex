import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import WyreScreen from '../screens/WyreScreen';
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
  tabBarLabel: 'Home',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  ),
};

HomeStack.path = '';

const WyreStack = createStackNavigator(
  {
    Wyre: WyreScreen,
  },
  config
);

WyreStack.navigationOptions = {
  tabBarLabel: 'Wyre',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-link' : 'md-link'} />
  ),
};

WyreStack.path = '';

const DepositStack = createStackNavigator(
  {
    Settings: DepositScreen,
  },
  config
);

DepositStack.navigationOptions = {
  tabBarLabel: 'Deposit',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-options' : 'md-options'} />
  ),
};

DepositStack.path = '';

const tabNavigator = createBottomTabNavigator({
  HomeStack,
  DepositStack,
  WyreStack,
});

tabNavigator.path = '';

export default tabNavigator;
