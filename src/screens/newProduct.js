import React, { useState } from 'react';
import { 
    Alert, 
    ActivityIndicator, 
    StyleSheet,  
    Text, 
    TextInput, 
    ToastAndroid, 
    TouchableOpacity, 
    ScrollView,
    Modal,
    View
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon, Avatar, Image, CheckBox } from 'react-native-elements';

import Http from '../components/Http';
import Field from '../components/Field';
import ModalListC from '../components/ModalSearchList';
import ImagePicker from '../components/ImagePicker';
import HeaderC from '../components/Header';

import * as BasicColors from '../styles/basic';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs();

const MAX_STEP = 3;
const PRODUCT_BLANK= {
    id: 0,
    name: '',
    price: '',
    description: '',
    img: null,
    status: true,
    variants: [],
    extras: [],
    productTag: {
        id: 0,
        name: ''
    }
}

const NEW_VARINAT_BLANK = { id: 0, name: '', status: true }
const NEW_EXTRA_BLANK = { id: 0, name: '',  price: 0.00, status: true }

const newProduct = ({ navigation, route }) => {  
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [descriptionFlag, setDescriptionFlag] = useState(false);
    const [modal, setModal] = useState({ type: '', one: false, two: false });
    const [newVariant, setNewVariant] = useState(NEW_VARINAT_BLANK);
    const [newExtra, setNewExtra] = useState(NEW_EXTRA_BLANK);
    const [input, setInput] = useState(false);
    const [product, setProduct] = useState(
        (route.params.type == 'update') 
        ? route.params.data 
        : PRODUCT_BLANK
    );

    let descriptionInput = '';
    let priceModalInput = '';

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

    const handlerFocusInput = () => {
        (modal.type == 'Extra') 
        ? setNewExtra({ ...newExtra, price: '' })
        : setProduct({ ...product, price: '' }); 

        setInput(true)
    }

    const handlerProductPrice = () => { 
        let aux;

        (product.price > 1)
        ? aux = Number.parseFloat(product.price).toFixed(2)
        : aux = 0;

        setProduct({ ...product, price: aux });
        setInput(false);
    }

    const pressAvatar = async() => {
        const img = await ImagePicker.getImage();

        if(img == null) {
            return;
        }
        
        setProduct({ ...product, img: img.base64 });
    }

    const handleButton = () => {
        switch(step) {
            case 1:
                (!Field.checkFields([ product.name, product.description ])) 
                ? Alert.alert('Disculpe', 'Introduzca el nombre y descipcion del producto.')
                : setStep(step + 1); 
                break;

            case 2:
                !(product.productTag.id != 0 && product.price > 0)
                ? Alert.alert('Disculpe', 'Introduzca seccion y precio para su producto.')
                : setStep(step + 1);
                break;
            
            case 3:
                summitProduct();
                break;

            default:
                Alert.alert('Error', step + 'no valido')
                break;
        }        
    }

    const handleModalItem = (data) => {
        setProduct({ ...product, productTag: data });
        setModal({ ...modal, one: false });
    }

    const addActionModal2 = () => {
        let newProduct = product;
        let aux = [];

        switch(modal.type) {
            case 'Extra': 
                if(newExtra.name.length < 1) {
                    Alert.alert('Disculpe', 'Debe llenar los campos requeridos');

                } else {
                    let newExtraAux = newExtra;
                    
                    (newExtra.price < 0) 
                    ? newExtraAux.price = 0
                    : newExtraAux.price = Number.parseFloat(newExtraAux.price).toFixed(2); 
                    
                    aux = product.extras;
                    
                    if (newExtraAux.id == 0) {
                        aux.push(newExtraAux);
                        
                    } else {
                        aux = aux.map(item => {
                            if(item.id == newExtraAux.id) {
                                return newExtraAux;
                            } 
    
                            return item;
                        });
                    }
    
                    newProduct.extras = aux; 
                    setNewExtra(NEW_EXTRA_BLANK);
                }
            
                break;
            
            case 'Variante': 
                if(newVariant.name.length < 1) {
                    Alert.alert('Disculpe', 'Debe llenar los campos requeridos');

                } else {
                    aux = product.variants; 
                    
                    if (newVariant.id == 0) {
                        aux.push(newVariant);
                        
                    } else {
                        aux = aux.map(item => {
                            if(item.id == newVariant.id) {
                                return newVariant;
                            } 
    
                            return item;
                        });
                    }
                    
                    newProduct.variants = aux; 
                    setNewVariant(NEW_VARINAT_BLANK);
                }

                break;
            
            default:
                Alert.alert('Error', 'Default en actionModal2');
                break;
        }

        setProduct(newProduct); 
        setModal({ ...modal, two: false });
    }

    const deleteVariant = (variant) => {
        const variantsAux = product.variants.filter(i => i != variant);

        setProduct({ ...product, variants: variantsAux });
    }

    const deleteExtra = (extra) => {
        const extrasAux = product.extras.filter(i => i != extra);

        setProduct({ ...product, extras: extrasAux });
    }

    const summitProduct = async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        const body = { ...product, enterpriseId: route.params.enterpriseId } 
        let endpoint = (route.params.type == 'update') ? endpoint = 'PUT' : endpoint = 'POST';        
        const data = await Http.send(endpoint, 'product', body, token);

        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');
            
        } else { 
            switch(data.typeResponse) { 
                case 'Success':  
                    toast(data.message);
                    route.params.callBack(route.params.type, data.body);
                    setProduct(PRODUCT_BLANK);
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

    const TagC = ({ text, line2, action, status, deleteAction }) => (
        <View style={NPStyles.viewTag}>
            <TouchableOpacity 
                onPress={(action) ? action : {}}
                style={{ width: '80%', ...NPStyles.viewRow }}
                >
                <CheckBox checked={status}/>
                <View>
                    <Text style={NPStyles.textTag}>
                        {text}
                    </Text>
                    {
                        (!line2)
                        ? null 
                        : <Text style={NPStyles.textTag}>
                            {line2}
                        </Text>
                    }
                </View>
            </TouchableOpacity>
            <Icon 
                color='white'
                size={20} 
                name='close' 
                type='ionicon'
                onPress={deleteAction}
            />
        </View>
    )

    return (
        <View style={NPStyles.container}>
            <Modal
                animationType="slide"
                transparent
                visible={modal.two}
                onRequestClose={() => setModal({ ...modal, two: false })}
                >
                <View style={NPStyles.centeredView}>
                    <View style={NPStyles.modalView}>
                        <Text>
                            {modal.type}
                        </Text>
                        <TouchableOpacity 
                            style={NPStyles.viewRow}
                            onPress={() => 
                                (modal.type == 'Extra')
                                ? setNewExtra({ ...newExtra, status: !newExtra.status })
                                : setNewVariant({ ...newVariant, status: !newVariant.status })
                            }
                            >
                            <CheckBox
                                onPress={() =>
                                    (modal.type == 'Extra')
                                    ? setNewExtra({ ...newExtra, status: !newExtra.status })
                                    : setNewVariant({ ...newVariant, status: !newVariant.status })
                                } 
                                checked={
                                    (modal.type == 'Extra')
                                    ? newExtra.status
                                    : newVariant.status
                                }
                            />
                            <Text style={{ color: 'gray', fontWeight: 'bold' }}>
                                Disponible   
                            </Text>
                        </TouchableOpacity>
                        <View style={{ ...NPStyles.viewRow, ...NPStyles.input, backgroundColor: 'lightgray' }}> 
                            <TextInput
                                placeholder={`Nombre del ${modal.type}`}
                                blurOnSubmit={false}
                                style={{ color: 'gray' }}
                                onChangeText={name => {
                                    (modal.type == 'Extra')
                                    ? setNewExtra({ ...newExtra, name })
                                    : setNewVariant({ ...newVariant, name })
                                }}
                                onSubmitEditing={() =>
                                    (modal.type == 'Extra') 
                                    ? priceModalInput.focus()
                                    : addActionModal2()
                                }
                                value={
                                    (modal.type == 'Extra')
                                    ? newExtra.name
                                    : newVariant.name
                                }
                            />
                        </View>
                        {
                           (modal.type != 'Extra')
                           ? null 
                           : <View style={{ ...NPStyles.viewRow, ...NPStyles.input, backgroundColor: 'lightgray' }}> 
                                <TextInput
                                    ref={ref => priceModalInput = ref}
                                    placeholder={`Precio del ${modal.type} ($)`}
                                    keyboardType='numeric'
                                    blurOnSubmit={false}
                                    maxLength={(input) ? 7 : 10}
                                    onFocus={handlerFocusInput}
                                    style={{ color: 'gray' }}
                                    onChangeText={price => setNewExtra({ ...newExtra, price })}
                                    onSubmitEditing={addActionModal2}
                                    value={String(newExtra.price)}
                                />
                            </View>
                        }
                        <TouchableOpacity
                            style={NPStyles.button} 
                            onPress={addActionModal2}
                            >
                            <Text style={NPStyles.textButton}>
                                Finalizar
                            </Text> 
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <ModalListC       
                vissible={modal.one}
                tittle='Seccion para productos'
                onCancel={() => setModal({ ...modal, one: false })}
                onPressItem={handleModalItem.bind(this)}
                data={route.params.productTags}
            />
            <HeaderC 
                title={(route.params.type == 'update') ? 'Editar producto' : 'Nuevo producto'}
                leftIconAction={() => navigation.goBack()}
                cartAction={()=> navigation.navigate('Cart')}
            />
            <View style={NPStyles.body}>
                <ScrollView>
                    <View style={NPStyles.viewCenter}>
                        <Text style={NPStyles.textInput}>
                            Introduce los datos requeridos ({step}/{MAX_STEP})
                        </Text> 
                    </View> 
                    {
                        (step == 1)
                        ? <View>
                            <View style={{ alignItems: 'center', paddingTop: 10  }}>
                                {
                                    (product.img != null) 
                                    ? <Image
                                        source={{ uri: `data:image/png;base64,${product.img}` }}
                                        containerStyle={NPStyles.img}
                                        onPress={pressAvatar}
                                    />
                                    : <Avatar 
                                        size="xlarge"
                                        containerStyle={{ ...NPStyles.img,  backgroundColor: 'lightgray' }}
                                        icon={{ name: 'image', color: 'white', type: 'ionicon', size: 100 }} 
                                        onPress={pressAvatar} 
                                    />
                                }
                            </View>     
                            {
                                (route.params.type == 'update')
                                ? <View>
                                    <Text style={NPStyles.textInput}>
                                        Disponibilidad del producto   
                                    </Text>
                                    <TouchableOpacity 
                                        onPress={() => setProduct({ ...product, status: !product.status })}
                                        style={NPStyles.viewRow}
                                        >
                                        <CheckBox
                                            onPress={() => setProduct({ ...product, status: !product.status })} 
                                            checked={product.status}
                                        />
                                        <Text style={{ color: 'gray', fontWeight: 'bold' }}>
                                            Disponible  
                                        </Text>
                                    </TouchableOpacity>
                                </View> 
                                : null
                            }         
                            <View>
                                <Text style={NPStyles.textInput}>
                                    Nombre del producto   
                                </Text>
                                <View style={NPStyles.input}>
                                    <TextInput
                                        placeholder="Nombre del producto..."
                                        blurOnSubmit={false}
                                        onChangeText={name => setProduct({ ...product, name })}
                                        value={product.name}
                                        onSubmitEditing={() => {
                                            descriptionInput.focus();
                                            setDescriptionFlag(true);
                                        }}
                                    />
                                </View>    
                            </View>
                            <View>
                                <Text style={NPStyles.textInput}>
                                    Descripcion   
                                </Text>
                                {
                                    (!descriptionFlag)
                                    ? null
                                    : <TouchableOpacity style={NPStyles.button}>
                                        <Text style={NPStyles.textButton}>
                                            Finalizar la descripcion
                                        </Text>
                                    </TouchableOpacity>
                                }  
                                <View style={NPStyles.input}>
                                    <TextInput
                                        ref={ref => descriptionInput = ref}
                                        multiline
                                        onFocus={() => setDescriptionFlag(true)}
                                        numberOfLines={3}
                                        placeholder="Descripcion..."
                                        blurOnSubmit={false}
                                        onChangeText={description => setProduct({ ...product, description })}
                                        onEndEditing={() => setDescriptionFlag(false)}
                                        value={product.description}
                                    />
                                </View>    
                            </View>
                        </View>
                        : (step == 2)
                        ? <View>
                            <View>
                                <Text style={NPStyles.textInput}>
                                    Seccion del producto (debe pertenecer a una)
                                </Text>
                                <TouchableOpacity 
                                    style={NPStyles.input}
                                    onPress={() => setModal({ ...modal, one: true })}
                                    >
                                    <Text style={{ color: 'gray' }}>
                                        {
                                            (product.productTag.id != 0)
                                            ? product.productTag.name
                                            : '...'
                                        }
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View>
                                <Text style={NPStyles.textInput}>
                                    Precio del producto ($)   
                                </Text>
                                <View style={NPStyles.input}>
                                    <TextInput
                                        keyboardType='numeric'
                                        placeholder='0'
                                        maxLength={(input) ? 7 : 10}
                                        onFocus={handlerFocusInput}
                                        onChangeText={price => setProduct({ ...product, price })}
                                        onSubmitEditing={handlerProductPrice}
                                        value={String(product.price)}
                                    />
                                </View>    
                            </View>
                            <View>
                                <Text style={NPStyles.textInput}>
                                    Cree todas las variantes q considere necesario ej: produto: torta, variantes: chocolate, fresa, etc..
                                </Text>
                                <TouchableOpacity 
                                    style={NPStyles.input}
                                    onPress={() => setModal({ ...modal, type: 'Variante', two: true })}
                                    >
                                    <Text style={{ color: 'gray' }}>
                                        Variantes del producto...
                                    </Text>
                                </TouchableOpacity>
                                {
                                    (!product.variants)
                                    ? null
                                    : product.variants.map((item, index) => (
                                        <TagC
                                            key={index}
                                            action={() => { console.log('hola');setModal({ ...modal, type: 'Variante', two: true }); setNewVariant(item) }}
                                            status={item.status}
                                            text={item.name}
                                            deleteAction={() =>
                                                (route.params.type != 'update') 
                                                ? deleteVariant(item)
                                                : alerButtom('Disculpe', `Realmente desea borrar ${item.name}?`, () => deleteVariant(item))
                                            } 
                                        />
                                    ))
                                }
                            </View>
                        </View>
                        : <View>
                            <Text style={NPStyles.textInput}>
                                Cree toda los agregados posibles para su producto ej: producto: pizza, extras: peperoni, jamos, etc...
                            </Text>
                            <View>
                                <TouchableOpacity 
                                    style={NPStyles.input}
                                    onPress={() => setModal({ ...modal, type: 'Extra', two: true })}
                                    >
                                    <Text style={{ color: 'gray' }}>
                                        Extras
                                    </Text>
                                </TouchableOpacity>
                                {
                                    product.extras.map((item, index) => (
                                        <TagC
                                            key={index}
                                            action={() => { setModal({ ...modal, type: 'Extra', two: true }); setNewExtra(item) }}
                                            status={item.status}
                                            text={item.name}
                                            line2={'$ ' + item.price}
                                            deleteAction={() => 
                                                (route.params.type != 'update') 
                                                ? deleteExtra(item)
                                                : alerButtom('Disculpe', `Realmente desea borrar ${item.name}?`, () => deleteExtra(item))
                                                
                                            } 
                                        />
                                    ))
                                }
                            </View>
                        </View>
                    }
                    {
                        (step == 1)
                        ? null
                        : <View style={NPStyles.viewTextBack}>
                            <Text style={{ color: 'gray' }}>
                                Deseas cambiar algo en pasos anteriores?
                            </Text>
                            <TouchableOpacity onPress={() => setStep(step - 1)}>
                                <Text style={{ color: BasicColors.THEME_COLOR_SEC }}>
                                    {' Vuelva atras'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    }
                </ScrollView>
                {
                    (descriptionFlag)
                    ? null
                    : <TouchableOpacity
                        style={NPStyles.button}
                        onPress={handleButton}
                        >     
                        {
                            (loading) 
                            ? <ActivityIndicator size="small" color={BasicColors.THEME_COLOR_SEC} /> 
                            : <Text style={NPStyles.textButton}>
                                {
                                    (step == MAX_STEP) 
                                    ? 'Finalizar'
                                    : 'Siguiente'
                                }
                            </Text>
                        }
                    </TouchableOpacity>
                }
            </View>
        </View>
    )
}

export default newProduct;

const NPStyles = StyleSheet.create({
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

    viewCenter: {
        alignItems:'center',
        justifyContent: 'center'
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

    textButton: {
        color: "white",
        fontWeight: "bold",
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

    viewTextBack: {
        marginTop: '3%',
        flexDirection: "row",
        justifyContent: "center"  
    },

    img: {
        borderRadius: 5, 
        width: 150, 
        height: 150, 
        resizeMode: 'contain'
    },

    viewRow: {
        alignItems: "center",
        flexDirection: 'row'
    },

    viewTag: {
        alignItems: "center",
        flexDirection: 'row',
        marginTop: '3%', 
        borderRadius: 50, 
        backgroundColor: BasicColors.THEME_COLOR_SEC, 
        justifyContent: 'space-between', 
        padding: '1%',
    },

    textTag: {
        color: 'white',
        fontWeight: 'bold'
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
})