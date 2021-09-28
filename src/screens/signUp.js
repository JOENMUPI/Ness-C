import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    ToastAndroid, 
    TouchableOpacity, 
    Alert, 
    ActivityIndicator,
} from 'react-native';

import { Icon, CheckBox } from 'react-native-elements'

import Field from '../components/Field';
import Http from '../components/Http';

import { SignUpStyles } from '../styles/signUp';
import * as basicColors from '../styles/basic';


const MAX_STEP = 3;
const USER_BLANK = {
    name: '',
    email: '', 
    phoneNumber: '',
    phoneNumberId: '',
    password: '', 
    passwordOperation: '',
}


const SignUp = ({ navigation }) => { 
    const [user, setUser] = useState(USER_BLANK);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [vissiblePassFlag, setVissiblePassFlag] = useState(false);
    
    let emailInput = '';

    const toast = (message) => { 
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.TOP
        );
    }

    const handleButton = async () => {
        switch(step) {
            case 1:
                (user.phoneNumber.length < 10)
                ? Alert.alert('Hey!', 'Numero inferior a 10 digitos no compatible!')
                : checkfield('number');
                break;
            
            case 2:
                (!Field.checkFields([ user.email, user.name ])) 
                ? Alert.alert('campos vacios!', 'por favor, rellene los campos correspondientes.')
                : (!/^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i.test(user.email))
                ? Alert.alert('Error de sintaxis', 'El email no cumple la sintaxis de email.')
                : checkfield('email');
                break;
                
            case 3:
                (!Field.checkFields([ user.password ])) 
                ? Alert.alert('Error en clave', 'asegurese que cumpla con todos los requeriminetos')
                : (!Field.checkPass(user.password)) 
                ? Alert.alert('Hey!', 'La clave no cumple los requerimientos minimos')
                : submitSignUp();
                break;
                
            default:
                Alert.alert('Error on handleButton')
                break;
        }
    }
    
    const submitSignUp = async () => {
        setLoading(true); 
        const data = await Http.send('POST', 'user/singup', user, null);

        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');
            
        } else { 
            switch(data.typeResponse) { 
                case 'Success':  
                    toast(data.message);
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

    const checkfield = async (type) => {
        setLoading(true); 
        let data;

        (type == 'number')
        ? data = await Http.send('POST', 'phone/check', { phoneNumber: user.phoneNumber })
        : data = await Http.send('POST', `user/check/${type}`, { email: user.email });
        
        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');
            
        } else { 
            switch(data.typeResponse) { 
                case 'Success':
                    toast(data.message);
                    
                    switch(type) {
                        case 'number':
                            const userAux = { ...user, phoneNumberId: data.body.phoneId };
                            
                            setUser(userAux);
                            setStep(step + 1);
                            break;   

                        case 'email':
                            setStep(step + 1);
                            break;
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
        
        if(step != 3) {
            setLoading(false);
        }
    }


    return (
        <View style={SignUpStyles.container}>
            <Text style={SignUpStyles.title}>
               Registro
            </Text>
            <Text style={SignUpStyles.subtitle}>
                Introduce los datos requeridos ({step}/{MAX_STEP})
            </Text>
            {
                (step == 2)
                ? <View>
                    <View style={SignUpStyles.section}>
                        <Icon name='person-outline' color='gray' type='ionicon' size={20} />
                        <TextInput
                            placeholder="Nombre"
                            blurOnSubmit={false}
                            style={SignUpStyles.textInput}
                            onChangeText={text => setUser({ ...user, name: text })}
                            onSubmitEditing={() => emailInput.focus()}
                            value={user.name}
                        />
                    </View>
                    <View style={SignUpStyles.section}>
                        <Icon name='at-outline' color='gray' type='ionicon' size={20} />
                        <TextInput
                            ref={input => emailInput = input}
                            placeholder="Email"
                            autoCapitalize="none"
                            keyboardType={'email-address'}
                            style={SignUpStyles.textInput}
                            onChangeText={email => setUser({ ...user, email: email })}
                            onSubmitEditing={handleButton}
                            value={user.email}
                        />
                    </View>    
                </View>
                : (step == 3)    
                ? <View>
                    <View style={SignUpStyles.sectionForText}>
                        <Text style={SignUpStyles.textInput}>
                            La clave debe poseer una logitud mayor a 7 ademas de contener mayusculas, minusculas y caracteres especiales en ella! 
                        </Text>
                    </View>
                    <View style={[ SignUpStyles.section, { justifyContent: 'space-between' } ]}>
                        <View style={SignUpStyles.viewPass}>
                            <Icon name='lock-closed-outline' color='gray' type='ionicon' size={20} />
                            <TextInput
                                placeholder="Clave"
                                autoCapitalize="none"
                                blurOnSubmit={false}
                                style={SignUpStyles.textInput}
                                secureTextEntry={!vissiblePassFlag}
                                onChangeText={password => setUser({ ...user, password: password })}
                                onSubmitEditing={handleButton}
                                value={user.password}
                            />
                        </View>
                        <CheckBox
                            containerStyle={SignUpStyles.eye}
                            checkedIcon={<Icon name='eye-outline' color='gold' type='ionicon' size={20}/>}
                            uncheckedIcon={<Icon name='eye-off-outline' color='grey' type='ionicon' size={20}/>}
                            checked={vissiblePassFlag}
                            onPress={() => setVissiblePassFlag(!vissiblePassFlag)}
                        />
                    </View>
                </View>
                : <View>
                <View style={SignUpStyles.section}>
                    <Icon name='phone-portrait-outline' color='gray' type='ionicon' size={20} />
                    <Text style={SignUpStyles.code}>+58</Text>
                    <TextInput
                        maxLength={10}
                        placeholder="Numero telefonico"
                        keyboardType='numeric'
                        blurOnSubmit={false}
                        style={SignUpStyles.textInput}
                        onChangeText={(phoneNumber) => setUser({ ...user, phoneNumber })}
                        onSubmitEditing={handleButton}
                        value={user.phoneNumber}
                    />
                </View>
            </View>
            } 
            <TouchableOpacity
                onPress={handleButton} 
                style={ SignUpStyles.signIn }
                >
                {
                    (loading) 
                    ? <ActivityIndicator size="small" color={basicColors.THEME_COLOR_SEC} /> 
                    : <Text style={SignUpStyles.textSignIn}>
                        { 
                            (step < MAX_STEP)
                            ? 'Siguiente'
                            : 'Finalizar'
                        }
                    </Text>
                }
            </TouchableOpacity>
            {
                (step == 1)
                ? null
                : <View style={SignUpStyles.signUp}>
                    <Text style={SignUpStyles.subtitle}>
                        Deseas cambiar algo en pasos anteriores?
                    </Text>
                    <TouchableOpacity onPress={() => setStep(step - 1)}>
                        <Text style={SignUpStyles.textSignUp}>
                            Vuelva atras
                        </Text>
                    </TouchableOpacity>
                </View>
            }
            <View style={SignUpStyles.signUp}>
                <Text style={SignUpStyles.subtitle}>
                    Ya posee cuenta?
                </Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={SignUpStyles.textSignUp}>
                        Ingresa aqui
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default SignUp;