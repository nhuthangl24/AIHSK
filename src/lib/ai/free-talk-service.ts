import { AIClient, ChatMessage } from "./ai-client";
import { pinyin } from "pinyin-pro";

export interface FreeTalkMessage {
  role: "user" | "assistant";
  content: string;
  pinyin?: string;
  translation?: string;
  tip?: string;
  suggestions?: { zh: string; pinyin: string; vi: string }[];
}

export interface FreeTalkPersona {
  id: string;
  name: string;
  zhName: string;
  role: string;
  avatarText: string;
  avatarColor: string;
  avatarIcon?: string;
  description: string;
  greeting: string;
  greetingPinyin: string;
  greetingVi: string;
  initialSuggestions: { zh: string; pinyin: string; vi: string }[];
}

export const FREE_TALK_PERSONAS: Record<string, FreeTalkPersona> = {
  friendly_peer: {
    id: "friendly_peer",
    name: "Tiểu Lý (小李)",
    zhName: "小李同学",
    role: "Bạn học thân thiện",
    avatarText: "HSK",
    avatarColor: "from-emerald-500 to-emerald-700",
    avatarIcon: "/icon.svg",
    description: "Trò chuyện đời sống thường ngày như hai người bạn, không áp lực, dùng từ ngữ tự nhiên, gần gũi.",
    greeting: "嗨！今天过得怎么样？你想和我随便聊聊什么呢？",
    greetingPinyin: "Hāi! Jīntiān guò de zěnmeyàng? Nǐ xiǎng hé wǒ suíbiàn liáoliao shénme ne?",
    greetingVi: "Chào bạn! Hôm nay thế nào rồi? Bạn muốn tán gẫu tự do về chuyện gì nào?",
    initialSuggestions: [
      { zh: "我今天挺好的，刚吃完饭。", pinyin: "Wǒ jīntiān tǐng hǎo de, gāng chī wán fàn.", vi: "Hôm nay mình khá ổn, vừa ăn cơm xong." },
      { zh: "今天工作/学习有点累，想聊聊天放松一下。", pinyin: "Jīntiān gōngzuò/xuéxí yǒudiǎn lèi, xiǎng liáoliao tiān fàngsōng yíxià.", vi: "Hôm nay làm việc/học tập hơi mệt, muốn trò chuyện thư giãn tí." },
      { zh: "我想练练口语，你能陪我聊聊生活吗？", pinyin: "Wǒ xiǎng liànlian kǒuyǔ, nǐ néng péi wǒ liáoliao shēnghuó ma?", vi: "Mình muốn luyện khẩu ngữ, bạn cùng mình trò chuyện đời sống nhé?" },
    ],
  },
  gentle_tutor: {
    id: "gentle_tutor",
    name: "Lý Lão Sư (李老师)",
    zhName: "李老师",
    role: "Gia sư kiên nhẫn",
    avatarText: "HSK",
    avatarColor: "from-emerald-600 to-teal-800",
    avatarIcon: "/icon.svg",
    description: "Nhẹ nhàng giải thích, sửa các lỗi ngữ pháp nhỏ, dùng câu ngắn dễ hiểu và động viên bạn nói nhiều hơn.",
    greeting: "你好！别紧张，这里没有考试和打分。你想聊什么话题都可以，慢慢说就好。",
    greetingPinyin: "Nǐ hǎo! Bié jǐnzhāng, zhèlǐ méiyǒu kǎoshì hé dǎ fēn. Nǐ xiǎng liáo shénme huàtí dōu kěyǐ, mànman shuō jiù hǎo.",
    greetingVi: "Chào em! Đừng căng thẳng nhé, ở đây không có thi cử hay chấm điểm gì cả. Em muốn trò chuyện về chủ đề nào cũng được, cứ nói từ từ thôi.",
    initialSuggestions: [
      { zh: "老师好，我想提高日常汉语听说能力。", pinyin: "Lǎoshī hǎo, wǒ xiǎng tígāo rìcháng hànyǔ tīngshuō nénglì.", vi: "Chào cô, em muốn nâng cao năng lực nghe nói tiếng Trung hàng ngày." },
      { zh: "如果我说错了，请老师帮我指出来。", pinyin: "Rúguǒ wǒ shuō cuò le, qǐng lǎoshī bāng wǒ zhǐ chūlai.", vi: "Nếu em nói sai chỗ nào, nhờ cô chỉ ra giúp em nhé." },
      { zh: "我今天遇到一件很有趣的事，想分享给您。", pinyin: "Wǒ jīntiān yùdào yí jiàn hěn yǒuqù de shì, xiǎng fēnxiǎng gěi nín.", vi: "Hôm nay em gặp một chuyện rất thú vị, muốn chia sẻ với cô ạ." },
    ],
  },
  travel_companion: {
    id: "travel_companion",
    name: "A Khang (阿康)",
    zhName: "旅行达人阿康",
    role: "Bạn đồng hành du lịch",
    avatarText: "HSK",
    avatarColor: "from-teal-500 to-emerald-700",
    avatarIcon: "/icon.svg",
    description: "Đam mê ẩm thực, văn hóa và du lịch Trung Quốc. Thích kể chuyện các thành phố và món ăn đặc sắc.",
    greeting: "哈喽！你喜欢旅行吗？中国有很多好玩的地方和好吃的美食，你想聊聊哪儿？",
    greetingPinyin: "Hālóu! Nǐ xǐhuan lǚxíng ma? Zhōngguó yǒu hěn duō hǎowán de dìfang hé hǎochī de měishí, nǐ xiǎng liáoliao nǎr?",
    greetingVi: "Xin chào! Bạn có thích đi du lịch không? Trung Quốc có rất nhiều nơi đẹp và món ăn ngon, bạn muốn trò chuyện về nơi nào?",
    initialSuggestions: [
      { zh: "我很想去北京爬长城、吃烤鸭。", pinyin: "Wǒ hěn xiǎng qù Běijīng pá Chángchéng, chī kǎoyā.", vi: "Mình rất muốn đến Bắc Kinh leo Vạn Lý Trường Thành, ăn vịt quay." },
      { zh: "我喜欢吃火锅，特别是四川和重庆火锅。", pinyin: "Wǒ xǐhuan chī huǒguō, tèbié shì Sìchuān hé Chóngqìng huǒguō.", vi: "Mình thích ăn lẩu, đặc biệt là lẩu Tứ Xuyên và Trùng Khánh." },
      { zh: "越南也有很多美丽的景点，比如岘港和下龙湾。", pinyin: "Yuènán yě yǒu hěn duō měilì de jǐngdiǎn, bǐrú Xiàngǎng hé Xiàlóngwān.", vi: "Việt Nam cũng có nhiều cảnh đẹp lắm, như Đà Nẵng và Vịnh Hạ Long." },
    ],
  },
};

