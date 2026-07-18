import { useCallback, useState} from "react";

let location: typeof import("expo-location") | null = null;

try {
    location = require("expo-location");
} catch {}

export type Coords = {
    latitude: number;
    longitude: number;
};

export function useCurrentLocation(){
    const [coords, setCoords] = useState<Coords | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);

    const requestLocation = useCallback(async (): Promise<Coords | null> => {
        setLoadingLocation(true);
        try {
            if (!location) {
                return null;
            }

            const {status} = await location.requestForegroundPermissionsAsync();
            if (status != "granted"){
                return null;
            }
            const position = await location.getCurrentPositionAsync({
            accuracy:location.Accuracy.Balanced,
                });
            const next ={
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            };
            setCoords(next);
            return next;


        }
        catch{
            return null;
        }
        finally{ setLoadingLocation(false);}
    },[])
    return {coords, loadingLocation, requestLocation};
  }
