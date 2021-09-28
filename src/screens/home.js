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
import { Icon } from 'react-native-elements';

import Http from '../components/Http';
import HeaderC from '../components/Header';
import * as BasicColors from '../styles/basic';


const Home = ({ navigation, route }) => { 
    const [me, setMe] = useState({ img: null });
    const [tags, setTags] = useState([]);
    const [searchBar, setSearchBar] = useState({ flag: false, text: '' });
    const [loading, setLoading] = useState({ loading: false, refresh: false });

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

    const refresh = () => {
        refreshUser().then(async (res) =>  {
            await AsyncStorage.setItem('user', JSON.stringify(res));
            setMe(res);
            setLoading({ ...loading, refresh: true });
        });
    }

    useEffect(() => {  
        getMee().then(res => setMe(res));
        getTags().then(res => {
            setTags(res);
            setLoading({ ...loading, loading: false });
        }); 
    }, []);

    return (
        <View style={homeStyles.container}>
            <HeaderC 
                leftIcon='menu'
                leftIconAction={() => navigation.openDrawer()}
                cartAction={()=> alert('llevalo a carrito')}
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
                                onChangeText={text => setSearchBar({ ...searchBar, text })}
                                onSubmitEditing={() => Alert.alert('envia el seach')}
                                placeholder="¿Que deseas hoy?"
                                style={{ color: 'gray', width: '90%' }}
                            />
                            {
                                (searchBar.flag)
                                ? <ActivityIndicator size="small" color={BasicColors.THEME_COLOR_MAIN}/>
                                : <Icon name='search-outline' color='gray' type='ionicon' size={20}/>
                            }
                        </View>
                        <View style={{ marginVertical: '1%' }}>
                            {
                                tags.map((item, index) => (
                                    <TouchableOpacity 
                                        onPress={() => alert('mira la lista')}
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
        padding: '3%', 
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
});