import { ConversationTurnItem, StageDefinition } from "./types";
import { AIClient, ChatMessage, LLMConfig } from "./ai-client";
import { pinyin } from "pinyin-pro";

export function generatePinyin(text: string): string {
  if (!text) return "";
  try {
    return pinyin(text, { toneType: "symbol" });
  } catch (e) {
    console.error("Pinyin generation error:", e);
    return "";
  }
}

export interface NextTurnResult {
  stage: number;
  examinerResponse: string;
  pinyin: string;
  isCompleted: boolean;
  pedagogicalObservation?: string;
}

export const STAGES_CONFIG: StageDefinition[] = [
  {
    stage: 1,
    name: "Warm-up & Introduction",
    nameZh: "自我介绍与导入",
    description: "Greet candidate, test audio clarity, warm up with simple introductory questions.",
    targetTurns: 2,
  },
  {
    stage: 2,
    name: "Daily Life & Routines",
    nameZh: "日常生活与兴趣爱好",
    description: "Inquire about habits, hobbies, study or work experiences.",
    targetTurns: 2,
  },
  {
    stage: 3,
    name: "Thematic Topic Presentation",
    nameZh: "主题阐述与观点表达",
    description: "Present a central discussion topic and elicit structured argumentation.",
    targetTurns: 2,
  },
  {
    stage: 4,
    name: "In-depth Probing & Reasoning",
    nameZh: "深入追问与逻辑展开",
    description: "Challenge perspective, prompt for examples, assess discourse markers and coherence.",
    targetTurns: 2,
  },
  {
    stage: 5,
    name: "Conclusion & Wrap-up",
    nameZh: "考试总结与致谢",
    description: "Conclude examination professionally and explain next assessment processing steps.",
    targetTurns: 1,
  },
];

export class ExaminerService {
  /**
   * Generates the next response from the AI Examiner based on full conversation history.
   */
  static async generateNextTurn(
    turns: ConversationTurnItem[],
    targetLevel = "HSK 3",
    topic = "Daily Life & Cultural Experience"
  ): Promise<NextTurnResult> {
    const currentLearnerTurnCount = turns.filter((t) => t.speaker === "LEARNER").length;

    // Check if cloud LLM is available (HHTECH / OpenAI / Claude)
    try {
      if (!process.env.VITEST) {
        const config = await AIClient.getActiveConfig();
        if (config.apiKey && config.isEnabled) {
          return await this.callCloudLLM(turns, targetLevel, topic, config);
        }
      }
    } catch (err) {
      console.warn("Cloud Examiner call failed, falling back to adaptive engine:", err);
    }

    // High fidelity built-in pedagogical state machine
    return this.generateAdaptiveTurn(turns, currentLearnerTurnCount, targetLevel, topic);
  }

