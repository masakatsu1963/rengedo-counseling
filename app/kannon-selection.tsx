import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { AppFooter } from "@/components/app-footer";
import { useColors } from "@/hooks/use-colors";
import { getKannonByNan, getAllKannon, type NanType } from "@/constants/kannon-data";

/**
 * 観音様選択画面
 * AIが分類した「難」と対応する観音様を提示
 */
export default function KannonSelectionScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams();

  const nanType = params.nanType as NanType;
  const concern = params.concern as string;
  const reason = params.reason as string;

  const selectedKannon = getKannonByNan(nanType);
  const allKannon = getAllKannon();

  const handleSelectKannon = (selectedNanType: NanType) => {
    router.push({
      pathname: "/chat" as any,
      params: {
        nanType: selectedNanType,
        concern,
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 py-8">
          {/* ヘッダー */}
          <TouchableOpacity onPress={handleBack} activeOpacity={0.7} className="mb-6">
            <Text style={{ color: colors.muted }}>← 戻る</Text>
          </TouchableOpacity>

          {/* メインメッセージ */}
          <View className="mb-8">
            <Text
              className="text-2xl font-bold mb-4"
              style={{ color: colors.foreground }}
            >
              あなたの悩みは{"\n"}
              <Text style={{ color: selectedKannon.colorTheme.primary }}>
                {selectedKannon.nanName}
              </Text>
              {"\n"}と感じられます
            </Text>
            <Text
              className="text-base leading-relaxed mb-6"
              style={{ color: colors.muted }}
            >
              {reason}
            </Text>
          </View>

          {/* 推奨される観音様 */}
          <View className="mb-8">
            <View
              className="p-6 rounded-3xl"
              style={{
                backgroundColor: selectedKannon.colorTheme.light + "20",
                borderWidth: 2,
                borderColor: selectedKannon.colorTheme.primary,
              }}
            >
              <View className="items-center mb-4">
                <Image
                  source={{ uri: selectedKannon.imageUrl }}
                  style={{ width: 200, height: 200, borderRadius: 12, marginBottom: 16 }}
                  contentFit="cover"
                />
                <Text
                  className="text-2xl font-bold mb-2"
                  style={{ color: selectedKannon.colorTheme.dark }}
                >
                  {selectedKannon.name}
                </Text>
                <Text
                  className="text-base text-center leading-relaxed"
                  style={{ color: colors.foreground }}
                >
                  {selectedKannon.description}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleSelectKannon(nanType)}
                activeOpacity={0.8}
                className="py-4 px-6 rounded-full items-center mt-4"
                style={{ backgroundColor: selectedKannon.colorTheme.primary }}
              >
                <Text className="text-white text-lg font-semibold">
                  この観音様とお話しする
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 他の観音様を選ぶ */}
          <View>
            <Text
              className="text-lg font-semibold mb-4"
              style={{ color: colors.foreground }}
            >
              他の観音様を選ぶ
            </Text>
            <View className="gap-3">
              {allKannon
                .filter((k) => k.id !== nanType)
                .map((kannon) => (
                  <TouchableOpacity
                    key={kannon.id}
                    onPress={() => handleSelectKannon(kannon.id)}
                    activeOpacity={0.7}
                    className="flex-row items-center p-4 rounded-2xl"
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-4"
                      style={{ backgroundColor: kannon.colorTheme.light }}
                    >
                      <Text className="text-2xl">🪷</Text>
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-base font-semibold mb-1"
                        style={{ color: colors.foreground }}
                      >
                        {kannon.name}
                      </Text>
                      <Text
                        className="text-sm"
                        style={{ color: colors.muted }}
                      >
                        {kannon.nanName}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        </View>
      </ScrollView>
      <AppFooter />
    </ScreenContainer>
  );
}
