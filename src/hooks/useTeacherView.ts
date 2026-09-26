import { useEffect, useState } from "react";
import { useQuery, useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getTeacherWorkspace, type TeacherWorkspace } from "@/lib/teacher-workspace.functions";

/** يعيد نسخة الأستاذ المنشورة إن كان مسجّلاً، وإلا null لعرض المحتوى الأصلي. */
export function useTeacherView(): { workspace: TeacherWorkspace | null } {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);
  const fetchWorkspace = useServerFn(getTeacherWorkspace);
  const query = useQuery({
    queryKey: ["teacher-workspace"],
    queryFn: () => fetchWorkspace(),
    enabled: signedIn,
    staleTime: 60_000,
  });
  return { workspace: (query.data as TeacherWorkspace | null) ?? null };
}
