import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  profileStorage,
  type Profile,
  type SavedPlace,
  type Journey,
} from "../storage/profileStorage";

type Ctx = {
  profile: Profile| null;
  savedPlaces: SavedPlace[];
  journeys: Journey[];
  createProfile: (name: string) => void;
  signOut: () => void;
  toggleSavedPlace: (place: SavedPlace) => void;
  isSaved: (id: string) => boolean;
  addJourney: (startName: string, endName: string) => void;
  removeJourney: (id: string) => void;
};


const ProfileContext = createContext<Ctx | null>(null);

export function ProfileProvider({children }: {children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      setProfile(await profileStorage.getProfile());
      setSavedPlaces(await profileStorage.getSavedPlaces());
      setJourneys(await profileStorage.getJourneys());
      setReady(true);
    })();
  }, []);
  useEffect(() => { if (ready) profileStorage.setSavedPlaces(savedPlaces); }, [savedPlaces, ready]);
  useEffect(() => { if (ready) profileStorage.setJourneys(journeys); }, [journeys, ready]);

  function createProfile(name: string) {
    const p: Profile = {
      id: String(Date.now()),
      name: name.trim() || "Guest",
      createdAt: new Date().toISOString(),
    };
    setProfile(p);
    profileStorage.setProfile(p);
  }
    function signOut() {
    profileStorage.clearProfile();
    setProfile(null);
    setSavedPlaces([]);
    setJourneys([]);
  }
    function isSaved(id: string) {
    return savedPlaces.some((p) => p.id === id);
  }
  function toggleSavedPlace(place: SavedPlace) {
    setSavedPlaces((prev) =>
      prev.some((p) => p.id === place.id)
        ? prev.filter((p) => p.id !== place.id)
        : [...prev, place]
    );
  }
  function addJourney(startName: string, endName: string) {
    setJourneys((prev) => {
      // avoid duplicates of the same pair
      if (prev.some((j) => j.startName === startName && j.endName === endName)) {
        return prev;
      }
      const journey: Journey = {
        id: String(Date.now()),
        label: `${startName} → ${endName}`,
        startName,
        endName,
        createdAt: new Date().toISOString(),
      };
      return [journey, ...prev];
    });
  }
  function removeJourney(id: string) {
    setJourneys((prev) => prev.filter((j) => j.id !== id));
  }

  return (
    <ProfileContext.Provider
      value={{
        profile, savedPlaces, journeys,
        createProfile, signOut, toggleSavedPlace, isSaved,
        addJourney, removeJourney,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}
