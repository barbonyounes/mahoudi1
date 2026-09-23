import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { BookOpen, Search, X } from "lucide-react";
import { lessons } from "@/data/lessons";
import type { Term } from "@/data/lesson";
import { cn } from "@/lib/utils";

/** توحيد الكتابة للبحث: حذف التشكيل و«ال» التعريف واللواحق الشائعة */
function normalize(s: string) {
  let t = s
    .replace(/[\u064B-\u0652\u0640]/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/[ةه]/g, "ه")
    .replace(/ى/g, "ي")
    .trim();
  t = t.replace(/^ال/, "");
  t = t.replace(/(ية|ي|ات|ون|ين)$/, "");
  return t;
}

export type GlossaryEntry = Term & { lessons: string[] };

function buildGlossary(): GlossaryEntry[] {
  const map = new Map<string, GlossaryEntry>();
  for (const l of lessons) {
    for (const t of l.terms) {
      const key = normalize(t.term);
      const found = map.get(key);
      if (found) {
        if (!found.lessons.includes(l.title)) found.lessons.push(l.title);
      } else {
        map.set(key, { ...t, lessons: [l.title] });
      }
    }
  }
  return [...map.values()].sort((a, b) => a.term.localeCompare(b.term, "ar"));
}

type GlossaryCtx = {
  open: (term?: string) => void;
  entries: GlossaryEntry[];
};

const Ctx = createContext<GlossaryCtx | null>(null);

export function useGlossary() {
  return useContext(Ctx);
}

export function GlossaryProvider({ children }: { children: React.ReactNode }) {
  const entries = useMemo(buildGlossary, []);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  const open = useCallback(
    (term?: string) => {
      if (term) {
        const key = normalize(term);
        const match = entries.find((e) => normalize(e.term) === key);
        setFocused(match ? match.term : null);
        setQuery(match ? "" : term);
      } else {
        setFocused(null);
        setQuery("");
      }
      setIsOpen(true);
    },
    [entries],
  );

  const value = useMemo(() => ({ open, entries }), [open, entries]);

  const q = normalize(query);
  const results = q
    ? entries.filter((e) => normalize(e.term).includes(q) || normalize(e.def).includes(q))
    : entries;

  return (
    <Ctx.Provider value={value}>
      {children}
      {isOpen && (
        <div
          dir="rtl"
          className="fixed inset-0 z-[70] flex items-end justify-center bg-background/80 p-0 backdrop-blur-xl sm:items-center sm:p-6"
        >
          <div className="flex max-h-[88dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border-2 border-border bg-card shadow-2xl sm:rounded-3xl">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
              <BookOpen className="size-6 shrink-0 text-primary" />
              <h2 className="flex-1 text-lg font-bold sm:text-xl">قاموس المصطلحات العلمية</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="إغلاق"
                className="rounded-xl border border-border p-2 hover:bg-secondary"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="border-b border-border px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-3 py-2">
                <Search className="size-5 shrink-0 text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value.slice(0, 60));
                    setFocused(null);
                  }}
                  placeholder="ابحث عن مصطلح: تطفل، تكافل، افتراس، تنافس، دفاع، تعاون…"
                  className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="lesson-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6">
              {results.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">لا يوجد مصطلح مطابق.</p>
              )}
              {results.map((e) => (
                <div
                  key={e.term}
                  className={cn(
                    "rounded-2xl border p-4 transition",
                    focused === e.term
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/30",
                  )}
                >
                  <h3 className="text-lg font-bold text-primary">{e.term}</h3>
                  <p className="mt-1 leading-relaxed text-foreground/90">{e.def}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{e.lessons.join(" • ")}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
