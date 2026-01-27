import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useMemo } from "react";

/**
 * 現在の月に応じて四季の画像を取得する関数
 */
function getSeasonalImage() {
  const month = new Date().getMonth() + 1; // 1-12
  
  if (month >= 3 && month <= 5) {
    // 春（3-5月）
    return require("@/assets/images/spring.png");
  } else if (month >= 6 && month <= 8) {
    // 夏（6-8月）
    return require("@/assets/images/summer.png");
  } else if (month >= 9 && month <= 11) {
    // 秋（9-11月）
    return require("@/assets/images/fall.png");
  } else {
    // 冬（12-2月）
    return require("@/assets/images/winter.png");
  }
}

/**
 * ホーム画面
 * ユーザーを穏やかに迎え入れ、相談を始めるよう促す
 */
export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  
  // 現在の季節に応じた画像を取得
  const seasonalImage = useMemo(() => getSeasonalImage(), []);

  const handleStartConsultation = () => {
    router.push("/input" as any);
  };

  return (
    <ScreenContainer edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1">
          {/* 四季の蓮華堂画像 - 画面上部いっぱい、左右いっぱい */}
          <Image
            source={seasonalImage}
            style={{
              width: "100%",
              aspectRatio: 16 / 6,
            }}
            resizeMode="cover"
          />

          {/* コンテンツエリア */}
          <View className="flex-1 items-center justify-center px-6 py-12">
            {/* タイトルエリア */}
            <View className="items-center mb-12">
              <Text
                className="text-center mb-1"
                style={{ color: colors.muted, fontSize: 17 }}
              >
                AI観音様による{"\n"}対話型カウンセリングルーム
              </Text>
              <Text
                className="font-bold text-center mb-2"
                style={{ color: colors.foreground, fontSize: 50 }}
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
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
