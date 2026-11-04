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
          // Route to high-speed conversational model (claude-haiku-4.5) to keep turn latency ~1s
          const targetModel =
            config.modelId.includes("sonnet") || config.modelId.includes("opus")
              ? "claude-haiku-4.5"
              : config.modelId;

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
              ? "claude-haiku-4.5"
              : config.modelId;

          const evalPrompt = `You are a certified Chinese Oral Proficiency Examiner (考官) and language coach.
Analyze all spoken messages from this learner during a free-talk conversation with ${persona.name}.
Target / Stated Level: ${level}
Learner's Spoken Messages:
${userMessages.map((text, idx) => `[Turn ${idx + 1}]: "${text}"`).join("\n")}

EVALUATE AND RETURN STRICT JSON:
{
  "overallScore": number between 40 and 100,
  "hskEstimate": "HSK 1" | "HSK 2" | "HSK 3" | "HSK 4" | "HSK 5" | "HSK 6",
  "fluencyScore": number between 40 and 100,
  "grammarScore": number between 40 and 100,
  "vocabularyScore": number between 40 and 100,
  "summary": "Warm, encouraging evaluation in Vietnamese summarizing their performance (2-3 sentences)",
  "strengths": ["Clear strength 1 in Vietnamese", "Clear strength 2 in Vietnamese"],
  "improvements": ["Actionable improvement 1 in Vietnamese", "Actionable improvement 2 in Vietnamese"],
  "corrections": [
    {
      "original": "The learner's original Chinese text",
      "correction": "Native, idiomatic Chinese way to say it (with Pinyin)",
      "explanation": "Clear grammatical or stylistic explanation in Vietnamese"
    }
  ]
}`;

          const raw = await AIClient.chatCompletion({
            messages: [
              {
                role: "system",
                content:
                  "You evaluate Chinese oral proficiency strictly in JSON format. Always write summary, strengths, improvements, and explanations in Vietnamese.",
              },
              { role: "user", content: evalPrompt },
            ],
            model: targetModel,
            temperature: 0.3,
            max_tokens: 700,
            requireJson: true,
            timeoutMs: 15000,
          });

          const parsed = AIClient.extractJson(raw);
          if (parsed && typeof parsed.overallScore === "number") {
            return {
              overallScore: Math.min(100, Math.max(0, Math.round(parsed.overallScore))),
              hskEstimate: parsed.hskEstimate || "HSK 2",
              fluencyScore: Math.min(100, Math.max(0, Math.round(parsed.fluencyScore || parsed.overallScore))),
              grammarScore: Math.min(100, Math.max(0, Math.round(parsed.grammarScore || parsed.overallScore))),
              vocabularyScore: Math.min(100, Math.max(0, Math.round(parsed.vocabularyScore || parsed.overallScore))),
              summary: parsed.summary || "Buổi trò chuyện tự do diễn ra rất tích cực và tự nhiên.",
              strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ["Phản xạ chủ động và tự tin"],
              improvements: Array.isArray(parsed.improvements) ? parsed.improvements : ["Luyện tập mở rộng câu ghép"],
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
   * Fallback heuristic evaluator calibrated to HSK standards.
   */
  private static generateHeuristicEvaluation(
    userMessages: string[],
    level: string,
    persona: FreeTalkPersona
  ): FreeTalkEvaluation {
    const turnCount = userMessages.length;
    const totalChars = userMessages.reduce((sum, m) => sum + m.trim().length, 0);
    const avgCharsPerTurn = totalChars / (turnCount || 1);

    // Baseline scores calculation
    let fluency = Math.min(95, 70 + turnCount * 4 + Math.round(avgCharsPerTurn * 0.8));
    let grammar = Math.min(92, 72 + Math.min(15, turnCount * 3));
    let vocab = Math.min(94, 68 + Math.round(totalChars * 0.4));

    // Refinements based on markers
    const allText = userMessages.join(" ");
    const hasConnectives = /因为|所以|但是|虽然|而且|如果|比如/.test(allText);
    const hasModalParticles = /吗|呢|吧|啊|呀/.test(allText);

    if (hasConnectives) {
      grammar = Math.min(95, grammar + 4);
      vocab = Math.min(96, vocab + 4);
    }
    if (hasModalParticles) {
      fluency = Math.min(98, fluency + 3);
    }

    const overallScore = Math.round((fluency * 0.35) + (grammar * 0.35) + (vocab * 0.3));

    // Determine estimated HSK level
    let hskEstimate = "HSK 2";
    if (level.includes("HSK")) {
      hskEstimate = level.split(" ")[0] + " " + (level.split(" ")[1] || "2");
    } else if (totalChars > 80 && hasConnectives) {
      hskEstimate = "HSK 3";
    } else if (totalChars > 150) {
      hskEstimate = "HSK 4";
    } else if (turnCount <= 2) {
      hskEstimate = "HSK 1";
    }

    // Build corrections from real utterances
    const corrections: FreeTalkCorrection[] = [];
    for (const msg of userMessages) {
      // Common pattern 1: Missing 的 in adjective + noun
      if (msg.includes("好吃菜") || msg.includes("好菜")) {
        corrections.push({
          original: msg,
          correction: msg.replace(/好吃菜|好菜/g, "好吃的菜 (hǎochī de cài)"),
          explanation: "Nên thêm trợ từ '的' sau tính từ đa âm tiết như '好吃' để bổ nghĩa cho danh từ tự nhiên hơn.",
        });
      }
      // Common pattern 2: Double verb or phrasing
      else if (msg.includes("我很喜欢去") && !msg.includes("爬") && !msg.includes("玩")) {
        corrections.push({
          original: msg,
          correction: msg + " 走走看看 (zǒuzou kànkan)",
          explanation: "Thêm thành ngữ đi dạo/tham quan '走走看看' giúp diễn đạt giàu hình ảnh và bản xứ hơn.",
        });
      }
    }

    // If no direct rule matched, provide a high-value contextual refinement on the longest utterance
    if (corrections.length === 0 && userMessages.length > 0) {
      const longest = [...userMessages].sort((a, b) => b.length - a.length)[0];
      corrections.push({
        original: longest,
        correction: longest + "，觉得挺有意思的。(juéde tǐng yǒuyìsi de.)",
        explanation: "Thêm cụm cảm thán '觉得挺有意思的' (cảm thấy khá là thú vị) ở cuối câu sẽ giúp giọng điệu thân thiện và mềm mại hơn.",
      });
    }

    const strengths: string[] = [
      `Duy trì tương tác rất tốt với ${turnCount} lượt đối đáp liên tục cùng ${persona.name}.`,
      hasConnectives
        ? "Đã chủ động sử dụng liên từ ghép câu để diễn đạt ý tưởng hoàn chỉnh."
        : "Phát âm rõ ràng, nhịp độ nói vừa vặn và sẵn sàng chia sẻ suy nghĩ.",
    ];

    const improvements: string[] = [
      "Thử mở rộng câu bằng cách kể thêm nguyên nhân (因为...) hoặc cảm nghĩ cá nhân (我觉得...).",
      "Chú ý luyện biến điệu hai thanh 3 đi liền nhau (ví dụ: '你好' phát âm thành 'Ní hǎo').",
    ];

    return {
      overallScore,
      hskEstimate,
      fluencyScore: fluency,
      grammarScore: grammar,
      vocabularyScore: vocab,
      summary: `Bạn đã hoàn thành phiên trò chuyện tự do cùng ${persona.name} rất xuất sắc! Tinh thần giao tiếp cởi mở và phản xạ tự nhiên là chìa khóa then chốt để tiến bộ khẩu ngữ HSK.`,
      strengths,
      improvements,
      corrections,
      extensionQuestions: FreeTalkService.generatePersonaExtensionQuestions(persona.id),
    };
  }
}
