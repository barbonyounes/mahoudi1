import { lessons } from "@/data/lessons";

/** حالة الدرس الرقمي: جاهز (مبني بالكامل) أو قيد الإنجاز */
export type SessionStatus = "ready" | "planned";

/** حصة تعليمية واحدة (50 دقيقة) داخل مورد معرفي */
export type CurriculumSession = {
  /** رقم الحصة داخل المورد */
  order: number;
  title: string;
  /** معرّف الدرس الرقمي في src/data/lessons.ts إن كان مبنياً */
  lessonId?: string;
  status: SessionStatus;
  /** ملخص قصير لما تعالجه الحصة */
  summary: string;
  /** في نسخة الأستاذ: معرّف الحصة الأصلية التي نُسخت منها، لتمكين الاسترجاع */
  originalLessonId?: string;
};

/** مورد معرفي (درس) داخل مقطع تعلمي */
export type CurriculumResource = {
  id: string;
  order: number;
  title: string;
  /** عدد الحصص التعليمية المقررة في المذكرة */
  plannedSessions: number;
  competence: string;
  sessions: CurriculumSession[];
};

/** مقطع تعلمي */
export type CurriculumSegment = {
  id: string;
  order: number;
  title: string;
  field: string;
  resources: CurriculumResource[];
};

/** مستوى دراسي */
export type CurriculumLevel = {
  id: string;
  title: string;
  short: string;
  segments: CurriculumSegment[];
};

