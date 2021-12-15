import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import SignUp from './src/screens/signUp';
import SignIn from './src/screens/signIn';
import Menu from './src/screens/menu';
import Deposit from './src/screens/deposit';
import Directions from './src/screens/myDiretions';
import NewDirection from './src/screens/newDirection';
import MyEnterprises from './src/screens/myEnterprises';
import NewEnterprise from './src/screens/newEnterprise';
import AdminEnterprise from './src/screens/adminEnterprise';
import NewBank from './src/screens/newBank';
import Withdraw from './src/screens/withdraw';
import NewHourDay from './src/screens/newHourDay';
import NewProduct from './src/screens/newProduct';
import Enterprise from './src/screens/enterprise';
import User from './src/screens/user';
import Cart from './src/screens/cart';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="SignIn" 
        screenOptions={{ headerShown: false }}
        >  
        <Stack.Screen name="SignIn" component={SignIn}/>
        <Stack.Screen name="SignUp" component={SignUp}/>
        <Stack.Screen name="Deposit" component={Deposit}/>
        <Stack.Screen name="Directions" component={Directions}/>
        <Stack.Screen name="NewDirection" component={NewDirection}/>
        <Stack.Screen name="MyEnterprises" component={MyEnterprises}/>
        <Stack.Screen name="NewEnterprise" component={NewEnterprise}/>
        <Stack.Screen name="AdminEnterprise" component={AdminEnterprise}/>
        <Stack.Screen name="NewBank" component={NewBank}/>
        <Stack.Screen name="Withdraw" component={Withdraw}/>
        <Stack.Screen name="NewHourDay" component={NewHourDay}/>
        <Stack.Screen name="NewProduct" component={NewProduct}/>
        <Stack.Screen name="Enterprise" component={Enterprise}/>
        <Stack.Screen name="User" component={User}/>
        <Stack.Screen name="Cart" component={Cart}/>
        <Stack.Screen name="Menu" component={Menu}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}