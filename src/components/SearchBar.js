import React, { useState } from 'react';
import { Text, FlatList, Modal, StyleSheet, View, ActivityIndicator, TextInput } from 'react-native';
import { Icon } from 'react-native-elements';

import * as BasicColors from '../styles/basic';


const SearchBarC = ({ arrayData, vissible, onCancel, renderItem, searchF, loadingFlag, valuex }) => { 
    const [value, setValue] = useState('');
    const [prevValue, setPrevValue] = useState(null);
    
    const handleSummit = () => { 
        setPrevValue(value);
        searchF(value); 
        setValue('');
    }

    return (
        <Modal 
            animationType="slide"
            transparent
            visible={vissible}
            onRequestClose={() => { onCancel(); setValue(''); }}
            style={styles.modal}
            >
            <View style={styles.Header}>
                <View style={[ styles.searchBar, styles.viewText ]}>
                    <Icon name='search-outline' color='gray' type='ionicon' size={20}/>
                    <TextInput
                        editable={!loadingFlag}
                        autoFocus
                        placeholder={ (loadingFlag) ? prevValue : valuex}  
                        style={{ color: 'gray', paddingLeft: 5, width: '80%' }}
                        onChangeText={text => setValue(text)}
                        onSubmitEditing={handleSummit}
                        value={value}
                    />
                    <View style={{ ...styles.viewText, flexDirection: 'row-reverse'}}>
                        {
                            (!loadingFlag)
                            ? null
                            : <ActivityIndicator size="small" color={BasicColors.THEME_COLOR_SEC}/>  
                        }
                        {
                            !(value.length)
                            ? null
                            : (loadingFlag)
                            ? <Icon
                                containerStyle={{ paddingHorizontal: '2%' }}
                                name='close-outline' 
                                color='gray' 
                                type='ionicon' 
                                size={20} 
                            />
                            : <Icon
                                onPress={() => setValue('')} 
                                containerStyle={{ paddingHorizontal: '2%' }}
                                name='close-outline' 
                                color='gray' 
                                type='ionicon' 
                                size={20} 
                            />
                        }
                    </View>
                </View>
            </View>    
            {
                (!arrayData.length)
                ? <Text style={styles.textMessage}>
                    {
                        (loadingFlag)
                        ? 'Buscando...'
                        : (prevValue != null)        
                        ? `No se encontro nada con "${prevValue}"`
                        : 'No ves nada? prueba con buscar otra cosa!'
                    }
                </Text>
                : null     
            }
            <FlatList
                style = {styles.list}
                data={arrayData}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
            />
        </Modal>
    )
}

export default SearchBarC;

export const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f4f6fc', 
        justifyContent: 'center', 
        alignItems: 'center'
    },

    searchBar: {
        backgroundColor: 'lightgray', 
        flexDirection: 'row', 
        padding: '3%', 
        borderRadius: 50, 
        width: '100%'
    },

    list: {
        paddingTop: 10, 
        paddingHorizontal: 16, 
        backgroundColor: '#f4f6fc'
    },

    viewText: {
        flexDirection: "row", 
        alignItems: 'center'
    },

    textMessage: {
        padding: 20,
        backgroundColor: '#f4f6fc', 
        fontSize: 25, 
        color: 'gray', 
        textAlign: "center"
    },

    modal: {
        flex: 1,
        height: '100%',
        width: '100%',
        alignSelf: 'center',
        justifyContent: 'center',
        
    },

    inputText: {
        marginVertical: '3%', 
        paddingVertical: '2%', 
        paddingHorizontal: '1%', 
        backgroundColor:'white', 
        borderRadius: 500, 
        color: 'gray'
    },

    Header: {
        backgroundColor: 'white',
        padding: '2%',
        width: '100%',
        justifyContent: 'center',
        alignItems: "center",
        paddingHorizontal: '5%',
        flexDirection: 'row',
        elevation: 3
    },
});