export const curriculum: CurriculumLevel[] = [
  {
    id: "1am",
    title: "السنة الأولى متوسط",
    short: "1 م",
    segments: [
      {
        id: "1am-human-nutrition",
        order: 1,
        title: "المقطع التعلمي الأول: التغذية عند الإنسان",
        field: "الإنسان والصحة",
        resources: [
          {
            id: "1am-hn-r1",
            order: 1,
            title: "مصدر وتركيب الأغذية",
            plannedSessions: 3,
            competence: "تصنيف الأغذية حسب المصدر والتركيب والكشف عن مكوناتها البسيطة.",
            sessions: [
              {
                order: 1,
                title: "مصدر الأغذية",
                lessonId: "food-source",
                status: "ready",
                summary: "تجربة الحرق: أغذية عضوية تتفحم وأغذية معدنية لا تتفحم.",
              },
              {
                order: 2,
                title: "تركيب الأغذية (1)",
                lessonId: "food-compo-1",
                status: "ready",
                summary: "الكشف عن النشاء بماء اليود وعن البروتين بحمض الآزوت.",
              },
              {
                order: 3,
                title: "تركيب الأغذية (2) — الحليب غذاء كامل",
                lessonId: "food-compo-2",
                status: "ready",
                summary: "الغذاء البسيط والغذاء المركب، حوصلة تركيب الحليب.",
              },
            ],
          },
          {
            id: "1am-hn-r2",
            order: 2,
            title: "دور الأغذية في الجسم",
            plannedSessions: 1,
            competence: "الربط بين طبيعة الغذاء ودوره في العضوية.",
            sessions: [
              {
                order: 1,
                title: "أغذية الطاقة وأغذية البناء",
                lessonId: "food-roles",
                status: "ready",
                summary: "تحليل جداول عوارض العوز الغذائي وتصنيف الأغذية حسب الدور.",
              },
            ],
          },
          {
            id: "1am-hn-r3",
            order: 3,
            title: "الرواتب الغذائية والتوازن الغذائي",
            plannedSessions: 2,
            competence: "تحديد الراتب الغذائي المناسب حسب السن والنشاط وبناء نظام متوازن.",
            sessions: [
              {
                order: 1,
                title: "الرواتب الغذائية",
                lessonId: "rations",
                status: "ready",
                summary: "راتب النمو والصيانة والعمل، مقارنة احتياجات الفئات العمرية.",
              },
              {
                order: 2,
                title: "التوازن الغذائي",
                lessonId: "food-balance",
                status: "ready",
                summary: "بناء وجبة متوازنة والوقاية من أمراض سوء التغذية.",
              },
            ],
          },
        ],
      },
      {
        id: "1am-plant-nutrition",
        order: 2,
        title: "المقطع التعلمي الثاني: التغذية عند النبات الأخضر",
        field: "الإنسان والمحيط",
        resources: [
          {
            id: "1am-pn-r1",
            order: 1,
            title: "احتياجات النبات الأخضر",
            plannedSessions: 1,
            competence: "تحديد شروط نمو النبات الأخضر عبر تجارب الحجب.",
            sessions: [
              {
                order: 1,
                title: "ضرورة المحلول المعدني والضوء",
                lessonId: "plant-needs",
                status: "ready",
                summary: "تجارب حجب الضوء والماء وثنائي أكسيد الكربون.",
              },
            ],
          },
          {
            id: "1am-pn-r2",
            order: 2,
            title: "العناصر المعدنية الضرورية ومحلول كنوب",
            plannedSessions: 1,
            competence: "إبراز أثر تركيز الأملاح المعدنية (آزوت، فوسفور، بوتاسيوم) على النمو.",
            sessions: [
              {
                order: 1,
                title: "محلول كنوب والعناصر NPK",
                lessonId: "knop-npk",
                status: "ready",
                summary: "سقي نباتات بتراكيز مختلفة ومقارنة النمو.",
              },
            ],
          },
          {
            id: "1am-pn-r3",
            order: 3,
            title: "مقر امتصاص المحلول المعدني",
            plannedSessions: 1,
            competence: "تحديد الأوبار الماصة كمقر لامتصاص المحلول المعدني.",
            sessions: [
              {
                order: 1,
                title: "الأوبار الماصة",
                lessonId: "root-hairs",
                status: "ready",
                summary: "تجربة غمس أجزاء الجذر في الماء والزيت.",
              },
            ],
          },
          {
            id: "1am-pn-r4",
            order: 4,
            title: "ضرورة CO2 ومقر امتصاصه",
            plannedSessions: 1,
            competence: "إبراز ضرورة ثنائي أكسيد الكربون ودور الثغور في امتصاصه.",
            sessions: [
              {
                order: 1,
                title: "الثغور وامتصاص CO2",
                lessonId: "stomata-co2",
                status: "ready",
                summary: "تجربة الناقوس والملاحظة المجهرية للثغور.",
              },
            ],
          },
          {
            id: "1am-pn-r5",
            order: 5,
            title: "التركيب الضوئي",
            plannedSessions: 2,
            competence: "بناء مفهوم النبات الأخضر كمنتج للمادة العضوية.",
            sessions: [
              {
                order: 1,
                title: "الكشف عن النشاء في الورقة",
                lessonId: "starch-test",
                status: "ready",
                summary: "تجربة الورقة المعرضة للضوء والورقة المحجوبة.",
              },
              {
                order: 2,
                title: "معادلة التركيب الضوئي",
                lessonId: "photosynthesis",
                status: "ready",
                summary: "دور اليخضور والضوء وCO2 والماء، حوصلة العملية.",
              },
            ],
          },
          {
            id: "1am-pn-r6",
            order: 6,
            title: "علاقة الإنسان بالنبات الأخضر",
            plannedSessions: 1,
            competence: "إبراز تبعية الإنسان والحيوان للنبات الأخضر.",
            sessions: [
              {
                order: 1,
                title: "النبات الأخضر منتج أول",
                lessonId: "plant-producer",
                status: "ready",
                summary: "سلاسل غذائية وأهمية النبات في التوازن الغذائي.",
              },
            ],
          },
          {
            id: "1am-pn-r7",
            order: 7,
            title: "دوران النسغ والنتح",
            plannedSessions: 2,
            competence: "شرح آلية انتقال النسغ داخل النبات ودور النتح.",
            sessions: [
              {
                order: 1,
                title: "دوران النسغ",
                lessonId: "sap-flow",
                status: "ready",
                summary: "تتبع النسغ الملون في الساق والأوعية الناقلة.",
              },
              {
                order: 2,
                title: "النتح محرك الصعود",
                lessonId: "transpiration",
                status: "ready",
                summary: "تجربة الناقوس الزجاجي وقياس فقدان الماء.",
              },
            ],
          },
        ],
      },
    ],

  },
  {
    id: "2am",
    title: "السنة الثانية متوسط",
    short: "2 م",
    segments: [
      {
        id: "2am-milieu",
        order: 1,
        title: "المقطع التعلمي الأول: الوسط الحي",
        field: "الإنسان والمحيط",
        resources: [
          {
            id: "2am-milieu-r1",
            order: 1,
            title: "خصائص الوسط الحي",
            plannedSessions: 1,
            competence: "التمييز بين العناصر الحية واللاحية وتحديد المكونات الأساسية للوسط الحي.",
            sessions: [
              {
                order: 1,
                title: "خصائص الوسط الحي",
                lessonId: "milieu",
                status: "ready",
                summary: "المكونات الحية واللاحية، الوحدة الحياتية، المدى الحيوي الجغرافي.",
              },
            ],
          },
          {
            id: "2am-milieu-r2",
            order: 2,
            title: "تنوع الأوساط الحية",
            plannedSessions: 1,
            competence: "إبراز تنوع الأوساط الحية وربطها بالعوامل المناخية والتربة.",
            sessions: [
              {
                order: 1,
                title: "تنوع الأوساط الحية",
                lessonId: "diversity",
                status: "ready",
                summary: "مقارنة أوساط مختلفة، مستكشف الأوساط، تصنيف الكائنات.",
              },
            ],
          },
          {
            id: "2am-milieu-r3",
            order: 3,
            title: "العلاقات القائمة بين الكائنات الحية في الوسط الحي",
            plannedSessions: 1,
            competence: "تحديد أنواع العلاقات بين الكائنات الحية داخل الوسط الحي.",
            sessions: [
              {
                order: 1,
                title: "العلاقات بين الكائنات الحية",
                lessonId: "relations",
                status: "ready",
                summary: "الافتراس، التنافس، التعاون، التكافل، التطفل، الدفاع.",
              },
            ],
          },
          {
            id: "2am-milieu-r4",
            order: 4,
            title: "توزع الكائنات الحية حسب العوامل الفيزيوكيميائية",
            plannedSessions: 1,
            competence: "ربط توزع الكائنات الحية بخصائص الوسط الفيزيوكيميائية (المناخ والتربة).",
            sessions: [
              {
                order: 1,
                title: "المناخ والتربة وتوزع الكائنات",
                lessonId: "distribution",
                status: "ready",
                summary: "معطيات مناخية، مخبر النفاذية، محاكاة تكيف اليربوع.",
              },
            ],
          },
          {
            id: "2am-milieu-r5",
            order: 5,
            title: "العلاقات الغذائية: السلاسل والشبكات الغذائية",
            plannedSessions: 1,
            competence: "بناء سلاسل وشبكات غذائية وتحديد موقع كل كائن حي فيها.",
            sessions: [
              {
                order: 1,
                title: "السلاسل والشبكات الغذائية",
                lessonId: "food-chains",
                status: "ready",
                summary: "منتج، مستهلك أول وثانٍ، محلل، ومعنى السهم في السلسلة الغذائية.",
              },
            ],
          },
          {
            id: "2am-milieu-r6",
            order: 6,
            title: "النظام البيئي وشروط توازنه",
            plannedSessions: 1,
            competence: "تعريف النظام البيئي واستخراج شروط توازنه.",
            sessions: [
              {
                order: 1,
                title: "النظام البيئي وشروط توازنه",
                lessonId: "ecosystem-balance",
                status: "ready",
                summary: "حظيرة بيئية ومجموعة حيوية، مقارنة غابة متوازنة بجزيرة مختلة.",
              },
            ],
          },
          {
            id: "2am-milieu-r7",
            order: 7,
            title: "تدخل الإنسان واستقرار النظام البيئي",
            plannedSessions: 1,
            competence: "إبراز أثر تدخلات الإنسان واقتراح إجراءات وقائية لحماية المحيط.",
            sessions: [
              {
                order: 1,
                title: "تدخل الإنسان واستقرار النظام البيئي",
                lessonId: "human-impact",
                status: "ready",
                summary: "تلوث، إزالة الغابات، صيد مفرط، ومقابلها التشجير والمحميات.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "3am",
    title: "السنة الثالثة متوسط",
    short: "3 م",
    segments: [
      {
        id: "3am-internal-dynamics",
        order: 1,
        title: "المقطع التعلمي الأول: الديناميكية الداخلية للكرة الأرضية",
        field: "الإنسان والمحيط",
        resources: [
          {
            id: "3am-id-r1",
            order: 1,
            title: "الزلازل",
            plannedSessions: 2,
            competence:
              "وصف الزلزال كظاهرة طبيعية وتفسير أسبابه بربطها بالتشوهات الصخرية وحدود الصفائح.",
            sessions: [
              {
                order: 1,
                title: "الزلازل ظاهرة طبيعية",
                lessonId: "eq-phenomenon",
                status: "ready",
                summary: "شهادات ميدانية، مكونات الزلزال، معطيات زلزال بومرداس وتصنيفها.",
              },
              {
                order: 2,
                title: "أسباب الزلازل",
                lessonId: "eq-causes",
                status: "ready",
                summary: "قوى الانضغاط، الطيات والفوالق، والتوزيع العالمي للزلازل.",
              },
            ],
          },
          {
            id: "3am-id-r2",
            order: 2,
            title: "البراكين",
            plannedSessions: 1,
            competence: "تحديد بنية البركان وأنماطه وربط النمط بطبيعة الصهارة.",
            sessions: [
              {
                order: 1,
                title: "النشاط البركاني وأنماط البراكين",
                lessonId: "volcano-activity",
                status: "ready",
                summary: "البركان الانصبابي والانفجاري، بنية البركان، لزوجة الحمم.",
              },
            ],
          },
          {
            id: "3am-id-r3",
            order: 3,
            title: "الغوص والظواهر المرافقة",
            plannedSessions: 1,
            competence:
              "شرح ظاهرة الغوص وربطها بالخنادق المحيطية وتوزع بؤر الزلازل والبراكين وتشكل الجبال.",
            sessions: [
              {
                order: 1,
                title: "الغوص والظواهر الجيولوجية المرتبطة به",
                lessonId: "subduction",
                status: "ready",
                summary: "خط بينيوف، الخنادق المحيطية، البراكين الانفجارية وتشكل الجبال.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "4am",
    title: "السنة الرابعة متوسط",
    short: "4 م",
    segments: [
      {
        id: "4am-nutrition",
        order: 1,
        title: "المقطع التعلمي الأول: التغذية عند الإنسان",
        field: "الإنسان والصحة",
        resources: [
          {
            id: "4am-nut-r1",
            order: 1,
            title: "تحولات الأغذية خلال الهضم",
            plannedSessions: 4,
            competence:
              "التعرف على مختلف التحولات التي تطرأ على الأغذية في الأنبوب الهضمي وعلى المعنى البيولوجي للهضم.",
            sessions: [
              {
                order: 1,
                title: "التحول الغذائي في الفم — الهضم الاصطناعي للنشاء",
                lessonId: "dig-mouth",
                status: "ready",
                summary:
                  "وضعية الانطلاق، فرضية تغير مذاق الخبز، تجربة اللعابين مع ماء اليود ومحلول فهلنج.",
              },
              {
                order: 2,
                title: "تحولات الغذاء في المعدة والمعي الدقيق",
                lessonId: "dig-stomach",
                status: "ready",
                summary: "البيبسين في المعدة، العصارات البنكرياسية والمعوية والصفراء، نواتج الهضم.",
              },
              {
                order: 3,
                title: "التأثير النوعي للإنزيمات",
                lessonId: "dig-enzymes",
                status: "ready",
                summary: "الأميلاز والبروتياز والليباز، إظهار تجريبي للنوعية الإنزيمية.",
              },
              {
                order: 4,
                title: "الدعامة التشريحية ومسار ومصير الغذاء",
                lessonId: "dig-anatomy",
                status: "ready",
                summary: "الأنبوب الهضمي والغدد الملحقة، رسم وظيفي لمسار الغذاء، الحوصلة.",
              },
            ],
          },
          {
            id: "4am-nut-r2",
            order: 2,
            title: "امتصاص المغذيات",
            plannedSessions: 3,
            competence: "إبراز بنية سطح التبادل المعوي وآلية مرور المغذيات نحو الوسط الداخلي.",
            sessions: [
              {
                order: 1,
                title: "بنية جدار المعي الدقيق",
                lessonId: "abs-villi",
                status: "ready",
                summary: "الزغابات المعوية وخصائص سطح التبادل.",
              },
              {
                order: 2,
                title: "آلية الامتصاص المعوي",
                lessonId: "abs-mechanism",
                status: "ready",
                summary: "مرور المغذيات نحو الدم والبلغم.",
              },
              {
                order: 3,
                title: "حوصلة الامتصاص",
                lessonId: "abs-summary",
                status: "ready",
                summary: "نمذجة سطح التبادل وتقويم.",
              },
            ],
          },
          {
            id: "4am-nut-r3",
            order: 3,
            title: "نقل المغذيات في العضوية",
            plannedSessions: 4,
            competence:
              "تحديد دور كل من الدم والبلغم في نقل المغذيات وبناء مفهوم الوسط الداخلي.",
            sessions: [
              {
                order: 1,
                title: "تركيب الدم ودوره",
                lessonId: "blood-compo",
                status: "ready",
                summary: "الطرد المركزي، البلازما والخلايا الدموية، الملاحظة المجهرية لسحبة دموية.",
              },
              {
                order: 2,
                title: "طريقا الامتصاص ودور الكبد",
                lessonId: "abs-paths-liver",
                status: "ready",
                summary: "الطريق الدموي والطريق البلغمي، تخزين الغليكوجين وتنظيم سكر الدم.",
              },
              {
                order: 3,
                title: "الدورة الدموية",
                lessonId: "circulation",
                status: "ready",
                summary: "القلب مضخة مزدوجة، الدورة الرئوية والدورة العامة، رسم تخطيطي.",
              },
              {
                order: 4,
                title: "الوسط الداخلي والمبادلات مع الخلايا",
                lessonId: "internal-milieu",
                status: "ready",
                summary: "السائل البيني واللمف، الحوصلة، والتحسيس بالتبرع بالدم.",
              },
            ],
          },
        ],
      },
    ],
  },

];

export function countReadySessions(level: CurriculumLevel): number {
  return level.segments.reduce(
    (acc, seg) =>
      acc +
      seg.resources.reduce(
        (a, r) => a + r.sessions.filter((s) => s.status === "ready").length,
        0,
      ),
    0,
  );
}

export function countTotalSessions(level: CurriculumLevel): number {
  return level.segments.reduce(
    (acc, seg) => acc + seg.resources.reduce((a, r) => a + r.sessions.length, 0),
    0,
  );
}

export function getLevel(id: string): CurriculumLevel | undefined {
  return curriculum.find((l) => l.id === id);
}

/** الدروس المبنية التي لم تُربط بعد بأي مورد في الشجرة */
export function unmappedLessonIds(): string[] {
  const mapped = new Set(
    curriculum.flatMap((l) =>
      l.segments.flatMap((s) =>
        s.resources.flatMap((r) => r.sessions.map((x) => x.lessonId).filter(Boolean)),
      ),
    ) as string[],
  );
  return lessons.map((l) => l.id).filter((id) => !mapped.has(id));
}