  private static async callCloudLLM(
    turns: ConversationTurnItem[],
    targetLevel: string,
    topic: string,
    config: LLMConfig
  ): Promise<NextTurnResult> {
    const learnerTurnCount = turns.filter((t) => t.speaker === "LEARNER").length;

    // 12-turn structured oral assessment progression (2 + 3 + 3 + 3 + 1)
    let computedStage = 1;
    if (learnerTurnCount < 2) computedStage = 1;
    else if (learnerTurnCount < 5) computedStage = 2;
    else if (learnerTurnCount < 8) computedStage = 3;
    else if (learnerTurnCount < 11) computedStage = 4;
    else computedStage = 5;

    const isCompleted = learnerTurnCount >= 12 && computedStage === 5;

    const stageGuidelines: Record<number, string> = {
      1: "问候导入（共2题）：简短欢迎考生，确认声音清晰，引导考生用中文做自我介绍并询问学习中文的背景与动机。",
      2: "日常交流（共3题）：围绕考试主题，循序渐进询问考生的日常生活习惯、最近一次具体经历，以及个人感受或与亲友的互动。",
      3: "主题阐述（共3题）：就该主题提出核心探讨问题，请考生陈述主要立场与论点，深入阐述理由、优缺点分析及具体例证。",
      4: "深入追问（共3题）：就考生的观点提出反思性追问、反方观点或突发两难情境，考察高阶思辨逻辑与复杂交际解决能力。",
      5: "考试总结（共1-2题）：引导考生对整场口语表现做元认知自我评估，考官给予真诚正面鼓励，宣布考试圆满结束。",
    };

    const dialogueMessages: ChatMessage[] = turns.map((t) => ({
      role: (t.speaker === "EXAMINER" ? "assistant" : "user") as "assistant" | "user",
      content: t.textContent,
    }));

    if (dialogueMessages.length === 0) {
      dialogueMessages.push({
        role: "user",
        content: `请开启考试：我是准备参加 ${targetLevel} 口语考核的考生，今天选择的主题是“${topic}”。请向我致问候、确认设备声音并请我开始做自我介绍。`,
      });
    }

    const systemPrompt = `你是一名专业严谨、循循善诱、语气亲切自然的华语口语高级考官（李老师），正在主持针对 ${targetLevel} 等级、主题为“${topic}”的口语标准化考试。
当前环节：第 ${computedStage}/5 阶段（${stageGuidelines[computedStage]}）。
考生已回答轮次：${learnerTurnCount} 轮。

【考官执考与对话标准】：
1. 语言与水平匹配：使用规范标准普通话（简体中文），用词和语法难度契合 ${targetLevel} 考生水平，自然得体，富有教学亲和力。
2. 承接与互动（重要）：切忌机械式直接抛出问题。请先自然承接、肯定或点评考生上一轮的回答（例如：“很好，听到你经常去……”、“你说得很详细，特别是提到……”、“明白了，这也是很多人的体会”），营造真实自然的人机口语面对面交际氛围。
3. 递进提问：紧扣主题“${topic}”与当前阶段的核心目标，提出一个重点明确、具有启发性的提问或追问，引导考生充分展开论述。
4. 适度篇幅：保持在 2 到 4 句连贯生动的口语对白（约 60 - 120 字左右），既有考官的专业反馈与点评，又有明确的引导提问，切忌生硬生冷或过度简略。
5. 防抄题与乱码：若考生仅复述题目或输入乱码字符，礼貌提示其用自己的话回答。
6. 输出规范：直接输出考官要说的中文对白文本。严禁输出拼音（系统会自动生成拼音），严禁输出英文，严禁输出任何额外格式或标签。`;

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...dialogueMessages,
    ];

    // Use fast model (e.g. claude-haiku-4.5) if default was claude-sonnet-4.6, with 15s timeout
    const targetModel =
      config.modelId === "claude-sonnet-4.6" ? "claude-haiku-4.5" : config.modelId;

    const rawContent = await AIClient.chatCompletion({
      messages,
      model: targetModel,
      temperature: 0.6,
      requireJson: false,
    });

    let cleanText = (rawContent || "").trim();

    // In case the model wrapped in JSON
    if (cleanText.startsWith("{") && cleanText.endsWith("}")) {
      try {
        const parsed = JSON.parse(cleanText);
        cleanText = parsed.examinerResponse || parsed.text || parsed.response || cleanText;
      } catch {
        // ignore
      }
    }

