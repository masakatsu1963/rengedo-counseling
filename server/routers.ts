import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { getAllKannon, getKannonByNan, type NanType } from "../constants/kannon-data";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * 悩みを七難に分類
   */
  classifyConcern: publicProcedure
    .input(
      z.object({
        concern: z.string().min(1, "悩みを入力してください"),
      })
    )
    .mutation(async ({ input }) => {
      const CLASSIFICATION_SYSTEM_PROMPT = `あなたは、ユーザーの悩みを「七難」のいずれかに分類する専門家です。

七難と観音様の対応は以下の通りです（この対応は絶対に崩してはいけません）:

1. 火の難（聖観音）: 激しい怒りの炎に焼かれる苦しみ
   - ネット炎上、ヘイトスピーチ、差別、偏見、過度な競争やストレス、パワハラ、モラハラ、DV

2. 水の難（千手観音）: 欲望に溺れる苦しみ
   - 物質主義、過剰な消費、投機的な金融行動、バブル経済、汚職、不正、資富の格差拡大、環境破壊

3. 風の難（馬頭観音）: 嘘や偽りに迷わされる苦しみ
   - フェイクニュース、デマ、詐欺、情報操作、プロパガンダ、誤情報、SNS誹謗中傷、サイバー攻撃

4. 鬼の難（十一面観音）: 物や信頼を奪われる苦しみ
   - 詐欺、窃盗、横領、個人情報漏洩、サイバー犯罪、企業不祥事、政治家の汚職、信頼関係の崩壊、いじめ、ハラスメント

5. 刀の難（如意輪観音）: 権力で抑えつけられる苦しみ
   - 権力乱用、独裁政治、企業の独占、寡占、ハラスメント（パワハラなど）、言論統制、表現の自由の侵害、監視社会

6. 鎖の難（不空缂索観音）: 役割や立場で縛りつけられる苦しみ
   - 同調圧力、集団主義、固定観念、ステレオタイプ、社会規範や慣習による束縛、過度な期待、プレッシャー、役割分担の固定化

7. 怨の難（准胝観音）: 暴力や悪口で傷つけられる苦しみ
   - いじめ、嫌がらせ、誹謗中傷、名誉毀損、ネットいじめ、サイバーハラスメント、ヘイトクライム、差別的な言動

ユーザーの悩みを読み、最も適切な「難」を1つだけ選んでください。
回答は以下のJSON形式で返してください:
{
  "nanType": "fire" | "water" | "wind" | "demon" | "sword" | "chain" | "grudge",
  "reason": "この難に分類した理由を1文で"
}`;

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: CLASSIFICATION_SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: input.concern,
            },
          ],
          response_format: { type: "json_object" },
        });

        const result = JSON.parse(response.choices[0].message.content as string);
        const nanType = result.nanType as NanType;

        const kannonForValidation = getKannonByNan(nanType);
        if (!kannonForValidation) {
          throw new Error("Invalid nanType returned from LLM");
        }

        return {
          nanType,
          reason: result.reason,
          kannonName: getKannonByNan(nanType).name,
          nanName: getKannonByNan(nanType).nanName,
        };
      } catch (error) {
        console.error("Classification error:", error);
        const nanTypes: NanType[] = ["fire", "water", "wind", "demon", "sword", "chain", "grudge"];
        const randomNan = nanTypes[Math.floor(Math.random() * nanTypes.length)];
        return {
          nanType: randomNan,
          reason: "あなたの悩みに寄り添います",
          kannonName: getKannonByNan(randomNan).name,
          nanName: getKannonByNan(randomNan).nanName,
        };
      }
    }),

  /**
   * 観音様とのカウンセリング対話
   */
  chat: publicProcedure
    .input(
      z.object({
        nanType: z.enum(["fire", "water", "wind", "demon", "sword", "chain", "grudge"]),
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const kannonData = getKannonByNan(input.nanType);

        // メッセージ数に応じてシステムプロンプトを調整
        const userMessageCount = input.messages.filter(msg => msg.role === "user").length;
        const isFirstMessage = userMessageCount === 1;
        const isSecondTurn = userMessageCount === 2;
        const isThirdTurn = userMessageCount >= 3;
        
        // 「まとめと提案」ボタンからのリクエストかどうかを判定
        const lastUserMessage = input.messages.filter(msg => msg.role === "user").slice(-1)[0]?.content || "";
        const isSummaryRequest = lastUserMessage.includes("まとめ") && lastUserMessage.includes("提案");
        
        let systemPrompt = kannonData.persona;
        
        if (isFirstMessage) {
          systemPrompt = `あなたは${kannonData.name}です。${kannonData.persona}\n\n【絶対に守るべきルール】\n1. 自己紹介や挨拶は一切しないでください。\n2. 最初の返信では、必ずユーザーが話した悩みの内容を、自分の言葉で繰り返してください。\n3. 例: 「仕事でストレスがたまっています」→「仕事でのストレスに苦しんでいらっしゃるのですね。」\n4. その後、共感の言葉を添え、詳しく聞くための質問をしてください。`;
        } else if (isSecondTurn) {
          systemPrompt = `あなたは${kannonData.name}です。${kannonData.persona}\n\n【2ターン目の指示】\n1. ユーザーの追加情報に共感し、問題の全体像を把握してください。\n2. ユーザーが新たな事例や追加情報を話した場合は、それについても質問を続けてください。\n3. 対話を通じて、ユーザーの悩みを深く理解するよう努めてください。`;
        } else if (isSummaryRequest) {
          systemPrompt = `あなたは${kannonData.name}です。${kannonData.persona}\n\n【まとめと提案の指示】\n1. これまでの対話で問題が明確になってきました。\n2. まず、ユーザーの悩みを簡潔にまとめてください（2-3文程度）。\n3. 次に、具体的な対策や行動の提案を2-3個してください。\n4. 提案は実行可能で、ユーザーが今日から始められるような具体的なものにしてください。\n5. 例: 「まずは、毎日5分だけでも自分のための時間を作ってみてはいかがでしょうか」\n6. 最後に、ユーザーがどう感じているか、実行できそうかを確認してください。`;
        } else {
          systemPrompt = `あなたは${kannonData.name}です。${kannonData.persona}\n\n【対話の指示】\n1. ユーザーの話に共感し、深く理解するよう努めてください。\n2. 必要に応じて質問を続け、問題の本質を探ってください。\n3. 焦らず、ユーザーのペースに合わせて対話を進めてください。`;
        }

        const llmMessages = [
          {
            role: "system" as const,
            content: systemPrompt,
          },
          ...input.messages.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
        ];

        const response = await invokeLLM({
          messages: llmMessages,
        });

        return {
          content: response.choices[0].message.content,
        };
      } catch (error) {
        console.error("Chat error:", error);
        throw new Error("カウンセリング対話の生成に失敗しました");
      }
    }),
});

export type AppRouter = typeof appRouter;
