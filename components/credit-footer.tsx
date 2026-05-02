import { View, Text, Linking, TouchableOpacity } from "react-native";
import { useColors } from "@/hooks/use-colors";

/**
 * 全ページ共通クレジットフッター
 * 2026 蓮華堂 All rights reserved.
 */
export function CreditFooter() {
  const colors = useColors();

  const handleLink = () => {
    Linking.openURL("https://rengedo.asia/");
  };

  return (
    <View
      className="items-center py-3 border-t"
      style={{ borderTopColor: colors.border }}
    >
      <Text className="text-xs" style={{ color: colors.muted }}>
        2026{" "}
        <TouchableOpacity onPress={handleLink} activeOpacity={0.7}>
          <Text
            className="text-xs underline"
            style={{ color: colors.primary, lineHeight: 16 }}
          >
            蓮華堂
          </Text>
        </TouchableOpacity>
        {"  "}All rights reserved.
      </Text>
    </View>
  );
}
