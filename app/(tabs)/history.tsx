import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

/**
 * 過去の相談 Screen
 */
export default function HistoryScreen() {
  // TODO: 実際の相談履歴データをAsyncStorageから読み込む
  const history: any[] = [];

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* タイトル */}
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold" style={{ color: "#000000" }}>
              過去の相談
            </Text>
            <Text className="text-base" style={{ color: "#666666" }}>
              これまでの相談履歴
            </Text>
          </View>

          {/* 相談履歴リスト */}
          {history.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-base" style={{ color: "#666666" }}>
                まだ相談履歴がありません
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {history.map((item, index) => (
                <View
                  key={index}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                  style={{ borderWidth: 1, borderColor: "#E5E7EB" }}
                >
                  <Text className="text-sm font-semibold mb-2" style={{ color: "#000000" }}>
                    {item.kannonName}
                  </Text>
                  <Text className="text-xs mb-2" style={{ color: "#666666" }}>
                    {item.date}
                  </Text>
                  <Text className="text-sm" style={{ color: "#333333" }}>
                    {item.concern}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
