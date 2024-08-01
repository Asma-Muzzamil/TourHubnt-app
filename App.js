import React from 'react';
import Login from './src/components/Login';
import Signup from './src/components/Signup';
import SplashScreen from './src/components/SplashScreen';
import { NavigationContainer } from '@react-navigation/native';
import { NativeBaseProvider } from 'native-base';
import { StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './src/components/BottomTabNavigator';
import Process from './src/components/Process'; // Import the Process screen
import Payment from './src/components/Payment'; // Import the Process screen
import { StripeProvider } from '@stripe/stripe-react-native';
const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <StripeProvider
      publishableKey="pk_test_51PTpmjCkJ4KnT2mzXnQabDhCkG8YIILUzxMB7MUKNmTZX9ZFc3qhYjHWJicoLrhBtzLVCH6noR7jiCxRQ23PXkQq00aiPWyaCi"
    >
      <NativeBaseProvider>
        <NavigationContainer>
          <StatusBar backgroundColor="#FFFFFF" />
          <Stack.Navigator>
            <Stack.Screen name="SplashScreen" component={SplashScreen}
              options={{
                headerShown: false,
                navigationBarColor: '#FFFFFF'
              }} />
            <Stack.Screen name="Signup" component={Signup}
              options={{
                headerShown: false,
                navigationBarColor: '#FFFFFF'
              }} />
            <Stack.Screen name="Login" component={Login}
              options={{
                headerShown: false,
                navigationBarColor: '#FFFFFF'
              }} />

            <Stack.Screen name="MainTab" component={BottomTabNavigator} options={{ headerShown: false, navigationBarColor: '#143E56' }} />
            <Stack.Screen
              name="Process"
              component={Process}
              options={{
                headerShown: false
              }}
            />
            <Stack.Screen name="Payment" component={Payment}
              options={{
                headerShown: false
              }} />
          </Stack.Navigator>
        </NavigationContainer>
      </NativeBaseProvider>
    </StripeProvider>
  );
};

export default App;