export interface FreeTalkCorrection {
  original: string;
  correction: string;
  explanation: string;
}

export interface FreeTalkExtensionQuestion {
  zh: string;
  pinyin: string;
  vi: string;
  tip?: string;
}

export interface FreeTalkEvaluation {
  overallScore: number;
  hskEstimate: string;
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  corrections: FreeTalkCorrection[];
  extensionQuestions?: FreeTalkExtensionQuestion[];
}

export class FreeTalkService {
  /**
   * Generates a conversational response in Free Talk mode.
   */
  static async generateReply({
    messages,
    level = "Tự do",
    personaId = "friendly_peer",
  }: {
    messages: { role: "user" | "assistant"; content: string }[];
    level?: string;
    personaId?: string;
  }): Promise<{
    reply: string;
    pinyin: string;
    translation: string;
    tip?: string;
    suggestions: { zh: string; pinyin: string; vi: string }[];
  }> {
    const persona = FREE_TALK_PERSONAS[personaId] || FREE_TALK_PERSONAS.friendly_peer;
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";

    // 1. Try Cloud LLM via AIClient
    try {
      if (!process.env.VITEST) {
        const config = await AIClient.getActiveConfig();
        if (config.apiKey && config.isEnabled) {
          // Route to high-speed conversational model (gemini-3.6-flash) to keep turn latency ~1s
          const targetModel =
            config.modelId.includes("sonnet") || config.modelId.includes("opus")
              ? "gemini-3.6-flash"
              : config.modelId || "gemini-3.6-flash";

          const systemPrompt = `You are ${persona.name} (${persona.zhName}), a ${persona.role}.
Casual Free-Talk companion for Chinese learners.
Learner Level: ${level}.
Persona: Warm, conversational, friendly.

INSTRUCTIONS:
1. "reply": Reply in natural, spoken Mandarin (1-2 concise sentences). Acknowledge user's idea and ask a friendly question to keep chatting.
2. "translation": Brief, natural Vietnamese translation of "reply".
3. "tip": If the user made a noticeable grammar mistake or used unnatural phrasing, provide a short 1-sentence tip in Vietnamese (e.g. "💡 Mẹo: Bạn có thể nói '...' sẽ tự nhiên hơn!"). Otherwise null.
4. "suggestions": 2 quick possible responses the user could say next in Chinese with Vietnamese translation. DO NOT generate pinyin (system computes pinyin automatically).

RETURN STRICT JSON ONLY:
{
  "reply": "...",
  "translation": "...",
  "tip": null,
  "suggestions": [
    { "zh": "...", "vi": "..." },
    { "zh": "...", "vi": "..." }
  ]
}`;

          const chatMessages: ChatMessage[] = [
            { role: "system", content: systemPrompt },
            ...messages.slice(-6).map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
          ];

          const rawJson = await AIClient.chatCompletion({
            messages: chatMessages,
            model: targetModel,
            temperature: 0.7,
            max_tokens: 350,
            requireJson: true,
            timeoutMs: 12000,
          });

          const parsed = AIClient.extractJson(rawJson);
          if (parsed && parsed.reply) {
            const replyText = parsed.reply.trim();
            const replyPinyin = pinyin(replyText, { toneType: "symbol" });
            const suggestions = Array.isArray(parsed.suggestions)
              ? parsed.suggestions.slice(0, 3).map((s: any) => ({
                  zh: s.zh || "",
                  pinyin: pinyin(s.zh || "", { toneType: "symbol" }),
                  vi: s.vi || "",
                }))
              : [];

            return {
              reply: replyText,
              pinyin: replyPinyin,
              translation: parsed.translation || "",
              tip: parsed.tip || undefined,
              suggestions,
            };
          }
        }
      }
    } catch (err) {
      console.warn("Cloud FreeTalk LLM call note, falling back to adaptive engine:", err);
    }

    // 2. High-fidelity built-in conversational fallback
    return this.generateAdaptiveReply(lastUserMessage, persona);
  }

