import { StyleSheet } from 'react-native';

export const homeStyles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 22
    },
    
    modalView: {
      margin: 20,
      backgroundColor: "white",
      borderRadius: 20,
      padding: 35,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5
    },

    button: {
      borderRadius: 20,
      padding: 10,
      elevation: 2
    },

    buttonClose: {
      backgroundColor: "#2196F3",
    },

    textStyle: {
      color: "white",
      fontWeight: "bold",
      textAlign: "center"
    },

    modalText: {
      marginBottom: 15,
      textAlign: "center"
    },

    container: {
        flex: 1,
        backgroundColor: '#006aff',
    },

    header: {
        padding: 20,
        flexDirection: "row",
        backgroundColor: '#f4f6fc',
        justifyContent: "space-between",
        alignItems: "center",
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20
    },

    secondary: {
        justifyContent: "space-between",
        alignItems:'center',
        backgroundColor: 'white',
        flexDirection: 'row',
        paddingHorizontal: 16,
        borderRadius: 10,
    },

    viewSecondary: {
      paddingHorizontal:16,
      paddingTop: 10,
      paddingVertical: 5,
      backgroundColor: '#f4f6fc'
    },

    textSecondary: {
      color:'gray',
      fontSize: 30
    },

    viewList: {
        backgroundColor: '#fff',
        flexDirection: "row",
        marginHorizontal: 16,
        marginVertical: 4,
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 24,
        justifyContent: "space-between"
    },

    viewTittle: {
        paddingTop: 30, 
        paddingLeft: 16, 
        paddingBottom: 10,  
        flexDirection: "row", 
        justifyContent: "space-between"
    },

    textTtittle: {
        color: '#f4f6fc', 
        fontSize: 30
    },

    buttonAdd: { 
        backgroundColor: '#fff', 
        borderRadius: 20 
    },

    viewTag: {
      borderRadius: 10, 
      padding: '3%', 
      backgroundColor: BasicColors.THEME_COLOR_SEC, 
      marginTop: '3%', 
      elevation: 2
    }
});