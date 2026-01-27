import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";

import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { getKannonByNan, type NanType } from "@/constants/kannon-data";
import { trpc } from "@/lib/trpc";
import {
  generateId,
  saveConsultation,
  type ChatMessage,
  type ConsultationSession,
} from "@/lib/storage";

/**
 * カウンセリング対話画面
 * 観音様とのAI対話を通じてカウンセリングを行う
 */
export default function ChatScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams();
  const flatListRef = useRef<FlatList>(null);

  const nanType = params.nanType as NanType;
  const concern = params.concern as string;

  const kannonData = getKannonByNan(nanType);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [sessionId] = useState(() => generateId());

  const chatMutation = trpc.chat.useMutation();

  // 初回メッセージ（観音様からの挨拶）
  useEffect(() => {
    const initialMessage: ChatMessage = {
      id: generateId(),
      role: "kannon",
      content: `こんにちは。私は${kannonData.name}です。あなたの心の内をお聞かせください。`,
      timestamp: Date.now(),
    };
    setMessages([initialMessage]);
  }, [kannonData.name]);

  // メッセージ送信
  const handleSend = async () => {
    if (!inputText.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: inputText.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText("");

    // スクロールを最下部に
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // LLMに送信するメッセージ履歴を構築
      const llmMessages = newMessages.map((msg) => ({
        role: msg.role === "kannon" ? ("assistant" as const) : ("user" as const),
        content: msg.content,
      }));

      const response = await chatMutation.mutateAsync({
        nanType,
        messages: llmMessages,
      });

      const kannonMessage: ChatMessage = {
        id: generateId(),
        role: "kannon",
        content: response.content as string,
        timestamp: Date.now(),
      };

      const updatedMessages = [...newMessages, kannonMessage];
      setMessages(updatedMessages);

      // セッションを保存
      const session: ConsultationSession = {
        id: sessionId,
        nanType,
        kannonName: kannonData.name,
        userConcern: concern,
        messages: updatedMessages,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await saveConsultation(session);

      // スクロールを最下部に
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Chat error:", error);
      alert("メッセージの送信に失敗しました。もう一度お試しください。");
    }
  };

  const handleBack = () => {
    router.back();
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isKannon = item.role === "kannon";

    return (
      <View
        className={`mb-4 ${isKannon ? "items-start" : "items-end"}`}
      >
        <View
          className="max-w-[80%] px-4 py-3 rounded-2xl"
          style={{
            backgroundColor: isKannon
              ? kannonData.colorTheme.light + "40"
              : colors.surface,
            borderWidth: 1,
            borderColor: isKannon
              ? kannonData.colorTheme.primary
              : colors.border,
          }}
        >
          <Text
            className="text-base leading-relaxed"
            style={{ color: colors.foreground }}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        {/* ヘッダー */}
        <View
          className="px-6 py-4 border-b"
          style={{
            backgroundColor: kannonData.colorTheme.primary,
            borderBottomColor: kannonData.colorTheme.dark,
          }}
        >
          <View className="flex-row items-center">
            <TouchableOpacity onPress={handleBack} activeOpacity={0.7} className="mr-4">
              <Text className="text-white text-base">← 戻る</Text>
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">
                {kannonData.name}
              </Text>
              <Text className="text-white text-sm opacity-90">
                {kannonData.nanName}
              </Text>
            </View>
          </View>
        </View>

        {/* メッセージリスト */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* 入力エリア */}
        <View
          className="px-4 py-3 border-t"
          style={{
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          }}
        >
          <View className="flex-row items-center">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="メッセージを入力..."
              placeholderTextColor={colors.muted}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              className="flex-1 px-4 py-3 rounded-full text-base mr-3"
              style={{
                backgroundColor: colors.background,
                color: colors.foreground,
                borderWidth: 1,
                borderColor: colors.border,
                maxHeight: 100,
              }}
            />
            <TouchableOpacity
              onPress={handleSend}
              activeOpacity={0.8}
              disabled={!inputText.trim() || chatMutation.isPending}
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{
                backgroundColor:
                  !inputText.trim() || chatMutation.isPending
                    ? colors.muted
                    : kannonData.colorTheme.primary,
              }}
            >
              {chatMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-white text-xl">↑</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