  /**
   * Built-in fallback conversational engine when cloud LLM is offline.
   */
  private static generateAdaptiveReply(
    userText: string,
    persona: FreeTalkPersona
  ): {
    reply: string;
    pinyin: string;
    translation: string;
    tip?: string;
    suggestions: { zh: string; pinyin: string; vi: string }[];
  } {
    const text = userText.toLowerCase();

    // Food / Eating
    if (text.includes("吃") || text.includes("饭") || text.includes("菜") || text.includes("火锅") || text.includes("面")) {
      return {
        reply: "听起来真不错！我也很喜欢中国美食。你平时喜欢吃辣的还是清淡的呢？",
        pinyin: "Tīng qǐlái zhēn búcuò! Wǒ yě hěn xǐhuan Zhōngguó měishí. Nǐ píngshí xǐhuan chī là de háishì qīngdàn de ne?",
        translation: "Nghe tuyệt quá! Mình cũng rất thích ẩm thực Trung Quốc. Bình thường bạn thích ăn cay hay đồ thanh đạm thế?",
        tip: "💡 Từ vựng hữu ích: 辣 (là - cay), 清淡 (qīngdàn - thanh đạm), 美食 (měishí - đồ ăn ngon).",
        suggestions: [
          { zh: "我很喜欢吃辣，特别是川菜。", pinyin: "Wǒ hěn xǐhuan chī là, tèbié shì chuāncài.", vi: "Mình rất thích ăn cay, đặc biệt là món Tứ Xuyên." },
          { zh: "我比较喜欢清淡的食物，比如广式点心。", pinyin: "Wǒ bǐjiào xǐhuan qīngdàn de shíwù, bǐrú guǎngshì diǎnxin.", vi: "Mình thích đồ ăn thanh đạm hơn, như điểm sấm Quảng Đông." },
          { zh: "越南的米粉和春卷也特别好吃！", pinyin: "Yuènán de mǐfěn hé chūnjuǎn yě tèbié hǎochī!", vi: "Phở và nem cuốn của Việt Nam cũng ngon lắm đấy!" },
        ],
      };
    }

    // Work / Study / Tired
    if (text.includes("工作") || text.includes("学习") || text.includes("累") || text.includes("忙") || text.includes("上课")) {
      return {
        reply: "辛苦啦！工作和学习确实不容易，要记得好好休息。你平时忙完之后，最喜欢做什么来放松自己？",
        pinyin: "Xīnkǔ la! Gōngzuò hé xuéxí quèshí bù róngyì, yào jìde hǎohāo xiūxi. Nǐ píngshí máng wán zhīhòu, zuì xǐhuan zuò shénme lái fàngsōng zìjǐ?",
        translation: "Vất vả cho bạn rồi! Đi làm và đi học quả thật không dễ dàng, nhớ nghỉ ngơi thật tốt nhé. Bình thường bận rộn xong, bạn thích làm gì để thư giãn?",
        tip: "💡 Cách dùng từ: '辛苦啦' (Xīnkǔ la) là câu cửa miệng rất ấm áp người bản xứ hay dùng để an ủi, động viên nhau.",
        suggestions: [
          { zh: "我喜欢听听音乐，或者看一部电影。", pinyin: "Wǒ xǐhuan tīngting yīnyuè, huòzhě kàn yí bù diànyǐng.", vi: "Mình thích nghe chút nhạc, hoặc xem một bộ phim." },
          { zh: "我一般会睡个好觉，或者跟朋友出去散散步。", pinyin: "Wǒ yìbān huì shuì ge hǎo jiào, huòzhě gēn péngyou chūqù sànsan bù.", vi: "Mình thường ngủ một giấc thật ngon, hoặc đi dạo cùng bạn bè." },
          { zh: "周末我打算去喝咖啡放松一下。", pinyin: "Zhōumò wǒ dǎsuàn qù hē kāfēi fàngsōng yíxià.", vi: "Cuối tuần mình dự định đi uống cà phê thư giãn một chút." },
        ],
      };
    }

    // Weather / Hobbies / Weekend
    if (text.includes("天气") || text.includes("热") || text.includes("冷") || text.includes("周末") || text.includes("玩")) {
      return {
        reply: "原来是这样！天气好的时候出门心情也会特别好。这个周末你有什么特别的计划吗？",
        pinyin: "Yuánlái shì zhèyàng! Tiānqì hǎo de shíhou chūmén xīnqíng yě huì tèbié hǎo. Zhège zhōumò nǐ yǒu shénme tèbié de jìhuà ma?",
        translation: "Hóa ra là vậy! Những khi thời tiết đẹp ra ngoài tâm trạng cũng thấy sảng khoái hẳn. Cuối tuần này bạn có kế hoạch đặc biệt gì không?",
        tip: "💡 Diễn đạt tự nhiên: '原来是这样' nghĩa là 'À hóa ra là vậy', dùng để tiếp lời rất tự nhiên.",
        suggestions: [
          { zh: "我打算在家里看看书，学学中文。", pinyin: "Wǒ dǎsuàn zài jiālǐ kànkan shū, xuéxue zhōngwén.", vi: "Mình dự định ở nhà đọc sách và học thêm tiếng Trung." },
          { zh: "我想跟朋友去商场逛逛，吃点好吃的。", pinyin: "Wǒ xiǎng gēn péngyou qù shāngchǎng guàngguang, chī diǎn hǎochī de.", vi: "Mình muốn đi trung tâm thương mại dạo chơi với bạn và ăn đồ ngon." },
          { zh: "如果天气好，我想去公园拍照散步。", pinyin: "Rúguǒ tiānqì hǎo, wǒ xiǎng qù gōngyuán pāizhào sànbù.", vi: "Nếu trời đẹp, mình muốn ra công viên chụp ảnh dạo mát." },
        ],
      };
    }

    // Default engaging conversation turn
    return {
      reply: "说得真好！和你聊天很开心。关于这个，你还有什么想跟我分享的吗？",
      pinyin: "Shuō de zhēn hǎo! Hé nǐ liáotiān hěn kāixīn. Guānyú zhège, nǐ hái yǒu shénme xiǎng gēn wǒ fēnxiǎng de ma?",
      translation: "Bạn nói hay lắm! Trò chuyện cùng bạn vui thật đấy. Về điều này, bạn còn muốn chia sẻ thêm gì với mình không?",
      tip: "💡 Bạn đang phản xạ rất tốt! Đừng ngại nói dài hơn hoặc kể thêm chi tiết nhé.",
      suggestions: [
        { zh: "我还想跟你聊聊我的中文学习经历。", pinyin: "Wǒ hái xiǎng gēn nǐ liáoliao wǒ de zhōngwén xuéxí jīnglì.", vi: "Mình muốn kể thêm cho bạn nghe về hành trình học tiếng Trung của mình." },
        { zh: "我想知道中国人平时都有什么有趣的流行语？", pinyin: "Wǒ xiǎng zhīdào zhōngguó rén píngshí dōu yǒu shénme yǒuqù de liúxíng yǔ?", vi: "Mình muốn biết người Trung dạo này hay dùng tiếng lóng thú vị nào?" },
        { zh: "今天先聊到这里吧，非常感谢你！", pinyin: "Jīntiān xiān liáo dào zhèlǐ ba, fēicháng gǎnxiè nǐ!", vi: "Hôm nay mình dừng ở đây nhé, cảm ơn bạn nhiều lắm!" },
      ],
    };
  }

