import React, { useState, useEffect } from 'react'; 
import { 
    View, 
    Text, 
    StyleSheet,
    ActivityIndicator,
    TextInput,
    Alert,
    TouchableOpacity,
    ToastAndroid,
    ScrollView,
    RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon, Image, Avatar } from 'react-native-elements';

import Http from '../components/Http';
import SearchBar from '../components/SearchBar';
import ModalListC from '../components/ModalSearchList';
import HeaderC from '../components/Header';
import * as BasicColors from '../styles/basic';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs();


const Home = ({ navigation, route }) => { 
    const [loading, setLoading] = useState({ loading: false, refresh: false, tag: false });
    const [search, setSearch] = useState({ data: [], loading: false, flag: false, text: '' });
    const [me, setMe] = useState({ img: null, name: '' });
    const [tags, setTags] = useState([]);
    const [modal, setModal] = useState(false);
    const [enterprises, setEnterprises] = useState([]);

    const toast = (message) => { 
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.TOP
        );
    }

    const handleTag = (tag) => {
        getEnterprises(tag.id);
        setModal(true);
    } 

    const gotoEnterprise = (data) => {
        setModal(false);
        navigation.navigate('Enterprise', { data });
    }
    
    const getMee = async () => {
        return JSON.parse(await AsyncStorage.getItem('user'));
    }

    const seacrhEnterpises = async (value) => { 
        setSearch({ ...search, loading: true });
        const token = await AsyncStorage.getItem('token'); 
        const data = await Http.send('GET', `enterprise/search/${value}`, null, token); 
        let aux = [];
        
        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');
            
        } else { 
            switch(data.typeResponse) {
                case 'Success':
                    toast(data.message);    
                    aux = data.body; 
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

        setSearch({ ...search, data: aux, loading: false, flag: true });
    }

    const renderItem = ({ item }) => (
        <View>
            <Text>
                {item.name}
            </Text>
        </View>
    )  

    const refreshUser = async () => {
        setLoading({ ...loading, refresh: true });
        const token = await AsyncStorage.getItem('token'); 
        const data = await Http.send('GET', 'user/id', null, token); 

        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');
            return me;

        } else { 
            switch(data.typeResponse) {
                case 'Success': 
                    toast(data.message); 
                    return data.body; 
                    
                case 'Fail':
                    data.body.errors.forEach(element => {
                        toast(element.text);
                    });
                    return me;

                default:
                    Alert.alert(data.typeResponse, data.message);
                    return me;
            }    
        }
    }

    const getTags = async () => {
        setLoading({ ...loading, loading: true });
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

    const getEnterprises = async (tagId) => {
        setLoading({ ...loading, tag: true });
        const data = await Http.send('GET', `enterprise/tag/${tagId}`, null, null); 

        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');
            
        } else { 
            switch(data.typeResponse) {
                case 'Success': 
                    toast(data.message); 
                    setEnterprises(data.body);
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

        setLoading({ ...loading, tag: false });
    }

    const refresh = () => {
        refreshUser().then(async (res) =>  {
            await AsyncStorage.setItem('user', JSON.stringify(res));
            setMe(res);
            setLoading({ ...loading, refresh: true });
        });
    }

    const renderModalItem = ({ item }) => (
        <View style={{ ...homeStyles.item, marginTop: '3%'}}>
            <TouchableOpacity 
                style={{ flexDirection: 'row', justifyContent: 'space-between' }}
                onPress={() => gotoEnterprise(item)}
                >
                <View style={{ flexDirection: 'row' }}>
                    {
                        (item.img)
                        ?
                        <Image
                            source={{ uri: `data:image/png;base64,${item.img}` }}
                            containerStyle={homeStyles.img}
                        />
                        : <Avatar 
                            size="medium"
                            containerStyle={{ ...homeStyles.img,  backgroundColor: 'lightgray' }}
                            icon={{ name: 'camera-outline', color: 'white', type: 'ionicon', size: 40 }}   
                        />
                    }
                    <View style={{ paddingLeft: '3%' }}>    
                        <Text style={homeStyles.textItem}>
                            {item.name}
                        </Text>
                    </View>
                </View>  
            </TouchableOpacity>
        </View>
    )

    useEffect(() => {  
        getMee().then(res => setMe(res));
        getTags().then(res => {
            setTags(res);
            setLoading({ ...loading, loading: false });
        }); 
    }, []);

    return (
        <View style={homeStyles.container}>
            <ModalListC       
                vissible={modal}
                tittle='Negocio'
                renderItem={renderModalItem}
                onCancel={() => setModal(false)}
                data={enterprises}
            />
            <SearchBar
                arrayData={search.data}
                vissible={search.flag}
                loadingFlag={search.loading}
                onCancel={() => setSearch({ ...search, flag: false, text: '' })}
                renderItem={renderModalItem}
                searchF={value => seacrhEnterpises(value)}
                valuex={search.text}
            />
            <HeaderC 
                leftIcon='menu'
                leftIconAction={() => navigation.openDrawer()}
                cartAction={()=> navigation.navigate('Cart')}
            />
            <View style={homeStyles.body}>
                {
                    (loading.loading)
                    ? <ActivityIndicator size="large" color={BasicColors.THEME_COLOR_MAIN} />
                    : <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={loading.loading}
                                onRefresh={refresh}
                            />
                        }
                        >
                        <View style={homeStyles.userView}>
                            <Text style={homeStyles.tittleUser}>
                                Hola, {me.name} 
                            </Text>
                            <View style={{ ...homeStyles.viewRow , flexDirection: 'row-reverse'  }}>
                                <View style={homeStyles.balanceView}>
                                    <Text style={homeStyles.tittleUser}>
                                        $ {Number.parseFloat(me.balance).toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={[ homeStyles.ViewSearchBar, homeStyles.viewRow ]}>
                            <TextInput
                                autoCapitalize="none"
                                blurOnSubmit={false}
                                onChangeText={text => setSearch({ ...search, text })}
                                onSubmitEditing={() => seacrhEnterpises(search.text)}
                                placeholder="¿Que deseas hoy?"
                                style={{ color: 'gray', width: '90%' }}
                            />
                            {
                                (search.loading)
                                ? <ActivityIndicator size="small" color={BasicColors.THEME_COLOR_SEC}/>
                                : <Icon name='search-outline' color='gray' type='ionicon' size={20}/>
                            }
                        </View>
                        <View style={{ marginVertical: '1%' }}>
                            {
                                tags.map((item, index) => (
                                    <TouchableOpacity 
                                        onPress={() => handleTag(item)}
                                        style={homeStyles.viewTag}
                                        key={index}
                                        >
                                        <Text style={homeStyles.tittleTag}>
                                            {item.name}
                                        </Text>
                                    </TouchableOpacity>
                                )) 
                            }
                        </View>
                    </ScrollView>
                } 
            </View>      
        </View>
    )
}

export default Home

const homeStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },

    userView: { 
        elevation: 3, 
        backgroundColor: BasicColors.THEME_COLOR_MAIN, 
        height: 105, 
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

    body: {
        flex: 1,
        paddingHorizontal: '3%',
        justifyContent: "center",
        backgroundColor: BasicColors.BACKGROUND_COLOR,
        elevation: 10,
        borderTopEndRadius: 10,
        borderTopStartRadius: 10,
    },

    ViewSearchBar: {
        marginVertical: '2%',
        backgroundColor: 'lightgray', 
        height: 40, 
        width: '100%', 
        borderRadius: 5, 
        paddingHorizontal: '2%',
        justifyContent: 'space-between',
        elevation: 3
    },

    viewTag: {
        borderRadius: 10, 
        borderWidth: 10,
        borderColor: BasicColors.THEME_COLOR_SEC,
        backgroundColor: BasicColors.THEME_COLOR_SEC, 
        marginTop: '3%', 
        elevation: 2
    },

    viewRow: {
        alignItems: "center",
        flexDirection: 'row'
    },

    tittleTag: {
        color: 'white', 
        fontWeight: 'bold', 
        fontSize: 20
    },

    tittleUser: {
        color: 'white', 
        fontSize: 30, 
        fontWeight: 'bold'
    },

    viewText: {
        flexDirection: "row", 
        alignItems: 'center'
    },

    viewItem: {
        padding: '2%',
        width: '100%',
        backgroundColor: BasicColors.BACKGROUND_COLOR,
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

    img: {
        borderRadius: 5, 
        width: 65, 
        height: 65, 
        resizeMode: 'contain'
    },
});