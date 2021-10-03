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
    RefreshControl,
    View,
    Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon, Avatar, Image } from 'react-native-elements';

import ImagePicker from '../components/ImagePicker';
import Http from '../components/Http';
import ModalListC from '../components/ModalList';
import HeaderC from '../components/Header';
import Fields from '../components/Field';
import * as BasicColors from '../styles/basic';

const MODAL_BLANK = {
    data: '', 
    flag: false,
    type: ''
}

const AdminEnterprise = ({ navigation, route }) => {  
    const [enterprise, setEnterprise] = useState(route.params.enterprise);
    const [modal, setModal] = useState({ type: 'Telefono', flag: false });
    const [modal2, setModal2] = useState(MODAL_BLANK);
    const [productTagSelected, setProductTagSelected] = useState({ name: '', id: 0});
    const [loading, setLoading] = useState({ main: false, refresh: false });

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

    const gotoNewProduct = (type, data) => {
        let body = { 
            type,
            enterpriseId: enterprise.id,
            productTags: enterprise.productTag,
            callBack: callBackProduct.bind(this)
        }

        if(data) {
            body = { ...body, data }
        }
        
        setModal({ ...modal, flag: false }); 
        navigation.navigate('NewProduct', { ...body });
    }

    const handlerModal2Button = () => {
        switch(modal.type) {
            case 'Telefono':
                (modal2.data.length < 10)
                ? Alert.alert('Disculpe', 'Numero inferior a 10 digitos no compatible!')
                : sendNewPhone();
                break;
            
            case 'Seccion de productos':
                (!Fields.checkFields([ modal2.data ]))
                ? Alert.alert('Disculpe', 'Debe ingresar un nombre para la seccion.')
                : (modal2.type == 'update')
                ? updateProducTag()
                : sendNewProductTag();
                break;
            
            default:
                Alert.alert('Mayday', 'tipo de modal no reconozido');
                break
        }
    }

    const updateProducTag = () => {
        const ptAux = enterprise.productTag.map(element => {
            if(element.id == productTagSelected.id) {
                return { ...productTagSelected, name: modal2.data }
            }

            return element;
        });

        const aux = {
            ...productTagSelected, 
            name: modal2.data, 
            enterpriseId: enterprise.id
        }

        setEnterprise({ ...enterprise, productTag: ptAux });
        setModal2({ ...modal2, flag: false, type: '' });
        sendData('PUT', 'product-tag', aux);
    } 

    const handleProductTag = (pt) => {
        setProductTagSelected(pt);
        setModal2({  data: pt.name, flag: true, type: 'update' });
    }

    const handleImg = async() => {
        const img = await ImagePicker.getImage();

        if(img == null) {
            return;
        }
        
        setEnterprise({ ...enterprise, img: img.base64 });
        sendData('PUT', 'enterprise/img', { img: img.base64, enterpriseId: enterprise.id });
    }

    const deleteProductTag = (pt) => { 
        const ptAux = enterprise.productTag.filter(i => i != pt);
        const body = { productTagId: pt.id, enterpriseId: enterprise.id }

        setEnterprise({ ...enterprise, productTag: ptAux });
        sendData('PUT', 'product-tag/status', body);
    }

    const deletePhone = (phone) => { 
        const phonesAux = enterprise.phones.filter(i => i != phone);

        setEnterprise({ ...enterprise, phones: phonesAux });
        sendData('DELETE', `phone/enterprise/${ enterprise.id }/${ phone.phoneId }`, null);
    }

    const deleteCountbank = (bank) => { 
        const BanksAux = enterprise.banks.filter(i => i.countId != bank.countId);

        setEnterprise({ ...enterprise, banks: BanksAux });
        sendData('PUT', 'bank/enterprise', { ...bank, enterpriseId: enterprise.id });
    }

    const deleteProduct = (product) => {
        const productAux = enterprise.products.filter(i => i != product);
        const body = {
            productId: product.id,
            enterpriseId: enterprise.id
        }

        setEnterprise({ ...enterprise, products: productAux });
        sendData('PUT', 'product/status', body);
    }

    const refresh = async() => {
        setLoading({ ...loading, refresh: true });
        const token = await AsyncStorage.getItem('token'); 
        const data = await Http.send('GET', `enterprise/${enterprise.id}`, null, token); 
        
        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');
            navigation.goBack(); 

        } else { 
            switch(data.typeResponse) {
                case 'Success': 
                    toast(data.message);
                    setEnterprise(data.body);
                    break;
                    
                case 'Fail':
                    data.body.errors.forEach(element => {
                        toast(element.text);
                    });
                    navigation.goBack();
                    break; 

                default:
                    Alert.alert(data.typeResponse, data.message);
                    navigation.goBack();
                    break; 
            }    
        }

        setLoading({ ...loading, refresh: false });
    }

    const sendNewPhone = async() => {
        setLoading({ ...loading, main: true });
        const token = await AsyncStorage.getItem('token'); 
        const body = { phoneNumber: modal2.data, enterpriseId: enterprise.id }
        const data = await Http.send('POST', 'phone/enterprise', body, token); 
        
        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');

        } else { 
            switch(data.typeResponse) {
                case 'Success': 
                    toast(data.message);
                    const aux = enterprise.phones;
                        
                    aux.push({ phoneCode: '+58', phoneNum: modal2.data, phoneId: data.body.id })
                    setEnterprise({ ...enterprise, phones: aux });
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
        setModal2(MODAL_BLANK);
    }

    const sendNewProductTag = async () => {
        setLoading({ ...loading, main: true });
        const token = await AsyncStorage.getItem('token'); 
        const body = { tagName: modal2.data, enterpriseId: enterprise.id }
        const data = await Http.send('POST', 'product-tag', body, token); 
        
        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');

        } else { 
            switch(data.typeResponse) {
                case 'Success': 
                    toast(data.message);
                    const aux = enterprise.productTag;
                        
                    aux.push({ name: modal2.data, id: data.body.id })
                    setEnterprise({ ...enterprise, productTag: aux });
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
        setModal2(MODAL_BLANK);
    }

    const sendData = async (type, endpoint, dataBody) => { 
        const token = await AsyncStorage.getItem('token'); 
        const data = await Http.send(type, endpoint, dataBody, token); 
        
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

    const ItemC = ({ title, action }) => (
        <TouchableOpacity
            style={AEStyles.viewItem}
            onPress={action}
            >
            <Text style={{ ...AEStyles.tittleUser, fontSize: 20}}>
                {title}
            </Text>
        </TouchableOpacity>
    )    

    const RenderItemPhone = ({ item }) => (
        <View style={AEStyles.viewModalItem}>
            <View style={AEStyles.item}>
                <View style={{ ...AEStyles.viewRow, justifyContent: 'space-between' }}>
                    <Text style={AEStyles.textItem}>
                        {item.phoneCode} {item.phoneNum}
                    </Text>
                    <Icon 
                        color='gray'
                        size={20} 
                        name='close' 
                        type='ionicon'
                        onPress={
                            () => alerButtom('Hey!', 
                            `Seguro que desea eliminar a ${item.phoneCode} ${item.phoneNum}?`,
                            () => deletePhone(item)) 
                        }
                    />
                </View>
            </View>
        </View>
    )

    const RenderItemProduct = ({ item }) => (
        <View style={AEStyles.viewModalItem}>
            <View style={AEStyles.item}>
                <TouchableOpacity 
                    style={{ ...AEStyles.viewRow, justifyContent: 'space-between' }}
                    onPress={() => gotoNewProduct('update', item)}
                    >
                    <View>
                        <Text style={AEStyles.textItem}>
                            {item.name}
                        </Text>
                    </View> 
                    <Icon 
                        color='gray'
                        size={20} 
                        name='close' 
                        type='ionicon'
                        onPress={
                            () => alerButtom('Peligro!', 
                            `Si se elimina ${item.name} se borraran TODO lo relacionado con el producto, desea continuar?`,
                            () => deleteProduct(item)) 
                        }
                    /> 
                </TouchableOpacity>
            </View>
        </View>
    )

    const RenderItemProducTag = ({ item }) => (
        <View style={AEStyles.viewModalItem}>
            <View style={AEStyles.item}>
                <TouchableOpacity 
                    style={{ ...AEStyles.viewRow, justifyContent: 'space-between' }}
                    onPress={() => handleProductTag(item)}
                    >
                    <Text style={AEStyles.textItem}>
                        {item.name}
                    </Text>
                    <Icon 
                        color='gray'
                        size={20} 
                        name='close' 
                        type='ionicon'
                        onPress={
                            () => alerButtom('Peligro!', 
                            `Si se elimina ${item.name} se borraran TODOS los productos relacionados con la seccion, desea continuar?`,
                            () => deleteProductTag(item)) 
                        }
                    />
                </TouchableOpacity>
            </View>
        </View>
    )

    const RenderItemBank = ({ item }) => (
        <View style={AEStyles.viewModalItem}>
            <View style={AEStyles.item}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ width: '80%' }}>
                        <View style={AEStyles.viewRow}>
                            <Text style={{ ...AEStyles.textItem, color: 'gray' }}>
                                {'Banco: '}
                            </Text>
                            <Text style={AEStyles.textItem}>
                                {item.bankName}
                            </Text>
                        </View>
                        <View style={AEStyles.viewRow}>
                            <Text style={{ ...AEStyles.textItem, color: 'gray' }}>
                                {'Titular: '}
                            </Text>
                            <Text style={AEStyles.textItem}>
                                {item.titularName}
                            </Text>
                        </View>
                        <View style={AEStyles.viewRow}>
                            <Text style={{ ...AEStyles.textItem, color: 'gray' }}>
                                {'Cuenta: '}
                            </Text>
                            <Text style={AEStyles.textItem}>
                                {item.countNum}
                            </Text>
                        </View>
                        <View style={AEStyles.viewRow}>
                            <Text style={{ ...AEStyles.textItem, color: 'gray' }}>
                                {'Identificacion: '} 
                            </Text>
                            <Text style={AEStyles.textItem}>
                                {item.titularId}
                            </Text>
                        </View>
                    </View>
                    <Icon 
                        color='gray'
                        size={20} 
                        name='close' 
                        type='ionicon'
                        onPress={
                            () => alerButtom('Disculpe', 
                            `Seguro que desea eliminar esta relacion cuenta/empresa?`,
                            () => deleteCountbank(item)) 
                        }
                    />
                </View>
            </View>
        </View>
    )

    const callbackLocation = (data, type) => {
        setEnterprise({ ...enterprise, location: data });
    }

    const newBankCallBack = (data) => {
        const bankAux = enterprise.banks;

        bankAux.push(data);
        setEnterprise({ ...enterprise, banks: bankAux });
        setModal({ type: 'Bancos', flag: true });
    }

    const callBackNewHour = (data) => {
        setEnterprise({ ...enterprise, hourDay: data });
    }

    const callBackProduct = (type, data) => {
        const aux = enterprise.products;
       
        switch(type) {
            case 'create':
                aux.push(data);
                break;
            
            case 'update':
                aux.map(product => {
                    if(product.id == data.id) {
                        return data;
                    }

                    return product;
                });
            break;

            default:
                Alert.alert('Error', type + ' No valido');
                break;
        }

        setEnterprise({ ...enterprise, products: aux });
    }

    const gotoNewBank = () => {
        const bodyAux = {
            type: 'enterprise', 
            enterpriseId: enterprise.id, 
            callBack: newBankCallBack.bind(this)    
        }

        navigation.navigate('NewBank', bodyAux);
        setModal({ ...modal, flag: false });
    }

    return (
        <View style={AEStyles.container}>
            <Modal
                animationType="slide"
                transparent
                visible={modal2.flag}
                onRequestClose={() => setModal2({ ...modal2, flag: false })}
                >
                <View style={AEStyles.centeredView}>
                    <View style={AEStyles.modalView}>
                        <Text>
                            {modal.type}
                        </Text>
                        <View style={{ ...AEStyles.viewRow, ...AEStyles.input }}>
                            {
                                (modal.type != 'Telefono')
                                ? null
                                : <Text style={{ color: 'gray', paddingRight: 10 }}>+58</Text>
                            }
                            <TextInput
                                placeholder={
                                    (modal.type == 'Telefono')
                                    ? "Numero telefonico"
                                    : (modal.type == 'Seccion de productos')
                                    ? 'Escriba la nueva seccion'
                                    : null
                                }
                                keyboardType={
                                    (modal.type == 'Telefono')
                                    ? 'numeric'
                                    : 'default'
                                }
                                maxLength={
                                    (modal.type == 'Telefono')
                                    ? 10
                                    : 50
                                }
                                blurOnSubmit={false}
                                style={{ color: 'gray' }}
                                onChangeText={data => setModal2({ ...modal2, data })}
                                onSubmitEditing={handlerModal2Button}
                                value={modal2.data}
                            />
                        </View>
                        <TouchableOpacity
                            style={AEStyles.button} 
                            onPress={handlerModal2Button}
                            >
                            {
                                (loading.main)
                                ? <ActivityIndicator size="small" color={BasicColors.THEME_COLOR_SEC}/>
                                : <Text style={AEStyles.textButton}>
                                    Finalizar
                                </Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <ModalListC
                tittle={modal.type}
                vissible={modal.flag}
                onCancel={() => setModal({ ...modal, flag: false })}
                addPress={() => {
                    (modal.type == 'Bancos')
                    ? gotoNewBank()
                    : (modal.type == 'Productos')
                    ? gotoNewProduct('create')
                    : setModal2({ ...modal2, flag: true })
                }}
                    
                addButton={
                    (modal.type == 'Telefono' || modal.type == 'Seccion de productos' || modal.type == 'Bancos' || modal.type == 'Productos')
                    ? true
                    : null
                }
                renderItem={
                    (modal.type == 'Telefono') 
                    ? RenderItemPhone
                    : (modal.type == 'Seccion de productos')
                    ? RenderItemProducTag
                    : (modal.type == 'Bancos')
                    ? RenderItemBank
                    : (modal.type == 'Productos')
                    ? RenderItemProduct
                    : null
                }
                data={
                    (modal.type == 'Telefono') 
                    ? enterprise.phones
                    : (modal.type == 'Seccion de productos')
                    ? enterprise.productTag
                    : (modal.type == 'Bancos')
                    ? enterprise.banks
                    : (modal.type == 'Productos')
                    ? enterprise.products
                    : null
                }
            />
            <HeaderC 
                title='Empresa'
                leftIconAction={() => navigation.goBack()}
                cartAction={()=> alert('envia a carrito')}
            />
            <View style={AEStyles.body}>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={loading.refresh}
                            onRefresh={refresh}
                        />
                    }
                    >
                    <View style={AEStyles.userView}>
                        <View style={{ ...AEStyles.viewRow }}>
                            {
                                (enterprise.img)
                                ? <Image
                                    source={{ uri: `data:image/png;base64,${enterprise.img}` }}
                                    containerStyle={AEStyles.img}
                                    onPress={handleImg}
                                />
                                : <Avatar 
                                    size="medium"
                                    containerStyle={{ ...AEStyles.img,  backgroundColor: 'lightgray' }}
                                    icon={{ name: 'camera-outline', color: 'white', type: 'ionicon', size: 40 }} 
                                    onPress={handleImg}
                                />
                            }
                            <Text style={AEStyles.tittleUser}>
                                {` ${enterprise.name}`} 
                            </Text>
                        </View>
                        <Text style={{ ...AEStyles.tittleUser, fontSize: 20 }}>
                            {enterprise.location.locationName}, {enterprise.location.cityName}, {enterprise.location.stateName} 
                        </Text>
                        <View style={{ ...AEStyles.viewRow , flexDirection: 'row-reverse'  }}>
                            <View style={AEStyles.balanceView}>
                                <Text style={AEStyles.tittleUser}>
                                    $ {Number.parseFloat(enterprise.balance).toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ alignItems: 'center', justifyContent: 'center', padding: '3%' }}>
                        <Text style={{ color: 'gray', fontWeight: 'bold', fontSize: 20 }}>
                            Gestiona
                        </Text>
                    </View>
                    <ItemC
                        title='Retiros'
                        action={() => 
                            navigation.navigate('Withdraw', 
                                { 
                                    type: 'enterprise', 
                                    balance: enterprise.balance, 
                                    banks: enterprise.banks,
                                    id: enterprise.id 
                                }
                            )
                        }
                    />
                    <ItemC
                        title='Productos'
                        action={() => setModal({ type: 'Productos', flag: true })}
                    />
                    <ItemC
                        title='Seccion de productos'
                        action={() => setModal({ type: 'Seccion de productos', flag: true })}
                    />
                    <ItemC
                        title='Horario y dias laborales'
                        action={
                            () => navigation.navigate(
                                'NewHourDay', 
                                { data: enterprise.hourDay, enterpriseId: enterprise.id, callBack: callBackNewHour.bind(this) }
                            )
                        }
                    />
                    <ItemC
                        title='Numeros telefonicos'
                        action={() => setModal({ type: 'Telefono', flag: true })}
                    />
                    <ItemC
                        title='Direccion del negocio'
                        action={
                            () => navigation.navigate(
                                'NewDirection', 
                                { type:'update', data: enterprise.location, callBack: callbackLocation.bind(this) }
                            )
                        }
                    />
                    <ItemC
                        title='Cuentas bancarias'
                        action={() => setModal({ type: 'Bancos', flag: true })}
                    />
                    <ItemC
                        title='Ventas'
                        action={() => setEnterprise({ ...enterprise, balance: 100 })}
                    />
                </ScrollView>
            </View>
        </View>
    )
}

