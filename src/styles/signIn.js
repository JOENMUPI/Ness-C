import { StyleSheet } from 'react-native';
import * as basicColors from '../styles/basic';

export const SignInStyles = StyleSheet.create({
    body : {
        backgroundColor: "white",
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: '3%'  
    },

    container: {
        backgroundColor: "white",
        flex: 1,
        paddingVertical: '7%'
    },

    section: {
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 5,
        borderColor: "gray",
        flexDirection: "row",
        marginTop: '3%',
        paddingHorizontal: '5%',
        paddingVertical: '3%'
    },

    signIn: {
        alignItems: "center",
        backgroundColor: basicColors.THEME_COLOR_MAIN,
        borderRadius: 5,
        padding: '3%',
        justifyContent: "center",
        marginTop: '7%',
        elevation: 2
    },

    signUp: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: '7%',
    },

    textInput: {
        color: "gray",
        flex: 1,
        paddingLeft: '3%'
    },

    textSignIn: {
        color: "white",
        fontWeight: "bold",
    },

    textSignUp: {
        color: "gray",
        textAlign: "center"
    },

    title: {
        color: basicColors.THEME_COLOR_MAIN,
        fontSize: 30,
        fontWeight: "bold"
    }
})