import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Login from './src/screens/Login';
import CameraScreen from './src/screens/CameraScreen';
import NutritionScreen from './src/screens/NutritionScreen';
import { Linking } from 'react-native';

const Stack = createStackNavigator();

function App() {
  const [initialRoute, setInitialRoute] = useState("Login");

  useEffect(() => {
    const handleDeepLink = (event) => {
      let data = Linking.parse(event.url);
      if (data.queryParams && data.queryParams.user) {
        let user = JSON.parse(decodeURIComponent(data.queryParams.user));
        setInitialRoute("CameraScreen");
      }
    };

    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    Linking.addEventListener('url', handleDeepLink);

    return () => {
      Linking.removeEventListener('url', handleDeepLink);
    };
  }, []);

  return (
    <>
      <StatusBar hidden={true} />
      <NavigationContainer initialRouteName={initialRoute}>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="CameraScreen" component={CameraScreen} />
            <Stack.Screen name="NutritionScreen" component={NutritionScreen} />
          </Stack.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
