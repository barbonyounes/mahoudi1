import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowRight, Check, Download, Plus, Trash2, Upload, Users } from "lucide-react";
import { useClassroom } from "@/hooks/useClassroom";
import { usePrefs } from "@/hooks/usePrefs";
import {
  FEEDBACK_LABELS,
  analyzeImport,
  parseCsvNames,
  parseNames,
  type ImportAnalysis,
} from "@/data/classroom";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "إعدادات الأقسام والتلاميذ — حصص العلوم" },
      {
        name: "description",
        content:
          "أضف المستويات والأقسام وأدخل قائمة أسماء التلاميذ يدوياً لحفظها واستعمالها في الاختيار العشوائي والتعليقات الفورية أثناء التقويم.",
      },
      { property: "og:title", content: "إعدادات الأقسام والتلاميذ — حصص العلوم" },
      {
        property: "og:description",
        content: "إدارة المستويات والأقسام وقوائم التلاميذ لاستعمالها في أدوات القسم أثناء الحصة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const c = useClassroom();
  const { prefs, setPref } = usePrefs();
  const [levelName, setLevelName] = useState("");
  const [className, setClassName] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Record<string, ImportAnalysis>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const clearPending = (classId: string) =>
    setPending((s) => {
      const next = { ...s };
      delete next[classId];
      return next;
    });

  const applyNames = (classId: string, names: string[], message: string) => {
    c.updateClass(classId, { students: names });
    setDraft((s) => ({ ...s, [classId]: names.join("\n") }));
    setNotice((s) => ({ ...s, [classId]: message }));
    clearPending(classId);
  };

  const importCsv = async (classId: string, file: File | undefined, existing: string[]) => {
    if (!file) return;
    if (file.size > 1_000_000) {
      setNotice((s) => ({ ...s, [classId]: "الملف كبير جداً (الحد 1 ميغابايت)" }));
      return;
    }
    try {
      const names = parseCsvNames(await file.text());
      if (names.length === 0) {
        setNotice((s) => ({ ...s, [classId]: "لم يُعثر على أسماء في الملف" }));
        return;
      }
      const analysis = analyzeImport(names, existing);
      if (analysis.duplicates.length === 0 && analysis.internalDuplicates.length === 0) {
        setDraft((s) => ({ ...s, [classId]: analysis.merged.join("\n") }));
        setPending((s) => ({ ...s, [classId]: analysis }));
        setNotice((s) => ({
          ...s,
          [classId]: `تم استيراد ${analysis.fresh.length} اسماً دون تكرار — اضغط «حفظ القائمة»`,
        }));
        return;
      }
      setPending((s) => ({ ...s, [classId]: analysis }));
      setNotice((s) => ({ ...s, [classId]: "" }));
    } catch {
      setNotice((s) => ({ ...s, [classId]: "تعذّرت قراءة الملف" }));
    }
  };


  return (
    <div dir="rtl" className="min-h-dvh bg-background px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="size-4" /> رجوع إلى اختيار الحصة
        </Link>
        <h1 className="mt-4 text-[clamp(1.6rem,4.5vw,2.6rem)] font-bold">
          إعدادات المستويات والأقسام والتلاميذ
        </h1>
        <p className="mt-2 text-muted-foreground">
          تُحفظ القوائم على هذا الجهاز وتُستعمل تلقائياً في الاختيار العشوائي، الأفواج الثنائية،
          والتعليقات الفورية أثناء التقويم.
        </p>

        {/* تفضيلات العرض */}
        <section className="mt-8 rounded-3xl border-2 border-border bg-secondary/30 p-5">
          <h2 className="mb-3 text-xl font-bold">تفضيلات العرض أثناء الحصة</h2>
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border bg-background px-4 py-3">
            <span>
              <span className="block font-semibold">إظهار الملاحظات الموجهة للأستاذة</span>
              <span className="block text-sm text-muted-foreground">
                عند الإطفاء يختفي شريط «تعليمة الأستاذة» تماماً من كل الحصص.
              </span>
            </span>
            <input
              type="checkbox"
              checked={prefs.showTeacherNotes}
              onChange={(e) => setPref("showTeacherNotes", e.target.checked)}
              className="size-6 accent-[var(--primary)]"
            />
          </label>
        </section>

        {/* إضافة مستوى */}
        <section className="mt-8 rounded-3xl border-2 border-border bg-secondary/30 p-5">
          <h2 className="mb-3 text-xl font-bold">المستويات</h2>
          <div className="flex flex-wrap gap-2">
            <input
              value={levelName}
              onChange={(e) => setLevelName(e.target.value.slice(0, 60))}
              placeholder="مثال: السنة الثانية متوسط"
              className="min-w-0 flex-1 rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => {
                c.addLevel(levelName);
                setLevelName("");
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 font-bold text-primary-foreground"
            >
              <Plus className="size-5" /> إضافة مستوى
            </button>
          </div>
        </section>

        {/* المستويات والأقسام */}
        <div className="mt-6 space-y-6">
          {c.levels.map((level) => {
            const classes = c.classes.filter((g) => g.levelId === level.id);
            return (
              <section key={level.id} className="rounded-3xl border-2 border-border p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={level.name}
                    onChange={(e) => c.renameLevel(level.id, e.target.value)}
                    className="min-w-0 flex-1 rounded-xl border border-transparent bg-transparent px-2 py-1 text-xl font-bold outline-none hover:border-border focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => c.removeLevel(level.id)}
                    aria-label="حذف المستوى"
                    className="rounded-xl border border-border p-2 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-5" />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <input
                    value={className[level.id] ?? ""}
                    onChange={(e) =>
                      setClassName((s) => ({ ...s, [level.id]: e.target.value.slice(0, 60) }))
                    }
                    placeholder="اسم القسم/الفوج، مثال: 2م1"
                    className="min-w-0 flex-1 rounded-2xl border border-border bg-background px-4 py-2.5 outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      c.addClass(level.id, className[level.id] ?? "");
                      setClassName((s) => ({ ...s, [level.id]: "" }));
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2.5 font-semibold hover:bg-secondary"
                  >
                    <Plus className="size-5" /> إضافة قسم
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {classes.length === 0 && (
                    <p className="text-sm text-muted-foreground">لا توجد أقسام في هذا المستوى بعد.</p>
                  )}
                  {classes.map((g) => {
                    const value = draft[g.id] ?? g.students.join("\n");
                    const active = c.activeClassId === g.id;
                    return (
                      <div
                        key={g.id}
                        className={cn(
                          "rounded-2xl border p-4",
                          active ? "border-primary bg-primary/5" : "border-border bg-secondary/20",
                        )}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            value={g.name}
                            onChange={(e) => c.updateClass(g.id, { name: e.target.value })}
                            className="min-w-0 flex-1 rounded-xl border border-transparent bg-transparent px-2 py-1 text-lg font-bold outline-none hover:border-border focus:border-primary"
                          />
                          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Users className="size-4" /> {g.students.length} تلميذ
                          </span>
                          <button
                            type="button"
                            onClick={() => c.setActiveClass(g.id)}
                            className={cn(
                              "rounded-xl px-3 py-2 text-sm font-bold",
                              active
                                ? "bg-primary text-primary-foreground"
                                : "border border-border hover:bg-secondary",
                            )}
                          >
                            {active ? "القسم النشط" : "اجعله نشطاً"}
                          </button>
                          <button
                            type="button"
                            onClick={() => c.removeClass(g.id)}
                            aria-label="حذف القسم"
                            className="rounded-xl border border-border p-2 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-5" />
                          </button>
                        </div>

                        <label className="mt-3 block text-sm font-semibold text-muted-foreground">
                          أسماء التلاميذ — اسم في كل سطر (أو مفصولة بفواصل)
                        </label>
                        <textarea
                          value={value}
                          onChange={(e) => setDraft((s) => ({ ...s, [g.id]: e.target.value }))}
                          rows={6}
                          className="mt-2 w-full rounded-2xl border border-border bg-background p-3 leading-relaxed outline-none focus:border-primary"
                          placeholder={"أمين\nسارة\nياسين"}
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              c.updateClass(g.id, { students: parseNames(value) });
                              setDraft((s) => {
                                const next = { ...s };
                                delete next[g.id];
                                return next;
                              });
                              setNotice((s) => ({ ...s, [g.id]: "" }));
                            }}
                            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 font-bold text-primary-foreground"
                          >
                            <Check className="size-5" /> حفظ القائمة
                          </button>
                          <input
                            ref={(el) => {
                              fileRefs.current[g.id] = el;
                            }}
                            type="file"
                            accept=".csv,text/csv,text/plain"
                            className="hidden"
                            onChange={(e) => {
                              void importCsv(g.id, e.target.files?.[0], g.students);
                              e.target.value = "";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => fileRefs.current[g.id]?.click()}
                            className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2.5 font-semibold hover:bg-secondary"
                          >
                            <Upload className="size-5" /> استيراد من CSV
                          </button>
                          <a
                            href="/modele-eleves.csv"
                            download="نموذج-قائمة-التلاميذ.csv"
                            className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2.5 font-semibold hover:bg-secondary"
                          >
                            <Download className="size-5" /> تنزيل نموذج CSV
                          </a>
                          <span className="self-center text-xs text-muted-foreground">
                            الحد الأقصى 120 اسماً — عمود الاسم واللقب ومعلومات إضافية
                          </span>
                        </div>
                        {notice[g.id] && (
                          <p className="mt-2 text-sm font-semibold text-primary">{notice[g.id]}</p>
                        )}
                        {pending[g.id] &&
                          (pending[g.id]!.duplicates.length > 0 ||
                            pending[g.id]!.internalDuplicates.length > 0) && (
                            <div className="mt-3 rounded-2xl border-2 border-primary/40 bg-primary/5 p-4">
                              <p className="font-bold">
                                كُشف تكرار في الأسماء (الاسم واللقب)
                              </p>
                              <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                                <li>أسماء جديدة: {pending[g.id]!.fresh.length}</li>
                                <li>
                                  مكرّرة مع القائمة الحالية: {pending[g.id]!.duplicates.length}
                                  {pending[g.id]!.duplicates.length > 0 &&
                                    ` — ${pending[g.id]!.duplicates.slice(0, 5).join("، ")}${
                                      pending[g.id]!.duplicates.length > 5 ? "…" : ""
                                    }`}
                                </li>
                                <li>
                                  مكرّرة داخل الملف: {pending[g.id]!.internalDuplicates.length}
                                </li>
                              </ul>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    applyNames(
                                      g.id,
                                      pending[g.id]!.merged,
                                      `تم الدمج: أُضيف ${pending[g.id]!.fresh.length} اسماً جديداً وتم توحيد المكرر`,
                                    )
                                  }
                                  className="rounded-2xl bg-primary px-4 py-2.5 font-bold text-primary-foreground"
                                >
                                  دمج السجلات
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    applyNames(
                                      g.id,
                                      [...g.students, ...pending[g.id]!.fresh].slice(0, 120),
                                      `تم تخطي ${
                                        pending[g.id]!.duplicates.length +
                                        pending[g.id]!.internalDuplicates.length
                                      } سجلاً مكرراً`,
                                    )
                                  }
                                  className="rounded-2xl border border-border px-4 py-2.5 font-semibold hover:bg-secondary"
                                >
                                  تخطي المكرر
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    applyNames(
                                      g.id,
                                      [...pending[g.id]!.fresh, ...pending[g.id]!.duplicates].slice(0, 120),
                                      "تم استبدال القائمة بمحتوى الملف بدون تكرار",
                                    )
                                  }
                                  className="rounded-2xl border border-border px-4 py-2.5 font-semibold hover:bg-secondary"
                                >
                                  استبدال القائمة بالملف
                                </button>
                                <button
                                  type="button"
                                  onClick={() => clearPending(g.id)}
                                  className="rounded-2xl border border-border px-4 py-2.5 font-semibold hover:bg-secondary"
                                >
                                  إلغاء
                                </button>
                              </div>
                            </div>
                          )}


                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* سجل التعليقات */}
        <section className="mt-8 rounded-3xl border-2 border-border bg-secondary/30 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">سجل التعليقات الفورية</h2>
            <button
              type="button"
              onClick={c.clearFeedback}
              className="rounded-2xl border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
            >
              مسح السجل
            </button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            التعليقات المتاحة أثناء الحصة: {FEEDBACK_LABELS.join(" • ")}
          </p>
          <ul className="mt-4 space-y-2">
            {c.feedback.length === 0 && (
              <li className="text-sm text-muted-foreground">لا توجد تعليقات مسجلة بعد.</li>
            )}
            {c.feedback.slice(0, 40).map((f) => (
              <li
                key={f.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background/60 px-4 py-2"
              >
                <span className="font-bold">{f.student}</span>
                <span className="text-sm text-primary">{f.label}</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {new Date(f.at).toLocaleTimeString("ar-DZ", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
