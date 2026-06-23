import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
    profile: "nusroutes.profile",
    savedPlaces : "nusroutes.savedPlaces",
    journeys: "nusroutes.journeys",
} as const;

export type Profile = { id: string; name: string; createdAt: string };
export type SavedPlace = { id: string; name: string; type?: string | null;};
export type Journey = {id : string; label:string; startName:string; endName:string; createdAt:string;};

async function read<T>(key:string, fallback: T): Promise<T>{
    try{
        const raw = await AsyncStorage.getItem(key);
        return raw ?(JSON.parse(raw) as T): fallback;}
        catch{
            return fallback;
        }
    }
async function write<T>(key:string, value: T): Promise<void>{
    try{
        await AsyncStorage.setItem(key,JSON.stringify(value));} catch{}}

export const profileStorage = {
    getProfile : ()=> read<Profile| null>(KEYS.profile,null),
    setProfile: (p: Profile |null) => write(KEYS.profile, p),
    clearProfile: () => AsyncStorage.multiRemove(Object.values(KEYS)),
    getSavedPlaces : () => read<SavedPlace[]>(KEYS.savedPlaces,[]),
    setSavedPlaces: (list:SavedPlace[])=>write(KEYS.savedPlaces,list),
    getJourneys:()=> read<Journey[]>(KEYS.journeys,[]),
    setJourneys: (list:Journey[])=> write(KEYS.journeys,list),
};