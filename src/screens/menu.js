import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerContentScrollView, DrawerItem  } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from 'react-native-elements';

import * as BasicColors from '../styles/basic';

import Home from './home';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs();

const SIZE = 20;
const NEUTRAL_THEME_COLOR = 'gray';
const USER_BLANK = {
    name: '',
}

const Drawer = createDrawerNavigator();

const  Menu = ({ navigation }) => {
    const [me, setMe] = useState(USER_BLANK);
    

    const getMee = async () => {
        return JSON.parse(await AsyncStorage.getItem('user'));
    }

    const DrawerItemC = ({ iconName, label, action, style }) => (
        <DrawerItem
            labelStyle={styles.labelItem}
            style={style}
            label={label}
            onPress={action}
            icon={() => 
                <Icon 
                    color={NEUTRAL_THEME_COLOR} 
                    size={SIZE} 
                    name={iconName} 
                    type='ionicon'
                />
            }
        />
    )

    const DrawerContentC = (props) => {
        const goTo = (name) => {
            props.navigation.toggleDrawer(); 
            navigation.navigate(name);
        }
        return (
            <View style={styles.container}>
                <DrawerContentScrollView {...props}>
                    <View style={styles.userView}>
                        <Text style={{ ...styles.labelItem, color: 'white', textAlign: 'center' }}>
                            {me.name}
                        </Text>
                    </View>
                    <DrawerItemC
                        iconName='cash'
                        label='Recarga de saldo'
                        action={() => goTo('Deposit')}
                    />
                    <DrawerItemC
                        iconName='compass'
                        label='Mis direcciones'
                        action={() => goTo('Directions')}
                    />
                    <DrawerItemC
                        iconName='basket'
                        label='mis pedidos'
                        action={() => navigation.navigate('Cart')}
                    />
                    <DrawerItemC
                        iconName='briefcase'
                        label='Mis negocios'
                        action={() => goTo('MyEnterprises')}
                    />
                    <DrawerItemC
                        iconName='settings'
                        label='Ajustes'
                        action={() => goTo('User')}
                    />
                    <DrawerItemC
                        iconName='log-out'
                        label='Cerrar sesion'
                        action={() => navigation.goBack()}
                    />
                </DrawerContentScrollView>
            </View>
        );
    }

    useEffect(() => {  
        getMee().then(res => setMe(res)); 
    }, []);

    return (
        <Drawer.Navigator
            initialRouteName="Home"
            screenOptions={{ headerShown: false, drawerStyle: styles.drawer }}
            drawerContent={(props) => <DrawerContentC {...props}  /> }
            > 
            <Drawer.Screen name="Principal" component={Home} />
        </Drawer.Navigator>
    );
}

export default Menu;

export const styles = StyleSheet.create({
    container: {        
        flex: 1,
        paddingHorizontal: '3%'
    },

    userView: { 
        elevation: 3, 
        backgroundColor: BasicColors.THEME_COLOR_MAIN, 
        marginVertical: '1%', 
        borderRadius: 10, 
        padding: '3%' 
    },

    drawer: {},

    labelItem: {
        textAlign: 'right',
        fontWeight: 'bold', 
        fontSize: SIZE, 
        color: NEUTRAL_THEME_COLOR 
    }
});