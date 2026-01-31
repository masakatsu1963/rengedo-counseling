import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { type NanType } from "@/constants/kannon-data";

/**
 * 七観音とは画面
 * 六道輪廻と七観音と七難の相関図を表示
 */
export default function AboutScreen() {
  const colors = useColors();
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;
  const imageWidth = screenWidth * 0.7;

  // 相関図上の各観音様の位置（画像サイズに対する相対的な位置）
  // 一番上から時計回り：聖観音、千手観音、馬頭観音、十一面観音、不空羂索観音、准胝観音、如意輪観音
  const kannonPositions: Record<NanType, { top: string; left: string; width: string; height: string }> = {
    fire: { top: "15%", left: "40%", width: "20%", height: "15%" }, // 上部中央（聖観音）
    water: { top: "30%", left: "70%", width: "20%", height: "15%" }, // 右上（千手観音）
    wind: { top: "50%", left: "75%", width: "20%", height: "15%" }, // 右中（馬頭観音）
    demon: { top: "70%", left: "70%", width: "20%", height: "15%" }, // 右下（十一面観音）
    chain: { top: "70%", left: "10%", width: "20%", height: "15%" }, // 左下（不空缂索観音）
    grudge: { top: "50%", left: "5%", width: "20%", height: "15%" }, // 左中（准胝観音）
    sword: { top: "30%", left: "10%", width: "20%", height: "15%" }, // 左上（如意輪観音）
  };

  const handleKannonPress = (nanType: NanType) => {
    router.push(`/kannon-detail?nanType=${nanType}` as any);
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 py-6">
          {/* 七難救済の相関図 */}
          <View className="items-center flex-1 justify-center" style={{ marginTop: 0 }}>
            <View style={{ position: "relative", width: imageWidth, aspectRatio: 1 }}>
              <Image
                source={require("@/assets/images/sokanzu03.jpg")}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                resizeMode="contain"
              />
              {/* タップ可能な観音様の領域 */}
              {(Object.entries(kannonPositions) as [NanType, typeof kannonPositions[NanType]][]).map(([nanType, position]) => (
                <TouchableOpacity
                  key={nanType}
                  onPress={() => handleKannonPress(nanType)}
                  activeOpacity={0.7}
                  style={{
                    position: "absolute",
                    top: position.top as any,
                    left: position.left as any,
                    width: position.width as any,
                    height: position.height as any,
                    // デバッグ用：タップ可能領域を表示（必要に応じてコメントアウト）
                    // backgroundColor: "rgba(255, 0, 0, 0.2)",
                    // borderWidth: 1,
                    // borderColor: "red",
                  }}
                />
              ))}
            </View>
          </View>

          {/* 七難と七観音の説明 */}
          <View className="mt-2 px-4">
            <Text
              className="text-lg font-bold mb-3"
              style={{ color: "#000000" }}
            >
              ■七難と七観音
            </Text>
            <Text
              className="text-base leading-relaxed"
              style={{ color: "#000000" }}
            >
              さてさて「七難」と言って、「七観音」を思い浮かべる方も多いと思います。しかし、この「七観音」も、元々は、現世の行いによって死後に行く世界が決まると言う「六道輪廊」の思想から生まれたもので、各世界で、我々を導いてくださると言う「六観音信仰」から発展したものです。ちなみに聖観音様は「地獄道」、千手観音様は「餓鬼道」、馬頭観音様は「畜生道」、十一面観音様は「修羅道」、如意輪観音様は「天道」を救うとされています。しかし「人道」を救うのが、天台宗では、不空羂索観音様であり、真言宗では准胝観音様だったのです。このように宗派によって六観音の構成は違っていました。
              {"\n\n"}
              民間で広まった「六観音信仰」ですが、「人の道は、たいへんだ。観音様も二人くらい必要だろう」とばかりに、両派の観音様を加えた「七観音」として普及していきました。
              {"\n\n"}
              でもそのおかげで、前述しました観音経の「七難」を救っていただくために「七観音」が揃うことになったのです。（上図参照）
              {"\n\n"}
              西洋でも「七つの大罪」があるように、人の愚かさは東西を問わないようですね。
            </Text>
          </View>

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
