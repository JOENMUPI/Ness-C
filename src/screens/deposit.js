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
import ImagePicker from '../components/ImagePicker';

import * as BasicColors from '../styles/basic';

const DEPOSIT_BLANK = {
    id: 0,
    img: null,
    mountTotransfer: 0.00,
    mountToDeposit: 0.00,
    status: null,
    mount_date: new Date(),
    depositTypeName: '',
    depositTypeId: 0,
    depositTypeJson: {}
}


const Deposit = ({ navigation }) => { 
    const [loading, setLoading] = useState({ countType: false, main: false, history: false });
    const [me, setMe] = useState({ balance: 0.00 });
    const [history, setHistory] = useState([]);
    const [countType, setCountType] = useState([]);
    const [deposit, setDeposit] = useState(DEPOSIT_BLANK);
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

    const getMee = async () => {
        return JSON.parse(await AsyncStorage.getItem('user'));
    }

    const handleModalItem = (item) => { 
        const aux = { 
            ...DEPOSIT_BLANK, 
            depositTypeId: item.id, 
            depositTypeJson: item.json, 
            depositTypeName: item.name 
        }

        setDeposit(aux);
        setmodal({ ...modal, flag: false });
    }

    const handlerMountToDeposit = () => { 
        let aux, aux2;

        (deposit.mountToDeposit > 1)
        ? aux = Number.parseFloat(deposit.mountToDeposit).toFixed(2)
        : aux = 1;

        aux2 = Number.parseFloat(aux * deposit.depositTypeJson.diferencial).toFixed(2);

        setDeposit({ ...deposit, mountToDeposit: aux, mountTotransfer: aux2 });
        setInput(false);
    }

    const handlerFocusInput = () => {
        setDeposit({ ...deposit, mountToDeposit: 0 });
        setInput(true)
    }

    const pressImg = async() => {
        let img = await ImagePicker.getImage();

        if(img == null) {          
            return;
        
        } else { 
            let aux = img.uri.split('/');
            
            aux = aux[aux.length - 1].split('.'); 
            img = { img: img.base64, tittle: aux[0], format: aux[1] }
        } 
        
        setDeposit({ ...deposit, img });
    }

    const getCountType = async () => { 
        setLoading({ ...loading, countType: true });
        const data = await Http.send('GET', 'deposit/depositType', null, null); 
        
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

    const getHistory = async () => { 
        setLoading({ ...loading, history: true });
        const token = await AsyncStorage.getItem('token'); 
        const data = await Http.send('GET', 'deposit', null, token); 
        
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

    const sendDeposit = async () => { 
        setLoading({ ...loading, main: true });
        const token = await AsyncStorage.getItem('token'); 
        const data = await Http.send('POST', 'deposit', deposit, token); 
        
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

    const ModalRenderItemCountTypeC = ({ item, action }) => (
        <View style={DepositStyles.viewItem}>
            <TouchableOpacity 
                onPress={() => (action) ? action() : handleModalItem(item)}
                style={DepositStyles.item}
                >
                <View>
                    <Text style={DepositStyles.textItem}>
                        {item.name}
                    </Text>
                    <View style={DepositStyles.viewText}>
                        <Text style={{ fontWeight: 'bold' }}> 
                            {'Nombre de la cuenta: '}  
                        </Text>
                        <Text style={{ color: 'gray' }}>
                            {item.json.name}
                        </Text>
                    </View>
                    <View style={DepositStyles.viewText}>
                        <Text style={{ fontWeight: 'bold' }}> 
                            {'Cuenta: '}  
                        </Text>
                        <Text style={{ color: 'gray' }}>
                            {item.json.count}
                        </Text>
                    </View>
                    {  
                        !(item.json.id) 
                        ? null 
                        : <View style={DepositStyles.viewText}>
                            <Text style={{ fontWeight: 'bold' }}> 
                                {'Id: '}  
                            </Text>
                            <Text style={{ color: 'gray' }}>
                                {item.json.id}
                            </Text>
                        </View>
                    }
                </View>
            </TouchableOpacity>
        </View>
    )

    const ModalRenderItemHistory = ({ item }) => (
        <View style={DepositStyles.viewItem}>
            <View style={DepositStyles.item}>
                <Text style={DepositStyles.textItem}>
                    {item.depositTypeName}
                </Text>
                <Text 
                    style={
                        (item.status == undefined)
                        ? { ...DepositStyles.textItem, color: 'gray' }
                        : (item.status)
                        ? { ...DepositStyles.textItem, color: 'green' }
                        : { ...DepositStyles.textItem, color: 'reed' }
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
                <View style={DepositStyles.viewRow}>
                    <Text style={{ ...DepositStyles.ModalListItemText, color: 'gray' }}>
                        Monto deseado:  
                    </Text>
                    <Text style={DepositStyles.ModalListItemText}>
                        $ {item.mountToDeposit}
                    </Text>    
                </View>
                <View style={DepositStyles.viewRow}>
                    <Text style={{ ...DepositStyles.ModalListItemText, color: 'gray' }}>
                        Monto transferido:  
                    </Text>
                    <Text style={DepositStyles.ModalListItemText}>
                        {item.depositTypeJson.typeCoin} {item.mountTotransfer}
                    </Text>    
                </View>
                <View style={DepositStyles.viewRow}>
                    <Text style={DepositStyles.ModalListItemText}>
                        Fecha:  
                    </Text>
                    <Text style={{ ...DepositStyles.ModalListItemText, color: 'gray' }}>
                        {item.mount_date.toString().split('T')[0]}, {item.mount_date.toString().split('T')[1].split('.')[0]}
                    </Text>    
                </View>          
            </View>
        </View>
    )

    useEffect(() => {  
        getMee().then((res) => setMe(res));
        getHistory().then(res => {
            setHistory(res);
            setLoading({ ...loading, history: false }); 
        });

        getCountType().then(res => { 
            setCountType(res);
            setLoading({ ...loading, countType: false }); 
        });
    }, []);


    return (
        <View style={DepositStyles.container}>
            <HeaderC 
                title='Recarga'
                leftIconAction={() => navigation.goBack()}
                rightIcon='book'
                cartAction={() => setmodal({ ...modal, history: true })}
            />
            <ModalSearchC       
                vissible={modal.flag}
                tittle={'Tipo de pago'}
                onCancel={() => setmodal({ ...modal, flag: false })}
                renderItem={ModalRenderItemCountTypeC}
                data={countType}
            />
            <ModalListC
                tittle='Historial de depositos'
                vissible={modal.history}
                onCancel={() => setmodal({ ...modal, history: false })}
                renderItem={ModalRenderItemHistory}
                data={history}
            />
            <View style={DepositStyles.body}>
                {
                    (deposit.depositTypeId == 0)
                    ? <TouchableOpacity 
                        disabled={loading.countType}
                        style={DepositStyles.viewCountType}
                        onPress={() => setmodal({ ...modal, flag: true })}
                        >
                        {
                            (loading.countType) 
                            ? <ActivityIndicator size="large" color={BasicColors.THEME_COLOR_SEC} />
                            : <Text style={DepositStyles.countTypeText}>
                                Metodo de pago
                            </Text>
                        }    
                    </TouchableOpacity>
                    : <ModalRenderItemCountTypeC
                        action={() => setmodal({ ...modal, flag: true })}
                        item={{
                            id: deposit.depositTypeId,
                            name: deposit.depositTypeName,
                            json: deposit.depositTypeJson
                        }} 
                    />                
                }
                <View style={DepositStyles.viewBalance}>
                    <View style={{ ...DepositStyles.viewRow, justifyContent: 'space-between' }}>
                        <Text style={{ ...DepositStyles.textButton, fontSize: 20 }}>
                            Balance actual:
                        </Text>
                        <Text style={{ ...DepositStyles.textButton, fontSize: 20 }}>
                            $ {Number.parseFloat(me.balance).toFixed(2)}
                        </Text>
                    </View>
                </View>
                {
                    (deposit.depositTypeId == 0)
                    ? null
                    : <View> 
                        <View style={DepositStyles.viewMountToDeposit}> 
                            <Text style={{ color: 'white', fontWeight:'bold' }}>
                                Monto a recargar ($)
                            </Text>
                            <View style={DepositStyles.viewInput}>
                                <View style={DepositStyles.buttonAdd}> 
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
                                    onChangeText={mountToDeposit => setDeposit({ ...deposit, mountToDeposit })}
                                    onEndEditing={handlerMountToDeposit}
                                    value={String(deposit.mountToDeposit)}
                                    style={DepositStyles.textInput}
                                />
                            </View>
                        </View>
                        <View style={{ ...DepositStyles.viewMountToDeposit, backgroundColor: BasicColors.THEME_COLOR_SEC }}>
                            <Text style={{ color: 'white', fontWeight:'bold' }}>
                                Monto que debes transferir ({deposit.depositTypeJson.typeCoin})
                            </Text>
                            <View style={{ flexDirection: 'row-reverse', marginTop: '2%' }}>
                                <Text style={DepositStyles.textInput}>
                                    {deposit.mountTotransfer} 
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity 
                            style={DepositStyles.viewImg}
                            onPress={pressImg}
                            >
                            {
                                !(deposit.img)
                                ? <Text style={DepositStyles.textItem}>
                                    Adjutar captura de pantalla
                                </Text>
                                : <View style={DepositStyles.viewRow}> 
                                    <View style={DepositStyles.avatar}>
                                        <Avatar
                                            size="small"
                                            title={deposit.img.format}
                                        />
                                    </View>
                                    <Text style={{ ...DepositStyles.textItem, fontSize: 15 }}>
                                        {deposit.img.tittle}
                                    </Text>
                                </View>
                            }
                        </TouchableOpacity>
                    </View>    
                }
                {
                    !(deposit.img) 
                    ? null
                    : <TouchableOpacity 
                        style={DepositStyles.button}
                        onPress={sendDeposit}
                        >
                        {
                            (loading.main)
                            ? <ActivityIndicator size="small" color={BasicColors.THEME_COLOR_SEC} />
                            : <Text style={DepositStyles.textButton}>
                                Finalizar deposito
                            </Text>
                        }
                    </TouchableOpacity>   
                }      
            </View>
        </View>
    )
}

export default Deposit;

const DepositStyles = StyleSheet.create({
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