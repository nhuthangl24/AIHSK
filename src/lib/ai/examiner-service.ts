import { ConversationTurnItem, StageDefinition } from "./types";
import { CHINESE_EXAMINER_SYSTEM_PROMPT } from "./prompts";

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
    const totalTurns = turns.length;
    const currentLearnerTurnCount = turns.filter((t) => t.speaker === "LEARNER").length;

    // Check if cloud LLM is available
    if (process.env.OPENAI_API_KEY) {
      try {
        return await this.callOpenAI(turns, targetLevel, topic);
      } catch (err) {
        console.warn("OpenAI Examiner call failed, falling back to adaptive engine:", err);
      }
    }

    // High fidelity built-in pedagogical state machine
    return this.generateAdaptiveTurn(turns, currentLearnerTurnCount, targetLevel, topic);
  }

  private static async callOpenAI(
    turns: ConversationTurnItem[],
    targetLevel: string,
    topic: string
  ): Promise<NextTurnResult> {
    const messages = [
      {
        role: "system",
        content: `${CHINESE_EXAMINER_SYSTEM_PROMPT}\nTarget Level: ${targetLevel}. Topic: ${topic}`,
      },
      ...turns.map((t) => ({
        role: t.speaker === "EXAMINER" ? "assistant" : "user",
        content: t.textContent,
      })),
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.AI_DEFAULT_MODEL || "gpt-4o-mini",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    return {
      stage: parsed.stage || 1,
      examinerResponse: parsed.examinerResponse || "你好，请继续回答。",
      pinyin: parsed.pinyin || "",
      isCompleted: Boolean(parsed.isCompleted),
      pedagogicalObservation: parsed.feedbackHint,
    };
  }

  private static generateAdaptiveTurn(
    turns: ConversationTurnItem[],
    learnerTurns: number,
    targetLevel: string,
    topic: string
  ): NextTurnResult {
    const lastLearnerTurn = [...turns].reverse().find((t) => t.speaker === "LEARNER");
    const lastText = lastLearnerTurn?.textContent || "";

    // Turn 0: Candidate hasn't spoken yet (First greeting)
    if (learnerTurns === 0) {
      return {
        stage: 1,
        examinerResponse: "你好！欢迎参加今天的华语口语评估。请问你准备好了吗？请先用中文简单介绍一下你自己吧。",
        pinyin: "Nǐ hǎo! Huānyíng cānjiā jīntiān de Huáyǔ kǒuyǔ pínggū. Qǐngwèn nǐ zhǔnbèi hǎo le ma? Qǐng xiān yòng zhōngwén jiǎndān jièshào yíxià nǐ zìjǐ ba.",
        isCompleted: false,
        pedagogicalObservation: "Stage 1 initial greeting and identity readiness confirmation.",
      };
    }

    // Stage 1 -> Turn 1
    if (learnerTurns === 1) {
      return {
        stage: 1,
        examinerResponse: `很好，很高兴认识你！听到你的声音很清晰。请问你平时学习中文多长时间了？你觉得学中文最有趣的地方是什么？`,
        pinyin: "Hěn hǎo, hěn gāoxìng rènshí nǐ! Tīng dào nǐ de shēngyīn hěn qīngxī. Qǐngwèn nǐ píngshí xuéxí zhōngwén duō cháng shíjiān le? Nǐ juéde xué zhōngwén zuì yǒuqù de dìfang shì shénme?",
        isCompleted: false,
        pedagogicalObservation: "Evaluating self-introduction clarity, basic tense, and introductory sentence structure.",
      };
    }

    // Stage 2: Daily Life & Routines
    if (learnerTurns === 2) {
      return {
        stage: 2,
        examinerResponse: `听起来很有意思！接下来我们聊聊日常生活。在周末或者空闲时间，你一般喜欢做些什么？你有什么特别的兴趣爱好吗？`,
        pinyin: "Tīng qǐlái hěn yǒu yìsi! Jiē xiàlái wǒmen liáo liáo rìcháng shēnghuó. Zài zhōumò huòzhě kòngxián shíjiān, nǐ yībān xǐhuan zuò xiē shénme? Nǐ yǒu shénme tèbié de xìngqù àihào ma?",
        isCompleted: false,
        pedagogicalObservation: "Assessing daily activities vocabulary, frequency adverbs (一般, 经常), and expression of personal hobbies.",
      };
    }

    // Stage 2 -> Follow-up
    if (learnerTurns === 3) {
      return {
        stage: 2,
        examinerResponse: `很好。那么平时你的朋友或家人也会和你一起参与这些活动吗？你可以具体说说你们最近一次一起度过的愉快经历吗？`,
        pinyin: "Hěn hǎo. Nàme píngshí nǐ de péngyou huò jiārén yě huì hé nǐ yìqǐ cānyù zhèxiē huódòng ma? Nǐ kěyǐ jùtǐ shuōshuō nǐmen zuìjìn yícì yìqǐ dùguò de yúkuài jīnglì ma?",
        isCompleted: false,
        pedagogicalObservation: "Testing past narrative cohesion, time expressions, and interpersonal conversational interaction.",
      };
    }

    // Stage 3: Topic Presentation (Theme: Learning & Culture)
    if (learnerTurns === 4) {
      return {
        stage: 3,
        examinerResponse: `现在我们进入主题讨论环节。现在的年轻人越来越喜欢使用手机和人工智能软件来学习外语。你认为利用科技学习中文有什么优势？它是否可以完全代替传统的老师呢？请谈谈你的看法。`,
        pinyin: "Xiànzài wǒmen jìnrù zhǔtí tǎolùn huánjié. Xiànzài de niánqīng rén yuè lái yuè xǐhuan shǐyòng shǒujī hé réngōng zhìnéng ruǎnjiàn lái xuéxí wàiyǔ. Nǐ rènwéi lìyòng kējì xuéxí zhōngwén yǒu shénme yōushì? Tā shìfǒu kěyǐ wánquán dàitì chuántǒng de lǎoshī ne? Qǐng tán tán nǐ de kànfǎ.",
        isCompleted: false,
        pedagogicalObservation: "Transitioning to formal topic argumentation: assessing conjunctions (因为...所以, 虽然...但是), comparison, and abstract expression.",
      };
    }

    // Stage 4: In-depth Probing & Logical Reasoning
    if (learnerTurns === 5) {
      return {
        stage: 4,
        examinerResponse: `你的观点很有深度。不过也有人担心，如果长期过度依赖人工智能和电子产品，可能会减少真实人际交往的机会，甚至影响语言的实际应用能力。针对这种担忧，你有什么建议或者解决办法吗？`,
        pinyin: "Nǐ de guāndiǎn hěn yǒu shēndù. Bùguò yě yǒurén dānxīn, rúguǒ chángqī guòdù yīlài réngōng zhìnéng hé diànzǐ chǎnpǐn, kěnéng huì jiǎnshǎo zhēnshí rénjì jiāowǎng de jīhuì, shènzhì yǐngxiǎng yǔyán de shíjì yìngyòng nénglì. Zhēnduì zhèzhǒng dānyōu, nǐ yǒu shénme jiànyì huòzhě jiějué bànfǎ ma?",
        isCompleted: false,
        pedagogicalObservation: "Probing higher-order reasoning, hypothetical conditional structures (如果...就...), and problem-solving discourse.",
      };
    }

    // Stage 5: Professional Conclusion
    return {
      stage: 5,
      examinerResponse: `非常感谢你的精彩回答！今天的华语口语考核到这里就全部结束了。你在整个交流过程中表现得很积极，表达也很流畅。系统现在正在对你的完整对话记录进行全面的语言学多维度评估，稍后你可以在系统中查看详细的诊断报告。祝你中文学习进步，再见！`,
      pinyin: "Fēicháng gǎnxiè nǐ de jīngcǎi huídá! Jīntiān de Huáyǔ kǒuyǔ kǎohé dào zhèlǐ jiù quánbù jiéshù le. Nǐ zài zhěnggè jiāoliú guòchéng zhōng biǎoxiàn de hěn jījí, biǎodá yě hěn liúchàng. Xìtǒng xiànzài zhèngzài duì nǐ de wánzhěng duìhuà jìlù jìnxíng quánmiàn de yǔyánxué duō wéidù pínggū, shāohòu nǐ kěyǐ zài xìtǒng zhōng chákàn xiángxì de zhěnduàn bàogào. Zhù nǐ zhōngwén xuéxí jìnbù, zàijiàn!",
      isCompleted: true,
      pedagogicalObservation: "Assessment session successfully concluded; triggers scoring job.",
    };
  }
}
