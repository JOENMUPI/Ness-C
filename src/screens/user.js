import React, { useState, useEffect } from 'react';
import { 
    Alert, 
    ActivityIndicator, 
    StyleSheet,  
    Text, 
    TextInput, 
    ToastAndroid, 
    TouchableOpacity, 
    View,
    ScrollView,
    RefreshControl,
    Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon, CheckBox } from 'react-native-elements';

import Http from '../components/Http';
import Field from '../components/Field';
import HeaderC from '../components/Header';
import * as BasicColors from '../styles/basic';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs();

const OLD_USER_BLANK = {
    id: 0,
    phone: 'numero...',
    name: 'nombre...',
    email: 'email...'
}

const NEW_USER_BLANK = {
    id: 0,
    phone: '',
    name: '',
    email: ''
}

const NEW_PASS_BLANK = { 
    oldPassword: '', 
    newPassword: '',
    flag1: false,
    flag2: false, 
}

const user = ({ navigation }) => { 
    const [loading, setLoading] = useState({ loading: false, refresh: false });
    const [oldUSer, setOldUser] = useState(OLD_USER_BLANK);
    const [newUSer, setNewUser] = useState(NEW_USER_BLANK);
    const [newPass, setNewPass] = useState(NEW_PASS_BLANK);
    const [modal, setModal] = useState(false);

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
                { text: "Si", onPress: okAction }
            ], { cancelable: false }
        );
    }

    const refreshMe = async () => { 
        const user = JSON.parse(await AsyncStorage.getItem('user')); 
        
        getNumUser(user.id).then(res => {
            setOldUser({ ...user, phone: res });
            setLoading({ ...loading, refresh: false });
        });
    } 

    const handlerModalButton = () => {
        if(!Field.checkPass(newPass.newPassword)) {
            Alert.alert('Disculpe', 'La nueva clave cumple con los requerimientos minimos.');
        
        } else {
            if(!Field.checkPass(newPass.oldPassword)) {
                Alert.alert('Disculpe', 'La antigua clave cumple con los requerimientos minimos.');
            
            } else {
                sendData('PUT', 'user/pass', newPass);
                setNewPass(NEW_PASS_BLANK);
                setModal(false);
            }
        }
    }

    const updateField = (type) => {
        switch(type) {
            case 'Nombre':
                sendData('PUT', 'user/field', { type: 'name', data: newUSer.name });
                setOldUser({ ...oldUSer, name: newUSer.name });
                break;
            
            case 'Email':
                sendData('PUT', 'user/field', { type: 'email', data: newUSer.email });
                setOldUser({ ...oldUSer, email: newUSer.email });
                break;
            
            case 'Numero de contacto':
                sendData('PUT', 'user/field', { type: 'phone', data: newUSer.phone });
                setOldUser({ ...oldUSer, phone: newUSer.phone });
                break;
            
            default:
                Alert.alert('Error', `Default de updateField por '${type}'`);
                break;
        }
    }

    const getNumUser = async(userId) => {
        setLoading({ ...loading, refresh: true });
        const token = await AsyncStorage.getItem('token'); 
        const data = await Http.send('GET', `user/phoneNumber/${userId}`, null, token); 
        
        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');
            return ''; 

        } else { 
            switch(data.typeResponse) {
                case 'Success': 
                   toast(data.message);
                   return data.body.phone;
                    
                case 'Fail':
                    data.body.errors.forEach(element => {
                        toast(element.text);
                    });
                    return '';

                default:
                    Alert.alert(data.typeResponse, data.message);
                    return ''; 
            }    
        }
    }

    const sendData = async(type, url, body) => {
        setLoading({ ...loading, loading: true });
        const token = await AsyncStorage.getItem('token'); 
        const data = await Http.send(type, url, body, token); 
        
        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');

        } else { 
            switch(data.typeResponse) {
                case 'Success': 
                    toast(data.message);
                   
                    if(url == 'user/field' && (body.type == 'name' || body.type == 'email' )) {
                        await AsyncStorage.setItem('token', data.body.token); 
                        await AsyncStorage.setItem('user', JSON.stringify(data.body.user));
                    }

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

        setLoading({ ...loading, loading: false });
    }

    const checkField = (type) => {
        let newFieldAux;
        let oldFieldAux;

        switch(type) {
            case 'Nombre':
                newFieldAux = newUSer.name;
                oldFieldAux = oldUSer.name;
                break;
            
            case 'Numero de contacto':
                newFieldAux = newUSer.phone;
                oldFieldAux = oldUSer.phone;
                break;

            case 'Email':
                newFieldAux = newUSer.email;
                oldFieldAux = oldUSer.email;
                break;

            default:
                Alert.alert('Error', `Default de checkField por ${type}`); 
                break;
        }
        
        if(newFieldAux) {
            if(Field.checkFields([ newFieldAux ])) {
                if(oldFieldAux == newFieldAux) {
                    toast(`${type} exactamente igual al antiguo.`);  
    
                } else {
                    if(type == 'Email') {
                        if(!Field.checkEmail(newFieldAux)) {
                            Alert.alert('Disculpe', `El nuevo email '${newFieldAux}' no posee un formato soportado por la app.`);
                        
                        } else {
                            alerButtom(
                                'Entonces...', 
                                `Desea cambiar ${oldFieldAux} por ${newFieldAux}?`,
                                () => updateField(type),
                            );
                        }
                    
                    } else if (type == 'Numero de contacto') {
                        if(newFieldAux.length < 10) {
                            Alert.alert('Disculpe', 'Numero inferior a 10 digitos no compatible');
                             
                        } else {
                            alerButtom(
                                'Entonces...', 
                                `Desea cambiar ${oldFieldAux} por ${newFieldAux}?`,
                                () => updateField(type),
                            );
                        }
                    } else {
                        alerButtom(
                            'Entonces...', 
                            `Desea cambiar ${oldFieldAux} por ${newFieldAux}?`,
                            () => updateField(type),
                        );
                    }
                }
            } else {
                Alert.alert('Disculpe', 'No se aceta campos vacios')
            }
        }
    }

    useEffect(() => {  
        refreshMe(); 
    }, []);
    
    return (
        <View style={userStyle.container}>
            <Modal
                animationType="slide"
                transparent
                visible={modal}
                onRequestClose={() => setModal(false)}
                >
                <View style={userStyle.centeredView}>
                    <View style={userStyle.modalView}>
                        <Text style={{ ...userStyle.textInput, fontSize: 20 }}>
                            Cambio de clave
                        </Text>
                        <View style={userStyle.sectionForText}>
                            <Text style={{ ...userStyle.textInput, color: 'gray' }}>
                                La clave debe poseer una logitud mayor a 7 ademas de contener mayusculas, minusculas y caracteres especiales en ella! 
                            </Text>
                        </View>
                        <View style={{ ...userStyle.input, ...userStyle.viewRow, backgroundColor: 'lightgray' }}>
                            <TextInput
                                style={{ color: 'gray', width: '80%' }}
                                autoCapitalize="none"
                                secureTextEntry={!newPass.flag1}
                                blurOnSubmit={false}
                                placeholder='Antigua clave'
                                value={newPass.oldPassword}
                                onChangeText={oldPassword => setNewPass({ ...newPass, oldPassword })}
                                onSubmitEditing={() => newPassRef.focus() }
                            />
                            <CheckBox
                                checkedIcon={<Icon name='eye-outline' color={BasicColors.THEME_COLOR_SEC} type='ionicon' size={20}/>}
                                uncheckedIcon={<Icon name='eye-off-outline' color='grey' type='ionicon' size={20}/>}
                                checked={newPass.flag1}
                                onPress={() => setNewPass({ ...newPass, flag1: !newPass.flag1 })}
                            />
                        </View>
                        <View style={{ ...userStyle.input, ...userStyle.viewRow, backgroundColor: 'lightgray' }}>
                            <TextInput
                                style={{ color: 'gray', width: '80%' }}
                                autoCapitalize="none"
                                secureTextEntry={!newPass.flag2}
                                placeholder='Nueva clave'
                                value={newPass.newPassword}
                                onChangeText={newPassword => setNewPass({ ...newPass, newPassword })}
                                onSubmitEditing={handlerModalButton}
                            />
                            <CheckBox
                                checkedIcon={<Icon name='eye-outline' color={BasicColors.THEME_COLOR_SEC} type='ionicon' size={20}/>}
                                uncheckedIcon={<Icon name='eye-off-outline' color='grey' type='ionicon' size={20}/>}
                                checked={newPass.flag2}
                                onPress={() => setNewPass({ ...newPass, flag2: !newPass.flag2 })}
                            />
                        </View>
                        <TouchableOpacity
                            style={userStyle.button} 
                            onPress={handlerModalButton}
                            disabled={loading.loading}
                            >
                            {
                                (loading.loading)
                                ? <ActivityIndicator size="small" color={BasicColors.THEME_COLOR_SEC} />
                                : <Text style={userStyle.textButton}>
                                    Listo!
                                </Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <HeaderC 
                title='Ajustes'
                leftIconAction={() => navigation.goBack()}
                cartAction={()=> navigation.navigate('Cart')}
            />
            <View style={userStyle.body}>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={loading.refresh}
                            onRefresh={refreshMe}
                        />
                    }
                    >
                    <View>
                        <Text style={userStyle.textInput}>
                            Nombre 
                        </Text>
                        <View style={userStyle.input}>
                            <TextInput
                                style={{ color: 'gray', width: '100%' }}
                                placeholder={oldUSer.name}
                                value={newUSer.name}
                                onChangeText={name => setNewUser({ ...newUSer, name })}
                                onEndEditing={() => setNewUser({ ...newUSer, name: '' })}
                                onSubmitEditing={() => checkField('Nombre') }
                            />
                        </View>
                    </View>
                    <View>
                        <Text style={userStyle.textInput}>
                            Email 
                        </Text>
                        <View style={userStyle.input}>
                            <TextInput
                                style={{ color: 'gray', width: '100%' }}
                                placeholder={oldUSer.email}
                                value={newUSer.email}
                                onChangeText={email => setNewUser({ ...newUSer, email })}
                                onEndEditing={() => setNewUser({ ...newUSer, email: '' })}
                                onSubmitEditing={() => checkField('Email') }
                            />
                        </View>
                    </View>
                    <View>
                        <Text style={userStyle.textInput}>
                            Numero de contacto 
                        </Text>
                        <View style={{ ...userStyle.input, ...userStyle.viewRow }}>
                            <Text style={{ color: 'gray', paddingRight: 10 }}>
                                +58
                            </Text>
                            <TextInput
                                style={{ color: 'gray', width: '100%' }}
                                maxLength={10}
                                keyboardType='numeric'
                                placeholder={oldUSer.phone}
                                value={newUSer.phone}
                                onChangeText={phone => setNewUser({ ...newUSer, phone })}
                                onEndEditing={() => setNewUser({ ...newUSer, phone: '' })}
                                onSubmitEditing={() => checkField('Numero de contacto') }
                            />
                        </View>
                    </View>
                    <TouchableOpacity
                        style={{ ...userStyle.button, width: '50%' }}
                        onPress={() => setModal(true)}
                        >
                        <Text style={userStyle.textButton}>
                            Cambio de clave
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </View>
    )
}

export default user;

const userStyle = StyleSheet.create({
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

    textInput: {
        color: BasicColors.THEME_COLOR_SEC, 
        marginTop: '3%', 
        fontWeight:'bold' 
    },

    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },

    modalView: {
        margin: '5%',
        backgroundColor: "white",
        borderRadius: 20,
        padding: '5%',
        alignItems: "center",
        elevation: 5
    },

    input: {
        padding: '3%',
        backgroundColor: 'white', 
        borderRadius: 5,  
        marginTop: '3%'
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

    sectionForText: {
        paddingHorizontal: 15,
        paddingTop: 10,
    },

    viewRow: {
        flexDirection: 'row',
        alignItems: 'center' 
    },
})