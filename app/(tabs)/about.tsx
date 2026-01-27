import { View, Text, ScrollView, Image } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

/**
 * 七観音とは画面
 * 六道輪廻と七観音と七難の相関図を表示
 */
export default function AboutScreen() {
  const colors = useColors();

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 py-6">
          {/* タイトル */}
          <View className="items-center mb-4">
            <Text
              className="text-3xl font-bold text-center"
              style={{ color: colors.foreground }}
            >
              七観音とは
            </Text>
          </View>

          {/* 説明文 */}
          <View className="mb-8">
            <Text
              className="text-base leading-relaxed text-center"
              style={{ color: colors.foreground }}
            >
              観音経では、七つの難（七難）から救済する{"\n"}
              七つの観音様が説かれています。
            </Text>
          </View>

          {/* 七難救済の相関図 */}
          <View className="items-center">
            <Image
              source={require("@/assets/images/seven-kannon-diagram.png")}
              style={{
                width: "65%",
                aspectRatio: 1,
              }}
              resizeMode="contain"
            />
          </View>


        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
