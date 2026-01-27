import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { KANNON_DATA, type NanType } from "../constants/kannon-data";

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
- 火の難（聖観音）: 怒り、情熱、激しい感情の問題
- 水の難（千手観音）: 感情の溢れ、悲しみ、涙
- 風の難（馬頭観音）: 不安定、迷い、決断できない
- 鬼の難（十一面観音）: 恐怖、トラウマ、心の傷
- 刀の難（如意輪観音）: 対人関係の衝突、葛藤
- 鎖の難（不空羂索観音）: 束縛、自由の欠如、閉塞感
- 怨の難（准胝観音）: 恨み、過去への執着、許せない気持ち

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

        if (!KANNON_DATA[nanType]) {
          throw new Error("Invalid nanType returned from LLM");
        }

        return {
          nanType,
          reason: result.reason,
          kannonName: KANNON_DATA[nanType].name,
          nanName: KANNON_DATA[nanType].nanName,
        };
      } catch (error) {
        console.error("Classification error:", error);
        const nanTypes: NanType[] = ["fire", "water", "wind", "demon", "sword", "chain", "grudge"];
        const randomNan = nanTypes[Math.floor(Math.random() * nanTypes.length)];
        return {
          nanType: randomNan,
          reason: "あなたの悩みに寄り添います",
          kannonName: KANNON_DATA[randomNan].name,
          nanName: KANNON_DATA[randomNan].nanName,
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
        const kannonData = KANNON_DATA[input.nanType];

        const llmMessages = [
          {
            role: "system" as const,
            content: kannonData.persona,
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
