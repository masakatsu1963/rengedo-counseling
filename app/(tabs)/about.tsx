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
    <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 py-6">
          {/* 七難救済の相関図 */}
          <View className="items-center flex-1 justify-center" style={{ marginTop: 0 }}>
            <Image
              source={require("@/assets/images/sokanzu03.jpg")}
              style={{
                width: "70%",
                aspectRatio: 1,
              }}
              resizeMode="contain"
            />
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
