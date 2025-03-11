import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker, Polyline,PROVIDER_GOOGLE } from "react-native-maps";
import axios from "axios";

const GOOGLE_MAPS_API_KEY = "AIzaSyAv-lL1px8xBL9rdovBXB8o4BgWuE-rKb8"; // Replace with your API key

const App = () => {
  const [route, setRoute] = useState<{ latitude: number; longitude: number }[]>([]);

  const origin = { latitude: 37.7749, longitude: -122.4194 }; // San Francisco
  const destination = { latitude: 36.0522, longitude: -121.2437 }; // Los Angeles

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/directions/json`,
          {
            params: {
              origin: `${origin.latitude},${origin.longitude}`,
              destination: `${destination.latitude},${destination.longitude}`,
              key: GOOGLE_MAPS_API_KEY,
            },
          }
        );
    
        console.log("Directions API Response:", response.data); // Debugging
    
        if (response.data.routes.length) {
          const points = response.data.routes[0].overview_polyline.points;
          const coordinates = decodePolyline(points);
          setRoute(coordinates);
        } else {
          console.warn("No routes found.");
        }
      } catch (error) {
        console.error("Error fetching directions:", error);
      }
    };
    

    fetchRoute();
  }, []);

  // Function to decode polyline
  const decodePolyline = (encoded: string) => {
    let index = 0, lat = 0, lng = 0, coordinates = [];
    
    while (index < encoded.length) {
      let shift = 0, result = 0, byte;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      
      let deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += deltaLat;
  
      shift = 0;
      result = 0;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
  
      let deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += deltaLng;
  
      coordinates.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return coordinates;
  };
  

  return (
    <View style={styles.container}>
      <MapView
  provider={MapView.PROVIDER_GOOGLE} // Force Google Maps
  style={{ flex: 1 }}
  initialRegion={{
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 5,
    longitudeDelta: 5,
  }}
>
        <Marker coordinate={origin} title="Origin" />
        <Marker coordinate={destination} title="Destination" />
        {route.length > 0 && <Polyline coordinates={[
    { latitude: 37.7749, longitude: -122.4194 },
    { latitude: 36.7783, longitude: -119.4179 },
    { latitude: 34.0522, longitude: -118.2437 }
  ]}
   strokeWidth={4} strokeColor="blue" />}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

export default App;
