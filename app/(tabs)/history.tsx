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

  // レーダーチャート用のデータ
  const radarData = {
    labels: ["火の難", "水の難", "風の難", "鬼の難", "刀の難", "鎖の難", "怨の難"],
    datasets: [
      {
        data: [
          nanCounts.fire,
          nanCounts.water,
          nanCounts.wind,
          nanCounts.demon,
          nanCounts.sword,
          nanCounts.chain,
          nanCounts.grudge,
        ],
      },
    ],
  };

  // 最も多い難を特定
  const maxNan = Object.entries(nanCounts).reduce((max, [nan, count]) => {
    return count > max.count ? { nan: nan as NanType, count } : max;
  }, { nan: "fire" as NanType, count: 0 });

  // 難に応じた日常的なアドバイス
  const getAdvice = (nan: NanType): string => {
    const adviceMap: Record<NanType, string> = {
      fire: "怒りや焦りを感じたら、深呼吸を3回してみましょう。感情に飲み込まれる前に、一歩引いて自分を見つめる時間を作ることが大切です。",
      water: "欲しいものがあるとき、本当に必要かどうか一晩考えてみましょう。物質的な豊かさよりも、心の豊かさを大切にすることで、本当の満足が得られます。",
      wind: "情報に惑わされそうになったら、その情報源を確認しましょう。真実を見極める目を養うことで、迷いから解放されます。",
      demon: "人との関係で不安を感じたら、相手の立場に立って考えてみましょう。信頼関係は、相互理解から生まれます。",
      sword: "プレッシャーを感じたら、自分の意見を大切にしましょう。他人の期待に応えることよりも、自分らしく生きることが重要です。",
      chain: "周りの目が気になったら、自分の価値観を確認しましょう。他人の評価ではなく、自分の心に従うことで、本当の自由が得られます。",
      grudge: "傷ついたら、その気持ちを誰かに話してみましょう。一人で抱え込まず、信頼できる人に相談することで、心が軽くなります。",
    };

    return adviceMap[nan] || "毎日を大切に、心穏やかに過ごしましょう。";
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
                    
                    return (
                      <View key={index}>
                        <View className="flex-row justify-between mb-1">
                          <Text className="text-sm" style={{ color: "#666666" }}>
                            {label}
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
                              backgroundColor: "#8A2BE2",
                              width: `${percentage}%`,
                            }}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* 日常的なアドバイス */}
              <View
                className="bg-white rounded-2xl p-6 shadow-sm"
                style={{ borderWidth: 1, borderColor: "#E5E7EB" }}
              >
                <Text className="text-lg font-bold mb-3" style={{ color: "#000000" }}>
                  今日のアドバイス
                </Text>
                <Text className="text-base leading-relaxed" style={{ color: "#333333" }}>
                  {getAdvice(maxNan.nan)}
                </Text>
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
            <Text className="text-sm text-center mb-2" style={{ color: "#666666" }}>
              様々な、お悩み相談窓口をご案内します。
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
