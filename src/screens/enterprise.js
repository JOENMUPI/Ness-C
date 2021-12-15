import React, { useState, useEffect } from 'react';
import { 
    Alert, 
    ActivityIndicator, 
    StyleSheet,  
    Text, 
    ToastAndroid, 
    TouchableOpacity, 
    View,
    RefreshControl,
    ScrollView,
    Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon, Avatar, Image, ListItem, CheckBox } from 'react-native-elements';

import ModalListC from '../components/ModalSearchList';
import Http from '../components/Http';
import HeaderC from '../components/Header';
import * as BasicColors from '../styles/basic';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs();

const ENTERPRISE_BLANK = {
    name: 'Negocio',
}

const SP_BLANK = {
    id: 0,
    img: null,
    name: '',
    description: '',
    totalMount: 0.00,
    price: 0.00,
    totalUnit: 0,
    variants: [],
    extras: [],
}

const enterprise = ({ navigation, route }) => { 
    const [loading, setLoading] = useState({ first: true, loading: false });
    const [enterprise, setEnterprise] = useState(route.params.data);
    const [modal, setModal] = useState({ flag: false, flag2: false, title: '', data: [], type: '' });
    const [selectedProduct, setSelectedProduct] = useState(SP_BLANK);

    const toast = (message) => { 
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.TOP
        );
    }
    
    const sectionProductsOrg = (productTag) => {
        let aux = [];
        
        enterprise.products.map(product => {
            if(product.productTag.id == productTag.id) {
                aux.push(product);
            }
        });

        setModal({ data: aux, flag: true, flag2: false, title: productTag.name});
    }

    const handleModalItem = (item) => {
        setSelectedProduct({ ...item, totalMount: item.price, totalUnit: 1 });
        setModal({ ...modal, flag: false, flag2: true, title: item.name });
    }

    const handlerModal2Button = () => {  
        if(selectedProduct.variants.length >= 2) {
            let flag = false;
            
            selectedProduct.variants.map(variant => {
                if(variant.flag) {
                    flag = true;
                }
            });

            (flag)
            ? sendCart(selectedProduct)
            : Alert.alert('Disculpe', 'Debe elegir una variante para agregar el producto.');
        
        } else if (selectedProduct.variants.length > 0) {
            let selectedProductAux = selectedProduct;

            selectedProductAux.variants[0].flag = true;
            sendCart(selectedProductAux);
        
        } else {
            sendCart(selectedProduct);  
        }
    }
    
    const sendCart = async(product) => {
        setModal({ ...modal, flag2: false });
        const token = await AsyncStorage.getItem('token'); 
        let extrasAux = [];
        let variantAux = 0;
        let body = {}
        
        product.extras.map(extra => {
            if(extra.flag) {
                extrasAux.push(extra.id)
            }
        });

        product.variants.map(variant => {
            if(variant.flag) {
                variantAux =  variant.id        
            }
        });
        
        body = {
            extras: extrasAux,
            variantId: variantAux,
            productId: product.id,
            totalUnit: product.totalUnit
        }
        
        const data = await Http.send('POST', `cart`, body, token); 
        
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

    const getEnterprise = async() => {
        setLoading({ ...loading, loading: true });
        const token = await AsyncStorage.getItem('token'); 
        const data = await Http.send('GET', `enterprise/${route.params.data.id}`, null, token); 
        
        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');
            return ENTERPRISE_BLANK; 

        } else { 
            switch(data.typeResponse) {
                case 'Success': 
                    toast(data.message);
                    return data.body;
                    
                case 'Fail':
                    data.body.errors.forEach(element => {
                        toast(element.text);
                    });
                    return ENTERPRISE_BLANK;

                default:
                    Alert.alert(data.typeResponse, data.message);
                    return ENTERPRISE_BLANK; 
            }    
        }
    }

    const handleUnit = (type) => {
        let aux = selectedProduct.price;
        let unitAux = selectedProduct.totalUnit;
        
        (type == 'add') 
        ? unitAux += 1
        : (selectedProduct.totalUnit >= 2)
        ? unitAux -= 1
        : unitAux = unitAux;
        
        selectedProduct.extras.map(extra => {
            if(extra.flag) {
                aux += extra.price;
            }
        });

        aux *= unitAux;
        setSelectedProduct({ ...selectedProduct, totalUnit: unitAux, totalMount: Number.parseFloat(aux).toFixed(2) });
    }

    const RenderModalItemC = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleModalItem(item)} 
            style={EnterpriseStyles.modalItemView}
            >
            {
                (item.img == null)
                ? <Avatar 
                    size="medium"
                    containerStyle={{ ...EnterpriseStyles.img,  backgroundColor: 'lightgray', width: 55, height: 55 }}
                    icon={{ name: 'camera-outline', color: 'white', type: 'ionicon', size: 40 }} 
                />
                : <Image
                    source={{ uri: `data:image/png;base64,${item.img}` }}
                    containerStyle={{ ...EnterpriseStyles.img, width: 55, height: 55 }}
                /> 
            }
            <View style={{ paddingLeft: 10, width: '100%' }}>
                <Text style={EnterpriseStyles.tittleItem}>
                    {item.name} 
                </Text>
                <Text style={{ color: 'gray', width: '80%', marginTop: '2%' }}>
                    {item.description}
                </Text>
                <Text style={{ color: 'green', width: '80%', fontWeight: 'bold', marginTop: '2%' }}>
                    $ {Number.parseFloat(item.price).toFixed(2)}
                </Text>  
            </View>
        </TouchableOpacity>
    ) 

    const ListItemWithImgC = ({ data }) => ( 
        <View style={EnterpriseStyles.viewRow}> 
            <ListItem.Content >
                <TouchableOpacity
                    onPress={() => handleModalItem(data)} 
                    style={{ ...EnterpriseStyles.viewRow,  width: '100%' }}
                    >
                    {
                        (data.img == null)
                        ? <Avatar 
                            size="medium"
                            containerStyle={{ ...EnterpriseStyles.img,  backgroundColor: 'lightgray', width: 55, height: 55 }}
                            icon={{ name: 'camera-outline', color: 'white', type: 'ionicon', size: 40 }} 
                        />
                        : <Image
                            source={{ uri: `data:image/png;base64,${data.img}` }}
                            containerStyle={{ ...EnterpriseStyles.img, width: 55, height: 55 }}
                        /> 
                    }
                    <View style={{ paddingLeft: 10, width: '100%' }}>
                        <Text style={EnterpriseStyles.tittleItem}>
                            {data.name}      
                        </Text>
                        {
                            (data.status)
                            ? <Text>
                                {'   '}
                            </Text>
                            : <Text style={{ color: 'red', marginTop: '2%' }}>
                                No diponible
                            </Text>
                        }
                        <Text style={{ color: 'gray', width: '80%', marginTop: '2%' }}>
                            {data.description}
                        </Text>
                        <Text style={{ color: 'green', width: '80%', fontWeight: 'bold', marginTop: '2%' }}>
                            $ {Number.parseFloat(data.price).toFixed(2)}
                        </Text>  
                    </View>
                </TouchableOpacity>      
            </ListItem.Content>
        </View>
    )

    const checkBoxAction = (item, type) => { 
        let aux;

        switch(type) {
            case 'variant':
                if(item.status) {
                    aux = selectedProduct.variants.map(variant => {
                        if(item.id == variant.id) {
                            return { ...item, flag: !item.flag };
                        }
            
                        return { ...variant, flag: false };
                    });
    
                    setSelectedProduct({ ...selectedProduct, variants: aux });
                }
                break;
            
            case 'extra':
                if(item.status) {
                    let totalMountAux = selectedProduct.price; 
                    
                    aux = selectedProduct.extras.map(extra => {
                        if(extra.flag && item.id != extra.id) {
                            totalMountAux += extra.price; 
                        }
                        
                        if(item.id == extra.id) {     
                            if(!extra.flag) {
                                totalMountAux += extra.price;  
                            } 
                            
                            return { ...item, flag: !item.flag };
                        }
            
                        return extra;
                    });

                    totalMountAux *= selectedProduct.totalUnit; 
                    
                    setSelectedProduct({ ...selectedProduct, extras: aux, totalMount: Number.parseFloat(totalMountAux).toFixed(2) });
                }
                break;
            
            default:
                Alert.alert('Error', 'Default de checkBoxAction'); 
                break;
        }
    }

    const CheckBoxItemC = ({ item, action, type }) => (
        <TouchableOpacity 
            onPress={action}
            style={EnterpriseStyles.viewRow}
            >
            <CheckBox
                checked={item.flag}
                onPress={action}
            />
            <View style={{ ...EnterpriseStyles.viewRow, justifyContent: 'space-between', width: '70%' }}>
                <View style={{ width:  '50%' }}>
                    <Text style={{ color: 'gray', fontWeight: 'bold' }}>
                        {item.name}   
                    </Text>
                    <Text style={{ color: BasicColors.THEME_COLOR_SEC, fontWeight: 'bold' }}>
                        {(!item.status) ? '(No disponible)' : null}
                    </Text> 
                </View>
                {
                    (type == 'Extra')
                    ? <View style={{ width: '50%', flexDirection: 'row-reverse' }}>
                        <Text style={{ color: 'green', fontWeight: 'bold', paddingRight: '2%' }}>
                            $ {Number.parseFloat(item.price).toFixed(2)}
                        </Text>
                    </View> 
                    : null
                }
            </View>
        </TouchableOpacity>
    )

    const refresh = () => {
        getEnterprise().then(res => {  
            setEnterprise(res);
            setLoading({ first: false, loading: false });
        });
    }

    useEffect(() => {  
        refresh(); 
    }, []);

    return (
        <View style={EnterpriseStyles.container}>
            <Modal
                animationType="slide"
                transparent
                visible={modal.flag2}
                onRequestClose={() => setModal({ ...modal, flag2: false })}
                >
                <View style={EnterpriseStyles.centeredView}>
                    <View style={EnterpriseStyles.modalView}>
                        <Text style={EnterpriseStyles.tittleItem}>
                            {modal.title}, {enterprise.name}
                        </Text>
                        <View style={EnterpriseStyles.viewRow}>
                            {
                                (selectedProduct.img == null)
                                ? <Avatar 
                                    size="medium"
                                    containerStyle={{ ...EnterpriseStyles.img,  backgroundColor: 'lightgray' }}
                                    icon={{ name: 'camera-outline', color: 'white', type: 'ionicon', size: 40 }} 
                                />
                                : <Image
                                    source={{ uri: `data:image/png;base64,${selectedProduct.img}` }}
                                    containerStyle={{ ...EnterpriseStyles.img }}
                                /> 
                            }
                            <ScrollView style={{ paddingLeft: '3%'}}>
                                <Text style={{ color: 'gray' }}>
                                    {selectedProduct.description}
                                </Text>
                                {
                                    (selectedProduct.variants.length == 0)
                                    ? null
                                    : <View>   
                                        <Text style={{ marginVertical: '2%', fontWeight: 'bold', color: BasicColors.THEME_COLOR_SEC }}>
                                            Variantes del producto
                                        </Text>
                                        {
                                            (selectedProduct.variants.length > 1)
                                            ? selectedProduct.variants.map((item, index) =>(
                                                <View key={index}>
                                                    <CheckBoxItemC 
                                                        type='variant'
                                                        item={item}
                                                        action={() => checkBoxAction(item, 'variant')}
                                                    />
                                                </View>
                                            ))
                                            : <View style={ EnterpriseStyles.viewRow}>
                                                <CheckBox checked={true}/> 
                                                <View style={{ width:  '50%' }}>
                                                    <Text style={{ color: 'gray', fontWeight: 'bold' }}>
                                                        {selectedProduct.variants[0].name} (Unica opcion)
                                                    </Text>
                                                </View>
                                            </View>
                                        }
                                    </View>
                                }
                                {
                                    (selectedProduct.extras.length < 1)
                                    ? null
                                    : <View>
                                        <Text style={{ marginVertical: '2%', fontWeight: 'bold', color: BasicColors.THEME_COLOR_SEC }}>
                                            Extras
                                        </Text>
                                        {
                                            selectedProduct.extras.map((item, index) =>(
                                                <View key={index}>
                                                    <CheckBoxItemC 
                                                        type='Extra'
                                                        item={item}
                                                        action={() => checkBoxAction(item, 'extra')}
                                                    />
                                                </View>
                                            ))
                                        }
                                    </View>
                                }
                            </ScrollView>
                        </View>
                        <View style={{ ...EnterpriseStyles.viewRow, justifyContent: 'space-between', width:'70%', marginTop: '3%' }}>
                            <View style={{ flexDirection: 'row', alignItems:'center', borderWidth: 1, borderColor: 'gray', borderRadius: 500 }}>
                                <Icon
                                    name='remove-outline'
                                    color={BasicColors.THEME_COLOR_SEC}
                                    type='ionicon'
                                    size={30}
                                    onPress={() => handleUnit('minus')}
                                />
                                <Text style={{ fontWeight: 'bold', color: 'gray', fontSize: 20 }}>
                                    {selectedProduct.totalUnit}
                                </Text>
                                <Icon
                                    name='add-outline'
                                    color={BasicColors.THEME_COLOR_SEC}
                                    type='ionicon'
                                    size={30}
                                    onPress={() => handleUnit('add')}
                                />
                            </View>
                            <View style={{ width: '100%', flexDirection: 'row-reverse' }}>
                                <Text style={{ fontWeight: 'bold', color: 'green', fontSize: 20 }}>
                                    $ {Number.parseFloat(selectedProduct.totalMount).toFixed(2)}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={EnterpriseStyles.button} 
                            onPress={handlerModal2Button}
                            >
                            <Text style={EnterpriseStyles.textButton}>
                                Agregar al carrito  
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <ModalListC       
                vissible={modal.flag}
                tittle={modal.title}
                renderItem={RenderModalItemC}
                onCancel={() => setModal({ ...modal, flag: false })}
                onPressItem={handleModalItem.bind(this)}
                data={modal.data}
            />
            <HeaderC 
                title={enterprise.name}
                leftIconAction={() => navigation.goBack()}
                cartAction={()=> navigation.navigate('Cart')}
            />
            <View style={EnterpriseStyles.body}>
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
                        : <View>
                            <View style={EnterpriseStyles.viewRow}>
                                <View style={{ paddingTop: '3%' }}>
                                    { 
                                        (enterprise.img != null)
                                        ? <Image
                                            source={{ uri: `data:image/png;base64,${enterprise.img}` }}
                                            containerStyle={EnterpriseStyles.img}
                                        />
                                        : <Avatar 
                                            size="medium"
                                            containerStyle={{ ...EnterpriseStyles.img,  backgroundColor: 'lightgray' }}
                                            icon={{ name: 'camera-outline', color: 'white', type: 'ionicon', size: 40 }} 
                                        />
                                    }
                                </View>
                                <View style={{ paddingLeft: '3%' }}>
                                    <Text style={EnterpriseStyles.name}>
                                        {enterprise.name}
                                    </Text>
                                    <Text style={EnterpriseStyles.tittleItem}>
                                        {enterprise.location.locationName}, {enterprise.location.cityName}, {enterprise.location.stateName}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity 
                                style={[ EnterpriseStyles.ViewSearchBar, EnterpriseStyles.viewRow ]}
                                onPress={() => setModal({ ...modal, flag: true, data: enterprise.products })}
                                >
                                <Text style={{ width: '90%', color: 'gray' }}>
                                    ¿Buscas algo en especifico?
                                </Text>
                                <Icon name='search-outline' color='gray' type='ionicon' size={20}/>
                            </TouchableOpacity>
                            <ScrollView 
                                horizontal={true}
                                style={{ padding: '3%', borderRadius: 10, backgroundColor: 'white', width: '100%'}}
                                >
                                {
                                    enterprise.productTag.map((item, index) => (
                                        <TouchableOpacity 
                                            onPress={() => sectionProductsOrg(item)}
                                            key={index}
                                            style={EnterpriseStyles.viewTag}
                                            >
                                            <Text style={{ ...EnterpriseStyles.tittleItem, color: 'white', margin: 10 }}>
                                                {item.name} 
                                            </Text>
                                        </TouchableOpacity>
                                    ))
                                }
                            </ScrollView>
                            { 
                                <View style={EnterpriseStyles.viewList}>
                                    <Text style={{ ...EnterpriseStyles.tittleItem, paddingLeft: '3%' }}>
                                        Productos
                                    </Text>
                                    {
                                        (enterprise.products.length < 1)
                                        ? <View style={{ justifyContent: 'center', alignItems: 'center', padding: '3%' }}>
                                            <Text style={{ color: 'gray', fontWeight: 'bold' }}>
                                                No hay prodcutos disponibles de momento...
                                            </Text>
                                        </View>
                                        : enterprise.products.map((item, index) => (
                                            <ListItem 
                                                key={index} 
                                                bottomDivider
                                                >
                                                <ListItemWithImgC data={item}/>
                                            </ListItem>
                                        ))
                                    }
                                </View> 
                            } 
                        </View>
                    }
                </ScrollView>
            </View>
        </View>
    )
}

