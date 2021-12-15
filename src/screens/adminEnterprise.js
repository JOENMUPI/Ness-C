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
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs();

const MODAL_BLANK = {
    data: '', 
    flag: false,
    type: ''
}

const AdminEnterprise = ({ navigation, route }) => {  
    const [enterprise, setEnterprise] = useState(route.params.enterprise);
    const [modal, setModal] = useState({ type: 'Telefono', flag: false, history: false });
    const [modal2, setModal2] = useState(MODAL_BLANK);
    const [productTagSelected, setProductTagSelected] = useState({ name: '', id: 0});
    const [sell, setSell] = useState([]);
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
        if(enterprise.productTag.length < 1) {
            Alert.alert('Discule', 'Requiere poseer como minimo una seccion de productos en  su nnegocio para crear prodcutos');
        
        } else {
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

    const getSell = async () => {
        const token = await AsyncStorage.getItem('token'); 
        const data = await Http.send('GET', `enterprise/sell/${enterprise.id}`, null, token); 
        
        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');
            navigation.goBack(); 

        } else { 
            switch(data.typeResponse) {
                case 'Success': 
                    toast(data.message);
                    setSell(data.body); 
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

    const sendTesis = async (item) => {
        const token = await AsyncStorage.getItem('token');
        const body = { billId: item.bill.id, enterpriseId: enterprise.id, mount: item.bill.mount }
        const data = await Http.send('POST', `enterprise/tesis`, body, token); 
        
        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');
            navigation.goBack(); 

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

    const refresh = async() => {
        setLoading({ ...loading, refresh: true });
        getSell();
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
                    style={{ flexDirection: 'row', justifyContent: 'space-between' }}
                    onPress={() => gotoNewProduct('update', item)}
                    >
                    <View style={{ flexDirection: 'row' }}>
                        {
                            (item.img)
                            ?
                            <Image
                                source={{ uri: `data:image/png;base64,${item.img}` }}
                                containerStyle={AEStyles.img}
                            />
                            : <Avatar 
                                size="medium"
                                containerStyle={{ ...AEStyles.img,  backgroundColor: 'lightgray' }}
                                icon={{ name: 'camera-outline', color: 'white', type: 'ionicon', size: 40 }}   
                            />
                        }
                        <View style={{ paddingLeft: '3%' }}>    
                            <Text style={AEStyles.textItem}>
                                {item.name}, {item.productTag.name}
                            </Text>
                            <Text style={{ fontWeight: 'bold', color: (item.status) ? 'green' : 'red' }}>  
                                {
                                    (item.status)
                                    ? 'Disponible'
                                    : 'No disponible'
                                }
                            </Text>
                            <Text style={{ ...AEStyles.textItem, color: 'green' }}>
                                $ {item.price}
                            </Text>
                            <Text style={{ color: 'gray' }}>
                                {item.description}
                            </Text>
                        </View>
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

    const handleButton = (data) => { 
        const sellAux = sell.filter(i => i.bill.id != data.bill.id);
        setSell(sellAux)
        sendTesis(data);
    }

    const ModalRenderItemHistory = ({ item }) => (
        <View>
            {
                (item.bill.status) 
                ? null
                :   
                <View style={{ ...AEStyles.item, marginTop: '3%' }}>
                    <View style={AEStyles.viewRow}>
                        <Text style={AEStyles.ModalListItemText}>
                            Fecha:  
                        </Text>
                        <Text style={{ ...AEStyles.ModalListItemText, color: 'gray' }}>
                            {item.bill.date.toString().split('T')[0]}, {item.bill.date.toString().split('T')[1].split('.')[0]}
                        </Text>    
                    </View>
                    <View style={AEStyles.viewRow}>
                        <Text style={AEStyles.ModalListItemText}>
                            Cliente:  
                        </Text>
                        <Text style={{ ...AEStyles.ModalListItemText, color: 'gray' }}>
                            {item.user.name}
                        </Text>    
                    </View>
                    <View style={AEStyles.viewRow}>
                        <Text style={{ ...AEStyles.ModalListItemText, color: 'gray' }}>
                            Monto total:  
                        </Text>
                        <Text style={AEStyles.ModalListItemText}>
                            $ {item.bill.mount}
                        </Text>    
                    </View>
                    <View style={AEStyles.viewRow}>
                        <Text style={{ ...AEStyles.ModalListItemText, color: 'gray' }}>
                            Destino:  
                        </Text>
                        <Text style={AEStyles.ModalListItemText}>
                            {`${item.location.locationName}, ${item.location.cityName}, ${item.location.stateName}`}
                        </Text>    
                    </View>
                    <Text style={{ ...AEStyles.textItem, color: 'gray' }}> 
                        Pendiente
                    </Text>
                    <Text style={AEStyles.textItem}>
                        Productos
                    </Text>
                    {
                        item.bill.products.map((data, index) => (
                            <View 
                                style={{ ...AEStyles.item, marginTop: '2%' }}
                                key={index}
                                >
                                <View style={{ flexDirection: 'row' }}>
                                    {
                                        (data.img == null)
                                        ? <Avatar 
                                            size="medium"
                                            containerStyle={{ ...AEStyles.img,  backgroundColor: 'lightgray' }}
                                            icon={{ name: 'camera-outline', color: 'white', type: 'ionicon', size: 40 }} 
                                        />
                                        : <Image
                                            source={{ uri: `data:image/png;base64,${data.img}` }}
                                            containerStyle={{ ...AEStyles.img }}
                                        /> 
                                    }
                                    
                                    <View style={{ paddingLeft: '3%', width: '75%' }}>
                                        <ScrollView>
                                            <Text style={AEStyles.tittleItem}>
                                                {data.name}
                                            </Text>
                                
                                            <Text style={{ color: 'gray' }}>
                                                {data.description}
                                            </Text>
                                            <View  style={{ ...AEStyles.viewRow, marginVertical: '2%' }}>
                                                <Text style={{ color: 'gray', fontWeight: 'bold' }}>
                                                    {'Variante: '}
                                                </Text>
                                                <Text style={{ color: BasicColors.THEME_COLOR_SEC, fontWeight: 'bold' }}>
                                                    {data.variants.name}
                                                </Text>    
                                            </View>
                                            <View style={{ ...AEStyles.viewRow, marginVertical: '2%' }}>
                                                <Text style={{ color: 'gray', fontWeight: 'bold' }}>
                                                    {'Cantidad: '}
                                                </Text>
                                                <Text style={{ color: BasicColors.THEME_COLOR_SEC, fontWeight: 'bold' }}>
                                                    {data.cart.totalUnit}
                                                </Text>    
                                            </View>
                                            <View style={{ ...AEStyles.viewRow, marginVertical: '2%' }}>
                                                <Text style={{ color: 'gray', fontWeight: 'bold', width: '50%' }}>
                                                    {'Precio: '}
                                                </Text>
                                                <View style={{ flexDirection: 'row-reverse', width: '50%' }}>
                                                    <Text style={{ color: 'green', fontWeight: 'bold' }}>
                                                        $ {Number.parseFloat(data.price).toFixed(2)}
                                                    </Text>    
                                                </View>
                                            </View>
                                            {
                                                (data.extras.length < 1)
                                                ? null
                                                : <View>   
                                                    <Text style={{ marginVertical: '2%', fontWeight: 'bold', color: BasicColors.THEME_COLOR_SEC }}>
                                                        Extras
                                                    </Text>
                                                    {
                                                        data.extras.map((ite, index) => (
                                                            <View 
                                                                style={AEStyles.viewRow}
                                                                key={index}
                                                                >    
                                                                <View style={{ ...AEStyles.viewRow, justifyContent: 'space-between' }}>
                                                                    <View style={{ width:  '50%' }}>
                                                                        <Text style={{ color: 'gray', fontWeight: 'bold' }}>
                                                                            {ite.name}   
                                                                        </Text>
                                                                    </View>    
                                                                    <View style={{ width: '50%', flexDirection: 'row-reverse' }}>
                                                                        <Text style={{ color: 'green', fontWeight: 'bold', paddingRight: '2%' }}>
                                                                            $ {Number.parseFloat(ite.price).toFixed(2)}
                                                                        </Text>
                                                                    </View> 
                                                                </View>
                                                            </View>
                                                        ))
                                                    }
                                                </View>
                                            }
                                        </ScrollView>
                                        <View style={{ ...AEStyles.viewRow, marginTop: '3%' }}>
                                            <View style={{ width: '50%' }}>
                                                <Text style={{ color: BasicColors.THEME_COLOR_SEC, fontWeight: 'bold' }}>
                                                    Monto total:   
                                                </Text> 
                                            </View>
                                            <View style={{ width: '50%', flexDirection: 'row-reverse' }}>
                                                <Text style={{ color: 'green', fontWeight: 'bold', paddingRight: '2%' }}>
                                                    $ {Number.parseFloat(data.cart.totalMount).toFixed(2)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View> 
                            </View>
                        ))
                    }
                    <TouchableOpacity
                        style={AEStyles.button}
                        onPress={() => handleButton(item)}
                        >     
                        <Text style={AEStyles.textButton}>
                            Tesis
                        </Text>
                    </TouchableOpacity>
                </View>
            }
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
        setModal({ type: 'Bancos', flag: true, history: false });
    }

    const callBackNewHour = (data) => {
        setEnterprise({ ...enterprise, hourDay: data });
    }

    const callBackProduct = (type, data) => {
        let aux = enterprise.products;
       
        switch(type) {
            case 'create':
                aux.push(data);
                break;
            
            case 'update':
                aux = aux.map(product => { 
                    if(product.id == data.id) { 
                        return data;
                    
                    } else {
                        return product;
                    }
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

    useEffect(() => {  
        refresh(); 
    }, []);

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
            <ModalListC
                tittle='Pedidos'
                vissible={modal.history}
                onCancel={() => setModal({ ...modal, history: false })}
                renderItem={ModalRenderItemHistory}
                data={sell}
            />
            <HeaderC 
                title='Empresa'
                leftIconAction={() => navigation.goBack()}
                cartAction={()=> navigation.navigate('Cart')}
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
                        action={() => setModal({ type: 'Productos', flag: true, history: false })}
                    />
                    <ItemC
                        title='Seccion de productos'
                        action={() => setModal({ type: 'Seccion de productos', flag: true, history: false })}
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
                        action={() => setModal({ type: 'Telefono', flag: true, history: false })}
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
                        action={() => setModal({ type: 'Bancos', flag: true, history: false })}
                    />
                    <ItemC
                        title='Pedidos'
                        action={() => setModal({ ...modal, history: true, flag: false })}
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

    ModalListItemText: {
        color: BasicColors.THEME_COLOR_MAIN, 
        fontWeight: 'bold', 
        paddingRight: '3%'
    },

    tittleItem: { 
        color:'gray', 
        fontWeight: "bold", 
        fontSize: 20 
    },
})