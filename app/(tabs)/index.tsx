import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { AppFooter } from "@/components/app-footer";
import { useColors } from "@/hooks/use-colors";

/**
 * ホーム画面
 * ユーザーを穏やかに迎え入れ、相談を始めるよう促す
 */
export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();

  const handleStartConsultation = () => {
    router.push("/input" as any);
  };



  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center px-6 py-12">
          {/* ロゴエリア */}
          <View className="items-center mb-12">
            <View
              className="w-32 h-32 rounded-full items-center justify-center mb-6"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-6xl">🪷</Text>
            </View>
            <Text
              className="text-3xl font-bold text-center mb-2"
              style={{ color: colors.foreground }}
            >
              蓮華堂
            </Text>
            <Text
              className="text-lg text-center"
              style={{ color: colors.muted }}
            >
              七観音の智慧
            </Text>
          </View>

          {/* メッセージ */}
          <View className="items-center mb-12">
            <Text
              className="text-xl text-center leading-relaxed"
              style={{ color: colors.foreground }}
            >
              心の悩みを{"\n"}観音様にお話しください
            </Text>
          </View>

          {/* メインボタン */}
          <TouchableOpacity
            onPress={handleStartConsultation}
            activeOpacity={0.8}
            className="w-full max-w-sm mb-6"
          >
            <View
              className="py-5 px-8 rounded-full items-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white text-lg font-semibold">
                相談を始める
              </Text>
            </View>
          </TouchableOpacity>


        </View>
      </ScrollView>
      <AppFooter />
    </ScreenContainer>
  );
}
