import { canUseThreeColumnLessonGrid, lessonGridColumns, resolveLessonLayoutMode } from "./lessonLayout";

describe("lesson grid layout", () => {
  it("keeps both portrait and landscape phones on a two-column grid", () => {
    expect(canUseThreeColumnLessonGrid(393, 852)).toBe(false);
    expect(canUseThreeColumnLessonGrid(852, 393)).toBe(false);
    expect(resolveLessonLayoutMode("grid3", 393, 852)).toBe("grid2");
    expect(lessonGridColumns(resolveLessonLayoutMode("grid3", 852, 393))).toBe(2);
  });

  it("makes the three-column choice available when a tablet has safe card width", () => {
    expect(canUseThreeColumnLessonGrid(768, 1024)).toBe(true);
    expect(resolveLessonLayoutMode("grid3", 768, 1024)).toBe("grid3");
    expect(lessonGridColumns(resolveLessonLayoutMode("grid3", 768, 1024))).toBe(3);
  });

  it("uses the two-column fallback for a narrow tablet split view", () => {
    expect(canUseThreeColumnLessonGrid(620, 1024)).toBe(false);
    expect(resolveLessonLayoutMode("grid3", 620, 1024)).toBe("grid2");
  });
});