  /**
   * Evaluates the entire Free Talk session when user concludes the conversation.
   */
  static async evaluateSession({
    messages,
    level = "Tự do",
    personaId = "friendly_peer",
  }: {
    messages: { role: "user" | "assistant"; content: string }[];
    level?: string;
    personaId?: string;
  }): Promise<FreeTalkEvaluation> {
    const persona = FREE_TALK_PERSONAS[personaId] || FREE_TALK_PERSONAS.friendly_peer;
    const userMessages = messages.filter((m) => m.role === "user").map((m) => m.content);

    if (userMessages.length === 0) {
      return {
        overallScore: 0,
        hskEstimate: level.includes("HSK") ? level.slice(0, 5) : "HSK 1",
        fluencyScore: 0,
        grammarScore: 0,
        vocabularyScore: 0,
        summary: "Bạn chưa gửi câu phản xạ nào trong buổi trò chuyện này. Hãy thử nói hoặc gõ một vài câu tiếng Trung nhé!",
        strengths: ["Đã bước vào phòng luyện tập"],
        improvements: ["Tự tin nói ít nhất 3-5 câu để AI có thể đánh giá toàn diện."],
        corrections: [],
      };
    }

    // 1. Try Cloud LLM Evaluation
    try {
      if (!process.env.VITEST) {
        const config = await AIClient.getActiveConfig();
        if (config.apiKey && config.isEnabled) {
          const targetModel =
            config.modelId.includes("sonnet") || config.modelId.includes("opus")
              ? "gemini-3.6-flash"
              : config.modelId || "gemini-3.6-flash";

          const evalPrompt = `You are a certified Chinese Oral Proficiency Examiner (考官) applying official HSK / HSKK scoring rubrics.
CRITICAL MANDATE: CALIBRATE STRICTLY WITHOUT INFLATION! In genuine oral exams, candidates who only speak 1 or 2 brief formulaic sentences (e.g. "你好", "好的") CANNOT pass and must receive low scores (below 35/100). Do NOT give unearned flattering scores or praise.

Dialogue Context:
- Target / Stated Level: ${level}
- Partner Persona: ${persona.name} (${persona.role})
- Total turns spoken by learner: ${userMessages.length}
- Learner's Spoken Utterances:
${userMessages.map((text, idx) => `[Turn ${idx + 1}]: "${text}"`).join("\n")}

STRICT HSKK ORAL BENCHMARKS (0-100 scale):
- 0 - 25 (Severely Insufficient / Incomplete): Only 1 turn, simple greeting (e.g. "你好", "吃了"), or < 8 Chinese characters total. Fails to demonstrate conversational sustainability. Max Level: HSK 1.
- 26 - 45 (Rudimentary / Minimal): 1-2 brief turns, < 20 characters total. Short isolated answers without narrative or conjunctions. Max Level: HSK 1.
- 46 - 59 (Beginner / Below Passing Standard): 2-3 turns, simple S+V+O phrases, no compound connectives, noticeable grammatical hesitations. Level: HSK 1 or HSK 2.
- 60 - 74 (Competent Daily Speaker / Passing Standard): 4+ sustained turns with at least 35+ total Chinese characters. Clearly answers questions, uses basic connectives (因为, 所以, 但是, 虽然), comprehensible structures. Level: HSK 2 - HSK 3.
- 75 - 88 (Fluent Conversationalist): 6+ well-developed turns, rich vocabulary diversity, natural particles (吧, 呢, 了), logical conjunctions, smooth discourse. Level: HSK 3 - HSK 4.
- 89 - 100 (Advanced / Near-Native): 8+ turns of sustained, in-depth discussion, idiom (成语) or colloquial expressions, nuanced argumentation. Level: HSK 5 - HSK 6.

EVALUATE AND RETURN STRICT JSON ONLY:
{
  "overallScore": number (integer between 0 and 100, adhering strictly to the benchmarks above),
  "hskEstimate": "HSK 1" | "HSK 2" | "HSK 3" | "HSK 4" | "HSK 5" | "HSK 6",
  "fluencyScore": number (integer between 0 and 100),
  "grammarScore": number (integer between 0 and 100),
  "vocabularyScore": number (integer between 0 and 100),
  "summary": "Objective, honest, and constructive evaluation in Vietnamese (2-3 sentences). If dialogue is too brief, state clearly that speech volume was insufficient to verify proficiency.",
  "strengths": ["Objective strength 1 in Vietnamese (grounded in actual evidence)", "Objective strength 2 in Vietnamese"],
  "improvements": ["Direct, actionable improvement 1 in Vietnamese", "Direct, actionable improvement 2 in Vietnamese"],
  "corrections": [
    {
      "original": "The learner's original Chinese phrase",
      "correction": "More native, idiomatic Chinese way to say or expand it (with Pinyin)",
      "explanation": "Clear grammatical or pragmatic explanation in Vietnamese"
    }
  ]
}`;

          const raw = await AIClient.chatCompletion({
            messages: [
              {
                role: "system",
                content:
                  "You evaluate Chinese oral proficiency strictly in JSON format. Always write summary, strengths, improvements, and explanations in Vietnamese. Do not inflate scores for minimal dialogue.",
              },
              { role: "user", content: evalPrompt },
            ],
            model: targetModel,
            temperature: 0.2,
            max_tokens: 700,
            requireJson: true,
            timeoutMs: 15000,
          });

          const parsed = AIClient.extractJson(raw);
          if (parsed && typeof parsed.overallScore === "number") {
            const allText = userMessages.join(" ");
            const hanziCount = allText.replace(/[^\u4e00-\u9fa5]/g, "").length;
            const turnCount = userMessages.length;

            let overallScore = Math.min(100, Math.max(0, Math.round(parsed.overallScore)));
            let fluencyScore = Math.min(100, Math.max(0, Math.round(parsed.fluencyScore || overallScore)));
            let grammarScore = Math.min(100, Math.max(0, Math.round(parsed.grammarScore || overallScore)));
            let vocabularyScore = Math.min(100, Math.max(0, Math.round(parsed.vocabularyScore || overallScore)));
            let hskEstimate = parsed.hskEstimate || "HSK 1";

            // Guardrail caps against LLM hallucinations/over-scoring on minimal volume
            if (turnCount === 1) {
              const cap = hanziCount <= 5 ? 25 : hanziCount <= 12 ? 35 : 42;
              overallScore = Math.min(overallScore, cap);
              fluencyScore = Math.min(fluencyScore, cap + 3);
              grammarScore = Math.min(grammarScore, cap + 5);
              vocabularyScore = Math.min(vocabularyScore, cap);
              hskEstimate = "HSK 1";
            } else if (turnCount === 2) {
              const cap = hanziCount <= 12 ? 40 : 52;
              overallScore = Math.min(overallScore, cap);
              fluencyScore = Math.min(fluencyScore, cap + 4);
              grammarScore = Math.min(grammarScore, cap + 5);
              vocabularyScore = Math.min(vocabularyScore, cap + 2);
              hskEstimate = "HSK 1";
            } else if (turnCount === 3 && hanziCount <= 20) {
              overallScore = Math.min(overallScore, 55);
              hskEstimate = "HSK 1";
            }

            return {
              overallScore,
              hskEstimate,
              fluencyScore,
              grammarScore,
              vocabularyScore,
              summary: parsed.summary || "Buổi trò chuyện tự do đã được ghi nhận và phân tích.",
              strengths:
                Array.isArray(parsed.strengths) && parsed.strengths.length > 0
                  ? parsed.strengths
                  : ["Đã chủ động giao tiếp tiếng Trung"],
              improvements:
                Array.isArray(parsed.improvements) && parsed.improvements.length > 0
                  ? parsed.improvements
                  : ["Luyện tập mở rộng câu ghép và phản xạ liên tục"],
              corrections: Array.isArray(parsed.corrections) ? parsed.corrections : [],
              extensionQuestions: this.generatePersonaExtensionQuestions(persona.id),
            };
          }
        }
      }
    } catch (e) {
      console.warn("Cloud FreeTalk evaluation note, using calibrated heuristic evaluator:", e);
    }

    // 2. Calibrated Heuristic Evaluator
    return this.generateHeuristicEvaluation(userMessages, level, persona);
  }

