/**
 * 連語道カウンセリング - スタンドアロン Express サーバー
 * 元プロジェクト (server/routers.ts + server/_core/llm.ts) を
 * tRPC なしの REST API として忠実に再実装
 *
 * エンドポイント:
 *   POST /api/classify  - 悩みを七難に分類
 *   POST /api/chat      - 観音様とのカウンセリング対話
 *   GET  /api/health    - ヘルスチェック
 */

import "dotenv/config";
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { getKannonByNan, ALL_NAN_TYPES } from "./kannon-data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── 環境変数 ──────────────────────────────────────────────────
// Google AI Studio キー (GEMINI_API_KEY) または Forge キー (BUILT_IN_FORGE_API_KEY) に対応
const FORGE_API_KEY =
  process.env.GEMINI_API_KEY || process.env.BUILT_IN_FORGE_API_KEY;
const FORGE_API_URL =
  process.env.BUILT_IN_FORGE_API_URL
    ? `${process.env.BUILT_IN_FORGE_API_URL.replace(/\/$/, "")}/v1/chat/completions`
    : process.env.GEMINI_API_KEY
      ? "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
      : "https://forge.manus.im/v1/chat/completions";
const LLM_MODEL = process.env.LLM_MODEL || "gemini-2.0-flash";
const PORT = parseInt(process.env.PORT || "3000");

