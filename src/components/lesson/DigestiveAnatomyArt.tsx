import type { ReactNode } from "react";

type AnatomyPiece = { x: number; y: number; width: number; height: number; color: string; art: ReactNode };

// All pieces share a local 100 × 100 drawing space; their bounds are the
// single source of truth for thumbnails, assembly, and pointer hit testing.
export const ANATOMY_PIECES: Record<string, AnatomyPiece> = {
  mouth: { x: 45, y: 13, width: 10, height: 6, color: "var(--anatomy-mouth)", art: <>
    <path d="M4 48 Q22 24 42 38 Q50 29 58 38 Q78 24 96 48 Q75 80 50 73 Q24 80 4 48Z" />
    <path d="M8 49 Q50 59 92 49 Q73 66 50 65 Q26 66 8 49Z" fill="var(--anatomy-outline)" />
    <path d="M20 49 Q50 53 80 49 L75 57 Q50 61 25 57Z" fill="var(--anatomy-highlight)" stroke="none" />
  </> },
  esophagus: { x: 47.6, y: 18, width: 7, height: 27, color: "var(--anatomy-esophagus)", art: <>
    <path d="M20 2 Q50 7 67 2 L63 67 Q64 83 92 96 L71 99 Q35 85 34 68Z" />
    <path d="M37 6 L47 68 Q49 82 76 94" fill="none" stroke="var(--anatomy-highlight)" strokeWidth="5" />
    {[18, 28, 38, 48, 58].map(y => <path key={y} d={`M26 ${y} Q44 ${y + 3} 64 ${y}`} fill="none" strokeWidth="1.5" />)}
  </> },
  stomach: { x: 49, y: 40, width: 16, height: 15, color: "var(--anatomy-stomach)", art: <>
    <path d="M28 2 L39 3 Q35 22 48 22 Q61 3 78 12 Q99 23 93 53 Q90 84 59 92 Q29 100 16 83 Q7 75 2 82 L3 64 Q17 57 30 64 Q45 72 53 56 Q60 42 39 39 Q23 34 25 18Z" />
    <path d="M75 22 Q88 37 77 61 Q67 83 44 82 M65 30 Q75 42 64 62 Q57 72 43 72 M45 43 Q59 50 47 60" fill="none" stroke="var(--anatomy-fold)" strokeWidth="3" />
    <path d="M32 8 Q28 28 41 32" fill="none" stroke="var(--anatomy-highlight)" strokeWidth="4" />
  </> },
  "small-intestine": { x: 40, y: 57, width: 20, height: 16, color: "var(--anatomy-intestine)", art: <>
    <path d="M13 5 C2 5 3 24 20 24 H78 C98 24 98 39 78 39 H22 C2 39 2 54 22 54 H78 C98 54 98 69 78 69 H23 C5 69 5 85 23 85 H66 Q88 85 90 98" fill="none" stroke="var(--anatomy-outline)" strokeWidth="13" strokeLinecap="round" />
    <path d="M13 5 C2 5 3 24 20 24 H78 C98 24 98 39 78 39 H22 C2 39 2 54 22 54 H78 C98 54 98 69 78 69 H23 C5 69 5 85 23 85 H66 Q88 85 90 98" fill="none" stroke="var(--anatomy-intestine)" strokeWidth="10" strokeLinecap="round" />
    <path d="M17 23 H75 M25 54 H76 M24 85 H63" fill="none" stroke="var(--anatomy-highlight)" strokeWidth="1.8" opacity="0.65" />
  </> },
  "large-intestine": { x: 36, y: 53, width: 29, height: 29, color: "var(--anatomy-colon)", art: <>
    <path d="M14 62 L14 25 Q13 13 26 15 Q47 23 71 14 Q86 10 86 25 L85 62 Q85 76 69 75 Q53 73 52 89 L52 98" fill="none" stroke="var(--anatomy-outline)" strokeWidth="14" strokeLinecap="round" />
    <path d="M14 62 L14 25 Q13 13 26 15 Q47 23 71 14 Q86 10 86 25 L85 62 Q85 76 69 75 Q53 73 52 89 L52 98" fill="none" stroke="var(--anatomy-colon)" strokeWidth="11" strokeLinecap="round" />
    {[29, 40, 51, 61].map(y => <g key={y}><path d={`M9 ${y} Q14 ${y + 4} 19 ${y}`} fill="none" strokeWidth="1.5" /><path d={`M80 ${y} Q85 ${y + 4} 90 ${y}`} fill="none" strokeWidth="1.5" /></g>)}
    <path d="M9 66 Q7 80 2 82" fill="none" stroke="var(--anatomy-colon)" strokeWidth="3" />
    <path d="M32 18 L32 23 M44 20 L44 25 M57 18 L58 23 M70 15 L72 20" fill="none" strokeWidth="1.5" />
  </> },
  salivary: { x: 39, y: 11, width: 22, height: 11, color: "var(--anatomy-gland)", art: <>
    <path d="M9 8 Q2 12 5 29 Q0 38 9 48 Q18 55 25 43 Q32 32 24 23 Q26 8 17 5Z M91 8 Q98 12 95 29 Q100 38 91 48 Q82 55 75 43 Q68 32 76 23 Q74 8 83 5Z M28 68 Q25 56 35 57 Q48 60 42 76 Q33 85 28 68Z M72 68 Q75 56 65 57 Q52 60 58 76 Q67 85 72 68Z" />
    <path d="M21 33 L43 45 M79 33 L57 45 M38 61 L45 51 M62 61 L55 51" fill="none" strokeWidth="2.5" />
    <path d="M12 16 L18 21 M10 29 L18 32 M82 21 L88 16 M82 32 L90 29" fill="none" stroke="var(--anatomy-highlight)" strokeWidth="2" />
  </> },
  liver: { x: 34, y: 39, width: 24, height: 14, color: "var(--anatomy-liver)", art: <>
    <path d="M4 30 Q12 7 44 13 Q74 16 97 28 Q90 49 72 55 Q59 59 48 71 Q19 97 5 69 Q0 51 4 30Z" />
    <path d="M55 17 Q49 42 48 69 M12 32 Q29 22 44 25" fill="none" stroke="var(--anatomy-highlight)" strokeWidth="2" opacity="0.65" />
    <path d="M52 58 Q62 49 65 62 Q66 74 59 81 Q50 76 52 58Z" fill="var(--anatomy-bile)" />
    <path d="M60 79 L65 95" fill="none" stroke="var(--anatomy-bile)" strokeWidth="3" />
  </> },
  pancreas: { x: 45, y: 51, width: 20, height: 7, color: "var(--anatomy-pancreas)", art: <>
    <path d="M4 55 Q0 34 15 24 Q27 10 40 25 Q52 11 61 26 Q74 17 81 31 Q95 27 98 47 Q81 67 61 68 Q45 87 34 72 Q18 90 10 73Z" />
    <path d="M13 55 Q43 45 87 46 M24 31 L32 49 M45 29 L50 47 M66 34 L69 46 M29 67 L35 51 M52 68 L57 48" fill="none" stroke="var(--anatomy-fold)" strokeWidth="2" />
  </> },
  villi: { x: 75, y: 58, width: 19, height: 17, color: "var(--anatomy-intestine)", art: <>
    <path d="M4 95 L4 63 Q4 51 13 51 Q23 51 23 63 V76 H29 V26 Q29 5 41 5 Q53 5 53 26 V76 H59 V43 Q59 24 72 24 Q85 24 85 43 V76 H96 V95Z" />
    <path d="M36 91 V27 Q41 15 46 27 V91 M66 91 V44 Q72 34 77 44 V91" fill="none" stroke="var(--anatomy-blood)" strokeWidth="3" />
    <path d="M41 89 V30 M72 89 V46" fill="none" stroke="var(--anatomy-lymph)" strokeWidth="3" />
  </> },
  "absorption-site": { x: 38, y: 59, width: 9, height: 10, color: "var(--anatomy-absorption)", art: <>
    <ellipse cx="50" cy="50" rx="43" ry="43" fill="none" stroke="var(--anatomy-absorption)" strokeWidth="5" strokeDasharray="7 4" />
    <path d="M22 65 L59 28 M40 28 H59 V47 M32 77 L75 34 M58 34 H75 V51" fill="none" stroke="var(--anatomy-absorption)" strokeWidth="6" />
  </> },
  "blood-path": { x: 41, y: 35, width: 13, height: 29, color: "var(--anatomy-blood)", art: <>
    <path d="M66 96 Q30 84 27 66 L26 42 Q23 23 49 26 Q72 27 76 4 M27 68 L7 83 M28 61 L87 78" fill="none" stroke="var(--anatomy-outline)" strokeWidth="6" strokeLinecap="round" />
    <path d="M66 96 Q30 84 27 66 L26 42 Q23 23 49 26 Q72 27 76 4 M27 68 L7 83 M28 61 L87 78" fill="none" stroke="var(--anatomy-blood)" strokeWidth="4" strokeLinecap="round" />
    <path d="M19 49 L26 36 L34 49 M65 16 L77 4 L80 23" fill="none" stroke="var(--anatomy-blood)" strokeWidth="3" />
  </> },
  "lymph-path": { x: 53, y: 32, width: 16, height: 34, color: "var(--anatomy-lymph)", art: <>
    <path d="M5 96 Q58 88 58 66 L58 15 Q58 4 13 5 M58 70 L93 83 M58 62 L17 78" fill="none" stroke="var(--anatomy-outline)" strokeWidth="5" />
    <path d="M5 96 Q58 88 58 66 L58 15 Q58 4 13 5 M58 70 L93 83 M58 62 L17 78" fill="none" stroke="var(--anatomy-lymph)" strokeWidth="3.5" />
    {[25, 43, 61].map(y => <ellipse key={y} cx="58" cy={y} rx="5" ry="3" />)}
    <path d="M50 39 L58 29 L66 39 M25 1 L13 5 L25 10" fill="none" stroke="var(--anatomy-lymph)" strokeWidth="3" />
  </> },
  "cell-target": { x: 77, y: 23, width: 17, height: 15, color: "var(--anatomy-cell)", art: <>
    <path d="M49 5 Q75 0 85 24 Q105 46 88 69 Q83 92 56 94 Q24 99 11 77 Q-3 51 12 31 Q23 7 49 5Z" />
    <ellipse cx="52" cy="49" rx="18" ry="22" fill="var(--anatomy-gland)" />
    <ellipse cx="55" cy="48" rx="6" ry="8" fill="var(--anatomy-outline)" />
    <path d="M20 44 Q28 34 32 43 Q38 54 27 54Z M65 76 Q73 65 81 74 Q76 86 65 76Z" fill="var(--anatomy-pancreas)" />
    <path d="M68 25 Q81 32 77 47 M26 69 Q36 80 48 77" fill="none" stroke="var(--anatomy-highlight)" strokeWidth="3" />
  </> },
  heart: { x: 47, y: 30, width: 12, height: 12, color: "var(--anatomy-heart)", art: <>
    <path d="M42 26 L40 3 L52 3 L55 25 M64 27 Q63 8 82 10 L83 22 Q74 19 76 32" fill="none" stroke="var(--anatomy-blood)" strokeWidth="9" />
    <path d="M28 28 L17 12 L8 18 L21 39" fill="var(--anatomy-vein)" />
    <path d="M21 30 Q5 32 12 58 Q25 86 65 98 Q89 68 88 44 Q89 23 67 26 Q51 14 40 28 Q28 20 21 30Z" />
    <path d="M45 32 Q45 59 66 90 M46 52 L26 59 M53 65 L74 57" fill="none" stroke="var(--anatomy-fold)" strokeWidth="3" />
    <path d="M23 37 Q18 47 26 58" fill="none" stroke="var(--anatomy-highlight)" strokeWidth="3" />
  </> },
};

