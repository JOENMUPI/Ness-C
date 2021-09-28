import React, { useState, useEffect } from 'react';
import { 
    Alert, 
    ActivityIndicator, 
    StyleSheet,  
    Text, 
    TextInput, 
    ToastAndroid, 
    TouchableOpacity, 
    View
} from 'react-native';

import Http from '../components/Http';
import { Icon } from 'react-native-elements';

import HeaderC from '../components/Header';
import * as BasicColors from '../styles/basic';


const AdminEnterprise = ({ navigation }) => { 
    const [loading, setLoading] = useState(false);

    return (
        <View style={AEStyles.container}>
            <HeaderC 
                title='Recarga'
                leftIconAction={() => navigation.goBack()}
                cartAction={()=> alert('envia a carrito')}
            />
            <View style={AEStyles.body}>

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
})