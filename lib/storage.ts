import AsyncStorage from "@react-native-async-storage/async-storage";
import { NanType } from "@/constants/kannon-data";

/**
 * チャットメッセージの型定義
 */
export interface ChatMessage {
  id: string;
  role: "user" | "kannon";
  content: string;
  timestamp: number;
}

/**
 * 相談セッションの型定義
 */
export interface ConsultationSession {
  id: string;
  nanType: NanType;
  kannonName: string;
  userConcern: string; // ユーザーの最初の悩み
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "rengedo_consultations";

/**
 * すべての相談履歴を取得
 */
export async function getAllConsultations(): Promise<ConsultationSession[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load consultations:", error);
    return [];
  }
}

/**
 * 特定の相談セッションを取得
 */
export async function getConsultation(id: string): Promise<ConsultationSession | null> {
  const consultations = await getAllConsultations();
  return consultations.find((c) => c.id === id) || null;
}

/**
 * 新しい相談セッションを保存
 */
export async function saveConsultation(session: ConsultationSession): Promise<void> {
  try {
    const consultations = await getAllConsultations();
    const existingIndex = consultations.findIndex((c) => c.id === session.id);

    if (existingIndex >= 0) {
      // 既存のセッションを更新
      consultations[existingIndex] = session;
    } else {
      // 新しいセッションを追加
      consultations.unshift(session);
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(consultations));
  } catch (error) {
    console.error("Failed to save consultation:", error);
    throw error;
  }
}

/**
 * 相談セッションを削除
 */
export async function deleteConsultation(id: string): Promise<void> {
  try {
    const consultations = await getAllConsultations();
    const filtered = consultations.filter((c) => c.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete consultation:", error);
    throw error;
  }
}

/**
 * すべての相談履歴を削除
 */
export async function clearAllConsultations(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear consultations:", error);
    throw error;
  }
}

/**
 * ユニークIDを生成
 */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
