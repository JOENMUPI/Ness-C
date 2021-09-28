import React, { useState } from 'react';
import { 
    Alert, 
    ActivityIndicator, 
    StyleSheet,  
    Text, 
    ToastAndroid, 
    TouchableOpacity, 
    ScrollView,
    View
} from 'react-native';
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckBox } from 'react-native-elements';

import Http from '../components/Http';
import HeaderC from '../components/Header';

import * as BasicColors from '../styles/basic';

const MAX_STEP = 2;

const NewHourDay = ({ navigation, route }) => { 
    const [loading, setLoading] = useState(false);
    const [json, setJson] = useState(route.params.data); 
    const [step, setStep] = useState(1);
    const [dateFlag, setDateFlag] = useState({ open: false, close: false });

    const toast = (message) => { 
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.TOP
        );
    }

    const handleButton = () => {
        if(step == 1) {
            setStep(step + 1);

        } else {
            const aux = json.days.filter(i => i.flag == true);
                
            (aux.length < 1) 
            ? Alert.alert('Disculpe', 'Debe elegir como minimo un dia de trabajo para su negocio.')
            : submitHourDay();
        }
    }

    const handlePicker = (date) => { 
        if(date) {
            const dateAux = date.timestamp.toString().split(' ')[4].split(':').splice(0,2).join(':');
            
            (dateFlag.open)
            ? setJson({ ...json, openHour: dateAux })
            : setJson({ ...json, closeHour: dateAux })

            setDateFlag({ open: false, close: false });  
        } 
    }

    const checkBoxAction = (item) => {
        const aux = json.days.map(day => {   
            if(day.name == item.name) { 
                return { ...item, flag: !item.flag }; 
            
            } else { 
                return day 
            }
        });

        setJson({ ...json, days: aux });
    }

    const submitHourDay = async () => {
        setLoading(true); 
        const token = await AsyncStorage.getItem('token'); 
        const body = { ...json, enterpriseId: route.params.enterpriseId }
        const data = await Http.send('PUT', 'enterprise/hour', body, token);

        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');
            
        } else { 
            switch(data.typeResponse) { 
                case 'Success':  
                    toast(data.message);
                    route.params.callBack(json);
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

        setLoading(false);
    }

    const CheckBoxItemC = ({ item, action }) => (
        <TouchableOpacity 
            onPress={action}
            style={NHDStyles.viewRow}
            >
            <CheckBox
                checked={item.flag}
                onPress={action}
            />
            <Text style={{ color: 'gray', fontWeight: 'bold' }}>
                {item.name}   
            </Text>
        </TouchableOpacity>
    )
    
    return (
        <View style={NHDStyles.container}>
            {
                (dateFlag.open || dateFlag.close) && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={new Date()}
                        mode='time'
                        is24Hour={true}
                        isplay="spinner"
                        onChange={e => handlePicker(e.nativeEvent)}
                        onTouchCancel={() => setDateFlag({ open: false, close: false })}
                    />
                )
            }
            <HeaderC 
                title='Horarios laborales'
                leftIconAction={() => navigation.goBack()}
                cartAction={()=> alert('envia a carrito')}
            />
            <View style={NHDStyles.body}>
                <ScrollView>
                    <View style={NHDStyles.viewCenter}>
                        <Text style={NHDStyles.textInput}>
                            Introduce los datos requeridos ({step}/{MAX_STEP})
                        </Text>  
                    </View>
                    {
                        (step == 1)
                        ? <View>
                            <Text style={NHDStyles.textInput}>
                                Hora deseada para comenzar a recibir pedidos   
                            </Text>
                            <TouchableOpacity 
                                style={NHDStyles.input}
                                onPress={() => setDateFlag({ ...dateFlag, open: true })}
                                >
                                <Text style={{ color: 'gray' }}>
                                    {json.openHour}
                                </Text>
                            </TouchableOpacity>
                            <Text style={NHDStyles.textInput}>
                                Hora deseada para dejar de recibir pedidos
                            </Text>
                            <TouchableOpacity
                                style={NHDStyles.input}
                                onPress={() => setDateFlag({ ...dateFlag, close: true })}
                                >
                                <Text style={{ color: 'gray' }}>
                                    {json.closeHour}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        : <View>
                            <Text style={NHDStyles.textInput}>
                                Cuales dias de la semana trabajas?
                            </Text>
                            {
                                json.days.map((item, index) => (
                                    <CheckBoxItemC
                                        key={index}
                                        item={item}
                                        action={() => checkBoxAction(item)}
                                    />
                                ))
                            }
                        </View>
                    }
                    <TouchableOpacity
                        style={NHDStyles.button}
                        onPress={handleButton}
                        >     
                        {
                            (loading) 
                            ? <ActivityIndicator size="small" color={BasicColors.THEME_COLOR_SEC} /> 
                            : <Text style={NHDStyles.textButton}>
                                {
                                    (step == MAX_STEP) 
                                    ? 'Finalizar'
                                    : 'Siguiente'
                                }
                            </Text>
                        }
                    </TouchableOpacity>
                    {
                        (step == 1)
                        ? null
                        : <View style={NHDStyles.viewTextBack}>
                            <Text style={{ color: 'gray' }}>
                                Deseas cambiar algo en pasos anteriores?
                            </Text>
                            <TouchableOpacity onPress={() => setStep(step - 1)}>
                                <Text style={{ color: BasicColors.THEME_COLOR_SEC }}>
                                    {' Vuelva atras'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    }
                </ScrollView>
            </View>
        </View>
    )
}

export default NewHourDay;

const NHDStyles = StyleSheet.create({
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

    viewCenter: {
        alignItems:'center',
        justifyContent: 'center'
    },

    viewRow: {
        alignItems: "center",
        flexDirection: 'row'
    },

    input: {
        marginTop: '3%', 
        padding: '3%',
        backgroundColor: 'white', 
        borderRadius: 5  
    },

    textInput: {
        color: BasicColors.THEME_COLOR_SEC, 
        marginTop: '3%', 
        fontWeight:'bold' 
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

    viewTextBack: {
        marginTop: '3%',
        flexDirection: "row",
        justifyContent: "center"  
    },
});