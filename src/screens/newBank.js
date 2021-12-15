import React, { useState, useEffect } from 'react';
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
import { Icon } from 'react-native-elements';

import Http from '../components/Http';
import HeaderC from '../components/Header';
import ModalListC from '../components/ModalSearchList';
import Field from '../components/Field';

import * as BasicColors from '../styles/basic';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs();

const COUNT_BANK_BLANK = {
    bankId: 0,
    titularId: '',
    titularName: '',
    bankName: '',
    countNum: ''
}

const newBank = ({ navigation, route }) => { 
    const [loading, setLoading] = useState({ main: false, bank: false });
    const [banks, setBanks] = useState([]);
    const [bank, setBank] = useState(COUNT_BANK_BLANK);
    const [modal, setModal] = useState(false);

    let bankNumInput = '';
    let titutlarIdInput = '';

    const toast = (message) => { 
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.TOP
        );
    }

    const handleButton = () => {
        if (!Field.checkFields([ bank.countNum, bank.titularName, bank.bankName, bank.titularId ])) {
            Alert.alert('Disculpe', 'Introduzca todos los datos requeridos para continuar.')

        } else {
            (bank.countNum.length < 20)
            ? Alert.alert('Disculpe', 'el numero debe poseer 20 digitos')
            : sendNewBank();
        }
    }

    const handleModalItem = (item) => {
        setBank({ ...bank, bankId: item.id, bankName: item.name });
        setModal(false);
    }

    const sendNewBank = async () => {
        setLoading({ ...loading, main: true });
        const token = await AsyncStorage.getItem('token'); 
        let body;
        
        (route.params.type == 'enterprise')
        ? body = { ...bank, enterpriseId: route.params.enterpriseId }
        : vody = bank;
        
        const data = await Http.send('Post', `bank/${route.params.type}`, body, token); 

        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');

        } else { 
            switch(data.typeResponse) {
                case 'Success': 
                    toast(data.message);
                    route.params.callBack({ ...bank, countBankId: data.body.id }) 
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

        setLoading({ ...loading, main: false });
    }

    const getBanks = async () => {
        setLoading({ ...loading, bank: true });
        const data = await Http.send('GET', 'bank', null, null); 

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

    useEffect(() => {  
        getBanks().then(res => { 
            setBanks(res)
            setLoading({ ...loading, bank: false }); 
        });
    }, []);

    return (
        <View style={newBankStyle.container}>
            <ModalListC       
                vissible={modal}
                tittle='Bancos'
                onCancel={() => setModal(false)}
                onPressItem={handleModalItem.bind(this)}
                data={banks}
            />
            <HeaderC 
                title='Nueva cuenta bancaria'
                leftIconAction={() => navigation.goBack()}
                cartAction={()=> navigation.navigate('Cart')}
            />
            <View style={newBankStyle.body}>
            {
                (loading.bank)
                ? <ActivityIndicator size="large" color={BasicColors.THEME_COLOR_SEC}/>
                : <ScrollView>
                    <View style={newBankStyle.viewCenter}>
                        <Text style={newBankStyle.textInput}>
                            Introduce los datos requeridos!
                        </Text>  
                    </View>
                    <View>
                        <Text style={newBankStyle.textInput}>
                            Banco:
                        </Text>
                        <TouchableOpacity
                            style={newBankStyle.input}
                            onPress={() => setModal(true)}
                            >
                            <Text style={{ color: 'gray' }}>
                                {
                                    (bank.bankId == 0)
                                    ? 'Busca un banco'
                                    : bank.bankName
                                }
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Text style={newBankStyle.textInput}>
                            Nombre del tituar:
                        </Text>
                        <View style={newBankStyle.input}>
                            <TextInput
                                placeholder="Javier bermudez..."
                                blurOnSubmit={false}
                                onChangeText={titularName => setBank({ ...bank, titularName })}
                                onSubmitEditing={() => titutlarIdInput.focus()}
                                value={bank.titularName}
                            />
                        </View>
                    </View>
                    <View>
                        <Text style={newBankStyle.textInput}>
                            Identificacion del titular:
                        </Text>
                        <View style={newBankStyle.input}>
                            <TextInput
                                ref={ref => titutlarIdInput = ref}
                                placeholder="V-24921844..."
                                    keyboardType='numeric'
                                blurOnSubmit={false}
                                onChangeText={titularId => setBank({ ...bank, titularId })}
                                onSubmitEditing={() => bankNumInput.focus()}
                                value={bank.titularId}
                            />
                        </View>
                    </View>
                    <View>
                        <Text style={newBankStyle.textInput}>
                            Numero de cuenta:
                        </Text>
                        <View style={newBankStyle.input}>
                            <TextInput
                                ref={ref => bankNumInput = ref}
                                placeholder="0134654682225..."
                                maxLength={20}
                                keyboardType='numeric'
                                blurOnSubmit={false}
                                onChangeText={countNum => setBank({ ...bank, countNum })}
                                onSubmitEditing={handleButton}
                                value={bank.countNum}
                            />
                        </View>
                    </View>
                    <TouchableOpacity
                        style={newBankStyle.button}
                        onPress={handleButton}
                        >     
                        {
                            (loading.main) 
                            ? <ActivityIndicator size="small" color={BasicColors.THEME_COLOR_SEC} /> 
                            : <Text style={newBankStyle.textButton}>
                                Guardar cuenta
                            </Text>
                        }
                    </TouchableOpacity>
                </ScrollView>
            }
            </View>
        </View>
    )
}

export default newBank;

const newBankStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },

    body: {
        flex: 1,
        paddingHorizontal: '3%',
        justifyContent: "center",
        backgroundColor: BasicColors.BACKGROUND_COLOR,
        elevation: 10,
        borderTopEndRadius: 10,
        borderTopStartRadius: 10,
    },

    viewCenter: {
        alignItems:'center',
        justifyContent: 'center'
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
})