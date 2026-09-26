import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Eye, FileUp, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BlockView } from "@/components/lesson/ContentBlocks";
import { supabase } from "@/integrations/supabase/client";
import type { Block, Term } from "@/data/lesson";
import { Field, LinesField, TextField } from "./EditorFields";

const labels: Record<string, string> = { text: "نص", bullets: "نقاط", quiz: "اختيارات", openQuestion: "سؤال مفتوح", prompt: "إشكالية", task: "تعليمة", analysis: "تحليل وتفسير", writing: "حوصلة", copyMode: "أثر كتابي", integration: "إدماج", compare: "مقارنة", liveResource: "وثيقة برابط", uploadedFile: "ملف مرفوع" };
const kinds = Object.keys(labels);
export function makeBlock(kind: string): Block {
  switch (kind) {
    case "bullets": return { kind, items: [""] };
    case "quiz": return { kind, question: "", options: ["", ""], answer: 0 };
    case "openQuestion": return { kind, question: "", expected: "" };
    case "prompt": return { kind, question: "", label: "السؤال" };
    case "task": return { kind, title: "تعليمة النشاط", instruction: "", steps: [""], minutes: 5 };
    case "analysis": return { kind, title: "التحليل والتفسير", data: "", observation: "", question: "", explanation: "" };
    case "writing": return { kind, title: "الحوصلة", minutes: 4, sentences: [""] };
    case "copyMode": return { kind, title: "الأثر الكتابي", minutes: 4, sentences: [""] };
    case "integration": return { kind, title: "الإدماج", scenario: "", question: "", resources: [""], expected: "" };
    case "compare": return { kind, left: { title: "", items: [""] }, right: { title: "", items: [""] } };
    case "liveResource": return { kind, media: "video", title: "", source: "", sourceUrl: "", description: "", instruction: "" };
    case "uploadedFile": return { kind, media: "image", title: "وثيقة مرفوعة", storagePath: "" };
    default: return { kind: "text", text: "" };
  }
}

