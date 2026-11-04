import { pinyin } from "pinyin-pro";

export interface KeyVocabItem {
  zh: string;
  pinyin: string;
  vi: string;
}

export interface PracticeQuestion {
  id: string;
  category: "REFLEX" | "DAILY" | "DEEP_DIVE" | "DEBATE" | "UPGRADE";
  categoryLabel: string;
  badgeColor: string;
  questionZh: string;
  pinyin: string;
  questionVi: string;
  modelAnswerZh: string;
  modelAnswerPinyin: string;
  modelAnswerVi: string;
  keyVocab: KeyVocabItem[];
  grammarTip?: string;
}

export function generatePinyinString(text: string): string {
  if (!text) return "";
  try {
    return pinyin(text, { toneType: "symbol", type: "string" });
  } catch {
    return "";
  }
}

/**
 * Curated knowledge base of contextual post-assessment practice banks for key HSK oral topics.
 */
const TOPIC_PRESETS: Record<
  string,
  Array<{
    category: PracticeQuestion["category"];
    categoryLabel: string;
    badgeColor: string;
    questionZh: string;
    questionVi: string;
    modelAnswerZh: string;
    modelAnswerVi: string;
    keyVocab: { zh: string; vi: string }[];
    grammarTip?: string;
  }>
> = {
  // Food & Dining
  food: [
    {
      category: "REFLEX",
      categoryLabel: "Phản xạ tức thì • Gọi món & Đổi món",
      badgeColor: "rose",
      questionZh: "服务员，这道菜太辣了，能帮我换一道不辣的吗？",
      questionVi: "Bồi bàn ơi, món này cay quá, có thể đổi giúp tôi một món không cay được không?",
      modelAnswerZh: "服务员，实在不好意思，我不太能吃辣。请问这道水煮牛肉可以帮我换成清淡一点的番茄炒蛋或者清蒸鱼吗？谢谢！",
      modelAnswerVi: "Phục vụ ơi, thật ngại quá, tôi không ăn cay được lắm. Xin hỏi món thịt bò cay này có thể đổi cho tôi món thanh đạm hơn như trứng xào cà chua hoặc cá hấp không? Cảm ơn bạn!",
      keyVocab: [
        { zh: "不太能吃辣", vi: "Không ăn cay được lắm" },
        { zh: "清淡", vi: "Thanh đạm, ít dầu mỡ" },
        { zh: "清蒸", vi: "Hấp chín nguyên vị" },
      ],
      grammarTip: "Mẫu câu đề nghị lịch sự: 请问...可以帮我...吗？",
    },
    {
      category: "DAILY",
      categoryLabel: "Giao tiếp đời sống • Khẩu vị quê hương",
      badgeColor: "emerald",
      questionZh: "在你的家乡，人们平时最喜欢吃什么特色菜？它的味道如何？",
      questionVi: "Ở quê hương bạn, mọi người thường thích ăn món đặc sản nào nhất? Hương vị của nó ra sao?",
      modelAnswerZh: "在我的家乡岘港，最有名的是广南米粉。米粉口感很有嚼劲，搭配浓郁的花生肉汤和新鲜蔬菜，吃起来香而不腻，非常爽口。",
      modelAnswerVi: "Ở quê tôi Đà Nẵng, nổi tiếng nhất là Mì Quảng. Sợi mì có độ dai giòn, kết hợp nước dùng đậu phộng đậm đà và rau sống tươi mát, ăn rất thơm mà không ngấy, cực kỳ ngon miệng.",
      keyVocab: [
        { zh: "特色菜", vi: "Món ăn đặc sản" },
        { zh: "有嚼劲", vi: "Có độ dai ngon vừa phải" },
        { zh: "香而不腻", vi: "Thơm phức mà không bị ngấy" },
      ],
      grammarTip: "Mẫu miêu tả: 搭配...，吃起来...",
    },
    {
      category: "DEEP_DIVE",
      categoryLabel: "Thuyết trình chủ đề • Văn hóa bàn ăn",
      badgeColor: "blue",
      questionZh: "你觉得中国人请客吃饭和你们国家的餐饮文化有什么不同？",
      questionVi: "Bạn nghĩ văn hóa mời cơm đãi khách của người Trung Quốc và nước bạn có điểm gì khác biệt?",
      modelAnswerZh: "我觉得最大的不同在于餐桌礼仪。中国人在宴席上非常讲究座次和热情劝菜，大家习惯合餐共食，热闹非凡；而在西方或部分国家，人们更注重分餐制和个人空间。",
      modelAnswerVi: "Tôi nghĩ điểm khác biệt lớn nhất nằm ở lễ nghi bàn tiệc. Người Trung Quốc rất coi trọng thứ tự chỗ ngồi và nhiệt tình gắp thức ăn cho khách, mọi người quen ăn chung mâm tạo không khí ấm cúng náo nhiệt; trong khi ở phương Tây thì chuộng ăn theo đĩa riêng và tôn trọng không gian cá nhân hơn.",
      keyVocab: [
        { zh: "餐桌礼仪", vi: "Nghi thức phép tắc bàn ăn" },
        { zh: "合餐制", vi: "Chế độ ăn chung mâm" },
        { zh: "热闹非凡", vi: "Náo nhiệt tưng bừng" },
      ],
      grammarTip: "Mẫu so sánh đối chiếu: 最大的不同在于...；而在...更注重...",
    },
    {
      category: "DEBATE",
      categoryLabel: "Phản biện tình huống • Đồ ăn nhanh vs Nấu tại nhà",
      badgeColor: "amber",
      questionZh: "有人认为现代年轻人点外卖方便快捷，没必要自己下厨，你怎么看？",
      questionVi: "Có người cho rằng người trẻ hiện đại gọi đồ ăn ngoài tiện lợi nhanh chóng, không cần phải tự nấu ăn, bạn nhìn nhận thế nào?",
      modelAnswerZh: "虽然点外卖确实节省时间，但长期来看，高油高盐的外卖不利于身体健康。自己下厨不仅更卫生营养，还能当成一种放松身心的生活情趣。",
      modelAnswerVi: "Mặc dù gọi đồ ăn ngoài quả thật tiết kiệm thời gian, nhưng về lâu dài, thức ăn ngoài nhiều dầu muối không tốt cho sức khỏe. Tự nấu nướng không chỉ vệ sinh, dinh dưỡng hơn mà còn là một thú vui giải tỏa căng thẳng trong cuộc sống.",
      keyVocab: [
        { zh: "节省时间", vi: "Tiết kiệm thời gian" },
        { zh: "高油高盐", vi: "Nhiều dầu mỡ và mặn" },
        { zh: "生活情趣", vi: "Thú vui phong vị cuộc sống" },
      ],
      grammarTip: "Mẫu phản biện nhượng bộ: 虽然...确实...，但长期来看...不仅...还...",
    },
    {
      category: "UPGRADE",
      categoryLabel: "Nâng cấp HSK cao cấp • Thành ngữ ẩm thực",
      badgeColor: "purple",
      questionZh: "请用中文成语或者谚语，谈谈你对“民以食为天”这句话的理解。",
      questionVi: "Hãy dùng thành ngữ hoặc tục ngữ tiếng Trung để chia sẻ cách hiểu của bạn về câu 'Dân dĩ thực vi thiên' (Người dân coi miếng ăn là trời).",
      modelAnswerZh: "“民以食为天”生动体现了饮食在人们生活中的崇高地位。中国饮食讲究“色香味俱全”，吃饭不仅是满足温饱，更是家人团聚、寄托情感的重要桥梁。",
      modelAnswerVi: "'Dân dĩ thực vi thiên' thể hiện sinh động vị trí tối thượng của ẩm thực trong đời sống. Ẩm thực Trung Hoa coi trọng 'sắc hương vị vẹn toàn', ăn cơm không chỉ để no bụng mà còn là cầu nối sum họp gia đình và gửi gắm tình cảm thiêng liêng.",
      keyVocab: [
        { zh: "民以食为天", vi: "Người dân lấy ăn làm gốc trọng" },
        { zh: "色香味俱全", vi: "Đầy đủ màu sắc, hương thơm, mùi vị" },
        { zh: "满足温饱", vi: "Thỏa mãn nhu cầu no ấm" },
      ],
      grammarTip: "Mẫu đúc kết nâng cao: 不仅是...，更是...的重要桥梁。",
    },
  ],

  // Travel & Transport
  travel: [
    {
      category: "REFLEX",
      categoryLabel: "Phản xạ tức thì • Hỏi đường & Đặt vé",
      badgeColor: "rose",
      questionZh: "请问去高铁站最近的地铁口在哪里？步行需要多久？",
      questionVi: "Xin hỏi lối vào ga tàu điện ngầm gần nhất đến ga tàu cao tốc ở đâu? Đi bộ mất bao lâu?",
      modelAnswerZh: "您好，您直走经过红绿灯，往右拐大概一百米就能看到地铁A出口。步行大概五分钟左右，非常方便。",
      modelAnswerVi: "Chào bạn, bạn đi thẳng qua ngã tư đèn đỏ, rẽ phải tầm 100m là thấy cửa ra A của tàu điện ngầm. Đi bộ chỉ khoảng 5 phút, rất tiện lợi.",
      keyVocab: [
        { zh: "红绿灯", vi: "Đèn giao thông" },
        { zh: "往右拐", vi: "Rẽ về bên phải" },
        { zh: "大概...左右", vi: "Khoảng chừng..." },
      ],
      grammarTip: "Chỉ đường: 直走经过...，往...拐大概...就能...",
    },
    {
      category: "DAILY",
      categoryLabel: "Giao tiếp đời sống • Kỷ niệm chuyến đi",
      badgeColor: "emerald",
      questionZh: "去过让你印象最深的一个旅游城市是哪里？为什么？",
      questionVi: "Thành phố du lịch để lại ấn tượng sâu sắc nhất với bạn là ở đâu? Vì sao?",
      modelAnswerZh: "让我印象最深的是北京。那里既有巍峨宏伟的故宫和万里长城，又有充满现代感的高楼大厦，古今交融的气息非常吸引我。",
      modelAnswerVi: "Nơi gây ấn tượng nhất với tôi là Bắc Kinh. Nơi đó vừa có Cố Cung sừng sững uy nghiêm và Vạn Lý Trường Thành, lại vừa có các tòa cao ốc hiện đại, khí chất giao hòa giữa cổ kính và hiện đại thu hút tôi vô cùng.",
      keyVocab: [
        { zh: "印象深刻", vi: "Ấn tượng sâu sắc" },
        { zh: "巍峨宏伟", vi: "Uy nghi, đồ sộ, kỳ vĩ" },
        { zh: "古今交融", vi: "Giao thoa giữa cổ xưa và hiện đại" },
      ],
      grammarTip: "Mẫu câu song hành: 既有...，又有...，...非常吸引我。",
    },
    {
      category: "DEEP_DIVE",
      categoryLabel: "Thuyết trình chủ đề • Lợi ích của du lịch",
      badgeColor: "blue",
      questionZh: "有人说“读万卷书不如行万里路”，谈谈你对旅行意义的看法。",
      questionVi: "Có câu 'Đọc vạn cuốn sách không bằng đi vạn dặm đường', hãy chia sẻ góc nhìn của bạn về ý nghĩa của du lịch.",
      modelAnswerZh: "我认为旅行不仅能让我们欣赏壮丽的自然风光，更重要的是让我们走出舒适圈，亲身体验不同地域的民俗文化，从而拥有更加宽广包容的心态。",
      modelAnswerVi: "Tôi cho rằng du lịch không chỉ giúp ngắm nhìn cảnh sắc thiên nhiên hùng vĩ, mà quan trọng hơn là giúp ta bước ra khỏi vùng an toàn, tận mắt trải nghiệm phong tục tập quán các vùng miền, từ đó có một tâm thế rộng mở và bao dung hơn.",
      keyVocab: [
        { zh: "读万卷书不如行万里路", vi: "Đi một ngày đàng học một sàng khôn" },
        { zh: "走出舒适圈", vi: "Bước ra khỏi vùng an toàn" },
        { zh: "宽广包容", vi: "Rộng lượng, cởi mở bao dung" },
      ],
      grammarTip: "Cấu trúc chiều sâu: 不仅能...，更重要的是...，从而...",
    },
    {
      category: "DEBATE",
      categoryLabel: "Phản biện tình huống • Tự túc vs Theo tour",
      badgeColor: "amber",
      questionZh: "你更倾向于自由行还是跟团旅游？请说明各自的利弊。",
      questionVi: "Bạn nghiêng về du lịch tự túc hay đi theo đoàn du lịch? Hãy nêu rõ lợi - hại của từng hình thức.",
      modelAnswerZh: "我个人更偏向于自由行。自由行行程灵活自由，可以深入大街小巷；跟团游虽然省心省力，但往往走马观花，受时间约束过大。",
      modelAnswerVi: "Cá nhân tôi thiên về du lịch tự túc hơn. Tự túc lịch trình linh hoạt, có thể tự do khám phá từng con phố nhỏ; đi theo tour tuy nhàn đầu nhàn sức nhưng lại thường cưỡi ngựa xem hoa, bị bó buộc thời gian quá nhiều.",
      keyVocab: [
        { zh: "自由行", vi: "Du lịch tự túc" },
        { zh: "走马观花", vi: "Cưỡi ngựa xem hoa, xem lướt" },
        { zh: "受约束", vi: "Bị gò bó, trói buộc" },
      ],
      grammarTip: "So sánh đối lập: 虽然...，但往往...，受...约束。",
    },
    {
      category: "UPGRADE",
      categoryLabel: "Nâng cấp HSK cao cấp • Du lịch bền vững",
      badgeColor: "purple",
      questionZh: "针对过度旅游（Overtourism）对当地生态带来的破坏，你有什么改进建议？",
      questionVi: "Đối với hiện tượng quá tải du lịch gây tổn hại cho hệ sinh thái bản địa, bạn có đề xuất cải thiện nào?",
      modelAnswerZh: "地方政府应当采取预约限流机制，并大力提倡绿色低碳生态游。同时，游客应自觉保护古迹与自然环境，做到文明出游，和谐共生。",
      modelAnswerVi: "Chính quyền địa phương nên áp dụng cơ chế đặt lịch giới hạn lượng khách, đồng thời tích cực thúc đẩy du lịch sinh thái xanh phát thải thấp. Song song đó, du khách phải tự giác bảo vệ di tích và môi trường, hướng đến du lịch văn minh, chung sống hài hòa.",
      keyVocab: [
        { zh: "预约限流", vi: "Đặt lịch hẹn khống chế lưu lượng khách" },
        { zh: "绿色低碳", vi: "Xanh sạch, phát thải carbon thấp" },
        { zh: "和谐共生", vi: "Chung sống hài hòa" },
      ],
      grammarTip: "Đề xuất giải pháp chính luận: ...应当采取...机制，并大力提倡...。同时，...应做到...",
    },
  ],

  // Work & Career
  work: [
    {
      category: "REFLEX",
      categoryLabel: "Phản xạ tức thì • Phỏng vấn xin việc",
      badgeColor: "rose",
      questionZh: "请用两到三句话，简要概括你在工作中最突出的核心优势。",
      questionVi: "Hãy dùng 2-3 câu khái quát ngắn gọn ưu thế cốt lõi nổi bật nhất của bạn trong công việc.",
      modelAnswerZh: "我最大的优势是出色的跨部门沟通协调能力和快速学习能力。面对高压紧急任务时，我能保持冷静，条理清晰地推动项目高效落地。",
      modelAnswerVi: "Ưu thế lớn nhất của tôi là khả năng điều phối giao tiếp liên phòng ban xuất sắc cùng năng lực tự học siêu tốc. Khi đối diện nhiệm vụ khẩn cấp áp lực cao, tôi luôn giữ được sự bình tĩnh, mạch lạc để thúc đẩy dự án cán đích hiệu quả.",
      keyVocab: [
        { zh: "沟通协调能力", vi: "Năng lực giao tiếp điều phối" },
        { zh: "条理清晰", vi: "Mạch lạc đâu ra đấy" },
        { zh: "推动项目落地", vi: "Thúc đẩy dự án triển khai thành công" },
      ],
      grammarTip: "Giới thiệu điểm mạnh: 我最大的优势是...。面对...时，我能...",
    },
    {
      category: "DAILY",
      categoryLabel: "Giao tiếp đời sống • Cân bằng công việc & Cuộc sống",
      badgeColor: "emerald",
      questionZh: "当遇到工作压力很大或者需要加班时，你通常如何调节自己的状态？",
      questionVi: "Khi gặp áp lực công việc quá lớn hoặc phải tăng ca, bạn thường điều chỉnh trạng thái tinh thần thế nào?",
      modelAnswerZh: "遇到压力时，我会先按重要紧急程度给任务排序，避免手忙脚乱。下班后我会去跑步或听听轻松的音乐，把工作和个人生活彻底隔开。",
      modelAnswerVi: "Khi gặp áp lực, trước tiên tôi sẽ phân loại thứ tự nhiệm vụ theo mức độ quan trọng khẩn cấp để tránh cuống cuồng. Tan làm tôi sẽ đi chạy bộ hoặc nghe nhạc thư giãn để tách bạch hoàn toàn công việc khỏi cuộc sống.",
      keyVocab: [
        { zh: "重要紧急程度", vi: "Mức độ quan trọng khẩn cấp" },
        { zh: "手忙脚乱", vi: "Luống cuống chân tay" },
        { zh: "彻底隔开", vi: "Tách bạch triệt để" },
      ],
      grammarTip: "Mẫu trình tự hành động: 会先...，避免...。之后会...，把...彻底...",
    },
    {
      category: "DEEP_DIVE",
      categoryLabel: "Thuyết trình chủ đề • Kỹ năng thế kỷ 21",
      badgeColor: "blue",
      questionZh: "在人工智能（AI）时代，你认为哪些职场能力是机器永远无法替代的？",
      questionVi: "Trong kỷ nguyên trí tuệ nhân tạo (AI), bạn nghĩ năng lực nơi công sở nào là thứ máy móc vĩnh viễn không thể thay thế?",
      modelAnswerZh: "我认为同理心、批判性思维以及复杂的团队领导力是AI无法替代的核心素养。AI可以高效处理数据，但无法深刻理解人类情感与建立长久信任。",
      modelAnswerVi: "Tôi cho rằng sự thấu cảm, tư duy phản biện cùng năng lực lãnh đạo đội nhóm phức tạp là những tố chất cốt lõi AI không thể thay thế. AI xử lý dữ liệu rất nhanh, nhưng không thể thấu hiểu sâu sắc cảm xúc con người và thiết lập niềm tin bền vững.",
      keyVocab: [
        { zh: "同理心", vi: "Sự thấu cảm, đồng cảm" },
        { zh: "批判性思维", vi: "Tư duy phản biện" },
        { zh: "核心素养", vi: "Tố chất phẩm chất cốt lõi" },
      ],
      grammarTip: "Mẫu so sánh nhân tạo vs con người: ...是AI无法替代的...。AI可以...，但无法...",
    },
    {
      category: "DEBATE",
      categoryLabel: "Phản biện tình huống • Nhảy việc vs Gắn bó lâu dài",
      badgeColor: "amber",
      questionZh: "年轻人频繁换工作（跳槽）更有利于职业成长，还是在一个公司深耕更好？",
      questionVi: "Người trẻ thường xuyên đổi việc (nhảy việc) có lợi hơn cho sự nghiệp, hay gắn bó sâu tại một công ty tốt hơn?",
      modelAnswerZh: "我认为这取决于职业发展阶段。刚毕业的前几年适度跳槽有助于拓宽行业视野；但想要成为某个领域的顶尖专家，必须在一个方向上长期深耕沉淀。",
      modelAnswerVi: "Tôi nghĩ điều này phụ thuộc vào từng giai đoạn sự nghiệp. Mấy năm đầu mới ra trường nhảy việc vừa phải giúp mở rộng tầm nhìn ngành nghề; nhưng muốn trở thành chuyên gia đầu ngành trong lĩnh vực nào đó, bắt buộc phải đào sâu tích lũy dài hạn theo một định hướng.",
      keyVocab: [
        { zh: "跳槽", vi: "Nhảy việc, chuyển công ty" },
        { zh: "拓宽视野", vi: "Mở rộng tầm nhìn" },
        { zh: "深耕沉淀", vi: "Đào sâu tích lũy bền bỉ" },
      ],
      grammarTip: "Phân tích 2 mặt: 这取决于...。刚...有助于...；但想要...，必须...",
    },
    {
      category: "UPGRADE",
      categoryLabel: "Nâng cấp HSK cao cấp • Văn hóa quản trị doanh nghiệp",
      badgeColor: "purple",
      questionZh: "请探讨一下“狼性文化”与“以人为本”两种企业管理理念在实践中的得与失。",
      questionVi: "Hãy luận bàn về cái được và cái mất trong thực tiễn của 2 triết lý quản trị doanh nghiệp: 'Văn hóa bầy sói' và 'Lấy con người làm gốc'.",
      modelAnswerZh: "“狼性文化”在短期内能激发团队拼搏精神、迅速开拓市场，但易导致员工身心疲惫；“以人为本”注重人文关怀与可持续发展，能凝聚核心人才，两者应当兼收并蓄。",
      modelAnswerVi: "'Văn hóa bầy sói' trong ngắn hạn kích thích tinh thần chiến đấu của đội ngũ, nhanh chóng mở rộng thị trường, nhưng dễ khiến nhân viên kiệt sức; 'Lấy con người làm gốc' chú trọng quan tâm nhân văn và phát triển bền vững, giữ chân nhân tài cốt lõi, doanh nghiệp nên biết dung hòa cả hai.",
      keyVocab: [
        { zh: "拼搏精神", vi: "Tinh thần chiến đấu kiên cường" },
        { zh: "以人为本", vi: "Lấy con người làm gốc" },
        { zh: "兼收并蓄", vi: "Dung hòa thâu nạp điểm hay của cả hai" },
      ],
      grammarTip: "Mẫu so sánh triết lý quản trị: ...在短期内能...，但易导致...；而...注重...，两者应当兼收并蓄。",
    },
  ],
};

