import { describe, it, expect } from "vitest";
import { KANNON_DATA, getKannonByNan, getAllKannon, type NanType } from "../constants/kannon-data";

describe("Kannon Data", () => {
  it("should have all seven kannon defined", () => {
    const allKannon = getAllKannon();
    expect(allKannon).toHaveLength(7);
  });

  it("should have correct mapping for each nan type", () => {
    expect(KANNON_DATA.fire.name).toBe("聖観音");
    expect(KANNON_DATA.water.name).toBe("千手観音");
    expect(KANNON_DATA.wind.name).toBe("馬頭観音");
    expect(KANNON_DATA.demon.name).toBe("十一面観音");
    expect(KANNON_DATA.sword.name).toBe("如意輪観音");
    expect(KANNON_DATA.chain.name).toBe("不空羂索観音");
    expect(KANNON_DATA.grudge.name).toBe("准胝観音");
  });

  it("should have correct nan names", () => {
    expect(KANNON_DATA.fire.nanName).toBe("火の難");
    expect(KANNON_DATA.water.nanName).toBe("水の難");
    expect(KANNON_DATA.wind.nanName).toBe("風の難");
    expect(KANNON_DATA.demon.nanName).toBe("鬼の難");
    expect(KANNON_DATA.sword.nanName).toBe("刀の難");
    expect(KANNON_DATA.chain.nanName).toBe("鎖の難");
    expect(KANNON_DATA.grudge.nanName).toBe("怨の難");
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
