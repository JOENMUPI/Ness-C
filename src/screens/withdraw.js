import React, { useState, useEffect } from 'react';
import { 
    Alert, 
    ActivityIndicator, 
    Text, 
    StyleSheet,
    TextInput, 
    ToastAndroid, 
    TouchableOpacity, 
    View
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Http from '../components/Http';
import { Icon,  Avatar } from 'react-native-elements';

import HeaderC from '../components/Header';
import ModalSearchC from '../components/ModalSearchList';
import ModalListC from '../components/ModalList';
import Field from '../components/Field';

import * as BasicColors from '../styles/basic';

const WITHDRAW_BLANK = {
    id: 0,
    mountTotransfer: 0.00,
    mountToWithdraw: 0.00,
    status: null,
    mount_date: new Date(),
    diferencial: 4000,
    countBank: {
        countNum: null,
        titularName: '',
        titularId: '',
        countBankId: 0,
        bankName: '',
        bankId: 0,
    },
}

const Withdraw = ({ navigation, route }) => { 
    const [loading, setLoading] = useState({ main: false, history: false, countBank: false });
    const [history, setHistory] = useState([]);
    const [withdraw, setWithdraw] = useState(WITHDRAW_BLANK);
    const [input, setInput] = useState(false);
    const [modal, setmodal] = useState({ type: '', flag: false, history: false });

    let mountInput = '';
    
    const toast = (message) => { 
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.TOP
        );
    }

    const handleModalItem = (item) => { 
        setWithdraw({ ...withdraw, countBank: item });
        setmodal({ ...modal, flag: false });
    }

    const handleButton = () => {
        if(withdraw.mountToWithdraw > route.params.balance) {
            Alert.alert('Disculpe', 'Fondos insuficientes para realizar este retiro');

        } else { 
            (!Field.checkFields([ withdraw.mountToWithdraw ]))
            ? Alert.alert('Disculpe', 'datos para el retiro incompletos')
            : sendWithdraw();    
        }
    }

    const handlerMountToDeposit = () => { 
        let aux, aux2;

        (withdraw.mountToWithdraw > 1)
        ? aux = Number.parseFloat(withdraw.mountToWithdraw).toFixed(2)
        : aux = 1;

        aux2 = Number.parseFloat(aux * withdraw.diferencial).toFixed(2);

        setWithdraw({ ...withdraw, mountToWithdraw: aux, mountTotransfer: aux2 });
        setInput(false);
    }

    const handlerFocusInput = () => {
        setWithdraw({ ...withdraw, mountToWithdraw: 0 });
        setInput(true)
    }

    const getHistory = async () => { 
        setLoading({ ...loading, history: true });
        const token = await AsyncStorage.getItem('token'); 
        const data = await Http.send('GET', `withdraw/${route.params.type}/${route.params.id}`, null, token); 
        
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

    const sendWithdraw = async () => { 
        setLoading({ ...loading, main: true });
        const token = await AsyncStorage.getItem('token'); 
        let body;

        (route.params.type == 'user')
        ? body = null 
        : body = { ...withdraw, enterpriseId: route.params.id } 

        const data = await Http.send('POST', `withdraw/${route.params.type}`, body, token); 
        
        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');
            return [];

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

        setLoading({ ...loading, principal: false });
    }

    const ModalRenderItemCountBankC = ({ item, action }) => (
        <View style={WithdrawtStyles.viewItem}>
            <TouchableOpacity 
                onPress={() => (action) ? action() : handleModalItem(item)}
                style={WithdrawtStyles.item}
                >
                <View>
                    <View style={WithdrawtStyles.viewText}>
                        <Text style={{ ...WithdrawtStyles.textItem, color: 'gray' }}> 
                            {'Banco: '}  
                        </Text>
                        <Text style={WithdrawtStyles.textItem}>
                            {item.bankName}
                        </Text>
                    </View>
                    <View style={WithdrawtStyles.viewText}>
                        <Text style={{ ...WithdrawtStyles.textItem, color: 'gray' }}> 
                            {'Titular: '}  
                        </Text>
                        <Text style={WithdrawtStyles.textItem}>
                            {item.titularName}
                        </Text>
                    </View>
                    <View style={WithdrawtStyles.viewRow}>
                        <Text style={{ ...WithdrawtStyles.textItem, color: 'gray' }}>
                            {'Cuenta: '}
                        </Text>
                        <Text style={WithdrawtStyles.textItem}>
                            {item.countNum}
                        </Text>
                    </View>
                    <View style={WithdrawtStyles.viewRow}>
                        <Text style={{ ...WithdrawtStyles.textItem, color: 'gray' }}>
                            {'Identificacion: '} 
                        </Text>
                        <Text style={WithdrawtStyles.textItem}>
                            {item.titularId}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    )

    const ModalRenderItemHistory = ({ item }) => (
        <View style={WithdrawtStyles.viewItem}>
            <View style={WithdrawtStyles.item}>
                <Text style={WithdrawtStyles.textItem}>
                    {item.countBank.bankName}
                </Text>
                <Text 
                    style={
                        (item.status == undefined)
                        ? { ...WithdrawtStyles.textItem, color: 'gray' }
                        : (item.status)
                        ? { ...WithdrawtStyles.textItem, color: 'green' }
                        : { ...WithdrawtStyles.textItem, color: 'reed' }
                    }
                    > 
                    {
                        (item.status == undefined)
                        ? 'Pendiente'
                        : (item.status)
                        ? 'Apovado'
                        : 'Denegado'
                    }
                </Text>
                <View style={WithdrawtStyles.viewRow}>
                    <Text style={{ ...WithdrawtStyles.ModalListItemText, color: 'gray' }}>
                        Monto retirado:  
                    </Text>
                    <Text style={WithdrawtStyles.ModalListItemText}>
                        $ {item.mountToWithdraw}
                    </Text>    
                </View>
                <View style={WithdrawtStyles.viewRow}>
                    <Text style={{ ...WithdrawtStyles.ModalListItemText, color: 'gray' }}>
                        Monto transferido:  
                    </Text>
                    <Text style={WithdrawtStyles.ModalListItemText}>
                        Bs {item.mountTotransfer}
                    </Text>    
                </View>
                <View style={WithdrawtStyles.viewRow}>
                    <Text style={{ ...WithdrawtStyles.ModalListItemText, color: 'gray' }}>
                       Titutlar:  
                    </Text>
                    <Text style={WithdrawtStyles.ModalListItemText}>
                        {item.countBank.titularName}
                    </Text>    
                </View>
                <View style={WithdrawtStyles.viewRow}>
                    <Text style={{ ...WithdrawtStyles.ModalListItemText, color: 'gray' }}>
                        Identificacion:  
                    </Text>
                    <Text style={WithdrawtStyles.ModalListItemText}>
                        {item.countBank.titularId}
                    </Text>    
                </View>
                <View style={WithdrawtStyles.viewRow}>
                    <Text style={{ ...WithdrawtStyles.ModalListItemText, color: 'gray' }}>
                        Cuenta:  
                    </Text>
                    <Text style={WithdrawtStyles.ModalListItemText}>
                        {item.countBank.countNuma}
                    </Text>    
                </View>
                <View style={WithdrawtStyles.viewRow}>
                    <Text style={WithdrawtStyles.ModalListItemText}>
                        Fecha:  
                    </Text>
                    <Text style={{ ...WithdrawtStyles.ModalListItemText, color: 'gray' }}>
                        {item.mount_date.toString().split('T')[0]}, {item.mount_date.toString().split('T')[1].split('.')[0]}
                    </Text>    
                </View>          
            </View>
        </View>
    )

    useEffect(() => {  
        getHistory().then(res => {
            setHistory(res);
            setLoading({ ...loading, history: false }); 
        });
    }, []);


    return (
        <View style={WithdrawtStyles.container}>
            <HeaderC 
                title='Recarga'
                leftIconAction={() => navigation.goBack()}
                rightIcon='book'
                cartAction={() => setmodal({ ...modal, history: true })}
            />
            <ModalSearchC       
                vissible={modal.flag}
                tittle='Cuenta bancaria'
                onCancel={() => setmodal({ ...modal, flag: false })}
                renderItem={ModalRenderItemCountBankC}
                data={route.params.banks}
            />
            <ModalListC
                tittle='Historial de retiros'
                vissible={modal.history}
                onCancel={() => setmodal({ ...modal, history: false })}
                renderItem={ModalRenderItemHistory}
                data={history}
            />
            <View style={WithdrawtStyles.body}>
                {
                    (withdraw.countBank.countBankId == 0)
                    ? <TouchableOpacity 
                        style={WithdrawtStyles.viewCountType}
                        onPress={() =>
                            (route.params.banks.length < 1)
                            ? Alert.alert('Disculpe', 'Registre una cuenta bancaria primero')
                            : setmodal({ ...modal, flag: true })
                        }
                        >
                        <Text style={WithdrawtStyles.countTypeText}>
                            Cuenta bancaria
                        </Text>
                    </TouchableOpacity>
                    : <ModalRenderItemCountBankC
                        action={() => setmodal({ ...modal, flag: true })}
                        item={withdraw.countBank} 
                    />                
                }
                <View style={WithdrawtStyles.viewBalance}>
                    <View style={{ ...WithdrawtStyles.viewRow, justifyContent: 'space-between' }}>
                        <Text style={{ ...WithdrawtStyles.textButton, fontSize: 20 }}>
                            Balance actual:
                        </Text>
                        <Text style={{ ...WithdrawtStyles.textButton, fontSize: 20 }}>
                            $ {Number.parseFloat(route.params.balance).toFixed(2)}
                        </Text>
                    </View>
                </View>
                {
                    (withdraw.countBank.countBankId == 0)
                    ? null
                    : <View> 
                        <View style={WithdrawtStyles.viewMountToDeposit}> 
                            <Text style={{ color: 'white', fontWeight:'bold' }}>
                                Monto a retirar ($)
                            </Text>
                            <View style={WithdrawtStyles.viewInput}>
                                <View style={WithdrawtStyles.buttonAdd}> 
                                    <Icon
                                        onPress={() => mountInput.focus()} 
                                        name='pencil' 
                                        color='white'
                                        type='ionicon' 
                                        size={20}
                                    />
                                </View>
                                <TextInput
                                    ref={input => mountInput = input} 
                                    onFocus={handlerFocusInput}
                                    keyboardType='numeric'
                                    placeholder='0'
                                    maxLength={(input) ? 7 : 10}
                                    onChangeText={mountToWithdraw => setWithdraw({ ...withdraw, mountToWithdraw })}
                                    onEndEditing={handlerMountToDeposit}
                                    value={String(withdraw.mountToWithdraw)}
                                    style={WithdrawtStyles.textInput}
                                />
                            </View>
                        </View>
                        <View style={{ ...WithdrawtStyles.viewMountToDeposit, backgroundColor: BasicColors.THEME_COLOR_SEC }}>
                            <Text style={{ color: 'white', fontWeight:'bold' }}>
                                Monto que se le transferira (Bs)
                            </Text>
                            <View style={{ flexDirection: 'row-reverse', marginTop: '2%' }}>
                                <Text style={WithdrawtStyles.textInput}>
                                    {withdraw.mountTotransfer} 
                                </Text>
                            </View>
                        </View>
                    </View>    
                }
                <TouchableOpacity 
                    style={WithdrawtStyles.button}
                    onPress={handleButton}
                    >
                    {
                        (loading.main)
                        ? <ActivityIndicator size="small" color={BasicColors.THEME_COLOR_SEC} />
                        : <Text style={WithdrawtStyles.textButton}>
                            Finalizar retiro
                        </Text>
                    }
                </TouchableOpacity>        
            </View>
        </View>
    )
}

export default Withdraw;

const WithdrawtStyles = StyleSheet.create({
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

    viewItem: {
        padding: '2%',
        width: '100%',
        backgroundColor: BasicColors.BACKGROUND_COLOR,
    },

    avatar: {
        borderRadius: 10, 
        marginRight: '3%', 
        elevation: 2, 
        backgroundColor: BasicColors.THEME_COLOR_MAIN 
    },

    item: {
        paddingVertical: '1%',
        backgroundColor: 'white' , 
        borderRadius: 10, 
        paddingHorizontal: '3%',
        paddingVertical: '4%',
        justifyContent: 'space-between' 
    }, 

    viewText: {
        flexDirection: "row", 
        alignItems: 'center'
    },

    viewInput: {
        justifyContent:'space-between', 
        alignItems: 'center', 
        flexDirection: 'row', 
        marginTop: '2%'
    },

    viewImg: {
        marginTop: '3%', 
        justifyContent:'center', 
        alignItems:'center', 
        borderRadius: 10, 
        borderWidth: 1, 
        borderColor: 'lightgray', 
        width: '100%', 
        height: '20%'
    },

    textItem: {
        fontWeight: "bold", 
        color: BasicColors.THEME_COLOR_SEC, 
        fontSize: 20
    },

    viewCountType: {
        marginTop: '3%', 
        justifyContent:'center', 
        alignItems:'center', 
        borderRadius: 10, 
        borderWidth: 1, 
        borderColor: 'lightgray', 
        width: '100%', 
        height: '14%'
    },

    
    viewMountToDeposit: {
        padding: '2%', 
        marginTop: '3%', 
        borderRadius: 10, 
        elevation: 2, 
        backgroundColor: BasicColors.THEME_COLOR_MAIN, 
        width: '100%', 
        height: 75 
    },

    viewRow: {
        alignItems: "center",
        flexDirection: 'row'
    },

    countTypeText: {
        color: BasicColors.THEME_COLOR_SEC,
        fontSize: 30,
        fontWeight: "bold"
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
        fontWeight: 'bold',
        color: 'white'
    },

    buttonAdd: {
        backgroundColor: BasicColors.THEME_COLOR_SEC, 
        borderRadius: 100, 
        width: 30, 
        height: 30, 
        justifyContent:'center'
    },

    viewBalance: {
        marginTop: '3%', 
        padding: '3%', 
        borderRadius: 10, 
        backgroundColor: 'green', 
        elevation: 2
    },

    ModalListItemText: {
        color: BasicColors.THEME_COLOR_MAIN, 
        fontWeight: 'bold', 
        paddingRight: '3%'
    },

    textInput: {
        color: 'white', 
        fontWeight: 'bold', 
        fontSize: 30, 
        paddingLeft: 10
    }
});