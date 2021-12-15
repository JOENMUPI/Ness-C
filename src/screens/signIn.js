import Field from '../components/Field';
import Http from '../components/Http';

import React, { useState } from 'react';
import { 
    Alert, 
    ActivityIndicator, 
    Text, 
    TextInput, 
    ToastAndroid, 
    TouchableOpacity, 
    View
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from 'react-native-elements';
import { SignInStyles } from '../styles/signIn';
import * as BasicColors from '../styles/basic';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs();

const USER_BLANK = { email: '', password: '' }

const SignIn = ({ navigation }) => { 
    const [user, setUser] = useState(USER_BLANK);
    const [loading, setLoading] = useState(false);

    let passInput = '';
    const abortController = new AbortController();

    const handleSingIn = () => {
        if(!Field.checkFields([ user.email, user.password ])) {
            Alert.alert('Campos vacios!', 'Ingrese su email y contraseña para continuar');
            
        } else {
            if (!Field.checkEmail(user.email)) {
                Alert.alert('Hey!','El email con cumple el formato de un correo electronico');
            
            } else {
                if(loading) {
                    abortController.abort();
                }

                sendData();
            }
        }
    }

    const handleSingUp = () => {
        if(loading) {
            abortController.abort();
            setLoading(false);
        }

        navigation.navigate("SignUp");
    }

    const sendData = async () => {
        setLoading(true);
        const data = await Http.send('POST', 'user/singin', user, null, abortController.signal);
        
        if(!data) {
            Alert.alert('Error', 'El servidor no responde');
            
        } else { 
            switch(data.typeResponse) {
                case 'Success':  
                    await AsyncStorage.setItem('token', data.body.token); 
                    await AsyncStorage.setItem('user', JSON.stringify(data.body.user)); 
                    setUser(USER_BLANK);
                    navigation.navigate('Menu'); 
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
        <View style={SignInStyles.container}>
            <View style={SignInStyles.body}>
                <Text style={SignInStyles.title}>
                    Iniciar sesión
                </Text>
                <Text style={{ color: 'gray' }}>
                    Ingresa tu email y clave 
                </Text>
                <View>
                    <View style={SignInStyles.section}>
                        <Icon name='at-outline' color='gray' type='ionicon' size={20} />
                        <TextInput
                            autoCapitalize="none"
                            autoFocus
                            blurOnSubmit={false}
                            keyboardType={'email-address'}
                            onChangeText={email => setUser({ ...user, email })}
                            onSubmitEditing={() => passInput.focus()}
                            placeholder="Email"
                            value={user.email}
                            style={SignInStyles.textInput}
                        />
                    </View>
                    <View style={SignInStyles.section}>
                        <Icon name='lock-closed-outline' color='gray' type='ionicon' size={20} />
                        <TextInput
                            autoCapitalize="none"
                            onChangeText={password => setUser({ ...user, password })}
                            onSubmitEditing={handleSingIn}
                            placeholder="clave"
                            ref={input => passInput = input}
                            secureTextEntry
                            value={user.password}
                            style={SignInStyles.textInput}
                        />
                    </View>
                </View>
                <TouchableOpacity 
                    onPress={handleSingIn} 
                    style={SignInStyles.signIn}
                    >
                    {
                        (loading) 
                        ? <ActivityIndicator size="small" color={BasicColors.THEME_COLOR_SEC} /> 
                        : <Text style={SignInStyles.textSignIn}>
                            Iniciar sesión
                        </Text>
                    }
                </TouchableOpacity>
                <View style={SignInStyles.signUp}>
                    <Text style={SignInStyles.textSignUp}>
                        ¿No posee cuenta? 
                    </Text>
                    <TouchableOpacity onPress={handleSingUp}>
                        <Text 
                            style={[ 
                                SignInStyles.textSignUp, 
                                { color: BasicColors.THEME_COLOR_MAIN, marginLeft: '1%' } 
                            ]}>    
                            registrese aqui
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default SignIn;