export default AdminEnterprise;

const AEStyles = StyleSheet.create({
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

    viewRow: {
        alignItems: "center",
        flexDirection: 'row'
    },

    userView: { 
        elevation: 3, 
        backgroundColor: BasicColors.THEME_COLOR_MAIN, 
        marginVertical: '1%', 
        borderRadius: 10, 
        padding: '3%' 
    },

    balanceView: {
        borderRadius: 10, 
        backgroundColor: 'green', 
        padding: '2%', 
        elevation: 5
    },

    viewItem: {
        elevation: 2,
        padding: '3%', 
        backgroundColor: BasicColors.THEME_COLOR_SEC, 
        borderRadius: 10, 
        marginTop: '3%'
    },

    tittleUser: {
        color: 'white', 
        fontSize: 30, 
        fontWeight: 'bold'
    },

    viewModalItem: {
        padding: '2%',
        width: '100%',
        backgroundColor: BasicColors.BACKGROUND_COLOR,
    },

    img: {
        borderRadius: 5, 
        width: 65, 
        height: 65, 
        resizeMode: 'contain'
    },

    item: {
        paddingVertical: '1%',
        backgroundColor: 'white' , 
        borderRadius: 10, 
        paddingHorizontal: '3%',
        paddingVertical: '4%',
        justifyContent: 'space-between' 
    }, 

    textItem: {
        fontWeight: "bold", 
        color: BasicColors.THEME_COLOR_SEC, 
        fontSize: 20
    },

    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },

    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
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
        backgroundColor: 'lightgray', 
        borderRadius: 5  
    },
})