  /**
   * Generates 5 curated follow-up challenge questions customized to the active persona.
   */
  public static generatePersonaExtensionQuestions(
    personaId: string = "friendly_peer"
  ): FreeTalkExtensionQuestion[] {
    const questionsByPersona: Record<string, { zh: string; vi: string; tip?: string }[]> = {
      friendly_peer: [
        {
          zh: "你平时周末一般喜欢睡懒觉还是早起出门散步？",
          vi: "Cuối tuần bạn thường thích ngủ nướng hay dậy sớm ra ngoài dạo mát?",
          tip: "Luyện thói quen sinh hoạt và sở thích cá nhân",
        },
        {
          zh: "最近有没有看到什么特别好看的电影或者电视剧？",
          vi: "Dạo gần đây bạn có xem bộ phim hay chương trình truyền hình nào hay không?",
          tip: "Luyện miêu tả nội dung và chia sẻ cảm nghĩ",
        },
        {
          zh: "如果现在给你一张免费机票，你最想立刻飞去哪座城市旅行？",
          vi: "Nếu giờ tặng bạn một vé máy bay miễn phí, bạn muốn bay ngay tới thành phố nào?",
          tip: "Mẫu câu giả định: 如果...最想...",
        },
        {
          zh: "你觉得学中文最难的部分是汉字、发音还是听力？",
          vi: "Bạn thấy phần khó nhất khi học tiếng Trung là chữ Hán, phát âm hay nghe hiểu?",
          tip: "Luyện so sánh lựa chọn: ...是...还是...",
        },
        {
          zh: "今天和你聊天真开心，下次我们一起聊聊各自的梦想好吗？",
          vi: "Hôm nay tán gẫu với bạn vui thật đấy, lần sau chúng mình cùng nói về ước mơ nhé?",
          tip: "Mẫu câu rủ rê thân mật: 下次我们一起...好吗？",
        },
      ],
      gentle_tutor: [
        {
          zh: "请用中文跟我分享一下，你每天通常花多少时间练习听力和口语？",
          vi: "Hãy chia sẻ bằng tiếng Trung, mỗi ngày em thường dành bao nhiêu thời gian luyện nghe nói?",
          tip: "Luyện diễn đạt thời lượng: 花...时间做...",
        },
        {
          zh: "在日常生活中，你觉得最实用的中文句型是哪一句？",
          vi: "Trong đời sống thường ngày, em thấy mẫu câu tiếng Trung nào là thực dụng nhất?",
          tip: "Luyện giải thích lý do thực tế",
        },
        {
          zh: "在学习中文的过程中，遇到记不住的生词时，你有什么好方法吗？",
          vi: "Trong quá trình học tiếng Trung, khi gặp từ mới khó nhớ, em có phương pháp hay nào?",
          tip: "Luyện mẫu câu kinh nghiệm: 遇到...时，有...方法",
        },
        {
          zh: "如果让你用三个词形容你眼中的中国文化，你会选择哪三个词？",
          vi: "Nếu dùng 3 từ để miêu tả văn hóa Trung Hoa trong mắt em, em sẽ chọn 3 từ nào?",
          tip: "Luyện vốn từ vựng miêu tả văn hóa",
        },
        {
          zh: "你的口语进步很大！接下来你的短期学习目标是什么？",
          vi: "Khẩu ngữ của em tiến bộ rất nhiều! Mục tiêu học tập ngắn hạn tiếp theo của em là gì?",
          tip: "Luyện lập kế hoạch tương lai: 学习目标是...",
        },
      ],
      travel_companion: [
        {
          zh: "中国有八大菜系，你尝过川菜、粤菜还是鲁菜？你更偏爱哪一种？",
          vi: "Trung Quốc có 8 trường phái ẩm thực lớn, bạn đã thử đồ Tứ Xuyên, Quảng Đông hay Sơn Đông chưa?",
          tip: "Luyện khẩu vị ẩm thực và so sánh sở thích",
        },
        {
          zh: "去外地旅游时，你更喜欢逛繁华的步行街，还是寻访历史古迹？",
          vi: "Khi đi du lịch xa, bạn thích dạo phố đi bộ sầm uất hay tìm về các di tích lịch sử?",
          tip: "Luyện cấu trúc: 更喜欢...还是...",
        },
        {
          zh: "在你的家乡，最值得向外国游客推荐的一个隐秘宝藏景点是哪里？",
          vi: "Ở quê hương bạn, một địa điểm 'viên ngọc ẩn' đáng giới thiệu cho du khách nước ngoài nhất là ở đâu?",
          tip: "Luyện giới thiệu địa danh quê hương",
        },
        {
          zh: "你出门旅游时最不能缺少的三件随身物品是什么？为什么？",
          vi: "Khi đi du lịch, 3 món đồ tùy thân bạn không thể thiếu là gì? Vì sao?",
          tip: "Luyện cấu trúc: 最不能缺少的...是...",
        },
        {
          zh: "如果我们要一起制定一份为期三天的中国自由行攻略，你想先去哪里？",
          vi: "Nếu chúng mình cùng lên lịch trình du lịch tự túc 3 ngày ở Trung Quốc, bạn muốn đi đâu trước?",
          tip: "Luyện lập kế hoạch hành trình du lịch",
        },
      ],
    };

    const list = questionsByPersona[personaId] || questionsByPersona.friendly_peer;
    return list.map((item) => ({
      zh: item.zh,
      pinyin: pinyin(item.zh, { toneType: "symbol", type: "string" }),
      vi: item.vi,
      tip: item.tip,
    }));
  }

