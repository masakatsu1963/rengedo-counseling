import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";

/**
 * 悩み入力画面
 * ユーザーが自由に悩みを入力できる空間
 */
export default function InputScreen() {
  const router = useRouter();
  const colors = useColors();
  const [concern, setConcern] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const classifyMutation = trpc.classifyConcern.useMutation();

  const handleSubmit = async () => {
    if (!concern.trim()) return;

    setIsAnalyzing(true);
    try {
      const result = await classifyMutation.mutateAsync({ concern });
      router.push({
        pathname: "/kannon-selection" as any,
        params: {
          nanType: result.nanType,
          concern,
          reason: result.reason,
        },
      });
    } catch (error) {
      console.error("Classification failed:", error);
      alert("分類に失敗しました。もう一度お試しください。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 py-8">
            {/* ヘッダー */}
            <View className="flex-row items-center mb-8">
              <TouchableOpacity onPress={handleBack} activeOpacity={0.7}>
                <IconSymbol
                  name="chevron.left.forwardslash.chevron.right"
                  size={24}
                  color={colors.foreground}
                />
              </TouchableOpacity>
            </View>

            {/* タイトル */}
            <View className="mb-8">
              <Text
                className="text-2xl font-bold mb-2"
                style={{ color: colors.foreground }}
              >
                どのようなことで{"\n"}お悩みですか?
              </Text>
              <Text
                className="text-base leading-relaxed"
                style={{ color: colors.muted }}
              >
                あなたの心の内を、どうぞ自由にお話しください。
              </Text>
            </View>

            {/* 入力エリア */}
            <View className="flex-1 mb-6">
              <TextInput
                value={concern}
                onChangeText={setConcern}
                placeholder="例: 仕事でのストレスが溜まっています..."
                placeholderTextColor={colors.muted}
                multiline
                textAlignVertical="top"
                returnKeyType="done"
                blurOnSubmit={true}
                className="flex-1 p-4 rounded-2xl text-base"
                style={{
                  backgroundColor: colors.surface,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                  minHeight: 100,
                }}
              />
            </View>

            {/* 送信ボタン */}
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={!concern.trim() || isAnalyzing}
              className="py-5 px-8 rounded-full items-center"
              style={{
                backgroundColor:
                  !concern.trim() || isAnalyzing
                    ? colors.muted
                    : colors.primary,
              }}
            >
              {isAnalyzing ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text className="text-white text-lg font-semibold ml-3">
                    分析中...
                  </Text>
                </View>
              ) : (
                <Text className="text-white text-lg font-semibold">
                  観音様に相談する
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