export default enterprise;

const EnterpriseStyles = StyleSheet.create({
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
        flexDirection: 'row',
        alignItems: 'center' 
    },

    viewList: {
        marginTop: '3%',
        backgroundColor: 'white', 
        borderRadius: 10 
    },

    tittleItem: { 
        color:'gray', 
        fontWeight: "bold", 
        fontSize: 20 
    },

    name: {
        fontWeight: "bold", 
        color: BasicColors.THEME_COLOR_SEC,
        fontSize: 30, 
    },

    img: {
        borderRadius: 5, 
        width: 65, 
        height: 65, 
        resizeMode: 'contain'
    },

    viewTag: {
        alignItems: "center",
        borderRadius: 10, 
        backgroundColor: BasicColors.THEME_COLOR_SEC, 
        justifyContent: 'space-between', 
        marginStart: 5,
        elevation: 2
    },

    modalItemView: {
        backgroundColor: 'white', 
        flexDirection: 'row', 
        padding: '3%', 
        borderRadius: 10, 
        marginTop: '2%'
    },

    ViewSearchBar: {
        marginVertical: '3%',
        backgroundColor: 'lightgray', 
        height: 40, 
        width: '100%', 
        borderRadius: 5, 
        paddingHorizontal: '2%',
        justifyContent: 'space-between',
        elevation: 3
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
        marginTop: '3%', 
        padding: '3%',
        backgroundColor: 'lightgray', 
        borderRadius: 5  
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
})