export function AnatomyOrgan({ id, ghost = false }: { id: string; ghost?: boolean }) {
  const piece = ANATOMY_PIECES[id];
  if (!piece) return null;
  return <g transform={`translate(${piece.x} ${piece.y}) scale(${piece.width / 100} ${piece.height / 100})`} fill={ghost ? "var(--anatomy-ghost)" : piece.color} stroke="var(--anatomy-outline)" strokeWidth="2" strokeLinejoin="round" opacity={ghost ? 0.16 : 1}>{piece.art}</g>;
}

export function AnatomyThumbnail({ id, className }: { id: string; className?: string }) {
  const piece = ANATOMY_PIECES[id];
  if (!piece) return null;
  return <svg viewBox="-7 -7 114 114" aria-hidden="true" className={className}><g fill={piece.color} stroke="var(--anatomy-outline)" strokeWidth="2" strokeLinejoin="round">{piece.art}</g></svg>;
}

export function AnatomyBody() {
  return <g>
    <path d="M50 2 C42 2 40 8 41 14 Q41 20 45 23 L45 27 Q42 28 36 29 Q29 30 26 37 L19 56 L15 65 Q13 68 15 71 Q17 72 19 68 L22 62 L31 44 L32 54 Q30 67 33 77 L36 97 L45 97 L48 77 L50 72 L52 77 L55 97 L64 97 L67 77 Q70 67 68 54 L69 44 L78 62 L81 68 Q83 72 85 71 Q87 68 85 65 L81 56 L74 37 Q71 30 64 29 L55 27 L55 23 Q59 20 59 14 C60 8 58 2 50 2Z" fill="var(--anatomy-body)" stroke="var(--anatomy-body-edge)" strokeWidth="0.55" />
    <path d="M45 27 Q50 30 55 27 M34 35 Q41 32 47 34 M53 34 Q60 32 66 35 M35 75 Q42 70 48 74 M52 74 Q58 70 65 75 M50 20 V26" fill="none" stroke="var(--anatomy-body-edge)" strokeWidth="0.35" opacity="0.5" />
    <path d="M37 37 Q33 51 36 66 Q40 75 50 76 Q60 75 64 66 Q67 51 63 37Z" fill="var(--anatomy-cavity)" opacity="0.7" />
    <path d="M44 10 Q45 9 46 10 M54 10 Q55 9 56 10 M50 11 L49 14 L51 14" fill="none" stroke="var(--anatomy-body-edge)" strokeWidth="0.45" />
  </g>;
}