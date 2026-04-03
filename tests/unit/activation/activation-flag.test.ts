import { afterEach, describe, expect, it } from "vitest";
import {
  ACTIVATION_COMPLETE_KEY,
  clearActivationFlag,
  isActivationComplete,
  markActivationComplete,
} from "@/lib/activation/activation-flag";

describe("activation-flag", () => {
  afterEach(() => {
    localStorage.clear();
  });

  describe("markActivationComplete", () => {
    it("writes the completion key to localStorage", () => {
      markActivationComplete();
      expect(localStorage.getItem(ACTIVATION_COMPLETE_KEY)).toBe("1");
    });

    it("is idempotent — calling twice does not throw", () => {
      markActivationComplete();
      markActivationComplete();
      expect(localStorage.getItem(ACTIVATION_COMPLETE_KEY)).toBe("1");
    });
  });

  describe("isActivationComplete", () => {
    it("returns false when key is absent", () => {
      expect(isActivationComplete()).toBe(false);
    });

    it("returns true after markActivationComplete", () => {
      markActivationComplete();
      expect(isActivationComplete()).toBe(true);
    });

    it("returns false when key has an unexpected value", () => {
      localStorage.setItem(ACTIVATION_COMPLETE_KEY, "yes");
      expect(isActivationComplete()).toBe(false);
    });
  });

  describe("clearActivationFlag", () => {
    it("removes the key from localStorage", () => {
      markActivationComplete();
      clearActivationFlag();
      expect(localStorage.getItem(ACTIVATION_COMPLETE_KEY)).toBeNull();
    });

    it("is safe to call when key is absent", () => {
      expect(() => clearActivationFlag()).not.toThrow();
    });
  });
});
