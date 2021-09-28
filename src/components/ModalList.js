import React from 'react';
import { View, Text, FlatList, Modal, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';
import * as BasicColors from '../styles/basic';


const ModalListC = ({ data, vissible, onCancel, renderItem, tittle, addButton, addPress }) => ( 
    <Modal 
        animationType="slide"
        transparent
        visible={vissible}
        onRequestClose={onCancel}
        style={styles.modal}
        > 
        <View style={ 
                (addButton == true) 
                ? { ...styles.Header, justifyContent: 'space-between' }
                : styles.Header 
            }>
            <Text style={styles.tittle}>
                {tittle} 
            </Text> 
            { 
                (addButton != true)     
                ? null
                : <Icon
                    name='add-outline'
                    color={BasicColors.THEME_COLOR_SEC}
                    type='ionicon'
                    size={30}
                    onPress={addPress}
                /> 
            }
        </View>
        {
            !(data.length)
            ? <Text style={styles.textMessage}>
                Sin {tittle}
            </Text>
            : <FlatList
                style = {styles.list}
                data={data}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
            />
        }
    </Modal>
)

export default ModalListC;

export const styles = StyleSheet.create({
    tittle: {
        color: BasicColors.THEME_COLOR_SEC,
        fontSize: 30, 
        fontWeight:'bold' 
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
});