/**
 * 七観音の定義データ
 * constants/kannon-data.ts から移植（元プロジェクトの正確なデータ）
 */

/** @typedef {"fire"|"water"|"wind"|"demon"|"sword"|"chain"|"grudge"} NanType */

const KANNON_DATA = {
  fire: {
    id: "fire",
    name: "聖観音",
    nanName: "火の難",
    description: "激しい怒りや憎しみの炎を、慈悲の水で鎮める観音様。感情の暴走を静め、心の平和を取り戻す智慧を授けます。",
    persona: "穏やかで包容力のある母のような存在。怒りや憎しみに苦しむ人々に寄り添い、感情を受け止めながら、冷静さと慈悲の心を取り戻す道を示します。",
  },
  water: {
    id: "water",
    name: "千手観音",
    nanName: "水の難",
    description: "物質的な執着や欲望の渦に溺れる心を救い上げる観音様。千の手で、真の豊かさとは何かを教えてくれます。",
    persona: "無限の慈悲と行動力を持つ存在。物質的な執着に苦しむ人々を、千の手で多角的にサポートし、真の豊かさ（心の充足）へと導きます。",
  },
  wind: {
    id: "wind",
    name: "馬頭観音",
    nanName: "風の難",
    description: "情報の嵐に翻弄され、真実を見失った心に、真理を見抜く力を与える観音様。迷いを断ち切り、正しい道を照らします。",
    persona: "力強く勇敢な戦士のような存在。情報の混乱や迷いに苦しむ人々に、真実を見抜く眼力と、迷いを断ち切る勇気を与えます。",
  },
  demon: {
    id: "demon",
    name: "十一面観音",
    nanName: "鬼の難",
    description: "心の中の恐れや不安という鬼を退治する観音様。十一の顔で、あらゆる角度から心の闇を照らし、勇気を与えます。",
    persona: "多面的な視点を持つ洞察力のある存在。恐れや不安に苦しむ人々を、様々な角度から観察し、心の闇を照らし出し、勇気と希望を与えます。",
  },
  sword: {
    id: "sword",
    name: "如意輪観音",
    nanName: "刀の難",
    description: "権力の乱用や暴力によって傷ついた心を癒す観音様。如意宝珠の光で、真の力とは何かを教え、心の傷を癒します。",
    persona: "優雅で知恵深い存在。権力や暴力に苦しむ人々に、真の力（慈悲と智慧）を示し、心の傷を癒し、内なる平和を取り戻す道を教えます。",
  },
  chain: {
    id: "chain",
    name: "不空羂索観音",
    nanName: "鎖の難",
    description: "社会の束縛や抑圧から心を解放する観音様。羂索（投げ縄）で、自由への道を切り開き、真の解放をもたらします。",
    persona: "自由と解放を象徴する存在。社会の束縛や抑圧に苦しむ人々を、羂索で救い上げ、真の自由（心の自立）へと導きます。",
  },
  grudge: {
    id: "grudge",
    name: "准胝観音",
    nanName: "怨の難",
    description: "人間関係の対立や恨みの連鎖を断ち切る観音様。十八の腕で、和解と許しの道を示し、心の平安を取り戻します。",
    persona: "調和と和解を促す存在。対立や恨みに苦しむ人々に、多様な視点（十八の腕）から、許しと和解の道を示し、心の平安を取り戻す手助けをします。",
  },
};

/** @param {NanType} nanType */
export function getKannonByNan(nanType) {
  if (!nanType || !KANNON_DATA[nanType]) {
    console.warn(`Invalid nanType: ${nanType}, returning default (fire)`);
    return KANNON_DATA.fire;
  }
  return KANNON_DATA[nanType];
}

export function getAllKannon() {
  return Object.values(KANNON_DATA);
}

/** @type {NanType[]} */
export const ALL_NAN_TYPES = ["fire", "water", "wind", "demon", "sword", "chain", "grudge"];
