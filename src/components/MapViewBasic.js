import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';

import * as BasicColors from '../styles/basic';

const CORR_AUX = {
    latitude: 9.332780057862571,
    longitude: -69.12082990631461,
    latitudeDelta: 0.09219993894678957,
    longitudeDelta: 0.08757513016462326
}

const Map = ({ markTitle, markDescription, coordinate, getCoor }) => { 
    const [region, setRegion] = useState(coordinate); 
    const [mark, setMark] = useState({
        title: markTitle,
        description: markDescription,
        coordinate
    }); 

    const setCoordinate = (e) => {
        const coordinateAux = { 
            latitude: e.nativeEvent.coordinate.latitude, 
            longitude: e.nativeEvent.coordinate.longitude 
        }; 
         
        setMark({ ...mark, coordinate: coordinateAux });
        getCoor(coordinateAux);
    }

    return (
        <View style={styles.container}>
            <MapView
                onPress={setCoordinate}
                style={styles.viewMap}
                provider={PROVIDER_GOOGLE}
                onRegionChangeComplete={region => setRegion(region)}
                region={{
                    latitude: region.latitude != undefined ? region.latitude : CORR_AUX.latitude ,
                    longitude: region.longitude != undefined ? region.longitude : CORR_AUX.longitude,
                    latitudeDelta: region.latitudeDelta != undefined ? region.latitudeDelta : CORR_AUX.latitudeDelta,
                    longitudeDelta: region.longitudeDelta != undefined ? region.longitudeDelta : CORR_AUX.longitudeDelta
                }} 
                >
                <Marker 
                    draggable
                    coordinate={mark.coordinate}
                    title={mark.title}
                    description={mark.description}
                    pinColor={BasicColors.THEME_COLOR_SEC}
                    onDragEnd={setCoordinate}
                />
            </MapView>
        </View>
    )
}

export default Map;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },

    viewMap: {
        width:'100%', 
        height: '100%'
    }
})