// ─── LLM 呼び出し（llm.ts の invokeLLM を移植） ───────────────
async function invokeLLM(params) {
  if (!FORGE_API_KEY) {
    throw new Error("BUILT_IN_FORGE_API_KEY が設定されていません");
  }

  const { messages, response_format } = params;

  const payload = {
    model: LLM_MODEL,
    messages,
    max_tokens: 8192,
  };

  if (response_format) {
    payload.response_format = response_format;
  }

  const response = await fetch(FORGE_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${FORGE_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM API エラー: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return await response.json();
}

// ─── Express 設定 ──────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// 静的ファイル配信（HTMLをルートから配信）
app.use(express.static(__dirname));

// / へのアクセスで rengedo-counseling.html を返す
app.get("/", (_req, res) => {
  res.sendFile("rengedo-counseling.html", { root: __dirname });
});

// ─── POST /api/classify ────────────────────────────────────────
// 悩みを七難に分類する
// リクエスト: { concern: string }
// レスポンス: { nanType, reason, kannonName, nanName }
app.post("/api/classify", async (req, res) => {
  const { concern } = req.body;

  if (!concern || typeof concern !== "string" || concern.trim().length === 0) {
    return res.status(400).json({ error: "concern フィールドが必要です" });
  }

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

6. 鎖の難（不空羂索観音）: 役割や立場で縛りつけられる苦しみ
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
    const llmResponse = await invokeLLM({
      messages: [
        { role: "system", content: CLASSIFICATION_SYSTEM_PROMPT },
        { role: "user",   content: concern },
      ],
      response_format: { type: "json_object" },
    });

    const result  = JSON.parse(llmResponse.choices[0].message.content);
    const nanType = result.nanType;

    const kannon = getKannonByNan(nanType);
    if (!kannon) {
      throw new Error("LLM から不正な nanType が返されました");
    }

    res.json({
      nanType,
      reason:     result.reason,
      kannonName: kannon.name,
      nanName:    kannon.nanName,
    });
  } catch (error) {
    console.error("classify エラー:", error);
    // フォールバック: ランダムな難を返す
    const randomNan = ALL_NAN_TYPES[Math.floor(Math.random() * ALL_NAN_TYPES.length)];
    const kannon = getKannonByNan(randomNan);
    res.json({
      nanType:    randomNan,
      reason:     "あなたの悩みに寄り添います",
      kannonName: kannon.name,
      nanName:    kannon.nanName,
    });
  }
});

// ─── POST /api/chat ────────────────────────────────────────────
// 観音様とのカウンセリング対話
// リクエスト: {
//   nanType: NanType,
//   messages: Array<{ role: "user"|"assistant", content: string }>,
//   personalData?: { age?: string, gender?: string, occupation?: string }
// }
// レスポンス: { content: string }
app.post("/api/chat", async (req, res) => {
  const { nanType, messages, personalData } = req.body;

  if (!ALL_NAN_TYPES.includes(nanType)) {
    return res
      .status(400)
      .json({ error: `nanType は ${ALL_NAN_TYPES.join(" | ")} のいずれかが必要です` });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages 配列が必要です" });
  }

  try {
    const kannonData = getKannonByNan(nanType);

    // メッセージ数に応じてシステムプロンプトを調整（元コードと同一ロジック）
    const userMessageCount  = messages.filter((m) => m.role === "user").length;
    const isFirstMessage    = userMessageCount === 1;
    const isSecondTurn      = userMessageCount === 2;
    const lastUserMessage   = messages.filter((m) => m.role === "user").slice(-1)[0]?.content || "";
    const isSummaryRequest  = lastUserMessage.includes("まとめ") && lastUserMessage.includes("提案");

    // パーソナルデータコンテキスト
    let personalContext = "";
    if (personalData) {
      const parts = [];
      if (personalData.age)        parts.push(`年齢: ${personalData.age}`);
      if (personalData.gender)     parts.push(`性別: ${personalData.gender}`);
      if (personalData.occupation) parts.push(`職業: ${personalData.occupation}`);
      if (parts.length > 0) {
        personalContext = `\n\n【相談者の情報】\n${parts.join(", ")}\n※この情報を踏まえて、より適切なアドバイスをしてください。`;
      }
    }

    let systemPrompt;

    if (isFirstMessage) {
      systemPrompt =
        `あなたは${kannonData.name}です。${kannonData.persona}${personalContext}\n\n` +
        `【絶対に守るべきルール】\n` +
        `1. 自己紹介や挨拶は一切しないでください。\n` +
        `2. 最初の返信では、必ずユーザーが話した悩みの内容を、自分の言葉で繰り返してください。\n` +
        `3. 例: 「仕事でストレスがたまっています」→「仕事でのストレスに苦しんでいらっしゃるのですね。」\n` +
        `4. その後、共感の言葉を添え、詳しく聞くための質問をしてください。`;
    } else if (isSecondTurn) {
      systemPrompt =
        `あなたは${kannonData.name}です。${kannonData.persona}${personalContext}\n\n` +
        `【2ターン目の指示】\n` +
        `1. ユーザーの追加情報に共感し、問題の全体像を把握してください。\n` +
        `2. ユーザーが新たな事例や追加情報を話した場合は、それについても質問を続けてください。\n` +
        `3. 対話を通じて、ユーザーの悩みを深く理解するよう努めてください。`;
    } else if (isSummaryRequest) {
      systemPrompt =
        `あなたは${kannonData.name}です。${kannonData.persona}${personalContext}\n\n` +
        `【まとめと提案の指示】\n` +
        `1. これまでの対話で問題が明確になってきました。\n` +
        `2. まず、ユーザーの悩みを簡潔にまとめてください（2-3文程度）。\n` +
        `3. 次に、具体的な対策や行動の提案を2-3個してください。\n` +
        `4. 提案は実行可能で、ユーザーが今日から始められるような具体的なものにしてください。\n` +
        `5. 最後に、相談内容に応じて専門機関や相談窓口を提案してください。\n` +
        `   - 心の健康: 心の健康相談統一ダイヤル（0570-064-556）\n` +
        `   - DVやハラスメント: DV相談ナビ（0570-0-55210）\n` +
        `   - 法律問題: 法テラス（0570-078374）\n` +
        `   - 労働問題: 労働条件相談ホットライン（0120-811-610）\n` +
        `   - 金銭問題: 金融庁の多重債務相談窓口（0570-031640）\n` +
        `6. 提案の後、ユーザーがどう感じているか、実行できそうかを確認してください。`;
    } else {
      systemPrompt =
        `あなたは${kannonData.name}です。${kannonData.persona}${personalContext}\n\n` +
        `【対話の指示】\n` +
        `1. ユーザーの話に共感し、深く理解するよう努めてください。\n` +
        `2. 必要に応じて質問を続け、問題の本質を探ってください。\n` +
        `3. 焦らず、ユーザーのペースに合わせて対話を進めてください。\n` +
        `4. 3ターン目以降は、応答の最後に以下のようなメッセージを追加してください：\n` +
        `   「今までのお話をまとめて、提案をさせていただけます。下記のボタンを押してください。もちろん、そのまま相談を続けることも可能です。」`;
    }

    const llmMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const llmResponse = await invokeLLM({ messages: llmMessages });

    res.json({ content: llmResponse.choices[0].message.content });
  } catch (error) {
    console.error("chat エラー:", error);
    res.status(500).json({ error: "カウンセリング対話の生成に失敗しました", detail: error.message });
  }
});

// ─── GET /api/health ───────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, model: LLM_MODEL, timestamp: Date.now() });
});

// ─── サーバー起動 ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ 連語道カウンセリングサーバー起動: http://localhost:${PORT}`);
  console.log(`   LLM: ${LLM_MODEL} (${FORGE_API_URL})`);
  if (!FORGE_API_KEY) {
    console.warn("⚠️  BUILT_IN_FORGE_API_KEY が未設定です。.env を確認してください。");
  }
});
