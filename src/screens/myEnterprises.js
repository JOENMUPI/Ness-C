import React, { useState } from 'react';
import { 
    Alert, 
    ActivityIndicator, 
    StyleSheet,  
    Text, 
    TextInput, 
    ToastAndroid, 
    TouchableOpacity, 
    ScrollView,
    View
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon, CheckBox } from 'react-native-elements';

import Http from '../components/Http';
import HeaderC from '../components/Header';
import Field from '../components/Field';

import * as BasicColors from '../styles/basic';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs();

const abortController = new AbortController();

const MyEnterprises = ({ navigation }) => { 
    const [loading, setLoading] = useState(false);
    const [vissiblePassFlag, setVissiblePassFlag] = useState(false);
    const [code, setCode] = useState('');

    const toast = (message) => { 
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.TOP
        );
    }

    const handlerCode = async () => {
        if(!Field.checkFields([ code ])) {
            Alert.alert('Codigo vacio', 'Ingrese su codigo de empresa para continuar');
            
        } else {
            if(loading) {
                abortController.abort();
            }

            sendCode();
        }
    }
    
    const handleNewEnterprise = () => {
        if(loading) {
            abortController.abort();
            setLoading(false);
        }

        navigation.navigate("NewEnterprise");
    }

    const goBack = () => {
        if(loading) {
            abortController.abort();
            setLoading(false);
        }

        navigation.goBack();
    }

    const sendCode = async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem('token'); 
        const data = await Http.send('POST', 'enterprise/code', { code: code }, token, abortController.signal);
       
        if(!data) {
            Alert.alert('Error', 'El servidor no responde');
            
        } else { 
            switch(data.typeResponse) {
                case 'Success':  
                    toast(data.message); 
                    setCode('');
                    navigation.navigate('AdminEnterprise', { enterprise: data.body });
                    break;
            
                case 'Fail':
                    data.body.errors.forEach(element => {
                        ToastAndroid.showWithGravity(
                            element.text,
                            ToastAndroid.SHORT,
                            ToastAndroid.TOP
                        );
                    });
                    break;

                default:
                    Alert.alert(data.typeResponse, data.message);
                    break;
            }
        }

        setLoading(false);
    }

    return (
        <View style={MEStyles.container}>
            <HeaderC 
                title='Mis negocios'
                leftIconAction={goBack}
                cartAction={()=> navigation.navigate('Cart')}
            />
            <View style={MEStyles.body}>
                <ScrollView>
                    <View style={{ marginBottom: '3%' }}>
                        <Text style={MEStyles.firstText}>
                            Todos los usuarios pueden enviar solicitud para 
                            registrar sus negocios en la plataforma.
                        </Text>
                        <Text style={MEStyles.text}>
                            Cada administrador tiene un codigo unico valido 
                            solo con el usuario por negocio. 
                        </Text>
                        <Text style={MEStyles.text}>
                            Si desea ingresar a un negocio introduzca la 
                            clave empresarial que valida al usuario con el negocio como un 
                            administrador legitimo del mismo.   
                        </Text>
                    </View>
                    <View style={MEStyles.section}>
                        <View style={{ flexDirection: 'row' }}>
                            <Icon name='lock-closed-outline' color='gray' type='ionicon' size={20} />
                            <TextInput
                                placeholder="Clave Empresarial"
                                autoCapitalize="none"
                                blurOnSubmit={false}
                                style={MEStyles.textInput}
                                secureTextEntry={!vissiblePassFlag}
                                onChangeText={code => setCode(code)}
                                onSubmitEditing={handlerCode}
                                value={code}
                            />
                        </View>
                        <CheckBox
                            containerStyle={MEStyles.eye}
                            checkedIcon={<Icon name='eye-outline' color='gold' type='ionicon' size={20}/>}
                            uncheckedIcon={<Icon name='eye-off-outline' color='grey' type='ionicon' size={20}/>}
                            checked={vissiblePassFlag}
                            onPress={() => setVissiblePassFlag(!vissiblePassFlag)}
                        />
                    </View>
                </ScrollView>
                <TouchableOpacity 
                    onPress={handlerCode} 
                    style={MEStyles.button}
                    >
                    {
                        (loading) 
                        ? <ActivityIndicator size="small" color={BasicColors.THEME_COLOR_SEC} /> 
                        : <Text style={MEStyles.textButton}>
                            Comprobar codigo
                        </Text>
                    }
                </TouchableOpacity>
                <View style={MEStyles.viewNew}>
                    <Text style={{ ...MEStyles.text, marginTop: 0 }}>
                        ¿No posee negocios registados y desea ser parte? 
                    </Text>
                    <TouchableOpacity onPress={handleNewEnterprise}>
                        <Text style={MEStyles.textNewEnterprise}>    
                            Solicitelo aqui
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default MyEnterprises;

const MEStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },

    body: {
        flex: 1,
        padding: '3%',
        backgroundColor: BasicColors.BACKGROUND_COLOR,
        elevation: 10,
        borderTopEndRadius: 10,
        borderTopStartRadius: 10,
    },

    eye: {
        marginLeft: '-10%'
    },

    section: {
        flexDirection: "row",
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 15,
        paddingVertical: 10,
        justifyContent: 'space-between',
        alignItems: "center",
        marginTop: 10
    },

    text: {
        color: 'gray', 
        marginTop: '3%'
    },

    text2: {
        color: "gray",
        textAlign: "center"
    },

    firstText: {
        color: BasicColors.THEME_COLOR_SEC, 
        fontWeight: 'bold', 
        marginTop: '3%'
    },

    textNewEnterprise: {
        paddingLeft: '1%',
        color: BasicColors.THEME_COLOR_MAIN,
        textAlign: "center"
    },

    textInput: {    
        width: '90%', 
        color: "gray",
        paddingLeft: 10
    },

    viewNew: {
        alignItems: 'center',
        flexDirection: "row",
        justifyContent: "center",
        marginTop: '7%',
    },

    button: {
        alignItems: "center",
        backgroundColor: BasicColors.THEME_COLOR_MAIN,
        borderRadius: 5,
        padding: '3%',
        justifyContent: "center",
        marginTop: '7%',
        elevation: 2
    },

    textButton: {
        color: "white",
        fontWeight: "bold",
    },
})