/**
 * Universal Fallback Generator for any custom exam topic
 */
function generateDynamicTopicQuestions(topicName: string, level: string): PracticeQuestion[] {
  const safeTopic = topicName || "Chủ đề Khảo thí Khẩu ngữ";

  const rawList = [
    {
      category: "REFLEX" as const,
      categoryLabel: "Phản xạ nhanh • Tình huống trọng điểm",
      badgeColor: "rose",
      questionZh: `围绕“${safeTopic}”，如果对方询问你的基本看法，你会怎么用一句话直接表明态度？`,
      questionVi: `Xoay quanh chủ đề "${safeTopic}", nếu đối phương hỏi quan điểm cơ bản của bạn, bạn sẽ dùng một câu trực diện thế nào để bày tỏ thái độ?`,
      modelAnswerZh: `在我看来，“${safeTopic}”是当前非常值得关注的议题，它不仅影响着我们的日常生活，更关系到未来的长远发展。`,
      modelAnswerVi: `Theo góc nhìn của tôi, "${safeTopic}" là một vấn đề rất đáng lưu tâm hiện nay, nó không chỉ ảnh hưởng đến đời sống thường nhật mà còn liên quan mật thiết đến sự phát triển lâu dài trong tương lai.`,
      keyVocab: [
        { zh: "值得关注", vi: "Rất đáng quan tâm chú ý" },
        { zh: "长远发展", vi: "Phát triển lâu dài bền vững" },
      ],
      grammarTip: "Mẫu khẳng định lập trường: 在我看来，...不仅影响着...，更关系到...",
    },
    {
      category: "DAILY" as const,
      categoryLabel: "Giao tiếp đời sống • Trải nghiệm cá nhân",
      badgeColor: "emerald",
      questionZh: `在你的日常生活中，你或者你身边的朋友有没有遇到过与“${safeTopic}”密切相关的经历？`,
      questionVi: `Trong đời sống hàng ngày, bạn hoặc bạn bè xung quanh đã từng có trải nghiệm nào gắn liền với "${safeTopic}" chưa?`,
      modelAnswerZh: `有的。平时我和身边的朋友经常会交流有关“${safeTopic}”的看法，这让我们在遇到具体问题时，能够互相借鉴经验，少走很多弯路。`,
      modelAnswerVi: `Có chứ. Thường ngày tôi và bạn bè hay trao đổi quan điểm về "${safeTopic}", điều này giúp chúng tôi khi gặp các vấn đề cụ thể có thể học hỏi kinh nghiệm lẫn nhau, tránh được nhiều sai lầm không đáng có.`,
      keyVocab: [
        { zh: "互相借鉴", vi: "Tham khảo học hỏi lẫn nhau" },
        { zh: "少走弯路", vi: "Tránh được đường vòng vất vả, bớt vấp ngã" },
      ],
      grammarTip: "Mẫu kể chuyện trải nghiệm: 这让我们在...时，能够...，少走很多弯路。",
    },
    {
      category: "DEEP_DIVE" as const,
      categoryLabel: "Thuyết trình chuyên sâu • Phân tích nguyên nhân & Dẫn chứng",
      badgeColor: "blue",
      questionZh: `请从两到三个方面，详细分析为什么“${safeTopic}”在现代社会中越来越受到大家的重视？`,
      questionVi: `Hãy phân tích từ 2-3 khía cạnh tại sao "${safeTopic}" ngày càng được mọi người đặc biệt coi trọng trong xã hội hiện đại?`,
      modelAnswerZh: `主要原因有两点：首先，随着科技与社会的快速进步，“${safeTopic}”直接关系到每个人的生活质量；其次，它推动了相关领域的创新与变革，具有极高的实用价值。`,
      modelAnswerVi: `Nguyên nhân chính có hai điểm: Thứ nhất, cùng với sự tiến bộ mau chóng của công nghệ và xã hội, "${safeTopic}" liên quan trực tiếp đến chất lượng cuộc sống mỗi người; Thứ hai, nó thúc đẩy sự đổi mới sáng tạo trong các lĩnh vực liên quan, mang giá trị thực tiễn rất cao.`,
      keyVocab: [
        { zh: "生活质量", vi: "Chất lượng cuộc sống" },
        { zh: "创新与变革", vi: "Đổi mới và cách tân" },
        { zh: "实用价值", vi: "Giá trị ứng dụng thực tiễn" },
      ],
      grammarTip: "Mẫu luận điểm phân tầng: 主要原因有两点：首先，...；其次，...",
    },
    {
      category: "DEBATE" as const,
      categoryLabel: "Phản biện tình huống • Quan điểm trái chiều",
      badgeColor: "amber",
      questionZh: `关于“${safeTopic}”，有人持完全积极乐观的态度，也有人抱有担忧与疑虑。你更赞同哪一方？为什么？`,
      questionVi: `Về "${safeTopic}", có người giữ thái độ hoàn toàn tích cực lạc quan, lại có người lo ngại hoài nghi. Bạn đồng tình với bên nào hơn? Vì sao?`,
      modelAnswerZh: `我认为应当客观看待。任何事物都具有两面性，对于“${safeTopic}”，我们既要积极拥抱它带来的便利与机遇，同时也要制定合理的规则，防范可能出现的潜在风险。`,
      modelAnswerVi: `Tôi nghĩ cần nhìn nhận một cách khách quan. Bất cứ sự vật nào cũng có hai mặt của nó, đối với "${safeTopic}", chúng ta vừa phải tích cực đón nhận những tiện lợi và cơ hội mà nó mang lại, đồng thời cũng phải đặt ra quy tắc hợp lý để phòng ngừa những rủi ro tiềm ẩn.`,
      keyVocab: [
        { zh: "客观看待", vi: "Nhìn nhận khách quan" },
        { zh: "两面性", vi: "Tính chất hai mặt của sự việc" },
        { zh: "防范潜在风险", vi: "Phòng ngừa rủi ro tiềm ẩn" },
      ],
      grammarTip: "Mẫu phản biện biện chứng: 任何事物都具有两面性，我们既要...，同时也要...",
    },
    {
      category: "UPGRADE" as const,
      categoryLabel: "Nâng cấp HSK cao cấp • Tầm nhìn tương lai",
      badgeColor: "purple",
      questionZh: `展望未来五到十年，你认为“${safeTopic}”将会呈现怎样的发展趋势？我们应该做好哪些准备？`,
      questionVi: `Nhìn về 5-10 năm tới, bạn nghĩ "${safeTopic}" sẽ có xu hướng phát triển thế nào? Chúng ta nên chuẩn bị những gì?`,
      modelAnswerZh: `展望未来，“${safeTopic}”必将向着更加智能化、规范化和普惠化的方向迈进。作为学习者，我们应当保持终身学习的热情，与时俱进，不断提升自己的综合素养。`,
      modelAnswerVi: `Nhìn về tương lai, "${safeTopic}" chắc chắn sẽ tiến bước theo hướng ngày càng thông minh hóa, chuẩn hóa và phổ cập rộng rãi hơn. Là người học, chúng ta nên duy trì ngọn lửa học tập suốt đời, bắt kịp thời đại và không ngừng nâng cao tố chất toàn diện của bản thân.`,
      keyVocab: [
        { zh: "终身学习", vi: "Học tập suốt đời" },
        { zh: "与时俱进", vi: "Bắt kịp thời đại, tiến cùng thời đại" },
        { zh: "综合素养", vi: "Năng lực, tố chất toàn diện" },
      ],
      grammarTip: "Mẫu kết bài định hướng tương lai: 展望未来，...必将向着...方向迈进。作为...，我们应当...",
    },
  ];

  return rawList.map((q, idx) => ({
    id: `pq_dyn_${Date.now()}_${idx}`,
    category: q.category,
    categoryLabel: q.categoryLabel,
    badgeColor: q.badgeColor,
    questionZh: q.questionZh,
    pinyin: generatePinyinString(q.questionZh),
    questionVi: q.questionVi,
    modelAnswerZh: q.modelAnswerZh,
    modelAnswerPinyin: generatePinyinString(q.modelAnswerZh),
    modelAnswerVi: q.modelAnswerVi,
    keyVocab: q.keyVocab.map((v) => ({
      zh: v.zh,
      pinyin: generatePinyinString(v.zh),
      vi: v.vi,
    })),
    grammarTip: q.grammarTip,
  }));
}

