import { ScrollView, Text, View, TouchableOpacity, Image, TextInput, Modal, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useMemo, useState, useEffect } from "react";
import { PersonalData, loadPersonalData, savePersonalData } from "@/lib/personal-data";

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

  // パーソナルデータの状態管理
  const [personalData, setPersonalData] = useState<PersonalData>({});
  const [showPersonalDataModal, setShowPersonalDataModal] = useState(false);
  const [tempPersonalData, setTempPersonalData] = useState<PersonalData>({});

  // 初回読み込み時にパーソナルデータを読み込む
  useEffect(() => {
    loadPersonalData().then((data) => {
      if (data) {
        setPersonalData(data);
      }
    });
  }, []);

  const handleStartConsultation = () => {
    router.push("/input" as any);
  };

  const handleOpenPersonalDataModal = () => {
    setTempPersonalData(personalData);
    setShowPersonalDataModal(true);
  };

  const handleSavePersonalData = async () => {
    await savePersonalData(tempPersonalData);
    setPersonalData(tempPersonalData);
    setShowPersonalDataModal(false);
  };

  const handleCancelPersonalData = () => {
    setShowPersonalDataModal(false);
  };

  return (
    <ScreenContainer edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1">
          {/* 四季の蓮華堂画像 - 画面上部いっぱい、左右いっぱい */}
          <View style={{ height: 400, width: "100%", overflow: "hidden" }}>
            <Image
              source={seasonalImage}
              style={{
                width: "100%",
                height: 430,
                marginTop: 0,
              }}
              resizeMode="cover"
            />
          </View>

          {/* コンテンツエリア */}
          <View className="flex-1 items-center px-6 pt-8">
            {/* タイトルエリア */}
            <View className="items-center mb-8">
              <Text
                className="text-center mb-2"
                style={{ color: colors.muted, fontSize: 17 }}
              >
                AI観音様によるカウンセリングルーム
              </Text>
              <Text
                className="font-bold text-center"
                style={{ color: colors.foreground, fontSize: 50 }}
              >
                蓮華堂
              </Text>
            </View>

            {/* メッセージ */}
            <View className="items-center mb-8">
              <Text
                className="text-base text-center leading-relaxed"
                style={{ color: colors.foreground }}
              >
                観音経の七つの智慧から、{"\n"}
                最もふさわしい観音様がお導きいたします。{"\n"}
                どうぞ、お悩みを自由にお話しください。
              </Text>
            </View>

            {/* パーソナルデータ表示・編集ボタン */}
            <TouchableOpacity
              onPress={handleOpenPersonalDataModal}
              activeOpacity={0.8}
              className="w-full max-w-sm mb-4"
            >
              <View
                className="py-3 px-6 rounded-lg items-center"
                style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
              >
                <Text className="text-sm" style={{ color: colors.muted }}>
                  {personalData.age || personalData.gender || personalData.occupation
                    ? `${personalData.age || ""}${personalData.age && (personalData.gender || personalData.occupation) ? " / " : ""}${personalData.gender || ""}${personalData.gender && personalData.occupation ? " / " : ""}${personalData.occupation || ""}`
                    : "プロフィールを設定する（任意）"}
                </Text>
              </View>
            </TouchableOpacity>

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

      {/* パーソナルデータ入力モーダル */}
      <Modal
        visible={showPersonalDataModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelPersonalData}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderRadius: 16,
              padding: 24,
              width: "100%",
              maxWidth: 400,
            }}
          >
            <Text
              className="text-xl font-bold mb-4 text-center"
              style={{ color: colors.foreground }}
            >
              プロフィール設定
            </Text>
            <Text
              className="text-sm mb-6 text-center"
              style={{ color: colors.muted }}
            >
              より適切なアドバイスをさせていただくため、{"\n"}
              差し支えなければご入力ください。（任意）
            </Text>

            {/* 年齢入力 */}
            <View className="mb-4">
              <Text className="text-sm mb-2" style={{ color: colors.foreground }}>
                年齢
              </Text>
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <Picker
                  selectedValue={tempPersonalData.age || ""}
                  onValueChange={(value) => setTempPersonalData({ ...tempPersonalData, age: value })}
                  style={{
                    color: colors.foreground,
                  }}
                >
                  <Picker.Item label="選択してください" value="" />
                  <Picker.Item label="10代" value="10代" />
                  <Picker.Item label="20代" value="20代" />
                  <Picker.Item label="30代" value="30代" />
                  <Picker.Item label="40代" value="40代" />
                  <Picker.Item label="50代" value="50代" />
                  <Picker.Item label="60代" value="60代" />
                  <Picker.Item label="70代以上" value="70代以上" />
                </Picker>
              </View>
            </View>

            {/* 性別入力 */}
            <View className="mb-4">
              <Text className="text-sm mb-2" style={{ color: colors.foreground }}>
                性別
              </Text>
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <Picker
                  selectedValue={tempPersonalData.gender || ""}
                  onValueChange={(value) => setTempPersonalData({ ...tempPersonalData, gender: value })}
                  style={{
                    color: colors.foreground,
                  }}
                >
                  <Picker.Item label="選択してください" value="" />
                  <Picker.Item label="男性" value="男性" />
                  <Picker.Item label="女性" value="女性" />
                  <Picker.Item label="どちらでもない" value="どちらでもない" />
                </Picker>
              </View>
            </View>

            {/* 職業入力 */}
            <View className="mb-6">
              <Text className="text-sm mb-2" style={{ color: colors.foreground }}>
                職業
              </Text>
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <Picker
                  selectedValue={tempPersonalData.occupation || ""}
                  onValueChange={(value) => setTempPersonalData({ ...tempPersonalData, occupation: value })}
                  style={{
                    color: colors.foreground,
                  }}
                >
                  <Picker.Item label="選択してください" value="" />
                  <Picker.Item label="学生" value="学生" />
                  <Picker.Item label="社会人" value="社会人" />
                  <Picker.Item label="自営業" value="自営業" />
                  <Picker.Item label="主婦/主夫" value="主婦/主夫" />
                  <Picker.Item label="無職" value="無職" />
                  <Picker.Item label="その他" value="その他" />
                </Picker>
              </View>
            </View>

            {/* ボタンエリア */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleCancelPersonalData}
                activeOpacity={0.8}
                className="flex-1"
              >
                <View
                  className="py-3 px-6 rounded-lg items-center"
                  style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
                >
                  <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                    キャンセル
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSavePersonalData}
                activeOpacity={0.8}
                className="flex-1"
              >
                <View
                  className="py-3 px-6 rounded-lg items-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-base font-semibold text-white">
                    保存
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
