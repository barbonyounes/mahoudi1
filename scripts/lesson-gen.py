"""مولّد ملفات الدروس (9 محطات / 50 دقيقة) وفق قالب lesson-builder."""
import json, os

TPL = '''import type {{ LessonDef, Term }} from "@/data/lesson";

export const {export_name}: LessonDef = {{
  id: {id},
  subject: "علوم الطبيعة والحياة",
  level: {level},
  unit: {unit},
  title: {title},
  competence: {competence},
  totalMinutes: 50,
  terms: {terms} satisfies Term[],
  stations: [
    {{
      id: "start",
      kicker: "المحطة 1",
      title: "وضعية الانطلاق",
      minutes: 4,
      model: {model},
      teacherNote: "اعرضي الوضعية بملء الشاشة، ملاحظة صامتة أولاً، ثم اجمعي تساؤلات التلاميذ دون تصحيح.",
      keyPoints: ["ملاحظة صامتة", "صياغة الإشكالية", "لا إجابات في هذه المرحلة"],
      blocks: [
        {{ kind: "text", text: {situation} }},
        {{ kind: "prompt", question: {problem} }},
        {{ kind: "bullets", items: {start_items} }},
      ],
    }},
    {{
      id: "hypotheses",
      kicker: "المحطة 2",
      title: "صياغة الفرضيات",
      minutes: 5,
      model: {model},
      teacherNote: "دوّني فرضيات التلاميذ بكلمات مفتاحية وأبقيها ظاهرة حتى محطة الاستنتاج.",
      keyPoints: ["تفسيرات مؤقتة", "لا تصحيح الآن"],
      blocks: [
        {{ kind: "hypotheses", title: "فرضيات القسم", prompt: {hyp_prompt} }},
      ],
    }},
    {{
      id: "task",
      kicker: "المحطة 3",
      title: "المهمة — التعليمة",
      minutes: 2,
      model: {model},
      teacherNote: "لا تنتقلي قبل إعادة صياغة التعليمة من طرف تلميذين.",
      keyPoints: ["تحديد المهمة قبل الاستقصاء"],
      blocks: [
        {{
          kind: "task",
          title: "التعليمة",
          instruction: {task_instruction},
          steps: {task_steps},
          support: {task_support},
          minutes: 2,
        }},
      ],
    }},
    {{
      id: "experiment",
      kicker: "المحطة 4",
      title: {exp_title},
      minutes: 12,
      model: {model},
      teacherNote: {exp_note},
      keyPoints: {exp_keypoints},
      blocks: [
        {{
          kind: "revealGrid",
          title: {grid_title},
          columns: {grid_columns},
          rows: {grid_rows},
          conclusion: {grid_conclusion},
        }},
      ],
    }},
    {{
      id: "analysis",
      kicker: "المحطة 5",
      title: "التحليل والتفسير",
      minutes: 6,
      model: {model},
      teacherNote: "اطلبي قراءة النتيجة أولاً ثم انتقلي إلى التفسير.",
      keyPoints: ["قراءة النتيجة", "ثم التفسير"],
      blocks: [
        {{
          kind: "analysis",
          title: "تحليل النتائج",
          data: {an_data},
          observation: {an_obs},
          question: {an_q},
          explanation: {an_exp},
        }},
      ],
    }},
    {{
      id: "summary",
      kicker: "المحطة 6",
      title: "الحوصلة",
      minutes: 6,
      model: {model},
      teacherNote: "ابني الحوصلة بأسئلة موجهة قبل إظهار النص.",
      keyPoints: {sum_keypoints},
      blocks: [
        {{ kind: "text", text: {sum_text} }},
        {{ kind: "bullets", items: {sum_items} }},
      ],
    }},
    {{
      id: "copy",
      kicker: "المحطة 7",
      title: "الأثر الكتابي",
      minutes: 7,
      model: {model},
      teacherNote: "شغّلي وضع التدوين ولا تتكلمي أثناء الكتابة.",
      keyPoints: ["تدوين منظّم", "خط كبير", "مؤقت عكسي"],
      blocks: [
        {{ kind: "copyMode", title: "ما يدوَّن في الكراس", minutes: 7, sentences: {copy_sentences} }},
      ],
    }},
    {{
      id: "evaluation",
      kicker: "المحطة 8",
      title: "التقويم",
      minutes: 5,
      model: {model},
      teacherNote: "اتركي وقتاً للتفكير قبل كشف الإجابة، وسجّلي تعليقاً لكل تلميذ.",
      keyPoints: ["تقويم فوري", "تصحيح جماعي"],
      blocks: {quizzes},
    }},
    {{
      id: "integration",
      kicker: "المحطة 9",
      title: "الإدماج",
      minutes: 3,
      model: {model},
      teacherNote: "اقرئي الوضعية ثم اتركي دقيقتين للإجابة الفردية.",
      keyPoints: ["تجنيد المكتسبات في وضعية جديدة"],
      blocks: [
        {{
          kind: "integration",
          title: "وضعية إدماجية",
          scenario: {int_scenario},
          question: {int_question},
          resources: {int_resources},
          expected: {int_expected},
        }},
      ],
    }},
  ],
}};
'''


def j(v):
    return json.dumps(v, ensure_ascii=False)


def build(spec):
    d = {k: j(v) for k, v in spec.items() if k not in ("export_name", "file", "terms", "quizzes")}
    d["export_name"] = spec["export_name"]
    d["terms"] = j([{"term": t, "def": de} for t, de in spec["terms"]])
    d["quizzes"] = j(
        [{"kind": "quiz", "question": q[0], "options": q[1], "answer": q[2]} for q in spec["quizzes"]]
    )
    path = os.path.join("src/data", spec["file"])
    with open(path, "w") as f:
        f.write(TPL.format(**d))
    return path
