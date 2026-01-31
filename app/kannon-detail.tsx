import { View, Text, ScrollView, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { getKannonByNan, type NanType } from "@/constants/kannon-data";
import { useColors } from "@/hooks/use-colors";
import { TouchableOpacity } from "react-native";

/**
 * 観音様の詳細ページ
 * 各観音様の詳しい説明を表示
 */
export default function KannonDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams();
  const nanType = params.nanType as NanType;

  const kannonData = getKannonByNan(nanType);

  const handleBack = () => {
    router.back();
  };

  return (
    <ScreenContainer edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1">
          {/* ヘッダー画像 */}
          <View className="relative">
            <Image
              source={{ uri: kannonData.imageUrl }}
              style={{
                width: "100%",
                height: 250,
              }}
              resizeMode="cover"
            />
            {/* 戻るボタン */}
            <TouchableOpacity
              onPress={handleBack}
              activeOpacity={0.8}
              className="absolute top-4 left-4"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                borderRadius: 20,
                padding: 8,
                width: 40,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text className="text-white text-xl">←</Text>
            </TouchableOpacity>
          </View>

          {/* コンテンツエリア */}
          <View className="px-6 py-8 gap-6">
            {/* タイトルエリア */}
            <View className="items-center gap-2">
              <Text
                className="text-3xl font-bold text-center"
                style={{ color: kannonData.colorTheme.primary }}
              >
                {kannonData.name}
              </Text>
              <Text
                className="text-xl text-center"
                style={{ color: colors.muted }}
              >
                {kannonData.nanName}
              </Text>
            </View>

            {/* 説明カード */}
            <View
              className="bg-white rounded-2xl p-6 shadow-sm"
              style={{ borderWidth: 1, borderColor: colors.border }}
            >
              <Text
                className="text-lg font-bold mb-3"
                style={{ color: colors.foreground }}
              >
                どのような難を救うか
              </Text>
              <Text
                className="text-base leading-relaxed"
                style={{ color: colors.foreground }}
              >
                {kannonData.description}
              </Text>
            </View>

            {/* ペルソナカード */}
            <View
              className="bg-white rounded-2xl p-6 shadow-sm"
              style={{ borderWidth: 1, borderColor: colors.border }}
            >
              <Text
                className="text-lg font-bold mb-3"
                style={{ color: colors.foreground }}
              >
                観音様の特徴
              </Text>
              <Text
                className="text-base leading-relaxed"
                style={{ color: colors.foreground }}
              >
                {kannonData.persona}
              </Text>
            </View>


          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
