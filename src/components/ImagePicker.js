import { Alert, } from 'react-native';
import * as ImagePicker from 'expo-image-picker';


const getImage = async () => {  
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if(permission.status != 'granted') {
        Alert.alert(
        'Error', 
        'Disculpe, requerimos permisos de camara para terminar el proceso!',
        { cancelable: false }
        );

    }  else {
        const imgResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
            base64: true,
        }); 
        
        if(!imgResult.cancelled) {  
            return imgResult;
        } 
    }

    return null;
}

export default {
    getImage
}