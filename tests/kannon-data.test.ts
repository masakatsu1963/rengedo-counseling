import { describe, it, expect } from "vitest";
import { getKannonByNan, getAllKannon, type NanType } from "../constants/kannon-data";

describe("Kannon Data", () => {
  it("should have all seven kannon defined", () => {
    const allKannon = getAllKannon();
    expect(allKannon).toHaveLength(7);
  });

  it("should have correct mapping for each nan type", () => {
    expect(getKannonByNan("fire").name).toBe("聖観音");
    expect(getKannonByNan("water").name).toBe("千手観音");
    expect(getKannonByNan("wind").name).toBe("馬頭観音");
    expect(getKannonByNan("demon").name).toBe("十一面観音");
    expect(getKannonByNan("sword").name).toBe("如意輪観音");
    expect(getKannonByNan("chain").name).toBe("不空羂索観音");
    expect(getKannonByNan("grudge").name).toBe("准胝観音");
  });

  it("should have correct nan names", () => {
    expect(getKannonByNan("fire").nanName).toBe("火の難");
    expect(getKannonByNan("water").nanName).toBe("水の難");
    expect(getKannonByNan("wind").nanName).toBe("風の難");
    expect(getKannonByNan("demon").nanName).toBe("鬼の難");
    expect(getKannonByNan("sword").nanName).toBe("刀の難");
    expect(getKannonByNan("chain").nanName).toBe("鎖の難");
    expect(getKannonByNan("grudge").nanName).toBe("怨の難");
  });

  it("should retrieve kannon by nan type", () => {
    const fireKannon = getKannonByNan("fire");
    expect(fireKannon.name).toBe("聖観音");
    expect(fireKannon.nanName).toBe("火の難");
  });

  it("should have color themes for all kannon", () => {
    const allKannon = getAllKannon();
    allKannon.forEach((kannon) => {
      expect(kannon.colorTheme).toBeDefined();
      expect(kannon.colorTheme.primary).toBeDefined();
      expect(kannon.colorTheme.light).toBeDefined();
      expect(kannon.colorTheme.dark).toBeDefined();
    });
  });

  it("should have persona for all kannon", () => {
    const allKannon = getAllKannon();
    allKannon.forEach((kannon) => {
      expect(kannon.persona).toBeDefined();
      expect(kannon.persona.length).toBeGreaterThan(0);
    });
  });
});
