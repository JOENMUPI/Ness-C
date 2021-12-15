import React, { useState, useEffect } from 'react';
import { 
    Alert, 
    ActivityIndicator, 
    StyleSheet,  
    Text,  
    ToastAndroid, 
    TouchableOpacity, 
    ScrollView,
    RefreshControl,
    View,
    Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon, Image, Avatar, CheckBox } from 'react-native-elements';

import Http from '../components/Http';
import HeaderC from '../components/Header';
import ModalSearchListC from '../components/ModalSearchList';
import ModalListC from '../components/ModalList';
import * as BasicColors from '../styles/basic';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs();

const CART_BLANK = [];

const DATA_BLANK = {
    flag: false,
    img: null,
    name: '',
    description: '',
    id: 0,
    price: 0,
    status: false,
    extras: [],
    cart: {
        id: 0,
        totalUnit: 0,
        totalMount: 0
    },
    variants: {
        name: '',
        id: 0,
        status: false
    },
    productTag: {
        id: 0,
        name: ''
    }
}

const BILL_BLANK = {
    mount: 0, 
    products: [],
    location: '',
}

const Cart = ({ navigation }) => { 
    const [loading, setLoading] = useState({ loading: false, first: true, history: false });
    const [all, setAll] = useState({ flag: false , totalMount: 0 });
    const [cart, setCart] = useState([]);
    const [directions, setDirections] = useState([]);
    const [modal, setModal] = useState({ flag: false, flag2: false, data: DATA_BLANK, history: false });
    const [me, setMe] = useState({ balance: 0 });
    const [history, setHistory] = useState([]);
    const [bill, setBill] = useState(BILL_BLANK);


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

    const checkBill = (data) => {
        let billAux = { mount: 0, products: [] };

        data.forEach(enterprise => {
            enterprise.products.forEach(product => {
                if (product.flag) { 
                    billAux.products.push(product);
                    billAux.mount += product.cart.totalMount; 
                }
            });
        });

        setBill(billAux); 
    }

    const checkAllEnterpriseFlags = (data) => {
        let flag = true;
        
        data.forEach(enterprise => {
            if(!enterprise.flag) {
                flag = false;    
            }
        });

        setAll({ ...all, flag });
    }

    const checkAllProductFlags = (data) => {
        let flag = true;
        
        data.forEach(product => {
            if(!product.flag && product.status) {
                flag = false;    
            }
        });

        return flag;
    }

    const deleteEnterprise = (enterprise) => {
        const cartAux = cart.filter(i => (i.id != enterprise.id));

        setCart(cartAux);
        checkBill(cartAux);
        handleAllMount(cartAux);
        sendData('DELETE', 'cart/enterprise', { id: enterprise.id });
    }

    const deleteProduct = (enterprise, product) => {
        let cartAux = cart.map(element => {
            if(element.id == enterprise.id) {
                element.products = element.products.filter(i => (i.cart.id != product.cart.id));
                enterprise.totalCost -= product.cart.totalMount;
            }

            if(element.products.length < 1) {
                element = { ...element, empty: true };
            } 
                
            return element;
        });

        cartAux.filter(i => !i.empty);

        setCart(cartAux);
        checkBill(cartAux);
        handleAllMount(cartAux);
        sendData('DELETE', 'cart',{ id: product.cart.id } );
    }

    const handleAllCheckBox = () => { 
        const newFlag = !all.flag;
        const cartAux = cart.map(enterprise => {  
            enterprise.flag = newFlag; 
            enterprise.products = enterprise.products.map(product => {
                if(product.status && product.variants.status) {
                    product.flag = newFlag; 
                }

                return product;
            });
            
            return enterprise;
        });

        setCart(cartAux);
        checkBill(cartAux);
        setAll({ ...all, flag: newFlag });
    }

    const handleAllProductsCheckBox = (data) => { 
        const cartAux = cart.map(enterprise => {
            if(enterprise.id == data.id) {
                let newFlag = !enterprise.flag;
                
                enterprise.flag = newFlag;
                enterprise.products.forEach(product => {
                    if(product.status && product.variants.status) {
                        product.flag = newFlag; 
                    }
                });
            }
            
            return enterprise;
        });
        
        checkAllEnterpriseFlags(cartAux);
        checkBill(cartAux);
        setCart(cartAux);
    }
    
    const handleProductCheckBox = (data, obj) => { 
        const cartAux = cart.map(enterprise => {
            if(enterprise.id == data.id) { 
                enterprise.products = enterprise.products.map(product => {    
                    if(product.cart.id == obj.cart.id && product.status && product.variants.status) { 
                        product.flag = !product.flag;
                    }
                    
                    return product;
                });
                
                (checkAllProductFlags(enterprise.products))
                ? enterprise.flag = true        
                : enterprise.flag = false;
            }
            
            return enterprise;
        });
        
        checkAllEnterpriseFlags(cartAux);
        checkBill(cartAux);
        setCart(cartAux);
    }
    
    const handleAllMount = (data) => {
        if(data.length > 0) {
            let allMountAux = 0;
            
            data.forEach(enterprise => {
                allMountAux += enterprise.totalCost;
            });
            
            setAll({ ...all, totalMount: allMountAux }); 
        }
    } 

    const handleOpen = (id) => {
        const cartAux = cart.map(enterprise => {
            if(enterprise.id == id) {
                (enterprise.open) 
                ? enterprise = { ...enterprise, open: false }
                : enterprise = { ...enterprise, open: true }
            }

            return enterprise;
        });

        setCart(cartAux);
    }

    const handleButton = () => {
        if(me.balance - bill.mount < 0) {
            Alert.alert('Disculpe', 'No posee el capital suficiente para efectuar esta compra');
        
        } else if (directions.length < 1) {
            Alert.alert('Disculpe', 'No posee direcciones previamente guardadas');
        
        } else {
            setModal({ ...modal, flag2: true });
        }
    }

    const handleBillHistory = () => {
        getBillHistory();
        setModal({ ...modal, history: true })
    }

    const sendData = async (type, endpoint, body) => {
        const token = await AsyncStorage.getItem('token'); 
        const data = await Http.send(type, endpoint, body, token);
    
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

    const getBillHistory = async () => {
        setLoading({ ...loading, history: true });
        const token = await AsyncStorage.getItem('token'); 
        const data = await Http.send('GET', 'bill/user', null, token);
    
        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');

        } else {
            switch(data.typeResponse) {
                case 'Success':
                    toast(data.message);
                    setHistory(data.body);
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

        setLoading({ ...loading, history: false });
    }

    const sendBill = async (location) => {
        setLoading({ ...loading, loading: true });
        const newUser = { ...me, balance: me.balance - bill.mount };
        let cartAux = cart;

        await AsyncStorage.setItem('user', JSON.stringify(newUser));

        bill.products.forEach(product => { 
            cartAux = cartAux.map(enterprise => {
                let aux = 0;
                
                enterprise.products = enterprise.products.filter(i => i.cart.id != product.cart.id);
                enterprise.products.forEach(x => aux += x.cart.totalMount);
                enterprise.totalCost = aux; 
                return enterprise;
            });
        });

        handleAllMount(cartAux)
        setCart(cartAux);
        setMe(newUser);
        sendData('POST', 'bill', { ...bill, location });
        setLoading({ ...loading, loading: false });
        setBill({ products: [], mount: 0 });
        setModal({ ...modal, flag2: false });
    }

    const getDirections = async () => { 
        const token = await AsyncStorage.getItem('token'); 
        const data = await Http.send('GET', 'direction/user', null, token); 
        
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

    const getCart = async () => {
        setLoading({ ...loading, loading: true });
        const token = await AsyncStorage.getItem('token'); 
        const data = await Http.send('GET', 'cart', null, token); 
        
        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');
            return CART_BLANK; 

        } else { 
            switch(data.typeResponse) {
                case 'Success': 
                    toast(data.message);
                    return data.body;
                    
                case 'Fail':
                    data.body.errors.forEach(element => {
                        toast(element.text);
                    });
                    return CART_BLANK;

                default:
                    Alert.alert(data.typeResponse, data.message);
                    return CART_BLANK; 
            }    
        }
    }

    const ModalRenderItemHistory = ({ item }) => (
        <View style={{ ...cartStyles.item, marginTop: '3%' }}>
            <View style={cartStyles.viewRow}>
                <Text style={cartStyles.ModalListItemText}>
                    Fecha:  
                </Text>
                <Text style={{ ...cartStyles.ModalListItemText, color: 'gray' }}>
                    {item.date.toString().split('T')[0]}, {item.date.toString().split('T')[1].split('.')[0]}
                </Text>    
            </View>
            <View style={cartStyles.viewRow}>
                <Text style={{ ...cartStyles.ModalListItemText, color: 'gray' }}>
                    Monto total:  
                </Text>
                <Text style={cartStyles.ModalListItemText}>
                    $ {item.mount}
                </Text>    
            </View>
            <View style={cartStyles.viewRow}>
                <Text style={{ ...cartStyles.ModalListItemText, color: 'gray' }}>
                    Destino:  
                </Text>
                <Text style={cartStyles.ModalListItemText}>
                    {`${item.location.locationName}, ${item.location.cityName}, ${item.location.stateName}`}
                </Text>    
            </View>
            <Text 
                style={
                    (item.status == undefined)
                    ? { ...cartStyles.textItem, color: 'gray' }
                    : (item.status)
                    ? { ...cartStyles.textItem, color: 'green' }
                    : { ...cartStyles.textItem, color: 'reed' }
                }
                > 
                {
                    (item.status == null)
                    ? 'Aun en negocio'
                    : (item.status)
                    ? 'Entregado'
                    : 'En camino'
                }
            </Text>
            <Text style={cartStyles.textItem}>
                Productos
            </Text>
            {
                item.products.map((data, index) => (
                    <View 
                        style={{ ...cartStyles.item, marginTop: '2%' }}
                        key={index}
                        >
                        <View style={{ flexDirection: 'row' }}>
                            {
                                (data.img == null)
                                ? <Avatar 
                                    size="medium"
                                    containerStyle={{ ...cartStyles.img,  backgroundColor: 'lightgray' }}
                                    icon={{ name: 'camera-outline', color: 'white', type: 'ionicon', size: 40 }} 
                                />
                                : <Image
                                    source={{ uri: `data:image/png;base64,${data.img}` }}
                                    containerStyle={{ ...cartStyles.img }}
                                /> 
                            }
                            
                            <View style={{ paddingLeft: '3%', width: '75%' }}>
                                <ScrollView>
                                    <Text style={cartStyles.tittleItem}>
                                        {data.name}
                                    </Text>
                        
                                    <Text style={{ color: 'gray' }}>
                                        {data.description}
                                    </Text>
                                    <View  style={{ ...cartStyles.viewRow, marginVertical: '2%' }}>
                                        <Text style={{ color: 'gray', fontWeight: 'bold' }}>
                                            {'Variante: '}
                                        </Text>
                                        <Text style={{ color: BasicColors.THEME_COLOR_SEC, fontWeight: 'bold' }}>
                                            {data.variants.name}
                                        </Text>    
                                    </View>
                                    <View style={{ ...cartStyles.viewRow, marginVertical: '2%' }}>
                                        <Text style={{ color: 'gray', fontWeight: 'bold' }}>
                                            {'Cantidad: '}
                                        </Text>
                                        <Text style={{ color: BasicColors.THEME_COLOR_SEC, fontWeight: 'bold' }}>
                                            {data.cart.totalUnit}
                                        </Text>    
                                    </View>
                                    <View style={{ ...cartStyles.viewRow, marginVertical: '2%' }}>
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
                                                        style={cartStyles.viewRow}
                                                        key={index}
                                                        >    
                                                        <View style={{ ...cartStyles.viewRow, justifyContent: 'space-between' }}>
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
                                <View style={{ ...cartStyles.viewRow, marginTop: '3%' }}>
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
        </View>
        
    )

    const renderModalItem = ({ item }) => (
        <TouchableOpacity
            disabled={loading.loading}
            style={{ ...cartStyles.item, marginVertical: '2%' }}
            onPress={() => 
                alerButtom('Hey!', 
                `Seguro que desea enviar los productos a ${item.locationName}, ${item.cityName}, ${item.stateName}`,
                () => sendBill(item))
            }
            >
            <Text style={{ ...cartStyles.tittleItem, color: BasicColors.THEME_COLOR_SEC }}>
                {`${item.locationName}, ${item.cityName}, ${item.stateName}`}
            </Text>
            <Text style={{ color: 'gray' }}>
                {item.locationDescription} 
            </Text> 
        </TouchableOpacity>
    )
    const EnterpriseItemC = ({ item }) => (
        <View>
            <View style={cartStyles.viewEnterpriseItem}>
                <TouchableOpacity 
                    onPress={() => handleAllProductsCheckBox(item)}
                    style={ cartStyles.viewRow}>
                    <CheckBox
                        disabled={loading.loading}
                        onPress={() => handleAllProductsCheckBox(item)} 
                        checked={item.flag}
                    /> 
                    <View style={cartStyles.viewRow}>
                        <View style={{ width: '80%' }}>
                            <Text style={{ color: BasicColors.THEME_COLOR_SEC, fontWeight: 'bold' }}>
                                Seleccionar todo de {item.name} 
                            </Text>
                            <Text style={{ paddingLeft: '3%', color:'green', fontWeight: 'bold' }}>
                                $ {Number.parseFloat(item.totalCost).toFixed(2)}
                            </Text>
                        </View>
                        <Icon 
                            color='gray' 
                            size={30} 
                            name='trash-outline' 
                            type='ionicon'
                            onPress={() => 
                                alerButtom('Hey!', 
                                `Seguro que quiere eliminar todo de ${item.name}?`,
                                () => deleteEnterprise(item))
                            }
                        />
                    </View>
                </TouchableOpacity>
                <View style={cartStyles.enterpriseItem}>
                    <TouchableOpacity
                        style={{ ...cartStyles.viewRow, width: '70%' }}
                        onPress={() => navigation.navigate('Enterprise', { data: item })}
                        >
                        { 
                            (item.img != null)
                            ? <Image
                                source={{ uri: `data:image/png;base64,${item.img}` }}
                                containerStyle={cartStyles.img}
                            />
                            : <Avatar 
                                size="medium"
                                containerStyle={{ ...cartStyles.img,  backgroundColor: 'lightgray' }}
                                icon={{ name: 'camera-outline', color: 'white', type: 'ionicon', size: 40 }} 
                            />
                        }
                        <View style={{ paddingLeft: '3%' }}>
                            <Text style={cartStyles.name}>
                                {item.name}
                            </Text>
                            <Text style={cartStyles.tittleItem}>
                                {item.location.locationName}, {item.location.cityName}, {item.location.stateName}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <Icon 
                        color='gray' 
                        size={30} 
                        onPress={()=> handleOpen(item.id)}
                        name={(item.open) ? 'chevron-up-outline': 'chevron-down-outline'} 
                        type='ionicon'
                    />
                </View>
                {
                    (!item.open)
                    ? null
                    : item.products.map((data, index) => (
                        <TouchableOpacity 
                            onPress={() => handleProductCheckBox(item, data)} 
                            onLongPress={() => { setModal({ ...modal, flag: true, data }); }}
                            style={cartStyles.viewRow}
                            key={index}
                            >
                            <CheckBox
                                disabled={loading.loading}
                                onPress={() => handleProductCheckBox(item, data)}
                                checked={data.flag}
                            />
                            <View style={cartStyles.viewRow}>
                                {
                                    (data.img == null)
                                    ? <Avatar 
                                        size="medium"
                                        containerStyle={{ ...cartStyles.img,  backgroundColor: 'lightgray', width: 55, height: 55 }}
                                        icon={{ name: 'camera-outline', color: 'white', type: 'ionicon', size: 40 }} 
                                    />
                                    : <Image
                                        source={{ uri: `data:image/png;base64,${data.img}` }}
                                        containerStyle={{ ...cartStyles.img, width: 55, height: 55 }}
                                    /> 
                                }
                                <View style={{ ...cartStyles.viewRow, justifyContent: 'space-between' }}>
                                    <View style={{ padding: '3%', width: '60%' }}>
                                        <Text style={cartStyles.tittleItem}>
                                            {data.name}      
                                        </Text>
                                        {
                                            (data.status && data.variants.status)
                                            ? <Text>
                                                {'   '}
                                            </Text>
                                            : <Text style={{ color: 'red', marginTop: '2%', fontWeight: 'bold' }}>
                                                No diponible
                                            </Text>
                                        }
                                        <View style={cartStyles.viewRow}>
                                            <Text style={{ color: 'gray', marginTop: '2%', fontWeight: 'bold' }}>
                                                {'Cantidad: '} 
                                            </Text>
                                            <Text style={{ color: BasicColors.THEME_COLOR_SEC, marginTop: '2%', fontWeight: 'bold' }}>
                                                {data.cart.totalUnit}
                                            </Text>
                                        </View>
                                        <View style={cartStyles.viewRow}>
                                            <Text style={{ color: 'gray', fontWeight: 'bold' }}>
                                                {'Costo total: '}
                                            </Text>
                                            <Text style={{ color: 'green', fontWeight: 'bold' }}>
                                                $ {Number.parseFloat(data.cart.totalMount).toFixed(2)}
                                            </Text>  
                                        </View>
                                    </View>
                                    <View style={{ paddingEnd: '1%' }}>
                                        <Icon 
                                            color='gray' 
                                            size={30} 
                                            name='trash-outline' 
                                            type='ionicon'
                                            onPress={() => 
                                                alerButtom('Hey!', 
                                                `Seguro que quiere eliminar ${data.name}?`,
                                                () => deleteProduct(item, data))
                                            }
                                        />
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                }
            </View>
        </View>
    )   

    const refresh = () => {
        setBill(BILL_BLANK);
        getMee().then((res) => setMe(res));
        getDirections().then(res => {
            setDirections(res);

            if(res.length < 1) {
                Alert.alert('Recuerda!', 'No posees direcciones guardadas, debes crear una direccion como minimo para tener destino del pedido');
            }
        });

        getCart().then(res => { 
            setCart(res);
            handleAllMount(res);
            setLoading({ ...loading, loading: false, first: false });
        }); 
    }

    useEffect(() => {  
        refresh(); 
    }, []);

    return (
        <View style={cartStyles.container}>
            <ModalListC       
                vissible={modal.flag2}
                tittle='Destino'
                renderItem={renderModalItem}
                onCancel={() => setModal({ ...modal, flag2: false })}
                data={directions}
            />
            <ModalListC
                tittle='Historial de pedidos'
                vissible={modal.history}
                onCancel={() => setModal({ ...modal, history: false })}
                renderItem={ModalRenderItemHistory}
                data={history}
            />
            <Modal
                animationType="slide"
                transparent
                visible={modal.flag}
                onRequestClose={() => setModal({ ...modal, flag: false })}
                >
                <View style={cartStyles.centeredView}>
                    <View style={cartStyles.modalView}>
                        <Text style={cartStyles.tittleItem}>
                            {modal.data.name}
                        </Text>
                        <View style={{ flexDirection: 'row' }}>
                            {
                                (modal.data.img == null)
                                ? <Avatar 
                                    size="medium"
                                    containerStyle={{ ...cartStyles.img,  backgroundColor: 'lightgray' }}
                                    icon={{ name: 'camera-outline', color: 'white', type: 'ionicon', size: 40 }} 
                                />
                                : <Image
                                    source={{ uri: `data:image/png;base64,${modal.data.img}` }}
                                    containerStyle={{ ...cartStyles.img }}
                                /> 
                            }
                            
                            <View style={{ paddingLeft: '3%', width: '80%' }}>
                                <ScrollView>
                                    <Text style={{ color: 'gray' }}>
                                        {modal.data.description}
                                    </Text>
                                    {
                                        (modal.data.status && modal.data.variants.status)
                                        ? <Text>
                                            {' '}
                                        </Text>
                                        : <Text style={{ color: 'red', marginTop: '2%', fontWeight: 'bold' }}>
                                            No diponible
                                        </Text>
                                    }
                                    <View>
                                        <View  style={{ ...cartStyles.viewRow, marginVertical: '2%' }}>
                                            <Text style={{ color: 'gray', fontWeight: 'bold' }}>
                                                {'Variante: '}
                                            </Text>
                                            <Text style={{ color: BasicColors.THEME_COLOR_SEC, fontWeight: 'bold' }}>
                                                {modal.data.variants.name}
                                            </Text>    
                                        </View>
                                        {
                                            (modal.data.variants.status)
                                            ? null 
                                            : <Text style={{ color: BasicColors.THEME_COLOR_SEC, fontWeight: 'bold' }}>
                                                (No disponible)
                                            </Text>
                                        }
                                    </View>
                                    <View style={{ ...cartStyles.viewRow, marginVertical: '2%' }}>
                                        <Text style={{ color: 'gray', fontWeight: 'bold' }}>
                                            {'Cantidad: '}
                                        </Text>
                                        <Text style={{ color: BasicColors.THEME_COLOR_SEC, fontWeight: 'bold' }}>
                                            {modal.data.cart.totalUnit}
                                        </Text>    
                                    </View>
                                    <View style={{ ...cartStyles.viewRow, marginVertical: '2%' }}>
                                        <Text style={{ color: 'gray', fontWeight: 'bold', width: '50%' }}>
                                            {'Precio: '}
                                        </Text>
                                        <View style={{ flexDirection: 'row-reverse', width: '50%' }}>
                                            <Text style={{ color: 'green', fontWeight: 'bold' }}>
                                                $ {Number.parseFloat(modal.data.price).toFixed(2)}
                                            </Text>    
                                        </View>
                                    </View>
                                    {
                                        (!modal.data.extras.length)
                                        ? null
                                        : <View>   
                                            <Text style={{ marginVertical: '2%', fontWeight: 'bold', color: BasicColors.THEME_COLOR_SEC }}>
                                                Extras selecionados
                                            </Text>
                                            {
                                                modal.data.extras.map((item, index) => (
                                                    <View 
                                                        style={cartStyles.viewRow}
                                                        key={index}
                                                        >    
                                                        <View style={{ ...cartStyles.viewRow, justifyContent: 'space-between' }}>
                                                            <View style={{ width:  '50%' }}>
                                                                <Text style={{ color: 'gray', fontWeight: 'bold' }}>
                                                                    {item.name}   
                                                                </Text>
                                                                {
                                                                    (item.status)
                                                                    ? null 
                                                                    :<Text style={{ color: BasicColors.THEME_COLOR_SEC, fontWeight: 'bold' }}>
                                                                        (No disponible)
                                                                    </Text> 
                                                                }
                                                            </View>    
                                                            <View style={{ width: '50%', flexDirection: 'row-reverse' }}>
                                                                <Text style={{ color: 'green', fontWeight: 'bold', paddingRight: '2%' }}>
                                                                    $ {Number.parseFloat(item.price).toFixed(2)}
                                                                </Text>
                                                            </View> 
                                                        </View>
                                                    </View>
                                                ))
                                            }
                                        </View>
                                    }
                                </ScrollView>
                                <View style={{ ...cartStyles.viewRow, marginTop: '3%' }}>
                                    <View style={{ width: '50%' }}>
                                        <Text style={{ color: BasicColors.THEME_COLOR_SEC, fontWeight: 'bold' }}>
                                            Monto total:   
                                        </Text> 
                                    </View>
                                    <View style={{ width: '50%', flexDirection: 'row-reverse' }}>
                                        <Text style={{ color: 'green', fontWeight: 'bold', paddingRight: '2%' }}>
                                            $ {Number.parseFloat(modal.data.cart.totalMount).toFixed(2)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>    
                    </View>
                </View>
            </Modal>
            <HeaderC 
                title='Carrito'
                leftIconAction={() => navigation.goBack()}
                rightIcon='book'
                cartAction={() => handleBillHistory()}
            />
            <View style={cartStyles.body}>
                {
                    (!loading.loading && cart.length)
                    ? <View>
                        <View style={{  borderBottomWidth: 0.5, borderBottomColor: 'lightgray', paddingBottom: '1%' }}>
                            <Text style={{ color: 'gray' }}>
                                {'Elejir productos deseados -> Elegir destino -> Pagar'}
                            </Text>
                            <View style={{ ...cartStyles.viewRow, justifyContent: 'space-between', marginTop: '3%' }}>
                                <View style={{ width: '49%', ...cartStyles.viewRow, ...cartStyles.viewBalance }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                                        { 'Balance: ' }
                                    </Text>
                                    <Text style={cartStyles.textButton}>
                                    $ {Number.parseFloat(me.balance).toFixed(2)}
                                    </Text>
                                </View>
                                <View style={{ width: '49%', ...cartStyles.viewRow, ...cartStyles.viewBuy }}>
                                    <Text style={cartStyles.textButton}>
                                        {'Monto: '}
                                    </Text>
                                    <Text style={cartStyles.textButton}>
                                    $ {Number.parseFloat(bill.mount).toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity 
                                onPress={() => handleAllCheckBox()}
                                style={ cartStyles.viewRow}>
                                <CheckBox
                                    disabled={loading.loading}
                                    onPress={() => handleAllCheckBox()} 
                                    checked={all.flag}
                                /> 
                                <View style={cartStyles.viewRow}>
                                    <Text style={{ color: BasicColors.THEME_COLOR_SEC, fontWeight: 'bold' }}>
                                        Seleccionar todo
                                    </Text>
                                    <Text style={{ paddingLeft: '3%', color:'green', fontWeight: 'bold' }}>
                                        $ {Number.parseFloat(all.totalMount).toFixed(2)}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View> 
                    : null
                }
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={loading.loading && !loading.first}
                            onRefresh={refresh}
                        />
                    }
                    >
                    {
                        (loading.first)
                        ? <View style = {{ marginTop: '70%' }}>
                            <ActivityIndicator size="large" color={BasicColors.THEME_COLOR_SEC}/>  
                        </View>
                        : (cart.length)
                        ? <View>
                            {
                              cart.map((item, index) => (
                                  <View 
                                      key={index}
                                      style={{ paddingVertical: '3%', paddingHorizontal: '1%' }}
                                      >
                                        {
                                            (item.empty)
                                            ? null
                                            : <EnterpriseItemC item={item}/>
                                        }
                                  </View>
                              ))
                            }  
                        </View> 
                        : <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: 'lightgray', fontWeight: 'bold', fontSize: 30 }}>
                                Carrito sin productos 
                            </Text>    
                        </View> 
                    }           
                </ScrollView>
                {
                    (bill.products.length < 1)
                    
                    ? null
                    : <TouchableOpacity
                        style={cartStyles.button}
                        onPress={handleButton}
                        >     
                        <Text style={cartStyles.textButton}>
                            Elegir destino
                        </Text>
                    </TouchableOpacity>
                }
            </View>
        </View>
    )
}

export default Cart;

const cartStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },

    viewRow: {
        flexDirection: 'row',
        alignItems: 'center' 
    },

    body: {
        flex: 1,
        paddingHorizontal: '3%',
        backgroundColor: BasicColors.BACKGROUND_COLOR,
        elevation: 10,
        borderTopEndRadius: 10,
        borderTopStartRadius: 10,
    },

    viewEnterpriseItem: {
        paddingRight: '3%', 
        backgroundColor: 'white', 
        marginTop: '3%', 
        borderRadius: 10,
        elevation: 5
    },

    enterpriseItem: {
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    viewBalance: {
        justifyContent: 'space-between', 
        backgroundColor: 'green', 
        borderRadius: 10, 
        padding: '3%'
    },

    viewBuy: {
        justifyContent: 'space-between', 
        backgroundColor: BasicColors.THEME_COLOR_SEC, 
        borderRadius: 10, 
        padding: '3%'
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

    img: {
        borderRadius: 5, 
        width: 65, 
        height: 65, 
        resizeMode: 'contain'
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


    name: {
        fontWeight: "bold", 
        color: BasicColors.THEME_COLOR_SEC,
        fontSize: 30, 
    },

    tittleItem: { 
        color:'gray', 
        fontWeight: "bold", 
        fontSize: 20 
    },

    item: {
        paddingVertical: '1%',
        backgroundColor: 'white' , 
        borderRadius: 10, 
        paddingHorizontal: '3%',
        paddingVertical: '4%',
        justifyContent: 'space-between', 
        elevation: 2 
    },

    viewItem: {
        padding: '2%',
        width: '100%',
        backgroundColor: BasicColors.BACKGROUND_COLOR,
    },

    textItem: {
        fontWeight: "bold", 
        color: BasicColors.THEME_COLOR_SEC, 
        fontSize: 20
    },

    ModalListItemText: {
        color: BasicColors.THEME_COLOR_MAIN, 
        fontWeight: 'bold', 
        paddingRight: '3%'
    },
})