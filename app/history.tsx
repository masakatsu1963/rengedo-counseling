import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { AppFooter } from "@/components/app-footer";
import { useColors } from "@/hooks/use-colors";
import { getAllConsultations, deleteConsultation, type ConsultationSession } from "@/lib/storage";
import { getKannonByNan } from "@/constants/kannon-data";

/**
 * 相談履歴画面
 * 過去の相談を振り返る
 */
export default function HistoryScreen() {
  const router = useRouter();
  const colors = useColors();
  const [consultations, setConsultations] = useState<ConsultationSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    setIsLoading(true);
    try {
      const data = await getAllConsultations();
      setConsultations(data);
    } catch (error) {
      console.error("Failed to load consultations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleViewConsultation = (session: ConsultationSession) => {
    router.push({
      pathname: "/chat" as any,
      params: {
        nanType: session.nanType,
        concern: session.userConcern,
        sessionId: session.id,
      },
    });
  };

  const handleDeleteConsultation = (session: ConsultationSession) => {
    Alert.alert(
      "相談を削除",
      "この相談履歴を削除してもよろしいですか?",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteConsultation(session.id);
              await loadConsultations();
            } catch (error) {
              console.error("Failed to delete consultation:", error);
              Alert.alert("エラー", "削除に失敗しました");
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  const renderConsultation = ({ item }: { item: ConsultationSession }) => {
    const kannonData = getKannonByNan(item.nanType);

    return (
      <TouchableOpacity
        onPress={() => handleViewConsultation(item)}
        onLongPress={() => handleDeleteConsultation(item)}
        activeOpacity={0.7}
        className="mb-4 p-4 rounded-2xl"
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View className="flex-row items-start mb-3">
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: kannonData.colorTheme.light }}
          >
            <Text className="text-2xl">🪷</Text>
          </View>
          <View className="flex-1">
            <Text
              className="text-base font-semibold mb-1"
              style={{ color: kannonData.colorTheme.dark }}
            >
              {item.kannonName}
            </Text>
            <Text
              className="text-sm mb-1"
              style={{ color: colors.muted }}
            >
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
        <Text
          className="text-sm leading-relaxed"
          style={{ color: colors.foreground }}
          numberOfLines={2}
        >
          {item.userConcern}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* ヘッダー */}
        <View className="px-6 py-4 border-b" style={{ borderBottomColor: colors.border }}>
          <View className="flex-row items-center">
            <TouchableOpacity onPress={handleBack} activeOpacity={0.7} className="mr-4">
              <Text style={{ color: colors.muted }}>← 戻る</Text>
            </TouchableOpacity>
            <Text
              className="text-2xl font-bold"
              style={{ color: colors.foreground }}
            >
              相談履歴
            </Text>
          </View>
        </View>

        {/* リスト */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <Text style={{ color: colors.muted }}>読み込み中...</Text>
          </View>
        ) : consultations.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text
              className="text-lg text-center leading-relaxed"
              style={{ color: colors.muted }}
            >
              まだ相談履歴がありません。{"\n"}
              ホーム画面から相談を始めてみましょう。
            </Text>
          </View>
        ) : (
          <FlatList
            data={consultations}
            keyExtractor={(item) => item.id}
            renderItem={renderConsultation}
            contentContainerStyle={{ padding: 16 }}
          />
        )}
      </View>
      <AppFooter />
    </ScreenContainer>
  );
}
