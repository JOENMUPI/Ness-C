import React from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';


const SIZE = 30;

const MenuC = ({ leftIconAction, cartAction, leftIcon, title, rightIcon }) => { 
    return (
        <View style={[ styles.viewRow, styles.header ]}>
            <TouchableOpacity onPress={leftIconAction}>
                <Icon 
                    style={{ paddingHorizontal: 5 }}
                    name={(leftIcon) ? leftIcon : 'arrow-back'} 
                    color='gray' 
                    type='ionicon' 
                    size={SIZE}
                />
            </TouchableOpacity>
            <View>
                <Text style={styles.tittleItem}>
                    {title ? title  : 'N.E.S.S' }
                </Text>
            </View>
            <TouchableOpacity onPress={cartAction}>
                <Icon 
                    style={{ paddingHorizontal: 5 }}
                    name={(rightIcon) ? rightIcon : 'cart'}
                    color='gray' 
                    type='ionicon' 
                    size={SIZE}
                />
            </TouchableOpacity>
        </View>
    )
}

export default MenuC;

export const styles = StyleSheet.create({
    viewRow: {
        alignItems: "center",
        flexDirection: 'row'
    },

    header: {
        marginTop: 24,
        backgroundColor: 'white',
        padding: '2%',
        width:'100%',
        justifyContent: 'space-between',
    },

    tittleItem: {
        fontWeight: "bold", 
        color: "gray", 
        fontSize: SIZE
    },
});