  /**
   * Fallback heuristic evaluator calibrated strictly to HSK / HSKK oral standards.
   */
  public static generateHeuristicEvaluation(
    userMessages: string[],
    level: string,
    persona: FreeTalkPersona
  ): FreeTalkEvaluation {
    const turnCount = userMessages.length;
    const allText = userMessages.join(" ");
    const hanziOnly = allText.replace(/[^\u4e00-\u9fa5]/g, "");
    const hanziCount = hanziOnly.length;
    const uniqueHanzi = new Set(hanziOnly.split("")).size;
    const avgHanziPerTurn = hanziCount / (turnCount || 1);

    // Linguistic features
    const hasConnectives = /因为|所以|但是|虽然|而且|如果|比如|不仅|或者|除了|不过/.test(allText);
    const hasModalParticles = /吗|呢|吧|啊|呀|啦/.test(allText);
    const hasAspectParticles = /了|过|着/.test(allText);

    let fluency = 0;
    let grammar = 0;
    let vocab = 0;
    let hskEstimate = "HSK 1";
    let summary = "";
    const strengths: string[] = [];
    const improvements: string[] = [];

    if (turnCount === 1) {
      if (hanziCount <= 5) {
        // e.g. "你好", "好的", "谢谢"
        fluency = 20;
        grammar = 25;
        vocab = 18;
        hskEstimate = "HSK 1";
        summary = `Buổi trò chuyện chỉ mới dừng lại ở 1 phản xạ rất ngắn ("${userMessages[0]}", ${hanziCount} chữ Hán). Khối lượng lời thoại quá ít để đánh giá khả năng duy trì hội thoại. Cần tương tác tối thiểu 4-6 lượt để có kết quả chính xác.`;
        strengths.push("Bước đầu chủ động mở lời bằng tiếng Trung.");
        improvements.push(
          "Cần duy trì hội thoại ít nhất 4-6 lượt nói thay vì chỉ chào hỏi 1 câu.",
          "Thử trả lời mở rộng câu hỏi của bạn trò chuyện (kể thêm về sở thích, hoạt động trong ngày)."
        );
      } else if (hanziCount <= 15) {
        // 1 simple sentence
        fluency = 32;
        grammar = 36;
        vocab = 30;
        hskEstimate = "HSK 1";
        summary = `Bạn đã tạo được 1 câu đơn có nghĩa (${hanziCount} chữ Hán), tuy nhiên chỉ với 1 lượt nói thì hệ thống chưa đủ căn cứ để chứng minh năng lực phản xạ liên tục.`;
        strengths.push("Cấu trúc câu đơn rõ ràng, diễn đạt được ý cơ bản.");
        improvements.push(
          "Tiếp tục đối đáp thêm các lượt sau khi bạn trò chuyện hỏi lại.",
          "Tập dùng thêm trợ từ ngữ khí (呢, 吧) để câu tự nhiên hơn."
        );
      } else {
        // 1 long sentence (> 15 chars)
        fluency = 40;
        grammar = 45;
        vocab = 40;
        hskEstimate = "HSK 1";
        summary = `Bạn có khả năng cấu tạo câu dài khá tốt (${hanziCount} chữ Hán), nhưng một cuộc trò chuyện cần nhiều lượt tương tác hai chiều để kiểm tra độ trôi chảy thực tế.`;
        strengths.push("Vốn từ vựng tương đối phong phú trong 1 câu.");
        improvements.push("Tăng số lượt tương tác qua lại để luyện phản xạ nghe - đáp tức thì.");
      }
    } else if (turnCount === 2) {
      if (hanziCount <= 12) {
        fluency = 35;
        grammar = 38;
        vocab = 32;
        hskEstimate = "HSK 1";
        summary = `Bạn đã có 2 lượt đối đáp rất ngắn (${hanziCount} chữ Hán). Lời thoại còn mang tính phản xạ rời rạc, chưa kết nối thành mạch câu chuyện hoàn chỉnh.`;
        strengths.push("Đã bắt đầu có sự tương tác 2 chiều với bạn trò chuyện.");
        improvements.push(
          "Thử mở rộng câu bằng các liên từ nối (vì vậy, nhưng mà...).",
          "Kể thêm chi tiết cụ thể để lời thoại có chiều sâu hơn."
        );
      } else {
        fluency = 46 + (hasConnectives ? 6 : 0);
        grammar = 48 + (hasConnectives ? 6 : 0);
        vocab = 44 + (hasConnectives ? 4 : 0);
        hskEstimate = hasConnectives && hanziCount >= 30 ? "HSK 2" : "HSK 1";
        summary = `Bạn đã trao đổi 2 lượt với nội dung rõ ý (${hanziCount} chữ Hán). Để đạt mức chuẩn HSK 2 trở lên, bạn cần duy trì tương tác liên tục từ 4 lượt trở lên.`;
        strengths.push("Phản xạ đúng trọng tâm câu hỏi của bạn trò chuyện.");
        if (hasConnectives) strengths.push("Biết cách sử dụng liên từ nối câu ghép.");
        improvements.push("Nói thêm từ 3-4 lượt nữa để kiểm tra sức bền phản xạ khẩu ngữ.");
      }
    } else if (turnCount === 3) {
      if (hanziCount <= 22) {
        fluency = 48;
        grammar = 50;
        vocab = 46;
        hskEstimate = "HSK 1";
        summary = `Hoàn thành 3 lượt đối đáp ngắn (${hanziCount} chữ Hán). Bạn bắt nhịp được câu chuyện nhưng câu còn đơn giản, chưa sử dụng nhiều cấu trúc ngữ pháp nâng cao.`;
      } else {
        fluency = 56 + (hasConnectives ? 5 : 0);
        grammar = 58 + (hasConnectives ? 5 : 0);
        vocab = 55 + (hasConnectives ? 4 : 0);
        hskEstimate = "HSK 2";
        summary = `Bạn duy trì được mạch trò chuyện 3 lượt với dung lượng chữ Hán tốt (${hanziCount} chữ). Bắt đầu thể hiện khả năng giao tiếp thường nhật ở trình độ Sơ cấp 2 (HSK 2).`;
      }
      strengths.push("Duy trì được 3 lượt phản xạ liền mạch cùng bạn trò chuyện.");
      if (hasConnectives) strengths.push("Biết cách sử dụng liên từ nối cơ bản.");
      improvements.push("Thử thách nói những câu ghép dài hơn và phong phú từ vựng.");
    } else if (turnCount >= 4 && turnCount <= 6) {
      // Competent daily dialogue (passing standard)
      fluency = Math.min(80, 56 + turnCount * 3 + Math.round(avgHanziPerTurn * 0.8));
      grammar = Math.min(80, 58 + Math.min(12, turnCount * 2));
      vocab = Math.min(80, 54 + Math.round(uniqueHanzi * 0.5));

      if (hasConnectives) {
        grammar = Math.min(84, grammar + 5);
        vocab = Math.min(84, vocab + 4);
      }
      if (hasModalParticles || hasAspectParticles) {
        fluency = Math.min(85, fluency + 4);
      }

      hskEstimate = hanziCount >= 50 && hasConnectives ? "HSK 3" : "HSK 2";
      summary = `Cuộc trò chuyện diễn ra trôi chảy với ${turnCount} lượt đối đáp (${hanziCount} chữ Hán). Bạn thể hiện phản xạ tự nhiên, nội dung mạch lạc và bám sát chủ đề với ${persona.name}.`;
      strengths.push(`Duy trì tương tác tốt qua ${turnCount} lượt đối đáp liên tục.`);
      if (hasConnectives) {
        strengths.push("Chủ động sử dụng liên từ ghép câu để diễn đạt nguyên nhân và kết quả.");
      } else {
        strengths.push("Phản xạ đều đặn và thể hiện thái độ giao tiếp tích cực.");
      }
      improvements.push(
        "Mở rộng thêm vốn thành ngữ hoặc quán dụng ngữ thường ngày.",
        "Luyện tập ngắt nghỉ tự nhiên giữa các vế câu dài."
      );
    } else {
      // 7+ turns: well-sustained advanced dialogue
      fluency = Math.min(94, 66 + turnCount * 2 + Math.round(avgHanziPerTurn * 0.6));
      grammar = Math.min(92, 68 + Math.min(14, turnCount * 1.5));
      vocab = Math.min(92, 64 + Math.round(uniqueHanzi * 0.45));

      if (hasConnectives) {
        grammar = Math.min(95, grammar + 6);
        vocab = Math.min(95, vocab + 5);
      }
      if (hasModalParticles && hasAspectParticles) {
        fluency = Math.min(96, fluency + 5);
      }

      if (hanziCount >= 120 && hasConnectives && uniqueHanzi >= 45) {
        hskEstimate = "HSK 4";
      } else if (hanziCount >= 70 && hasConnectives) {
        hskEstimate = "HSK 3";
      } else {
        hskEstimate = "HSK 2";
      }

      summary = `Phiên luyện tập khẩu ngữ rất sâu sắc và ấn tượng! Bạn đã duy trì ${turnCount} lượt đối đáp (${hanziCount} chữ Hán), thể hiện vốn từ vững vàng và khả năng ứng biến ngôn ngữ linh hoạt.`;
      strengths.push(`Sức bền hội thoại tuyệt vời với ${turnCount} lượt giao tiếp hai chiều.`);
      strengths.push("Diễn đạt tự nhiên, giàu hình ảnh và giữ vững ngữ điệu chuẩn xác.");
      improvements.push(
        "Thử thách bản thân ở các chủ đề phản biện chuyên sâu hơn (kinh tế, công nghệ, xã hội).",
        "Chú ý trau chuốt thêm các cặp liên từ nâng cao (不仅...而且..., 与其...不如...)."
      );
    }

    const overallScore = Math.round(fluency * 0.35 + grammar * 0.35 + vocab * 0.3);

    // Build corrections from real utterances
    const corrections: FreeTalkCorrection[] = [];
    for (const msg of userMessages) {
      const clean = msg.trim();
      // Case 1: Simple greeting expansion (instead of appending "觉得挺有意思的")
      if (/^(你好|嗨|哈喽|您好)[!！,.，。 ]*$/.test(clean)) {
        corrections.push({
          original: clean,
          correction: "你好！很高兴能和你聊天。(Nǐ hǎo! Hěn gāoxìng néng hé nǐ liáotiān.)",
          explanation: "Trong giao tiếp khẩu ngữ, sau lời chào nên kèm câu mở đầu tự nhiên để khơi gợi mạch trò chuyện.",
        });
      }
      // Case 2: Missing 的 in adjective + noun
      else if (clean.includes("好吃菜") || clean.includes("好菜")) {
        corrections.push({
          original: clean,
          correction: clean.replace(/好吃菜|好菜/g, "好吃的菜 (hǎochī de cài)"),
          explanation: "Nên thêm trợ từ '的' sau tính từ đa âm tiết như '好吃' khi bổ nghĩa cho danh từ.",
        });
      }
      // Case 3: Double verb or phrasing
      else if (clean.includes("我很喜欢去") && !clean.includes("走") && !clean.includes("玩")) {
        corrections.push({
          original: clean,
          correction: clean + " 走走看看 (zǒuzou kànkan)",
          explanation: "Thêm thành ngữ đi dạo/tham quan '走走看看' giúp diễn đạt giàu hình ảnh và chuẩn bản xứ hơn.",
        });
      }
    }

    // Contextual refinement if no rule matched
    if (corrections.length === 0 && userMessages.length > 0) {
      const longest = [...userMessages].sort((a, b) => b.length - a.length)[0];
      if (longest.length >= 10 && !/吧|呢|啊|呀/.test(longest)) {
        corrections.push({
          original: longest,
          correction: longest + "，觉得挺有意思的。(juéde tǐng yǒuyìsi de.)",
          explanation: "Thêm cụm cảm thán '觉得挺有意思的' (cảm thấy khá là thú vị) ở cuối câu sẽ giúp giọng điệu thân thiện và mềm mại hơn.",
        });
      } else if (longest.length < 10 && !/你好|谢谢|再见/.test(longest)) {
        corrections.push({
          original: longest,
          correction: `我平时也${longest}，你呢？(Wǒ píngshí yě..., nǐ ne?)`,
          explanation: "Thêm câu hỏi ngược lại '你呢？' (còn bạn thì sao?) giúp tạo đà đối thoại tương tác hai chiều.",
        });
      }
    }

    return {
      overallScore,
      hskEstimate,
      fluencyScore: fluency,
      grammarScore: grammar,
      vocabularyScore: vocab,
      summary,
      strengths,
      improvements,
      corrections,
      extensionQuestions: FreeTalkService.generatePersonaExtensionQuestions(persona.id),
    };
  }
}
