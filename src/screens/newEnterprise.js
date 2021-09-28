import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput,
    StyleSheet, 
    ToastAndroid, 
    TouchableOpacity, 
    ScrollView,
    Alert, 
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon, Avatar, CheckBox } from 'react-native-elements'
import DateTimePicker from "@react-native-community/datetimepicker";

import Field from '../components/Field';
import ImagePicker from '../components/ImagePicker';
import DocumentPicker from '../components/documentPicker';
import HeaderC from '../components/Header';
import ModalListC from '../components/ModalSearchList';
import Http from '../components/Http';

import * as BasicColors from '../styles/basic';


const MAX_STEP = 5;
const DAYS = [
    { name: 'Domingo', flag: false },
    { name: 'Lunes', flag: false },
    { name: 'Martes', flag: false },
    { name: 'Miercoles', flag: false },
    { name: 'Jueves', flag: false },
    { name: 'Viernes', flag: false },
    { name: 'Sabado', flag: false }
]

const ENTERPRISE_BLANK = {
    name: '',
    img: null,
    location: null,
    tag: [],
    document: [],
    operationalDays: {
        closeHour: null,
        openHour: null,
        days: DAYS
    },
}

const abortController = new AbortController();

const NewEnterprise = ({ navigation }) => { 
    const [enterprise, setEnterprise] = useState(ENTERPRISE_BLANK);
    const [loading, setLoading] = useState(false);
    const [dateFlag, setDateFlag] = useState({ open: false, close: false });
    const [modal, setmodal] = useState(false);
    const [tags, setTags] = useState([]);
    const [step, setStep] = useState(1);  

    const toast = (message) => { 
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.TOP
        );
    }

    const handleModalItem = (item) => { 
        const aux = enterprise.tag.filter(i  => i != item);
        aux.push(item);
        
        setEnterprise({ ...enterprise, tag: aux });
        setmodal(false);
    }

    const handleButton = async () => {
        switch(step) {
            case 1:
                (!Field.checkFields([ enterprise.name ])) 
                ? Alert.alert('Disculpe', 'Introduzca el nombre del negocio.')
                : setStep(step + 1);
                break;
            
            case 2:
                !(enterprise.operationalDays.openHour && enterprise.operationalDays.closeHour)
                ? Alert.alert('Disculpe', 'No a ingresado horarios para su negocio.')
                : (enterprise.tag.length < 1)
                ? Alert.alert('Disculpe', 'Debe elegir como minimo un rubro para su negocio.')
                : setStep(step + 1);
                break;

            case 3:
                const aux = enterprise.operationalDays.days.filter(i => i.flag == true);
                
                (aux.length < 1) 
                ? Alert.alert('Disculpe', 'Debe elegir como minimo un dia de trabajo para su negocio.')
                : setStep(step + 1);
                break;
                
            case 4:
                (!enterprise.location)
                ? Alert.alert('Disculpe', 'Introduzca la direccion del negocio.')
                : setStep(step + 1)
                break;

            case 5:
                if(enterprise.document.length < 1) {
                    Alert.alert('Disculpe', 'Introduzca los documentos que validan su negocio.')

                } else {
                    if(loading) {
                        abortController.abort();
                    }
        
                    submitEnterprise();
                }
                break;
                
            default:
                Alert.alert('Error on handleButton')
                break;
        }
    }

    const handlePicker = (date) => { 
        if(date) {
            let opAux = enterprise.operationalDays;
            let dateAux = date.timestamp.toString().split(' ')[4].split(':').splice(0,2).join(':');
            
            (dateFlag.open)
            ? opAux = { ...opAux, openHour: dateAux }
            : opAux = { ...opAux,  closeHour: dateAux }

            setEnterprise({ ...enterprise, operationalDays: opAux })
            setDateFlag({ open: false, close: false });  
        } 
    }

    const getDoc = async () => {
        const aux = enterprise.document.filter(i => doc != i);
        const doc = await DocumentPicker.getDocument();
        
        
        aux.push(doc);
        setEnterprise({ ...enterprise, document: aux });
    }

    const deleteDoc = (doc) => {
        const aux = enterprise.document.filter(i => doc != i);

        setEnterprise({ ...enterprise, document: aux });
    }

    const pressAvatar = async() => {
        const img = await ImagePicker.getImage();

        if(img == null) {
            return;
        }
        
        setEnterprise({ ...enterprise, img: img.base64 });
    }

    const deleteTag = (tag) => {
        const aux = enterprise.tag.filter(i => i != tag);
        
        setEnterprise({ ...enterprise, tag: aux });
    }

    const getTags = async () => {
        const data = await Http.send('GET', 'tag', null, null); 

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
    
    const submitEnterprise = async () => {
        setLoading(true); 
        const token = await AsyncStorage.getItem('token'); 
        const data = await Http.send('POST', 'enterprise', enterprise, token, abortController.signal);

        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');
            
        } else { 
            switch(data.typeResponse) { 
                case 'Success':  
                    toast(data.message);
                    Alert.alert(
                        data.body.code, 
                        'Su peticion sera procesada por el personal y se le repondera por via email, este proceso no deberia de durar mas de 24h.'
                    );

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

    const callBack = (location) => {  
        setEnterprise({ ...enterprise, location });
    }

    const checkBoxAction = (item) => {
        const aux = enterprise.operationalDays.days.map(day => {   
            if(day.name == item.name) { 
                return { ...item, flag: !item.flag }; 
            
            } else { 
                return day 
            }
        });

        setEnterprise({ ...enterprise, operationalDays: { ...enterprise.operationalDays, days: aux } });
    }

    const CheckBoxItemC = ({ item, action }) => (
        <TouchableOpacity 
            onPress={action}
            style={NEStyles.viewRow}
            >
            <CheckBox
                checked={item.flag}
                onPress={action}
            />
            <Text style={{ color: 'gray', fontWeight: 'bold' }}>
                {item.name}   
            </Text>
        </TouchableOpacity>
    )

    const TagC = ({ text, action }) => (
        <View style={NEStyles.viewTag}>
            <View style={{ width: '80%' }}>
                <Text style={NEStyles.textTag}>
                    {text}
                </Text>
            </View>
            <Icon 
                color='white'
                size={20} 
                name='close' 
                type='ionicon'
                onPress={action}
            />
        </View>
    )

    useEffect(() => {  
        getTags().then(res => setTags(res)); 
    }, []);

    return (
        <View style={NEStyles.container}>
            {
                (dateFlag.open || dateFlag.close) && (
                    <DateTimePicker
                    testID="dateTimePicker"
                    value={new Date()}
                    mode='time'
                    is24Hour={true}
                    isplay="spinner"
                    onChange={e => handlePicker(e.nativeEvent)}
                    onTouchCancel={() => setDateFlag({ open: false, close: false })}
                    />
                )
            }
            <ModalListC       
                vissible={modal}
                tittle={'Rubro'}
                onCancel={() => setmodal(false)}
                onPressItem={handleModalItem.bind(this)}
                data={tags}
            />
            <HeaderC 
                title='Nuevo negocio'
                leftIconAction={()=> navigation.goBack()}
                cartAction={()=> alert('envia a carrito')}
            />
            <View style={NEStyles.body}>
                <ScrollView>
                    <View style={NEStyles.viewCenter}>
                        <Text style={NEStyles.textInput}>
                            Introduce los datos requeridos ({step}/{MAX_STEP})
                        </Text>  
                    </View>
                    {
                        (step == 1)
                        ? <View>
                            <View style={{ alignItems: 'center', paddingTop: 10  }}>
                                {
                                    (enterprise.img != null) 
                                    ? <Avatar 
                                        onPress={pressAvatar} 
                                        rounded 
                                        source={{ uri: `data:image/png;base64,${enterprise.img}` }}
                                        size="xlarge" 
                                    />
                                    : <Avatar 
                                        onPress={pressAvatar} 
                                        rounded 
                                        size="xlarge"
                                        containerStyle={{ backgroundColor: 'lightgray' }}
                                        icon={{ name: 'image', color: 'white', type: 'ionicon', size: 100 }} 
                                    />
                                }
                            </View>              
                            <View style={NEStyles.input}>
                                <TextInput
                                    placeholder="Nombre del negocio"
                                    blurOnSubmit={false}
                                    onChangeText={name => setEnterprise({ ...enterprise, name })}
                                    onSubmitEditing={handleButton}
                                    value={enterprise.name}
                                />
                            </View>
                        </View>
                        : (step == 2)
                        ? <View>
                            <Text style={NEStyles.textInput}>
                                Hora deseada para comenzar a recibir pedidos
                            </Text>
                            <TouchableOpacity 
                                style={NEStyles.input}
                                onPress={() => setDateFlag({ ...dateFlag, open: true })}
                                >
                                <Text style={{ color: 'gray' }}>
                                    {
                                        (enterprise.operationalDays.openHour)
                                        ? enterprise.operationalDays.openHour
                                        : '...'
                                    }
                                </Text>
                            </TouchableOpacity>
                            <Text style={NEStyles.textInput}>
                                Hora deseada para dejar de recibir pedidos
                            </Text>
                            <TouchableOpacity
                                style={NEStyles.input}
                                onPress={() => setDateFlag({ ...dateFlag, close: true })}
                                >
                                <Text style={{ color: 'gray' }}>
                                    {
                                        (enterprise.operationalDays.closeHour)
                                        ? enterprise.operationalDays.closeHour
                                        : '...'
                                    }
                                </Text>
                            </TouchableOpacity>
                            <Text style={NEStyles.textInput}>
                                Cual es el rubro de tu empresa?
                            </Text>
                            <TouchableOpacity 
                                onPress={() => setmodal(true)}
                                style={NEStyles.input}
                                >
                                <Text style={{ color: 'gray' }}>
                                    Ver rubros...
                                </Text>
                            </TouchableOpacity>
                            {
                                (!enterprise.tag)
                                ? null
                                : enterprise.tag.map((item, index) => (
                                    <TagC
                                        key={index}
                                        text={item.name}
                                        action={() => deleteTag(item)} 
                                    />
                                ))
                            }
                        </View>
                        : (step == 3)
                        ? <View>
                            <Text style={NEStyles.textInput}>
                                Cuales dias de la semana trabajas?
                            </Text>
                            {
                                enterprise.operationalDays.days.map((item, index) => (
                                    <CheckBoxItemC
                                        key={index}
                                        item={item}
                                        action={() => checkBoxAction(item)}
                                    />
                                ))
                            }
                        </View>
                        : (step == 4)
                        ? <TouchableOpacity
                                style={NEStyles.input}
                                onPress={() => navigation.navigate('NewDirection', { callBack: callBack.bind(this), type: 'enterprise' })}
                                >
                                <Text style={{ color: 'gray' }}>
                                    {
                                        (!enterprise.location)
                                        ? 'Ubicacion del negocio'
                                        : `${enterprise.location.locationName}, ${enterprise.location.cityName}, ${enterprise.location.stateName}`
                                    }
                                </Text>
                            </TouchableOpacity>
                        : <View> 
                            <TouchableOpacity
                                style={NEStyles.viewImg}
                                onPress={getDoc}
                                >
                                <Text style={NEStyles.textItem}>
                                    Adjutar archivo o imagen
                                </Text>
                            </TouchableOpacity>
                            {
                                (enterprise.document.length < 1)
                                ? null
                                : enterprise.document.map((item, index) => (
                                    <TagC
                                        key={index}
                                        text={item.name}
                                        action={() => deleteDoc(item)}
                                    />
                                )) 
                            }
                        </View>
                    }
                    <TouchableOpacity
                        style={NEStyles.button}
                        onPress={handleButton}
                        >     
                        {
                            (loading) 
                            ? <ActivityIndicator size="small" color={BasicColors.THEME_COLOR_SEC} /> 
                            : <Text style={NEStyles.textButton}>
                                {
                                    (step == MAX_STEP) 
                                    ? 'Finalizar'
                                    : 'Siguiente'
                                }
                            </Text>
                        }
                    </TouchableOpacity>
                    {
                        (step == 1)
                        ? null
                        : <View style={NEStyles.viewTextBack}>
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
            </View>
        </View>
    )
}

export default NewEnterprise;

const NEStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },

    body: {
        flex: 1,
        padding: '3%',
        backgroundColor: BasicColors.BACKGROUND_COLOR,
        elevation: 10,
        borderTopEndRadius: 10,
        borderTopStartRadius: 10,
    },

    textInput: {
        color: BasicColors.THEME_COLOR_SEC, 
        marginTop: '3%', 
        fontWeight:'bold' 
    },

    viewCenter: {
        alignItems:'center',
        justifyContent: 'center'
    },

    viewRow: {
        alignItems: "center",
        flexDirection: 'row'
    },
 
    input: {
        marginTop: '3%', 
        padding: '3%',
        backgroundColor: 'white', 
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

    viewTextBack: {
        marginTop: '3%',
        flexDirection: "row",
        justifyContent: "center"  
    },

    textItem: {
        fontWeight: "bold", 
        color: BasicColors.THEME_COLOR_SEC, 
        fontSize: 20
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

    viewImg: {
        marginTop: '3%', 
        justifyContent:'center', 
        alignItems:'center', 
        borderRadius: 10, 
        borderWidth: 1, 
        borderColor: 'lightgray', 
    },

    avatar: {
        borderRadius: 10, 
        marginRight: '3%', 
        elevation: 2, 
        backgroundColor: BasicColors.THEME_COLOR_MAIN 
    },
})