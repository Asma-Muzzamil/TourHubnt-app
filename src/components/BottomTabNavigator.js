import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faBoxesPacking, faCalendar, faUser } from '@fortawesome/free-solid-svg-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from './Home';
import TourPackage from './TourPackage';
import BookingScreen from './Booking';
import AccountScreen from './Account';
const Tab = createBottomTabNavigator();


const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: 'gray',
        tabBarInactiveTintColor: 'white',
        tabBarStyle: { backgroundColor: '#143E56', height: "10%" },
        tabBarLabelStyle: {
          marginBottom: 13,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? faHome : faHome;
          } else if (route.name === 'TourPackages') {
            iconName = focused ? faBoxesPacking : faBoxesPacking;
          } else if (route.name === 'BookedPackages') {
            iconName = focused ? faCalendar : faCalendar;
          } else if (route.name === 'Account') {
            iconName = focused ? faUser : faUser;
          }
          return <FontAwesomeIcon icon={iconName} size={23} color={color} style={{ marginTop: 10 }} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false
        }}
      />
      <Tab.Screen
        name="TourPackages"
        component={TourPackage}
        options={{
          headerShown: false
        }}
      />
      <Tab.Screen
        name="BookedPackages"
        component={BookingScreen}
        options={{
          headerShown: false
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          headerShown: false
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

