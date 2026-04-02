import { View, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

/**
 * アプリ共通フッター
 * ホームボタンと過去の相談ボタンを含む
 */
export function AppFooter() {
  const router = useRouter();
  const colors = useColors();

  const handleHome = () => {
    router.push("/");
  };

  const handleHistory = () => {
    router.push("/(tabs)/history" as any);
  };

  return (
    <View
      className="flex-row items-center justify-around px-6 py-4 border-t"
      style={{
        backgroundColor: colors.background,
        borderTopColor: colors.border,
      }}
    >
      {/* ホームボタン */}
      <TouchableOpacity
        onPress={handleHome}
        className="flex-1 items-center py-2"
        activeOpacity={0.7}
      >
        <IconSymbol name="house.fill" size={24} color={colors.primary} />
        <Text className="text-xs mt-1" style={{ color: colors.foreground }}>
          ホーム
        </Text>
      </TouchableOpacity>

      {/* 過去の相談ボタン */}
      <TouchableOpacity
        onPress={handleHistory}
        className="flex-1 items-center py-2"
        activeOpacity={0.7}
      >
        <IconSymbol name="paperplane.fill" size={24} color={colors.primary} />
        <Text className="text-xs mt-1" style={{ color: colors.foreground }}>
          過去の相談
        </Text>
      </TouchableOpacity>
    </View>
  );
}
