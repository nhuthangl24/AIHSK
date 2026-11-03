import { PrismaClient, UserRole, OrgRole, AssessmentCategory, SessionStatus, SpeakerType, RecommendationCategory, PlanTier } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Classnia AI SaaS database seeding...");

  // 1. Subscription Plans
  console.log("Creating subscription plans...");
  const freePlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "free" },
    update: {},
    create: {
      name: "Free Starter",
      slug: "free",
      tier: PlanTier.FREE,
      priceMonthly: 0,
      priceYearly: 0,
      maxAssessments: 3,
      featuresJson: [
        "3 Oral Assessments per month",
        "AI Chinese Examiner (5 stages)",
        "Standard linguistic report",
        "CEFR & HSK level estimates",
      ],
    },
  });

  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "pro" },
    update: {},
    create: {
      name: "Pro Learner",
      slug: "pro",
      tier: PlanTier.PRO,
      priceMonthly: 1900, // $19.00
      priceYearly: 19000,
      maxAssessments: 30,
      featuresJson: [
        "30 Oral Assessments per month",
        "Full acoustic & tone sandhi analysis",
        "Granular grammar & vocabulary coaching",
        "Unlimited audio playback",
        "PDF Report export",
        "Personalized weekly learning roadmap",
      ],
    },
  });

  const teacherPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "teacher" },
    update: {},
    create: {
      name: "Educator & Classroom",
      slug: "teacher",
      tier: PlanTier.TEACHER,
      priceMonthly: 4900, // $49.00
      priceYearly: 49000,
      maxAssessments: 120,
      featuresJson: [
        "Classroom creation & student roster",
        "Assessment assignment workflows",
        "Class-wide progress analytics",
        "CSV & gradebook export",
        "Customizable assessment rubrics",
      ],
    },
  });

  const orgPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "organization" },
    update: {},
    create: {
      name: "Institutional Enterprise",
      slug: "organization",
      tier: PlanTier.ORGANIZATION,
      priceMonthly: 19900, // $199.00
      priceYearly: 199000,
      maxAssessments: 1000,
      featuresJson: [
        "Unlimited departments & teachers",
        "Up to 250 learner seats included",
        "Multi-tenant isolation & security audit logs",
        "Dedicated account manager",
        "SSO & Custom domain support",
      ],
    },
  });

  // 2. Assessment Rubric
  console.log("Creating default assessment rubric...");
  const defaultRubric = await prisma.assessmentRubric.upsert({
    where: { id: "rubric-standard-v1" },
    update: {},
    create: {
      id: "rubric-standard-v1",
      name: "Standard Chinese Oral Proficiency Rubric",
      version: "1.0",
      description: "Comprehensive 7-dimension psychometric evaluation model calibrated to CEFR and HSK proficiency scales.",
      passingScore: 60,
      isDefault: true,
      dimensionsJson: [
        { key: "pronunciation", name: "Pronunciation & Tones", weight: 0.20, maxScore: 20 },
        { key: "fluency", name: "Fluency & Speech Rhythm", weight: 0.20, maxScore: 20 },
        { key: "vocabulary", name: "Vocabulary Range & Appropriateness", weight: 0.15, maxScore: 15 },
        { key: "grammar", name: "Grammar & Syntax Accuracy", weight: 0.15, maxScore: 15 },
        { key: "coherence", name: "Coherence & Discourse Flow", weight: 0.10, maxScore: 10 },
        { key: "comprehension", name: "Comprehension & Question Relevance", weight: 0.10, maxScore: 10 },
        { key: "interaction", name: "Interactive Sustained Dialogue", weight: 0.10, maxScore: 10 },
      ],
    },
  });

  // 3. Assessment Templates
  console.log("Creating assessment templates...");
  const tplHsk3 = await prisma.assessmentTemplate.upsert({
    where: { slug: "hsk-3-oral-proficiency" },
    update: {},
    create: {
      id: "tpl-hsk3",
      title: "HSK 3 Spoken Mandarin Diagnostic",
      slug: "hsk-3-oral-proficiency",
      description: "Standardized 5-stage oral assessment covering daily activities, personal background, hobbies, and simple opinions.",
      category: AssessmentCategory.HSK_ORIENTED,
      targetLevel: "HSK 3 / CEFR B1",
      estimatedDurationMinutes: 12,
      maxTurns: 10,
      rubricId: defaultRubric.id,
      stagesConfig: [
        { stage: 1, name: "Greeting & Introduction", turns: 2 },
        { stage: 2, name: "Daily Habits & Hobbies", turns: 2 },
        { stage: 3, name: "Topic Discourse (Travel & Cities)", turns: 2 },
        { stage: 4, name: "Opinion & Reasoning", turns: 2 },
        { stage: 5, name: "Examiner Wrap-up", turns: 1 },
      ],
      examinerPrompt: "Assess student's capability to express routines, handle basic conversations, and articulate reasons clearly in Mandarin.",
    },
  });

  const tplHsk4 = await prisma.assessmentTemplate.upsert({
    where: { slug: "hsk-4-intermediate-discourse" },
    update: {},
    create: {
      id: "tpl-hsk4",
      title: "HSK 4 Intermediate Argumentation & Culture",
      slug: "hsk-4-intermediate-discourse",
      description: "Designed for intermediate speakers to demonstrate abstract thinking, connectives, and Chinese cultural topics.",
      category: AssessmentCategory.HSK_ORIENTED,
      targetLevel: "HSK 4 / CEFR B2",
      estimatedDurationMinutes: 15,
      maxTurns: 10,
      rubricId: defaultRubric.id,
      stagesConfig: [
        { stage: 1, name: "Greeting & Experience", turns: 2 },
        { stage: 2, name: "Lifestyle & Social Habits", turns: 2 },
        { stage: 3, name: "Technology & Modern Learning", turns: 2 },
        { stage: 4, name: "Critical Probing & Counterarguments", turns: 2 },
        { stage: 5, name: "Conclusion", turns: 1 },
      ],
      examinerPrompt: "Evaluate student's discourse coherence, conjunction pairs, and tone stabilization under deeper probing questions.",
    },
  });

  const tplBusiness = await prisma.assessmentTemplate.upsert({
    where: { slug: "business-mandarin-workplace" },
    update: {},
    create: {
      id: "tpl-business",
      title: "Business Chinese & Professional Communication",
      slug: "business-mandarin-workplace",
      description: "Focused on workplace negotiations, meeting etiquette, project updates, and professional vocabulary.",
      category: AssessmentCategory.BUSINESS,
      targetLevel: "B2 / HSK 5",
      estimatedDurationMinutes: 18,
      maxTurns: 12,
      rubricId: defaultRubric.id,
      stagesConfig: [
        { stage: 1, name: "Professional Introduction", turns: 2 },
        { stage: 2, name: "Project & Role Briefing", turns: 2 },
        { stage: 3, name: "Business Problem Solving", turns: 2 },
        { stage: 4, name: "Client Proposal & Negotiation", turns: 2 },
        { stage: 5, name: "Formal Closing", turns: 1 },
      ],
      examinerPrompt: "Evaluate workplace register, formal Chinese business terminology, and persuasive clarity.",
    },
  });

  // 4. Demo Users
  console.log("Creating demo accounts...");
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const learner = await prisma.user.upsert({
    where: { email: "learner@aihsk.com" },
    update: {},
    create: {
      email: "learner@aihsk.com",
      passwordHash,
      name: "Alex Chen (陈明)",
      role: UserRole.LEARNER,
      emailVerified: true,
      profile: {
        create: {
          targetLevel: "HSK 1",
          nativeLanguage: "English",
          learningGoal: "Prepare for study abroad in Beijing and work in bilingual tech environments.",
          studyHoursWeekly: 5,
          bio: "Passionate Chinese language learner aiming for advanced oral fluency.",
        },
      },
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@aihsk.com" },
    update: {},
    create: {
      email: "teacher@aihsk.com",
      passwordHash,
      name: "Prof. Lin Zhang (张老师)",
      role: UserRole.TEACHER,
      emailVerified: true,
      profile: {
        create: {
          targetLevel: "Native / Examiner",
          nativeLanguage: "Mandarin Chinese",
          learningGoal: "Managing student oral assessment cohorts.",
          studyHoursWeekly: 20,
          bio: "Senior Mandarin Lecturer with 12 years of experience preparing students for HSK and oral exams.",
        },
      },
    },
  });

  const orgAdmin = await prisma.user.upsert({
    where: { email: "admin@oriental-edu.com" },
    update: {},
    create: {
      email: "admin@oriental-edu.com",
      passwordHash,
      name: "Director David Wang (王主任)",
      role: UserRole.ORG_ADMIN,
      emailVerified: true,
      profile: {
        create: {
          targetLevel: "Native",
          nativeLanguage: "Mandarin Chinese",
          learningGoal: "Institutional administration.",
          studyHoursWeekly: 0,
          bio: "Academic Director at Beijing Oriental Language Institute.",
        },
      },
    },
  });

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@aihsk.com" },
    update: {},
    create: {
      email: "superadmin@aihsk.com",
      passwordHash,
      name: "Platform Super Admin (系统管理员)",
      role: UserRole.SUPER_ADMIN,
      emailVerified: true,
    },
  });

  // 5. Demo Organization & Class
  console.log("Creating organization and class...");
  const org = await prisma.organization.upsert({
    where: { slug: "oriental-language-institute" },
    update: {},
    create: {
      name: "Beijing Oriental Language Academy",
      slug: "oriental-language-institute",
      domain: "oriental-edu.com",
      maxSeats: 150,
      maxAssessmentsPerMonth: 1200,
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: orgAdmin.id,
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      userId: orgAdmin.id,
      role: OrgRole.OWNER,
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: teacher.id,
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      userId: teacher.id,
      role: OrgRole.TEACHER,
    },
  });

  const demoClass = await prisma.class.upsert({
    where: { code: "ZH-SPRING-2026" },
    update: {},
    create: {
      name: "Intermediate Spoken Mandarin Cohort A",
      code: "ZH-SPRING-2026",
      teacherId: teacher.id,
      organizationId: org.id,
      description: "Targeted oral communication practice for HSK 3-4 candidates.",
      level: "Intermediate",
    },
  });

  await prisma.classMember.upsert({
    where: {
      classId_userId: {
        classId: demoClass.id,
        userId: learner.id,
      },
    },
    update: {},
    create: {
      classId: demoClass.id,
      userId: learner.id,
    },
  });

  // Assign an assessment to the class
  const assignment = await prisma.assessmentAssignment.create({
    data: {
      classId: demoClass.id,
      templateId: tplHsk3.id,
      assignedById: teacher.id,
      title: "Mid-Term Oral Proficiency Checkpoint",
      instructions: "Please complete all 5 stages of the spoken interview in a quiet room before Friday.",
      dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    },
  });

  // 6. Demo Completed Assessment Session & Report
  console.log("Creating completed demo assessment session & report...");
  const sampleSession = await prisma.assessmentSession.create({
    data: {
      id: "demo-session-101",
      userId: learner.id,
      templateId: tplHsk3.id,
      rubricId: defaultRubric.id,
      status: SessionStatus.COMPLETED,
      currentStage: 5,
      currentTurn: 6,
      totalTurns: 6,
      totalDurationSeconds: 480,
      startedAt: new Date(Date.now() - 3600 * 1000),
      completedAt: new Date(Date.now() - 3120 * 1000),
    },
  });

  // Turns
  const turnsData = [
    {
      turnIndex: 0,
      stage: 1,
      speaker: SpeakerType.EXAMINER,
      textContent: "你好！欢迎参加今天的华语口语评估。请问你准备好了吗？请先用中文简单介绍一下你自己吧。",
      pinyinContent: "Nǐ hǎo! Huānyíng cānjiā jīntiān de Huáyǔ kǒuyǔ pínggū. Qǐngwèn nǐ zhǔnbèi hǎo le ma? Qǐng xiān yòng zhōngwén jiǎndān jièshào yíxià nǐ zìjǐ ba.",
    },
    {
      turnIndex: 1,
      stage: 1,
      speaker: SpeakerType.LEARNER,
      textContent: "老师好，我准备好了！我叫陈明，来自美国，我学习中文快两年了。我非常喜欢中国历史和中国美食。",
      pinyinContent: "Lǎoshī hǎo, wǒ zhǔnbèi hǎo le! Wǒ jiào Chén Míng, láizì Měiguó, wǒ xuéxí zhōngwén kuài liǎng nián le. Wǒ fēicháng xǐhuan zhōngguó lìshǐ hé zhōngguó měishí.",
    },
    {
      turnIndex: 2,
      stage: 2,
      speaker: SpeakerType.EXAMINER,
      textContent: "很高兴认识你！陈明。在周末或者平时的空闲时间，你一般喜欢做些什么？你有什么特别的兴趣爱好吗？",
      pinyinContent: "Hěn gāoxìng rènshí nǐ! Chén Míng. Zài zhōumò huòzhě píngshí de kòngxián shíjiān, nǐ yībān xǐhuan zuò xiē shénme? Nǐ yǒu shénme tèbié de xìngqù àihào ma?",
    },
    {
      turnIndex: 3,
      stage: 2,
      speaker: SpeakerType.LEARNER,
      textContent: "我平时喜欢打篮球，也喜欢在网上看中文电视剧。比如《西游记》和一些现代的生活剧。因为有中文字幕，所以对提高我的听力和口语很有帮助。",
      pinyinContent: "Wǒ píngshí xǐhuan dǎ lánqiú, yě xǐhuan zài wǎngshàng kàn zhōngwén diànshìjù. Bǐrú Xīyóujì hé yìxiē xiàndài de shēnghuó jù. Yīnwèi yǒu zhōngwén zìmù, suǒyǐ duì tígāo wǒ de tīnglì hé kǒuyǔ hěn yǒu bāngzhù.",
    },
    {
      turnIndex: 4,
      stage: 3,
      speaker: SpeakerType.EXAMINER,
      textContent: "现在很多年轻人喜欢利用手机和人工智能软件来学习外语。你认为利用科技学习中文有什么优势？它是否可以完全代替传统的老师呢？",
      pinyinContent: "Xiànzài hěn duō niánqīng rén xǐhuan lìyòng shǒujī hé réngōng zhìnéng ruǎnjiàn lái xuéxí wàiyǔ. Nǐ rènwéi lìyòng kējì xuéxí zhōngwén yǒu shénme yōushì? Tā shìfǒu kěyǐ wánquán dàitì chuántǒng de lǎoshī ne?",
    },
    {
      turnIndex: 5,
      stage: 3,
      speaker: SpeakerType.LEARNER,
      textContent: "我认为科技有很多好处，比如可以随时随地练习发音，非常方便。但是我认为它不能完全代替老师，因为真正的老师可以和我们有情感交流，能根据我们的情况提出针对性的建议。",
      pinyinContent: "Wǒ rènwéi kējì yǒu hěn duō hǎochu, bǐrú kěyǐ suíshí suídì liànxí fāyīn, fēicháng fāngbiàn. Dànshì wǒ rènwéi tā bùnéng wánquán dàitì lǎoshī, yīnwèi zhēnzhèng de lǎoshī kěyǐ hé wǒmen yǒu qínggǎn jiāoliú, néng gēnjù wǒmen de qíngkuàng tíchū zhēnduìxìng de jiànyì.",
    },
  ];

  for (const t of turnsData) {
    await prisma.conversationTurn.create({
      data: {
        sessionId: sampleSession.id,
        turnIndex: t.turnIndex,
        stage: t.stage,
        speaker: t.speaker,
        textContent: t.textContent,
        pinyinContent: t.pinyinContent,
      },
    });
  }

  // Result
  const sampleResult = await prisma.assessmentResult.create({
    data: {
      sessionId: sampleSession.id,
      overallScore: 84.5,
      cefrEstimate: "B2",
      hskEstimate: "HSK 4 (Unofficial)",
      performanceSummary: "Candidate Alex Chen demonstrated strong, confident communicative competence across all five examination stages. He sustained fluent turn-taking, articulated clear tones with solid four-tone distinction, and effectively employed connective structures such as 因为...所以 and 虽然...但是 to elaborate opinions.",
      confidenceLevel: 0.95,
      isAcousticAided: true,
      strengthsJson: [
        "Consistent communicative flow without prolonged awkward hesitations.",
        "Accurate usage of subordinating connectives ('因为...所以', '但是', '针对性的建议').",
        "Clear articulation of tones 1, 2, and 4 in connected speech.",
      ],
      weaknessesJson: [
        "Third tone sandhi occasionally flattens during complex thoughts.",
        "Colloquial verb repetition ('用', '做') where formal register could be deployed.",
        "Word order in complex time-adverb clauses needs fine-tuning.",
      ],
      priorityAreasJson: [
        "Third tone sandhi stabilization (e.g. 了解, 可以, 很好).",
        "Integration of formal discourse markers (总而言之, 综上所述).",
        "Mastery of the '把' construction (把字句) for active agent displacement.",
      ],
      improvementPlanJson: [
        { week: 1, title: "Tone Sandhi Precision", focus: "Tone contour drills", activities: ["Shadowing 15 mins daily", "Pitch recorder feedback"] },
        { week: 2, title: "Syntactic Complexity", focus: "把字句 & 被动句", activities: ["10 oral sentences daily", "Narrative retelling"] },
        { week: 3, title: "Thematic Vocabulary", focus: "Education & Tech Terminology", activities: ["HSK 4/5 word list exercises", "Mini debate presentation"] },
        { week: 4, title: "Mock Diagnostic Re-evaluation", focus: "Full exam replay", activities: ["Retake Classnia assessment", "Track radar chart delta"] },
      ],
    },
  });

  // Score Dimensions
  const dims = [
    { key: "pronunciation", name: "Pronunciation & Tones (发音与声调)", weight: 0.20, score: 17.5, maxScore: 20, perf: "Proficient", rationale: "Vowel clarity and initial consonant articulation are consistent. Tones 1, 2, and 4 are well distinguished." },
    { key: "fluency", name: "Fluency & Speech Rhythm (流利度与语速连贯)", weight: 0.20, score: 17.0, maxScore: 20, perf: "Proficient", rationale: "Natural cadence with minimal filler pauses. Average sentence length exceeded 25 characters per turn." },
    { key: "vocabulary", name: "Vocabulary Range (词汇广度与得体度)", weight: 0.15, score: 12.5, maxScore: 15, perf: "Proficient", rationale: "Appropriate deployment of domain vocabulary (人工智能, 针对性, 情感交流)." },
    { key: "grammar", name: "Grammar & Syntax (语法结构与准确度)", weight: 0.15, score: 13.0, maxScore: 15, perf: "Proficient", rationale: "Accurate connective pairing and consistent subject-predicate-object structure." },
    { key: "coherence", name: "Coherence & Discourse (篇章连贯与逻辑结构)", weight: 0.10, score: 8.5, maxScore: 10, perf: "Mastery", rationale: "Smooth transitions from opinion to supporting arguments and examples." },
    { key: "comprehension", name: "Listening Comprehension (听力理解与应答切题)", weight: 0.10, score: 9.0, maxScore: 10, perf: "Mastery", rationale: "Candidate addressed both parts of the multi-part question directly." },
    { key: "interaction", name: "Interactive Dialogue (互动表达与深层展开)", weight: 0.10, score: 8.0, maxScore: 10, perf: "Proficient", rationale: "Active communication, warm interaction tone, and willingness to elaborate." },
  ];

  for (const d of dims) {
    await prisma.scoreDimension.create({
      data: {
        resultId: sampleResult.id,
        dimensionKey: d.key,
        dimensionName: d.name,
        weight: d.weight,
        score: d.score,
        maxScore: d.maxScore,
        performanceLevel: d.perf,
        evidenceQuotesJson: ['"我认为科技有很多好处，比如可以随时随地练习发音..."', '"真正的老师可以和我们有情感交流..."'],
        rationale: d.rationale,
        suggestionsJson: ["Review third-tone sandhi rules in connected speech.", "Deploy more HSK 4 idioms."],
      },
    });
  }

  // Recommendations
  await prisma.learningRecommendation.create({
    data: {
      resultId: sampleResult.id,
      category: RecommendationCategory.GRAMMAR,
      originalPhrase: "我学习中文快两年了。",
      correctedPhrase: "我已经学了快两年的中文了。",
      explanation: "Using the double '了' pattern (已经...了) highlights the continuous duration from the past extending into the present.",
      exampleSentence: "他已经在北京生活了三年了。",
      priority: 1,
    },
  });

  await prisma.learningRecommendation.create({
    data: {
      resultId: sampleResult.id,
      category: RecommendationCategory.VOCABULARY,
      originalPhrase: "有很多好处",
      correctedPhrase: "具备诸多显著优势",
      explanation: "Elevate casual '很多好处' to formal academic written vocabulary in argumentative stages.",
      exampleSentence: "数字化教学模式具备诸多显著优势。",
      priority: 2,
    },
  });

  await prisma.learningRecommendation.create({
    data: {
      resultId: sampleResult.id,
      category: RecommendationCategory.PRONUNCIATION,
      originalPhrase: "三声变调 (Third Tone Sandhi)",
      correctedPhrase: "可以 (kěyǐ -> kéyǐ), 了解 (liǎojiě -> liáojiě)",
      explanation: "Consecutive third tones must shift the preceding syllable to second tone for natural native cadence.",
      exampleSentence: "你好、手表、可以、领导",
      priority: 1,
    },
  });

  // Assign Pro subscription to learner
  await prisma.subscription.create({
    data: {
      userId: learner.id,
      planId: proPlan.id,
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    },
  });

  // Default AI Provider Configuration: HHTECH.API Gateway
  console.log("Configuring HHTECH.API Gateway...");
  const existingAIConfig = await prisma.aIProviderConfiguration.findFirst({
    where: { providerType: "LLM", isDefault: true },
  });
  if (!existingAIConfig) {
    await prisma.aIProviderConfiguration.create({
      data: {
        providerType: "LLM",
        providerName: "hhtech",
        modelId: "claude-sonnet-4.6",
        isEnabled: true,
        isDefault: true,
        configJson: {
          baseUrl: "https://hhtechapi.net/v1",
          apiKey: process.env.HHTECH_API_KEY || "",
          temperature: 0.7,
          notes: "Pre-configured HHTECH.API Gateway (Claude, GPT, Gemini, DeepSeek)",
        },
      },
    });
  }

  console.log("✅ Seeding completed successfully!");
  console.log("--------------------------------------------------");
  console.log("Demo Accounts created:");
  console.log("🧑‍🎓 Learner:      learner@aihsk.com      / Password123!");
  console.log("👨‍🏫 Teacher:      teacher@aihsk.com      / Password123!");
  console.log("🏢 Org Admin:    admin@oriental-edu.com / Password123!");
  console.log("👑 Super Admin:  superadmin@aihsk.com   / Password123!");
  console.log("--------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
