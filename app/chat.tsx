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
  Image,
} from "react-native";

import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { AppFooter } from "@/components/app-footer";
import { useColors } from "@/hooks/use-colors";
import { getKannonByNan, type NanType } from "@/constants/kannon-data";
import { trpc } from "@/lib/trpc";
import {
  generateId,
  saveConsultation,
  type ChatMessage,
  type ConsultationSession,
} from "@/lib/storage";
import { loadPersonalData, type PersonalData } from "@/lib/personal-data";

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
  const [showSummaryButton, setShowSummaryButton] = useState(false);
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);

  const chatMutation = trpc.chat.useMutation();

  // パーソナルデータを読み込む
  useEffect(() => {
    loadPersonalData().then((data) => {
      if (data) {
        setPersonalData(data);
      }
    });
  }, []);

  // 初回メッセージ（相談内容への共感）
  useEffect(() => {
    // 相談内容を要約して共感的に繰り返す
    const empathyMessage = `「${concern}」と感じていらっしゃるのですね。\n\n詳しくお話を聞かせていただけますか？`;
    
    const initialMessage: ChatMessage = {
      id: generateId(),
      role: "kannon",
      content: empathyMessage,
      timestamp: Date.now(),
    };
    setMessages([initialMessage]);
  }, [concern]);

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
        personalData: personalData || undefined,
      });

      const kannonMessage: ChatMessage = {
        id: generateId(),
        role: "kannon",
        content: response.content as string,
        timestamp: Date.now(),
      };

      const updatedMessages = [...newMessages, kannonMessage];
      setMessages(updatedMessages);

      // 3ターン目以降は「まとめと提案」ボタンを表示
      const userMessageCount = updatedMessages.filter(msg => msg.role === "user").length;
      if (userMessageCount >= 3) {
        setShowSummaryButton(true);
      }

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

      // スクロールを観音様の返答の先頭に（最新のメッセージの位置に移動）
      setTimeout(() => {
        const lastIndex = updatedMessages.length - 1;
        if (lastIndex >= 0) {
          flatListRef.current?.scrollToIndex({
            index: lastIndex,
            animated: true,
            viewPosition: 0, // 画面の上部に表示
          });
        }
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
        {/* 観音様の画像（画面幅いっぱい、高さ悩％） */}
        {kannonData?.chatImageUrl && (
          <View className="w-full overflow-hidden" style={{ aspectRatio: 16 / (9 * 0.6) }}>
            <Image
              source={{ uri: kannonData.chatImageUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
        )}

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
          ListHeaderComponent={
            messages.length <= 1 ? (
              <View
                className="rounded-xl p-3 mb-4"
                style={{ backgroundColor: "#FFF8E1", borderWidth: 1, borderColor: "#F0C040" }}
              >
                <Text className="text-xs text-center" style={{ color: "#7A6000", lineHeight: 18 }}>
                  本システムは、カウンセリングを体験していただくもので、カウンセリングを代替するものではありません。本格的なカウンセリングは、専門のクリニックや心療内科にご相談ください。
                </Text>
              </View>
            ) : null
          }
          onContentSizeChange={() => {
            // 新しいメッセージが追加されたら最上部にスクロール
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }}
        />

        {/* 入力エリア */}
        <View
          className="px-4 py-3 border-t"
          style={{
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          }}
        >
          {/* 選択ボタン（3ターン目から表示） */}
          {showSummaryButton && (
            <View className="mb-2 flex-row gap-2">
              <TouchableOpacity
                onPress={async () => {
                  setShowSummaryButton(false);
                  
                  const summaryMessage: ChatMessage = {
                    id: generateId(),
                    role: "user",
                    content: "これまでの話をまとめて、具体的な提案をしてください。",
                    timestamp: Date.now(),
                  };

                  const newMessages = [...messages, summaryMessage];
                  setMessages(newMessages);

                  setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                  }, 100);

                  try {
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

                    setTimeout(() => {
                      const lastIndex = updatedMessages.length - 1;
                      if (lastIndex >= 0) {
                        flatListRef.current?.scrollToIndex({
                          index: lastIndex,
                          animated: true,
                          viewPosition: 0,
                        });
                      }
                    }, 100);
                  } catch (error) {
                    console.error("Chat error:", error);
                    alert("メッセージの送信に失敗しました。もう一度お試しください。");
                  }
                }}
                activeOpacity={0.7}
                className="flex-1 px-4 py-2 rounded-full"
                style={{
                  backgroundColor: kannonData.colorTheme.primary,
                }}
              >
                <Text className="text-white text-center font-semibold">
                  まとめと提案を聞く
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowSummaryButton(false);
                }}
                activeOpacity={0.7}
                className="flex-1 px-4 py-2 rounded-full"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: kannonData.colorTheme.primary,
                }}
              >
                <Text className="text-center font-semibold" style={{ color: kannonData.colorTheme.primary }}>
                  相談を続ける
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
      <AppFooter />
    </ScreenContainer>
  );
}
