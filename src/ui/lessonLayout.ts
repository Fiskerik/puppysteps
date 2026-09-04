export type LessonLayoutMode = "list" | "grid2" | "grid3";

/**
 * Three columns are useful on a tablet, but make lesson cards cramped on a
 * phone even in landscape. The shortest viewport edge is the stable signal
 * across orientation changes.
 */
export const canUseThreeColumnLessonGrid = (width: number, height: number): boolean => Math.min(width, height) >= 600 && width >= 700;

/** Keeps a previously selected three-column layout safe after a resize. */
export const resolveLessonLayoutMode = (requested: LessonLayoutMode, width: number, height: number): LessonLayoutMode => (
  requested === "grid3" && !canUseThreeColumnLessonGrid(width, height) ? "grid2" : requested
);

export const lessonGridColumns = (mode: LessonLayoutMode): number => mode === "grid3" ? 3 : 2;
