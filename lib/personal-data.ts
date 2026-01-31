import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * パーソナルデータの型定義
 */
export interface PersonalData {
  age?: string;
  gender?: string;
  occupation?: string;
}

const PERSONAL_DATA_KEY = "personal_data";

/**
 * パーソナルデータを保存
 */
export async function savePersonalData(data: PersonalData): Promise<void> {
  try {
    await AsyncStorage.setItem(PERSONAL_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save personal data:", error);
  }
}

/**
 * パーソナルデータを読み込み
 */
export async function loadPersonalData(): Promise<PersonalData | null> {
  try {
    const data = await AsyncStorage.getItem(PERSONAL_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to load personal data:", error);
    return null;
  }
}

/**
 * パーソナルデータをクリア
 */
export async function clearPersonalData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PERSONAL_DATA_KEY);
  } catch (error) {
    console.error("Failed to clear personal data:", error);
  }
}
