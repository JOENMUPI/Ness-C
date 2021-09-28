import React, { useState } from 'react';
import { View, Text, FlatList, Modal, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import * as BasicColors from '../styles/basic';


const ModalListC = ({ data, vissible, onCancel, onPressItem, tittle, renderItem }) => { 
    const [datax, setData] = useState(data); 
    const [value, setValue] = useState(null);

    const searchItems = text => {
        const newData = data.filter(item => {
            const textData = text.toUpperCase();
            let itemData = `${item.name.toUpperCase()}`;
            
            return itemData.indexOf(textData) > -1;
        });

        setData(newData);
        setValue(text); 
    };

    const renderItemAux = ({ item }) => (
        <View style={styles.viewItem}>
            <TouchableOpacity 
                onPress={() => { onPressItem(item); setData([]); setValue(null); }}
                style={styles.item}
                >
                <View style={styles.viewText}>
                    <Text style={styles.textItem}>
                        {item.name}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    )

    return ( 
        <Modal 
            animationType="slide"
            transparent
            visible={vissible}
            onRequestClose={() => { onCancel(); setValue(null); }}
            style={styles.modal}
            > 
            <View style={styles.Header}>
                <View style={styles.searchBar}>
                    <Icon name='search-outline' color='gray' type='ionicon' size={20}/>
                    <TextInput
                        placeholder={`Busca un ${tittle}!`}  
                        style={{ color: 'gray', paddingLeft: 5, width: '80%' }}
                        onChangeText={text => searchItems(text)}
                        onSubmitEditing={() => alert(`Debe presionar un ${tittle}`)}
                        value={value}
                    />
                </View>
            </View> 
            {
                (value == null)
                ? <FlatList
                    style = {styles.list}
                    data={data}
                    renderItem={(item) => (renderItem) ? renderItem(item) : renderItemAux(item)}
                    keyExtractor={(item, index) => index.toString()}
                />
                : !(datax.length)
                ? <Text style={styles.textMessage}>
                    Ningun {tittle} que contenga '{value}' encontrado
                </Text>
                : <FlatList
                    style = {styles.list}
                    data={datax}
                    renderItem={(item) => (renderItem) ? renderItem(item) : renderItemAux(item)}
                    keyExtractor={(item, index) => index.toString()}
                />
            }
        </Modal>
    )
}

export default ModalListC;

export const styles = StyleSheet.create({
    searchBar: {
        backgroundColor: 'lightgray', 
        flexDirection: 'row', 
        padding: '3%', 
        borderRadius: 50, 
        width: '100%'
    },

    list: {
        paddingHorizontal: '3%', 
        backgroundColor: BasicColors.BACKGROUND_COLOR
    },

    textMessage: {
        padding: 20,
        backgroundColor: BasicColors.BACKGROUND_COLOR,
        fontSize: 25, 
        color: 'gray', 
        textAlign: "center",
        height: '100%'
    },

    modal: {
        flex: 1,
        height: '100%',
        width: '100%',
        alignSelf: 'center',
        justifyContent: 'center',
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
        borderRadius:20, 
        alignItems: 'center', 
        justifyContent: 'space-between' 
    },

    textItem: {
        fontWeight: "bold", 
        color: "gray", 
        fontSize: 30
    },
});