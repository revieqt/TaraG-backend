import admin, { db } from '../config/firebase';

interface TaraBuddyPreference {
  gender: string;
  maxDistance: number;
  ageRange: number[];
  zodiac: string[];
  likedUsers: string[];
}

export const createTaraBuddyProfile = async (
  userID: string
): Promise<TaraBuddyPreference> => {
  const defaultPref: TaraBuddyPreference = {
    gender: 'Open to All',
    maxDistance: 25,
    ageRange: [18, 35],
    zodiac: [],
    likedUsers: [],
  };
  const userRef = db.collection('users').doc(userID);
  await userRef.update({ taraBuddyPreference: defaultPref });
  return defaultPref;
};

export const updateGenderPreference = async (
  userID: string,
  gender: string
): Promise<TaraBuddyPreference | null> => {
  const userRef = db.collection('users').doc(userID);
  await userRef.update({ 'taraBuddyPreference.gender': gender });
  const snap = await userRef.get();
  const data = snap.data();
  return data?.taraBuddyPreference ?? null;
};

export const updateMaxDistancePreference = async (
  userID: string,
  maxDistance: number
): Promise<TaraBuddyPreference | null> => {
  const userRef = db.collection('users').doc(userID);
  await userRef.update({ 'taraBuddyPreference.maxDistance': maxDistance });
  const snap = await userRef.get();
  const data = snap.data();
  return data?.taraBuddyPreference ?? null;
};

export const updateAgePreference = async (
  userID: string,
  ageRange: number[]
): Promise<TaraBuddyPreference | null> => {
  const userRef = db.collection('users').doc(userID);
  await userRef.update({ 'taraBuddyPreference.ageRange': ageRange });
  const snap = await userRef.get();
  const data = snap.data();
  return data?.taraBuddyPreference ?? null;
};

export const updateZodiacPreference = async (
  userID: string,
  zodiac: string[]
): Promise<TaraBuddyPreference | null> => {
  const userRef = db.collection('users').doc(userID);
  await userRef.update({ 'taraBuddyPreference.zodiac': zodiac });
  const snap = await userRef.get();
  const data = snap.data();
  return data?.taraBuddyPreference ?? null;
};

/**
 * Disable the TaraBuddy profile by deleting the preference field from Firestore.
 */
export const disableTaraBuddyProfile = async (
  userID: string
): Promise<void> => {
  const userRef = db.collection('users').doc(userID);
  await userRef.update({
    taraBuddyPreference: admin.firestore.FieldValue.delete(),
  });
};
