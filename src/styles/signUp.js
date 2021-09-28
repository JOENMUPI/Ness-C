import { StyleSheet } from 'react-native';
import * as basicColors from '../styles/basic';

export const SignUpStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        justifyContent: "center",
        paddingHorizontal: 30,
        paddingVertical: 100
    },
    
    subtitle: {
        color: "gray"
    },

    viewPass: {
        flexDirection: 'row'
    },

    title: {
        color: basicColors.THEME_COLOR_MAIN,
        fontSize: 30,
        fontWeight: "bold"
    },

    section: {
        flexDirection: "row",
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 15,
        paddingVertical: 10,
        alignItems: "center",
        marginTop: 10
    },

    sectionForText: {
        paddingHorizontal: 15,
        paddingTop: 10,
    },

    textInput: {    
        width: '90%', 
        color: "gray",
        paddingLeft: 10
    },

    code: {
        color: "gray",
        paddingLeft: 10
    },

    eye: {
        marginLeft: '-10%'
    },

    signIn: {
        width: "100%",
        height: 40,
        backgroundColor: basicColors.THEME_COLOR_MAIN,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 25,
        borderRadius: 5,
        elevation: 2
    },

    textSignIn: {
        color: "white",
        fontSize: 15,
        fontWeight: "bold",
    },

    signUp: {
        marginTop: 25,
        flexDirection: "row",
        justifyContent: "center"
    },

    textSignUp: {
        color: basicColors.THEME_COLOR_MAIN, 
        marginLeft: 3
    }
})