    cleanText = cleanText
      .replace(/^```[a-z]*\s*/i, "")
      .replace(/\s*```$/, "")
      .replace(/^["'“]|["'”]$/g, "")
      .replace(/^(考官|李老师|考官李老师)[：:]\s*/i, "")
      .trim();

    if (!cleanText) {
      cleanText = "你好！请继续回答。";
    }

    // Generate accurate Pinyin using the pinyin-pro library in 0.1ms
    const generatedPinyin = generatePinyin(cleanText);

    return {
      stage: computedStage,
      examinerResponse: cleanText,
      pinyin: generatedPinyin,
      isCompleted,
    };
  }

  private static generateAdaptiveTurn(
    turns: ConversationTurnItem[],
    learnerTurns: number,
    targetLevel: string,
    topic: string
  ): NextTurnResult {
    const lastLearnerTurn = [...turns].reverse().find((t) => t.speaker === "LEARNER");
    const lastText = (lastLearnerTurn?.textContent || "").trim();
    const prevExaminerTurn = [...turns].reverse().find((t) => t.speaker === "EXAMINER");
    const prevExText = (prevExaminerTurn?.textContent || "").trim();

    // Check if candidate copied examiner question or typed gibberish
    const cleanPunct = (s: string) => s.replace(/[\s\p{P}\p{S}]/gu, "");
    const cleanLast = cleanPunct(lastText);
    const cleanPrev = cleanPunct(prevExText);

    let isLastCopied = false;
    if (cleanLast.length >= 4 && cleanPrev.length >= 4) {
      if (cleanPrev.includes(cleanLast) || cleanLast.includes(cleanPrev)) {
        isLastCopied = true;
      } else {
        let matched = 0;
        for (const ch of cleanLast) {
          if (cleanPrev.includes(ch)) matched++;
        }
        if (matched / cleanLast.length >= 0.68) {
          isLastCopied = true;
        }
      }
    }

    const hanziCount = (lastText.match(/[\u4e00-\u9fa5]/g) || []).length;
    const isLastGibberish =
      lastText.length > 0 &&
      (hanziCount < 2 || /^(asdf|1234|qwerty|zxcv|test|linh tinh|bla bla|zzz|xxx)/i.test(lastText));

    const prefix = isLastCopied
      ? "请用你自己的话回答，不要直接重复我的问题哦。让我们继续："
      : isLastGibberish
      ? "刚才好像没有收到有效的中文回答。请尽量用中文句子回答。接下来："
      : "";

    const pinyinPrefix = isLastCopied
      ? "Qǐng yòng nǐ zìjǐ de huà huídá, búyào zhíjiē chóngfù wǒ de wèntí ó. Ràng wǒmen jìxù: "
      : isLastGibberish
      ? "Gāngcái hǎoxiàng méiyǒu shōudào yǒuxiào de zhōngwén huídá. Qǐng jǐnliàng yòng zhōngwén jùzi huídá. Jiē xiàlái: "
      : "";

    const lowerTopic = (topic || "").toLowerCase();
    const isFood = lowerTopic.includes("ẩm thực") || lowerTopic.includes("gọi món") || lowerTopic.includes("món ăn") || lowerTopic.includes("nhà hàng") || lowerTopic.includes("ăn uống") || lowerTopic.includes("food");
    const isSports = lowerTopic.includes("bóng") || lowerTopic.includes("thể thao") || lowerTopic.includes("sport") || lowerTopic.includes("football");

    // Turn 0: Candidate hasn't spoken yet (First greeting)
    if (learnerTurns === 0) {
      return {
        stage: 1,
        examinerResponse: "你好！欢迎参加今天的华语口语评估。我是李老师。我们先确认一下，你能清楚地听到我的声音吗？请先用中文简单介绍一下你自己吧（比如你的名字、职业或学习经历）。",
        pinyin: "Nǐ hǎo! Huānyíng cānjiā jīntiān de Huáyǔ kǒuyǔ pínggū. Wǒ shì Lǐ lǎoshī. Wǒmen xiān quèrèn yíxià, nǐ néng qīngchǔ de tīng dào wǒ de shēngyīn ma? Qǐng xiān yòng zhōngwén jiǎndān jièshào yíxià nǐ zìjǐ ba (bǐrú nǐ de míngzì, zhíyè huò xuéxí jīnglì).",
        isCompleted: false,
        pedagogicalObservation: "Stage 1 Turn 1: Warm greeting, audio verification, self-introduction.",
      };
    }

    // Stage 1 Turn 2: Follow-up intro
    if (learnerTurns === 1) {
      const resp = prefix
        ? `${prefix}请问你平时学习中文多长时间了？今天我们的话题是“${topic}”，你对这个话题有什么兴趣？`
        : `很好，很高兴认识你！听到你的声音很清晰。请问你平时学习中文多长时间了？今天我们选择的话题是“${topic}”，是什么让你对这个话题感兴趣呢？`;
      const pin = pinyinPrefix
        ? `${pinyinPrefix}Qǐngwèn nǐ píngshí xuéxí zhōngwén duō cháng shíjiān le? Jīntiān wǒmen de huàtí shì \"${topic}\", nǐ duì zhè ge huàtí yǒu shénme xìngqù?`
        : `Hěn hǎo, hěn gāoxìng rènshí nǐ! Tīng dào nǐ de shēngyīn hěn qīngxī. Qǐngwèn nǐ píngshí xuéxí zhōngwén duō cháng shíjiān le? Jīntiān wǒmen xuǎnzé de huàtí shì \"${topic}\", shì shénme ràng nǐ duì zhè ge huàtí gǎn xìngqù ne?`;

      return {
        stage: 1,
        examinerResponse: resp,
        pinyin: pin,
        isCompleted: false,
        pedagogicalObservation: "Stage 1 Turn 2: Background exploration and motivation for chosen topic.",
      };
    }

    // Stage 2 Turn 1: Daily life routines (Question 1/3)
    if (learnerTurns === 2) {
      if (isFood) {
        return {
          stage: 2,
          examinerResponse: "听起来很棒！现在我们进入日常交流环节。聊到美食，你平时更喜欢在家里自己做饭，还是更喜欢去饭馆点菜？你最喜欢吃的一道菜是什么？",
          pinyin: "Tīng qǐlái hěn bàng! Xiànzài wǒmen jìnrù rìcháng jiāoliú huánjié. Liáo dào měishí, nǐ píngshí gèng xǐhuan zài jiālǐ zìjǐ zuò fàn, háishì gèng xǐhuan qù fànguǎn diǎncài? Nǐ zuì xǐhuan chī de yī dào cài shì shénme?",
          isCompleted: false,
          pedagogicalObservation: "Stage 2 Turn 1: Daily eating habits and favorite dish.",
        };
      }
      if (isSports) {
        return {
          stage: 2,
          examinerResponse: "很好。现在我们进入日常交流环节。平时在周末或者空闲时间，你一般喜欢看球赛还是亲自参与体育运动？你最支持的队伍或运动员是谁？",
          pinyin: "Hěn hǎo. Xiànzài wǒmen jìnrù rìcháng jiāoliú huánjié. Píngshí zài zhōumò huòzhě kòngxián shíjiān, nǐ yībān xǐhuan kàn qiúsài háishì qīnzì cānyù tǐyù yùndòng? Nǐ zuì zhīchí de duìwǔ huò yùndòngyuán shì shéi?",
          isCompleted: false,
          pedagogicalObservation: "Stage 2 Turn 1: Sports routines, spectating vs playing.",
        };
      }
      return {
        stage: 2,
        examinerResponse: `很好。现在我们进入日常交流环节。关于“${topic}”，在平时日常生活或空闲时间里，你一般有哪些相关的习惯或爱好？请跟老师简单聊聊。`,
        pinyin: `Hěn hǎo. Xiànzài wǒmen jìnrù rìcháng jiāoliú huánjié. Guānyú \"${topic}\", zài píngshí rìcháng shēnghuó huò kòngxián shíjiān lǐ, nǐ yībān yǒu nǎxiē xiāngguān de xíguàn huò àihào? Qǐng gēn lǎoshī jiǎndān liáo liáo.`,
        isCompleted: false,
        pedagogicalObservation: "Stage 2 Turn 1: Daily routines and personal habits linked to topic.",
      };
    }

    // Stage 2 Turn 2: Specific narrative story (Question 2/3)
    if (learnerTurns === 3) {
      if (isFood) {
        return {
          stage: 2,
          examinerResponse: "你说得很诱人！那么你能具体分享一次你最近和朋友或家人一起去特色餐馆点菜的经历吗？当时尝到了什么特别的味道，有什么有趣的事？",
          pinyin: "Nǐ shuō de hěn yòurén! Nàme nǐ néng jùtǐ fēnxiǎng yícì nǐ zuìjìn hé péngyou huò jiārén yìqǐ qù tèsè cānguǎn diǎncài de jīnglì ma? Dāngshí cháng dào le shénme tèbié de wèidào, yǒu shénme yǒuqù de shì?",
          isCompleted: false,
          pedagogicalObservation: "Stage 2 Turn 2: Past narrative, restaurant ordering experience, vivid recall.",
        };
      }
      return {
        stage: 2,
        examinerResponse: "听起来很有意思。那么平时你的朋友或家人也会和你一起参与吗？你能具体分享一次你印象最深刻的相关经历吗？当时发生了什么？",
        pinyin: "Tīng qǐlái hěn yǒu yìsi. Nàme píngshí nǐ de péngyou huò jiārén yě huì hé nǐ yìqǐ cānyù ma? Nǐ néng jùtǐ fēnxiǎng yícì nǐ yìnxiàng zuì shēnkè de xiāngguān jīnglì ma? Dāngshí fāshēng le shénme?",
        isCompleted: false,
        pedagogicalObservation: "Stage 2 Turn 2: Past narrative recounting a memorable event.",
      };
    }

    // Stage 2 Turn 3: Personal insights & reflections (Question 3/3)
    if (learnerTurns === 4) {
      if (isFood) {
        return {
          stage: 2,
          examinerResponse: "这段经历真让人回味无穷！如果让你向第一次来旅游的外国朋友推荐一道家乡必吃的美食，你会推荐什么？你会怎么向他形容这道菜的独特魅力？",
          pinyin: "Zhè duàn jīnglì zhēn ràng rén huíwèi wúqióng! Rúguǒ ràng nǐ xiàng dì yī cì lái lǚyóu de wàiguó péngyou tuījiàn yí dào jiāxiāng bì chī de měishí, nǐ huì tuījiàn shénme? Nǐ huì zěnme xiàng tā xíngróng zhè dào cài de dútè mèilì?",
          isCompleted: false,
          pedagogicalObservation: "Stage 2 Turn 3: Cultural recommendation and descriptive elaboration.",
        };
      }
      return {
        stage: 2,
        examinerResponse: `聊得真不错！结合这些日常经历，你觉得“${topic}”对你个人的心情或者日常生活状态带来了哪些最直接的改变？`,
        pinyin: `Liáo de zhēn búcuò! Jiéhé zhèxiē rìcháng jīnglì, nǐ juéde \"${topic}\" duì nǐ gèrén de xīnqíng huòzhě rìcháng shēnghuó zhuàngtài dài lái le nǎxiē zuì zhíjiē de gǎibiàn?`,
        isCompleted: false,
        pedagogicalObservation: "Stage 2 Turn 3: Reflecting on personal lifestyle impact.",
      };
    }

    // Stage 3 Turn 1: Topic Presentation Core Stance (Question 1/3)
    if (learnerTurns === 5) {
      if (isFood) {
        return {
          stage: 3,
          examinerResponse: "现在我们进入第3阶段：主题阐述环节。有人认为“在餐馆点菜是了解一个国家文化最直接的方式”，也有人觉得现代快餐和外卖更加高效便捷。针对这两种不同的生活方式，你有什么看法？请谈谈你的主要观点和理由。",
          pinyin: "Xiànzài wǒmen jìnrù dì sān jiēduàn: zhǔtí chǎnshù huánjié. Yǒurén rènwéi 'zài cānguǎn diǎncài shì liǎojiě yí ge guójiā wénhuà zuì zhíjiē de fāngshì', yě yǒurén juéde xiàndài kuàicān hé wàimài gèngjiā gāoxiào biànjié. Zhēnduì zhè liǎng zhǒng bùtóng de shēnghuó fāngshì, nǐ yǒu shénme kànfǎ? Qǐng tán tán nǐ de zhǔyào guāndiǎn hé lǐyóu.",
          isCompleted: false,
          pedagogicalObservation: "Stage 3 Turn 1: Formal thematic stance, comparing cultural dining vs fast food convenience.",
        };
      }
      return {
        stage: 3,
        examinerResponse: `现在我们进入第3阶段：主题阐述环节。围绕今天的话题“${topic}”，有人认为它给现代生活带来了极大的便利与改变，也有人认为它带来了一些挑战。你持有怎样的看法？请阐明你的立场，并说明理由。`,
        pinyin: `Xiànzài wǒmen jìnrù dì sān jiēduàn: zhǔtí chǎnshù huánjié. Wéirào jīntiān de huàtí \"${topic}\", yǒurén rènwéi tā gěi xiàndài shēnghuó dài lái le jídà de biànlì yǔ gǎibiàn, yě yǒurén rènwéi tā dài lái le yìxiē tiǎozhàn. Nǐ chí yǒu zěnyàng de kànfǎ? Qǐng chǎnmíng nǐ de lìchǎng, bìng shuōmíng lǐyóu.`,
        isCompleted: false,
        pedagogicalObservation: "Stage 3 Turn 1: Structured thematic opinion formulation.",
      };
    }

    // Stage 3 Turn 2: In-depth argumentation and reasons (Question 2/3)
    if (learnerTurns === 6) {
      return {
        stage: 3,
        examinerResponse: "你的观点阐述得很清晰。那么从长远来看，你觉得这种现象对人们的生活方式、健康或者人际关系有哪些深远的影响？你能再举一个具体的例子来论证吗？",
        pinyin: "Nǐ de guāndiǎn chǎnshù de hěn qīngxī. Nàme cóng chángyuǎn lái kàn, nǐ juéde zhè zhǒng xiànxiàng duì rénmen de shēnghuó fāngshì, jiànkāng huòzhě rénjì guānxì yǒu nǎxiē shēnyuǎn de yǐngxiǎng? Nǐ néng zài jǔ yí ge jùtǐ de lìzi lái lùnzhèng ma?",
        isCompleted: false,
        pedagogicalObservation: "Stage 3 Turn 2: Expanding arguments with concrete examples and causal relationships.",
      };
    }

    // Stage 3 Turn 3: Contrast and trade-offs (Question 3/3)
    if (learnerTurns === 7) {
      return {
        stage: 3,
        examinerResponse: "分析得很有深度。如果要在这种便利与传统价值之间找到一个最佳平衡点，你觉得关键在于什么？",
        pinyin: "Fēnxī de hěn yǒu shēndù. Rúguǒ yào zài zhè zhǒng biànlì yǔ chuántǒng jiàzhí zhījiān zhǎodào yí ge zuì jiā pínghéng diǎn, nǐ juéde guānjiàn zàiyú shénme?",
        isCompleted: false,
        pedagogicalObservation: "Stage 3 Turn 3: Synthesizing balanced perspectives and core criteria.",
      };
    }

    // Stage 4 Turn 1: Probing & Hypothetical Challenge (Question 1/3)
    if (learnerTurns === 8) {
      if (isFood) {
        return {
          stage: 4,
          examinerResponse: "你说得非常有见地。接下来进入第4阶段：深入追问。如果一个外国人刚到中国，完全看不懂中文菜单，而且服务员也不会外语，面对这种情况，你会建议他怎么做？如果点错了菜或者遇到口味不合，又该如何礼貌地沟通？",
          pinyin: "Nǐ shuō de fēicháng yǒu jiàndì. Jiē xiàlái jìnrù dì sì jiēduàn: shēnrù zhuīwèn. Rúguǒ yí ge wàiguó rén gāng dào Zhōngguó, wánquán kàn bù dǒng zhōngwén càidān, érqiě fúwùyuán yě bú huì wàiyǔ, miànduì zhè zhǒng qíngkuàng, nǐ huì jiànyì tā zěnme zuò? Rúguǒ diǎn cuò le cài huòzhě yù dào kǒuwèi bù hé, yòu gāi rúhé lǐmào de gōutōng?",
          isCompleted: false,
          pedagogicalObservation: "Stage 4 Turn 1: Hypothetical problem-solving, situational diplomatic communication.",
        };
      }
      return {
        stage: 4,
        examinerResponse: "你说得非常有见地。接下来进入第4阶段：深入追问。如果遇到强烈反对你观点的人，或者出现了意料之外的突发情况，你会如何说服对方或者妥善化解矛盾？请谈谈你的应对思路。",
        pinyin: "Nǐ shuō de fēicháng yǒu jiàndì. Jiē xiàlái jìnrù dì sì jiēduàn: shēnrù zhuīwèn. Rúguǒ yù dào qiángliè fǎnduì nǐ guāndiǎn de rén, huòzhě chūxiàn le yìliào zhīwài de tūfā qíngkuàng, nǐ huì rúhé shuōfú duìfāng huòzhě tuǒshàn huàjiě máodùn? Qǐng tán tán nǐ de yìngduì sīlù.",
        isCompleted: false,
        pedagogicalObservation: "Stage 4 Turn 1: Handling hypothetical challenges and conflicting viewpoints.",
      };
    }

    // Stage 4 Turn 2: Critical dialectics & practical advice (Question 2/3)
    if (learnerTurns === 9) {
      return {
        stage: 4,
        examinerResponse: "这个解决方法很有建设性。结合你自己的切身体会，针对想要更好地掌握这门技能或适应这种情境的学习者，你最想给他们提出的两条实用建议是什么？",
        pinyin: "Zhè ge jiějué fāngfǎ hěn yǒu jiànshè xìng. Jiéhé nǐ zìjǐ de qièshēn tǐhuì, zhēnduì xiǎng yào gèng hǎo de zhǎngwò zhè mén jìnéng huò shìyìng zhè zhǒng qíngjìng de xuéxí zhě, nǐ zuì xiǎng gěi tāmen tíchū de liǎng tiáo shíyòng jiànyì shì shénme?",
        isCompleted: false,
        pedagogicalObservation: "Stage 4 Turn 2: Synthesizing personal advice and practical wisdom.",
      };
    }

    // Stage 4 Turn 3: Future Outlook & High-level Synthesis (Question 3/3)
    if (learnerTurns === 10) {
      return {
        stage: 4,
        examinerResponse: `非常有洞察力。最后，展望未来五到十年，你认为随着人工智能和科技的发展，“${topic}”这一领域会发生哪些颠覆性的变化？我们应当做好怎样的心理准备？`,
        pinyin: `Fēicháng yǒu dòngchálì. Zuìhòu, zhǎnwàng wèilái wǔ dào shí nián, nǐ rènwéi suízhe réngōng zhìnéng hé kējì de fāzhǎn, \"${topic}\" zhè yī lǐngyù huì fāshēng nǎxiē diānfù xìng de biànhuà? Wǒmen yīngdāng zuò hǎo zěnyàng de xīnlǐ zhǔnbèi?`,
        isCompleted: false,
        pedagogicalObservation: "Stage 4 Turn 3: Future outlook and macro-level dialectical synthesis.",
      };
    }

    // Stage 5 Turn 1: Candidate Self-Reflection (Question 1/2)
    if (learnerTurns === 11) {
      return {
        stage: 5,
        examinerResponse: "非常出色！现在我们来到最后的全程总结阶段。回顾今天在5个不同阶段的交流，你觉得自己今天口语发挥得怎么样？在词汇、发音或者表达流利度方面，你有哪些满意或者希望能进一步提高的地方吗？",
        pinyin: "Fēicháng chūsè! Xiànzài wǒmen lái dào zuìhòu de quánchéng zǒngjié jiēduàn. Huígù jīntiān zài wǔ ge bùtóng jiēduàn de jiāoliú, nǐ juéde zìjǐ jīntiān kǒuyǔ fāhuī de zěnmeyàng? Zài cíhuì, fāyīn huòzhě biǎodá liúlì dù fāngmiàn, nǐ yǒu nǎxiē mǎnyì huòzhě xīwàng néng jìnyíbù tígāo de dìfang ma?",
        isCompleted: false,
        pedagogicalObservation: "Stage 5 Turn 1: Metacognitive self-reflection on oral proficiency across 5 stages.",
      };
    }

    // Stage 5 Turn 2: Final Conclusion & Goodbye (isCompleted = true)
    return {
      stage: 5,
      examinerResponse: "非常感谢你的真诚分享！今天的华语口语5阶段全真模拟考核到这里就圆满结束了。你在整个交流中表现得非常积极，语言连贯度很高，思路也很清晰。系统目前正在对你全程对话录音进行全面的7维度语言学智能评估，稍后你可以在系统中查阅详细的诊断报告。祝你在中文学习的道路上取得更大的进步，再见！",
      pinyin: "Fēicháng gǎnxiè nǐ de zhēnchéng fēnxiǎng! Jīntiān de Huáyǔ kǒuyǔ wǔ jiēduàn quánzhēn mónǐ kǎohé dào zhèlǐ jiù yuánmǎn jiéshù le. Nǐ zài zhěnggè jiāoliú zhōng biǎoxiàn de fēicháng jījí, yǔyán liánguàn dù hěn gāo, sīlù yě hěn qīngxī. Xìtǒng mùqián zhèngzài duì nǐ quánchéng duìhuà lùyīn jìnxíng quánmiàn de qī wéidù yǔyánxué zhìnéng pínggū, shāohòu nǐ kěyǐ zài xìtǒng zhōng cháyuè xiángxì de zhěnduàn bàogào. Zhù nǐ zài zhōngwén xuéxí de dàolù shàng qǔdé gèng dà de jìnbù, zàijiàn!",
      isCompleted: true,
      pedagogicalObservation: "Stage 5 Turn 2: Examination formally concluded, scoring pipeline enqueued.",
    };
  }
}
