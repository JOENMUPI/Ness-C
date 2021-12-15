import React, { useState, useEffect } from 'react';
import { 
    Alert, 
    ActivityIndicator, 
    StyleSheet,  
    Text, 
    TextInput, 
    TouchableOpacity, 
    ToastAndroid,
    ScrollView,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Http from '../components/Http';
import HeaderC from '../components/Header';
import Field from '../components/Field';
import ModalListC from '../components/ModalSearchList';
import MapViewC from '../components/MapViewBasic';
import * as BasicColors from '../styles/basic';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs();

const MAX_STEP = 2;
const DIRECTION_BLANK = {
    locationId: 0,
    stateId: 0,
    stateName: '',
    cityId: 0,
    cityName: '',
    locationName: '',
    locationDescription: '',
    coordinate: {
        latitude: 0.00,
        longitude: 0.00
    }
}

const NewDirection = ({ navigation, route }) => { 
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [modal, setmodal] = useState({ type: '', flag: false });
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(
        (route.params.type == 'update')
        ? route.params.data 
        : DIRECTION_BLANK
    );

    let detailInput = '';

    const toast = (message) => { 
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.TOP
        );
    }

    const handleCityButton = () => {
        (direction.stateId == 0)
        ? Alert.alert('Debe elegir un estado primero')
        : setmodal({ type: 'Ciudad', flag: true });
    }

    const handleModalItem = (item) => {
        if(modal.type == 'Estado') {
            const aux = {
                ...direction, 
                stateName: item.name, 
                stateId: item.id,
                cityId: 0,
                cityName: ''
            }

            setDirection(aux);
            setCities(item.cities);
        
        } else { 
            setDirection({ ...direction, cityId: item.id, cityName: item.name, coordinate: item.coordinate });
        }

        setmodal({ ...modal, flag: false });
    }

    const handleButton = () => { 
        switch(step) {
            case 1: 
                const aux = [ 
                    direction.locationDescription, 
                    direction.locationName, 
                    direction.cityName, 
                    direction.stateName 
                ];  

                (!Field.checkFields(aux)) 
                ? Alert.alert('campos vacios!', 'por favor, rellene los campos correspondientes.')
                : setStep(step + 1);
                break;

            case 2:
                if(route.params.type == 'enterprise') {
                    route.params.callBack(direction);
                    navigation.goBack(); 
                
                } else {
                    sendDirection(); 
                }
                break;
                
            default:
                Alert.alert('Error on handleButton')
                break;
        }
    }

    const getStates = async () => { 
        const data = await Http.send('GET', 'state', null, null); 
        
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
    
    const sendDirection = async () => { 
        setLoading(true);
        const typeAux = (route.params.type == 'update') ? 'PUT' :'POST'
        const token = await AsyncStorage.getItem('token');
        let endpoint;

        (route.params.type == 'update') 
        ? endpoint = 'direction'
        : endpoint = 'direction/user';
        
        const data = await Http.send(typeAux, endpoint, direction, token); 
        
        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');

        } else { 
            switch(data.typeResponse) {
                case 'Success': 
                    toast(data.message);
                    let aux

                    (route.params.type == 'update') 
                    ? aux = direction
                    : aux = { ...direction, locationId: data.body.id }
                    
                    route.params.callBack(aux, route.params.type);
                    
                    navigation.goBack(); 
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

    useEffect(() => {  
        getStates().then(res => {  
            if(route.params.type != 'create') {
                const aux = res.forEach(state => {
                    if(state.id == direction.stateId) {
                        setCities(state.cities); 
                    }
                });
            }

            setStates(res) ;
        });
    }, []);

    return (
        <View style={newDirectionStyles.container}>
            <HeaderC 
                title={(route.params.type == 'update') ? 'Editar direccion' : 'Nueva direccion'}
                leftIconAction={() => navigation.goBack()}
                cartAction={() => navigation.navigate('Cart')}
            />
            <ModalListC       
                vissible={modal.flag}
                tittle={modal.type}
                onCancel={() => setmodal({ ...modal, flag: false })}
                onPressItem={handleModalItem.bind(this)}
                data={
                    (modal.type == 'Estado')
                    ? states
                    : cities
                }
            />
            <View style={newDirectionStyles.body}>
                <View style={newDirectionStyles.viewCenter}>
                    <Text style={newDirectionStyles.textInput}>
                        Introduce los datos requeridos ({step}/{MAX_STEP})
                    </Text>  
                </View>
                {
                    (step == 1)
                    ? <ScrollView>
                        <TouchableOpacity
                            style={[ newDirectionStyles.viewRow, newDirectionStyles.input ]}
                            onPress={()=> setmodal({ type: 'Estado', flag: true })}
                            >
                            <Text style={{ ...newDirectionStyles.textInput, marginTop: 0 }}>
                                Estado: 
                            </Text>
                            <Text style={newDirectionStyles.responseButton}>
                                {direction.stateName}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[ newDirectionStyles.viewRow, newDirectionStyles.input ]}
                            onPress={handleCityButton}
                            >
                            <Text style={{ ...newDirectionStyles.textInput, marginTop: 0 }}>
                                Ciudad: 
                            </Text>
                            <Text style={newDirectionStyles.responseButton}>
                                {direction.cityName}
                            </Text>
                        </TouchableOpacity>
                        <View>
                            <Text style={newDirectionStyles.textInput}>
                                Direccion:  
                            </Text>
                            <View style={newDirectionStyles.input}>
                                <TextInput
                                    placeholder="ej: calle 15 con av. 13..."
                                    blurOnSubmit={false}
                                    onChangeText={text => setDirection({ ...direction, locationName: text })}
                                    onSubmitEditing={() => detailInput.focus()}
                                    value={direction.locationName}
                                    />
                            </View>
                        </View>
                        <View>
                            <Text style={newDirectionStyles.textInput}>
                                Detalles:  
                            </Text>
                            <View style={newDirectionStyles.input}>
                                <TextInput
                                    ref={ref => detailInput = ref }
                                    placeholder="ej: casa roja con cerca amarilla..."
                                    blurOnSubmit={false}
                                    onChangeText={text => setDirection({ ...direction, locationDescription: text })}
                                    onSubmitEditing={handleButton}
                                    value={direction.locationDescription}
                                    />
                            </View>
                        </View>   
                    </ScrollView>
                    : <View style={{ width:'100%', height: '80%' }}>
                        <View style={newDirectionStyles.viewCenter}>
                            <Text style={newDirectionStyles.textInput}>
                                Para una mayor presicion, pon el pin en la zona de tu direccion
                            </Text>
                        </View> 
                        <MapViewC
                            markDescription={direction.locationDescription}
                            markTitle={direction.locationName}
                            getCoor={coordinate => setDirection({ ...direction, coordinate })}
                            coordinate={{
                                ...direction.coordinate,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            }}
                        />
                        <View style={newDirectionStyles.viewTextBack}>
                            <Text style={{ color: 'gray' }}>
                                Deseas cambiar algo en pasos anteriores?
                            </Text>
                            <TouchableOpacity onPress={() => setStep(step - 1)}>
                                <Text style={{ color: BasicColors.THEME_COLOR_SEC }}>
                                    {' Vuelva atras'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View> 
                }
                <TouchableOpacity
                    style={newDirectionStyles.button}
                    onPress={handleButton}
                    >     
                    {
                        (loading) 
                        ? <ActivityIndicator size="small" color={BasicColors.THEME_COLOR_SEC} /> 
                        : <Text style={newDirectionStyles.textButton}>
                            {
                                (step == MAX_STEP) 
                                ? 'Finalizar'
                                : 'Siguiente'
                            }
                        </Text>
                    }
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default NewDirection;

const newDirectionStyles = StyleSheet.create({
    container: {        
        flex: 1,
        backgroundColor: 'white',
    },

    body: {
        flex: 1,
        paddingHorizontal: '3%',
        backgroundColor: BasicColors.BACKGROUND_COLOR,
        elevation: 10,
        borderTopEndRadius: 10,
        borderTopStartRadius: 10,
    },

    viewTextBack: {
        marginTop: '3%',
        flexDirection: "row",
        justifyContent: "center"  
    },

    responseButton: {
        color:'gray', 
        paddingLeft: '2%' 
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

    button: {
        marginVertical: '3%',
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: BasicColors.THEME_COLOR_MAIN,
        borderRadius: 5,
        padding: '3%',
        elevation: 2
    },

    textButton: {
        color: "white",
        fontWeight: "bold",
    },

    textInput: {
        color: BasicColors.THEME_COLOR_SEC, 
        marginTop: '3%', 
        fontWeight:'bold' 
    },

    modalItemText: {
        color: 'gray', 
        fontWeight:'bold', 
        fontSize: 20 
    },

    input: {
        marginTop: '3%', 
        padding: '3%',
        backgroundColor: 'white', 
        borderRadius: 5  
    },

    viewTextBack: {
        marginTop: '3%',
        flexDirection: "row",
        justifyContent: "center"  
    },
})