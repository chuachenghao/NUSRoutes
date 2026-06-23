import { useCallback, useState} from "react";
import * as Location from "expo-location";
export type Coords = {
    latitude: number;
    longitude: number;
};

export function useCurrentLocation(){
    const [coords, setCoords] = useState<Coords | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [locationMessage, setLocationMessage] = useState("");

    const requestLocation = useCallback(async (): Promise<Coords | null> => {
        setLoadingLocation(true);
        setLocationMessage("");
        try {
            const {status} = await Location.requestForegroundPermissionsAsync();
            if (status != "granted"){
                setLocationMessage("Location permission not granted.");
                return null;
            }
            const position = await Location.getCurrentPositionAsync({
            accuracy:Location.Accuracy.Balanced,
                });
            const next ={
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            };
            setCoords(next);
            return next;


        }
        catch{ setLocationMessage("Could not get location.");
            return null;
        }
        finally{ setLoadingLocation(false);}
    },[])
    return {coords, loadingLocation, locationMessage, requestLocation};
  }