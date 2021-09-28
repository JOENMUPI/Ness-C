import * as DocumentPicker from 'expo-document-picker';


const getDocument = async () => {  
    const docResult = await DocumentPicker.getDocumentAsync({ multiple: true, }); 
    
    return docResult;
}

export default {
    getDocument
}