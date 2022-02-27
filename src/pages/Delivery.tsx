import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import Complete from './Complete';
import Ing from './Ing';

const Stack = createNativeStackNavigator();

function Delivery() {
  return (
    <Stack.Navigator
      initialRouteName="Ing"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Ing" component={Ing} />
      <Stack.Screen name="Complete" component={Complete} />
    </Stack.Navigator>
  );
}

export default Delivery;
