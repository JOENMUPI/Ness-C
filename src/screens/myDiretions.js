import React, { useState, useEffect } from 'react';
import { 
    Alert, 
    ActivityIndicator, 
    StyleSheet,  
    Text, 
    TouchableOpacity, 
    ToastAndroid,
    RefreshControl,
    ScrollView,
    View
} from 'react-native';
import { Icon, ListItem } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Http from '../components/Http';
import HeaderC from '../components/Header';
import * as BasicColors from '../styles/basic';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs();

const MyDirections = ({ navigation }) => { 
    const [directions, setDirections] = useState([]);
    const [loading, setLoading] = useState(false);

    const toast = (message) => { 
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.TOP
        );
    }

    const alerButtom = (title, description, okAction) => {
        return Alert.alert(
            title, 
            description,
            [
                { text: "No", style: "cancel" }, 
                { text: "Si", onPress: okAction}
            ], { cancelable: false }
        );
    }

    const deleteDirection = (item) => {
        const newDiretions = directions.filter(i => i != item);

        setDirections(newDiretions);
        sendData('DELETE', `direction/user/${item.locationId}`, null);
    }
    
    const getDirections = async () => { 
        setLoading(true);
        const token = await AsyncStorage.getItem('token'); 
        const data = await Http.send('GET', 'direction/user', null, token); 
        
        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');
            return [];

        } else { 
            switch(data.typeResponse) {
                case 'Success': 
                    toast(data.message); 
                    return data.body; 
                    
                case 'Fail':
                    data.body.errors.forEach(element => {
                        toast(element.text);
                    });
                    return [];

                default:
                    Alert.alert(data.typeResponse, data.message);
                    return [];
            }    
        }
    }

    const sendData = async (type, endpoint, body) => {
        const token = await AsyncStorage.getItem('token'); 
        const data = await Http.send(type, endpoint, body, token);
    
        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');

        } else {
            switch(data.typeResponse) {
                case 'Success':
                    toast(data.message);
                    break;
    
                case 'Fail':
                    data.body.errors.forEach(element => {
                        toast(element.text);
                    });
                    break;
                    
                default:
                    Alert.alert(data.typeResponse, data.message);
                    break;
            }
        }
    } 

    const callBack = (data, type) => { 
        let directionsAux = directions;

        switch(type) {
            case 'create':
                directionsAux.push(data); 
                break;
            
            case 'update': 
                directionsAux = directions.map(direction => { 
                    if(direction.locationId == data.locationId) { 
                        return data;
                    }
        
                    return direction;
                });
                break;
            
            default:
                Alert.alert('Error en tipo de callback');
                break;
        } 
        
        setDirections([ ...directionsAux ]);
    }

    const refresh = () => {
        getDirections().then(res => {
            setDirections(res);
            setLoading(false); 
        });
    }

    useEffect(() => {  
        refresh();
    }, []);

    return (
        <View style={directionsStyles.container}>
            <HeaderC 
                title='Mis direcciones'
                leftIconAction={() => navigation.goBack()}
                cartAction={()=> navigation.navigate('Cart')}
            />
            <View style={directionsStyles.body}>
                {
                    (loading)
                    ? <ActivityIndicator size="large" color={BasicColors.THEME_COLOR_SEC} /> 
                    : (directions.length < 1)
                    ? <View style={{ ...directionsStyles.viewCenter, height: '90%' }}>
                        <Text style={directionsStyles.noDataTex}>No posee direciones</Text>
                    </View> 
                    : <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={loading}
                                onRefresh={refresh}
                            />
                        }
                        >
                        {
                            directions.map((item, index) => (
                                <ListItem 
                                    style={{ marginBottom: 10 }} 
                                    key={index} 
                                    bottomDivider
                                    >
                                    <View style={{ ...directionsStyles.viewRow, justifyContent: 'space-between', width: '100%' }}>
                                        <TouchableOpacity
                                            style={{ width: '90%' }}
                                            onPress={() => 
                                                navigation.navigate('NewDirection', { 
                                                    callBack: callBack.bind(this),
                                                    type: 'update', 
                                                    data: item
                                                })
                                            }
                                            >
                                            <Text style={directionsStyles.tittleItem}>
                                                {`${item.locationName}, ${item.cityName}, ${item.stateName}`}
                                            </Text>
                                            <Text style={{ color: 'gray' }}>
                                                {item.locationDescription} 
                                            </Text> 
                                        </TouchableOpacity>
                                        <Icon 
                                            color={'gray'} 
                                            size={30} 
                                            name={'close'} 
                                            type='ionicon'
                                            onPress={() => 
                                                alerButtom('Hey!', 
                                                `Seguro que quiere eliminar ${item.locationName}?`,
                                                () => deleteDirection(item))
                                            }
                                        />
                                    </View>
                                </ListItem>  
                            ))
                        }
                    </ScrollView>
                }
                {
                    (loading)
                    ? null
                    : <View>
                        <TouchableOpacity
                            style={directionsStyles.newDirection}
                            onPress={() => 
                                navigation.navigate('NewDirection', { 
                                    callBack: callBack.bind(this),
                                    type: 'create', 
                                    data: null
                                })
                            }
                            >
                            <Text style={directionsStyles.textDirection}>
                                Crear nueva direccion
                            </Text>
                        </TouchableOpacity>
                    </View>
                }
            </View>
        </View>
    )
}

export default MyDirections; 
    

const directionsStyles = StyleSheet.create({
    container: {        
        flex: 1,
        backgroundColor: 'white',
    },

    fill: { 
        width: '100%' 
    },

    tittleItem: { 
        color:BasicColors.THEME_COLOR_SEC, 
        fontWeight: "bold", 
        fontSize: 20 
    },

    body: {
        flex: 1,
        padding: '3%',
        backgroundColor: BasicColors.BACKGROUND_COLOR,
        elevation: 10,
        justifyContent: 'center', 
        borderTopEndRadius: 10,
        borderTopStartRadius: 10,

    },

    viewCenter: {
        alignItems:'center',
        justifyContent: 'center'
    },

    viewRow: {
        alignItems: "center",
        flexDirection: 'row'
    },

    noDataTex: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'lightgray'
    },

    newDirection: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: BasicColors.THEME_COLOR_MAIN,
        borderRadius: 5,
        padding: '3%',
        elevation: 2
    },

    textDirection: {
        color: "white",
        fontWeight: "bold",
    },
})