/**
 * Returns 5 structured practice questions based on the assessment topic, level, and feedback
 */
export function generatePostAssessmentQuestions(
  topicTitle: string,
  targetLevel: string = "HSK 3"
): PracticeQuestion[] {
  const lower = (topicTitle || "").toLowerCase();

  let matchedKey: string | null = null;
  if (lower.includes("ẩm thực") || lower.includes("món") || lower.includes("nhà hàng") || lower.includes("ăn") || lower.includes("food") || lower.includes("dining")) {
    matchedKey = "food";
  } else if (lower.includes("du lịch") || lower.includes("giao thông") || lower.includes("vé") || lower.includes("đường") || lower.includes("travel")) {
    matchedKey = "travel";
  } else if (lower.includes("công việc") || lower.includes("nghề") || lower.includes("phỏng vấn") || lower.includes("kinh doanh") || lower.includes("work") || lower.includes("career") || lower.includes("business")) {
    matchedKey = "work";
  }

  if (matchedKey && TOPIC_PRESETS[matchedKey]) {
    return TOPIC_PRESETS[matchedKey].map((item, idx) => ({
      id: `pq_${matchedKey}_${idx}`,
      category: item.category,
      categoryLabel: item.categoryLabel,
      badgeColor: item.badgeColor,
      questionZh: item.questionZh,
      pinyin: generatePinyinString(item.questionZh),
      questionVi: item.questionVi,
      modelAnswerZh: item.modelAnswerZh,
      modelAnswerPinyin: generatePinyinString(item.modelAnswerZh),
      modelAnswerVi: item.modelAnswerVi,
      keyVocab: item.keyVocab.map((v) => ({
        zh: v.zh,
        pinyin: generatePinyinString(v.zh),
        vi: v.vi,
      })),
      grammarTip: item.grammarTip,
    }));
  }

  return generateDynamicTopicQuestions(topicTitle, targetLevel);
}