export function BlockEditor({ block, terms, onChange, onDelete, onDuplicate, onMove, lessonId }: { block: Block; terms: Term[]; onChange: (block: Block) => void; onDelete: () => void; onDuplicate: () => void; onMove: (direction: -1 | 1) => void; lessonId: string }) {
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = (patch: object) => onChange({ ...block, ...patch } as Block);
  const upload = async (file?: File) => {
    if (!file) return;
    const allowed = ["image/", "video/", "audio/", "application/pdf"];
    if (!allowed.some((type) => file.type.startsWith(type))) {
      toast.error("نوع الملف غير مدعوم");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("حجم الملف يتجاوز 50 ميغابايت");
      return;
    }
    setUploading(true);
    const { data: user } = await supabase.auth.getUser();
    const uid = user.user?.id;
    if (!uid) {
      setUploading(false);
      toast.error("سجّل الدخول أولاً");
      return;
    }
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${uid}/${lessonId}/${crypto.randomUUID()}-${safe}`;
    const { error } = await supabase.storage.from("teacher-documents").upload(path, file);
    setUploading(false);
    if (error) {
      toast.error("تعذّر رفع الوثيقة");
      return;
    }
    const media = file.type === "application/pdf" ? "pdf" : file.type.split("/")[0] as "image" | "video" | "audio";
    onChange({ kind: "uploadedFile", media, title: file.name, storagePath: path });
    toast.success("تم رفع الوثيقة");
  };
  return <div className="rounded-2xl border border-border bg-background p-4">
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{labels[block.kind] ?? block.kind}</span>
      <div className="me-auto flex gap-1">
        <Button size="icon" variant="ghost" aria-label="تحريك للأعلى" onClick={() => onMove(-1)}><ChevronUp /></Button>
        <Button size="icon" variant="ghost" aria-label="تحريك للأسفل" onClick={() => onMove(1)}><ChevronDown /></Button>
        <Button size="icon" variant="ghost" aria-label="نسخ العنصر" onClick={onDuplicate}><Copy /></Button>
        <Button size="icon" variant="ghost" aria-label="معاينة" onClick={() => setPreview((v) => !v)}><Eye /></Button>
        <Button size="icon" variant="ghost" aria-label="حذف العنصر" className="text-destructive" onClick={onDelete}><Trash2 /></Button>
      </div>
    </div>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {block.kind === "text" && <div className="sm:col-span-2"><TextField label="النص" value={block.text} onChange={(text) => set({ text })} multiline /></div>}
      {block.kind === "bullets" && <div className="sm:col-span-2"><LinesField label="النقاط" value={block.items} onChange={(items) => set({ items })} /></div>}
      {block.kind === "quiz" && <><div className="sm:col-span-2"><TextField label="السؤال" value={block.question} onChange={(question) => set({ question })} /></div><LinesField label="الاختيارات" value={block.options} onChange={(options) => set({ options })} /><Field label="رقم الإجابة الصحيحة"><Input type="number" min={1} max={block.options.length} value={block.answer + 1} onChange={(e) => set({ answer: Math.max(0, Number(e.target.value) - 1) })} /></Field></>}
      {block.kind === "openQuestion" && <><TextField label="السؤال" value={block.question} onChange={(question) => set({ question })} multiline /><TextField label="الإجابة المنتظرة" value={block.expected} onChange={(expected) => set({ expected })} multiline /></>}
      {block.kind === "prompt" && <><TextField label="التسمية" value={block.label ?? ""} onChange={(label) => set({ label })} /><TextField label="السؤال" value={block.question} onChange={(question) => set({ question })} /></>}
      {(block.kind === "writing" || block.kind === "copyMode") && <><TextField label="العنوان" value={block.title} onChange={(title) => set({ title })} /><Field label="الدقائق"><Input type="number" min={1} value={block.minutes} onChange={(e) => set({ minutes: Number(e.target.value) })} /></Field><div className="sm:col-span-2"><LinesField label="جمل الحوصلة" value={block.sentences} onChange={(sentences) => set({ sentences })} /></div></>}
      {block.kind === "task" && <><TextField label="العنوان" value={block.title} onChange={(title) => set({ title })} /><Field label="الدقائق"><Input type="number" value={block.minutes ?? 5} onChange={(e) => set({ minutes: Number(e.target.value) })} /></Field><div className="sm:col-span-2"><TextField label="التعليمة" value={block.instruction} onChange={(instruction) => set({ instruction })} multiline /><LinesField label="الخطوات" value={block.steps} onChange={(steps) => set({ steps })} /></div></>}
      {block.kind === "analysis" && <>{(["title","data","observation","question","explanation"] as const).map((key) => <TextField key={key} label={({title:"العنوان",data:"المعطيات",observation:"الملاحظة",question:"السؤال",explanation:"التفسير"})[key]} value={block[key]} onChange={(value) => set({ [key]: value })} multiline={key !== "title"} />)}</>}
      {block.kind === "integration" && <>{(["title","scenario","question","expected"] as const).map((key) => <TextField key={key} label={({title:"العنوان",scenario:"الوضعية",question:"السؤال",expected:"الإجابة المنتظرة"})[key]} value={block[key]} onChange={(value) => set({ [key]: value })} multiline={key !== "title"} />)}<div className="sm:col-span-2"><LinesField label="الموارد" value={block.resources} onChange={(resources) => set({ resources })} /></div></>}
      {block.kind === "compare" && <><TextField label="عنوان الجهة الأولى" value={block.left.title} onChange={(title) => set({ left: { ...block.left, title } })} /><TextField label="عنوان الجهة الثانية" value={block.right.title} onChange={(title) => set({ right: { ...block.right, title } })} /><LinesField label="عناصر الجهة الأولى" value={block.left.items} onChange={(items) => set({ left: { ...block.left, items } })} /><LinesField label="عناصر الجهة الثانية" value={block.right.items} onChange={(items) => set({ right: { ...block.right, items } })} /></>}
      {block.kind === "liveResource" && <><TextField label="العنوان" value={block.title} onChange={(title) => set({ title })} /><Field label="النوع"><Select value={block.media} onValueChange={(media) => set({ media })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="video">فيديو</SelectItem><SelectItem value="audio">صوت</SelectItem><SelectItem value="simulation">محاكاة</SelectItem></SelectContent></Select></Field><TextField label="المصدر" value={block.source} onChange={(source) => set({ source })} /><TextField label="رابط المصدر" value={block.sourceUrl} onChange={(sourceUrl) => set({ sourceUrl })} /><TextField label="رابط التضمين" value={block.embedUrl ?? ""} onChange={(embedUrl) => set({ embedUrl })} /><TextField label="المدة" value={block.duration ?? ""} onChange={(duration) => set({ duration })} /><TextField label="الوصف" value={block.description} onChange={(description) => set({ description })} multiline /><TextField label="تعليمة الاستغلال" value={block.instruction} onChange={(instruction) => set({ instruction })} multiline /></>}
      {block.kind === "uploadedFile" && <><TextField label="عنوان الوثيقة" value={block.title} onChange={(title) => set({ title })} /><TextField label="التعليق" value={block.caption ?? ""} onChange={(caption) => set({ caption })} /><label className="sm:col-span-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-5 font-bold hover:border-primary"><FileUp />{uploading ? "جارٍ الرفع…" : "استبدال الوثيقة"}<input type="file" className="hidden" accept="image/*,video/*,audio/*,.pdf,application/pdf" disabled={uploading} onChange={(e) => void upload(e.target.files?.[0])} /></label></>}
      {!kinds.includes(block.kind) && <div className="sm:col-span-2"><Field label="بيانات العنصر المتقدم"><Textarea dir="ltr" className="min-h-64 font-mono text-xs" value={JSON.stringify(block, null, 2)} onChange={(e) => { try { onChange(JSON.parse(e.target.value) as Block); } catch { /* wait for valid JSON */ } }} /></Field></div>}
    </div>
    {preview && <div className="mt-4 rounded-2xl border-2 border-primary/30 bg-card p-5"><BlockView block={block} terms={terms} quizId="editor-preview" onAnswer={() => undefined} onStartActivityTimer={() => undefined} /></div>}
  </div>;
}

export function AddBlock({ onAdd }: { onAdd: (block: Block) => void }) {
  const [kind, setKind] = useState("text");
  return <div className="flex flex-wrap gap-2"><Select value={kind} onValueChange={setKind}><SelectTrigger className="w-52"><SelectValue /></SelectTrigger><SelectContent>{kinds.map((item) => <SelectItem key={item} value={item}>{labels[item]}</SelectItem>)}</SelectContent></Select><Button variant="outline" onClick={() => onAdd(makeBlock(kind))}>إضافة عنصر</Button></div>;
}
