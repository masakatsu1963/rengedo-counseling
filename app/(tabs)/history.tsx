import { useState, useEffect } from "react";
import { ScrollView, Text, View, Dimensions, Linking, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { getAllConsultations, type ConsultationSession } from "@/lib/storage";
import { type NanType } from "@/constants/kannon-data";

/**
 * 過去の相談 Screen
 */
export default function HistoryScreen() {
  const [consultations, setConsultations] = useState<ConsultationSession[]>([]);
  const [nanCounts, setNanCounts] = useState<Record<NanType, number>>({
    fire: 0,
    water: 0,
    wind: 0,
    demon: 0,
    sword: 0,
    chain: 0,
    grudge: 0,
  });

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    const data = await getAllConsultations();
    setConsultations(data);

    // 七難の傾向をカウント
    const counts: Record<NanType, number> = {
      fire: 0,
      water: 0,
      wind: 0,
      demon: 0,
      sword: 0,
      chain: 0,
      grudge: 0,
    };

    data.forEach((consultation: ConsultationSession) => {
      if (consultation.nanType in counts) {
        counts[consultation.nanType]++;
      }
    });

    setNanCounts(counts);
  };

  // 難の説明マップ
  const nanDescriptions: Record<NanType, string> = {
    fire: "怒りや憎しみの炎",
    water: "物質的な執着や欲望",
    wind: "情報の嵐や迷い",
    demon: "心の中の恐れや不安",
    sword: "権力の乱用や暴力",
    chain: "社会の束縛や抑圧",
    grudge: "人間関係の対立や恨み",
  };

  // 難の名称マップ
  const nanNames: Record<NanType, string> = {
    fire: "火の難",
    water: "水の難",
    wind: "風の難",
    demon: "鬼の難",
    sword: "刀の難",
    chain: "鎖の難",
    grudge: "怨の難",
  };

  // 難の色マップ
  const nanColors: Record<NanType, string> = {
    fire: "#C0504D",
    water: "#C9302C",
    wind: "#6FA868",
    demon: "#8E7CC3",
    sword: "#D4AF37",
    chain: "#4A6FA5",
    grudge: "#76A5AF",
  };

  // レーダーチャート用のデータ（刀の難を一番下に配置）
  const radarData = {
    labels: [
      nanNames.fire,
      nanNames.water,
      nanNames.wind,
      nanNames.demon,
      nanNames.chain,
      nanNames.grudge,
      nanNames.sword,
    ],
    datasets: [
      {
        data: [
          nanCounts.fire,
          nanCounts.water,
          nanCounts.wind,
          nanCounts.demon,
          nanCounts.chain,
          nanCounts.grudge,
          nanCounts.sword,
        ],
      },
    ],
  };

  const screenWidth = Dimensions.get("window").width;

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
              あなたの悩みの傾向
            </Text>
          </View>

          {/* 七難の傾向表示 */}
          {consultations.length > 0 ? (
            <>
              <View
                className="bg-white rounded-2xl p-6 shadow-sm"
                style={{ borderWidth: 1, borderColor: "#E5E7EB" }}
              >
                <Text className="text-lg font-bold mb-4" style={{ color: "#000000" }}>
                  悩みの傾向
                </Text>
                <View className="gap-3">
                  {Object.entries(radarData.labels).map(([index, label]) => {
                    const count = radarData.datasets[0].data[parseInt(index)];
                    const maxCount = Math.max(...radarData.datasets[0].data);
                    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    
                    // 難のタイプを取得（radarData.labelsの順序と一致）
                    const nanTypes: NanType[] = ["fire", "water", "wind", "demon", "chain", "grudge", "sword"];
                    const nanType = nanTypes[parseInt(index)];
                    const nanColor = nanColors[nanType];
                    const description = nanDescriptions[nanType];
                    
                    return (
                      <View key={index}>
                        <View className="flex-row justify-between mb-1">
                          <Text className="text-sm" style={{ lineHeight: 20 }}>
                            <Text style={{ color: nanColor, fontWeight: "600" }}>{label}</Text>
                            <Text style={{ color: "#000000" }}> - {description}</Text>
                          </Text>
                          <Text className="text-sm font-semibold" style={{ color: "#8A2BE2" }}>
                            {count}回
                          </Text>
                        </View>
                        <View
                          className="h-2 rounded-full"
                          style={{ backgroundColor: "#F3F4F6" }}
                        >
                          <View
                            className="h-2 rounded-full"
                            style={{
                              backgroundColor: nanColor,
                              width: `${percentage}%`,
                            }}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* 相談履歴の統計 */}
              <View
                className="bg-white rounded-2xl p-6 shadow-sm"
                style={{ borderWidth: 1, borderColor: "#E5E7EB" }}
              >
                <Text className="text-lg font-bold mb-3" style={{ color: "#000000" }}>
                  相談の記録
                </Text>
                <Text className="text-base" style={{ color: "#666666" }}>
                  これまでに{consultations.length}回の相談をされています。
                </Text>
              </View>
            </>
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-base" style={{ color: "#666666" }}>
                まだ相談履歴がありません
              </Text>
              <Text className="text-sm mt-2" style={{ color: "#999999" }}>
                相談を始めると、ここに傾向が表示されます
              </Text>
            </View>
          )}

          {/* クレジット表示 */}
          <View
            className="bg-white rounded-2xl p-6 shadow-sm mt-8"
            style={{ borderWidth: 1, borderColor: "#E5E7EB" }}
          >
            <Text className="text-xs text-center mb-2" style={{ color: "#666666", lineHeight: 18 }}>
              本システムは、カウンセリングを体験していただくもので、カウンセリングを代替するものではありません。本格的なカウンセリングは、専門のクリニックや心療内科にご相談ください。
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL("http://www.artam.asia/rengedo/")}
              activeOpacity={0.7}
            >
              <Text
                className="text-lg font-bold text-center mb-2"
                style={{ color: "#8A2BE2", textDecorationLine: "underline" }}
              >
                蓮華堂
              </Text>
            </TouchableOpacity>
            <Text className="text-xs text-center" style={{ color: "#999999" }}>
              2026 copyright by Rengedo, Masakatsu
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
