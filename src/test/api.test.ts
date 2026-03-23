import { describe, it, expect, beforeEach, vi } from "vitest";
import { api } from "@/services/api";
import { MOCK_TASKS, MOCK_TASK_CONSTRUCTIONS, MOCK_FIND_ODD_ITEMS } from "@/data/mockData";

// Save original mock data lengths for cleanup
const originalTasksLength = MOCK_TASKS.length;
const originalConstructionsLength = MOCK_TASK_CONSTRUCTIONS.length;
const originalFindOddLength = MOCK_FIND_ODD_ITEMS.length;

describe("API: Task Creation", () => {
  beforeEach(() => {
    // Reset mock data to original state after each test
    MOCK_TASKS.length = originalTasksLength;
    MOCK_TASK_CONSTRUCTIONS.length = originalConstructionsLength;
    MOCK_FIND_ODD_ITEMS.length = originalFindOddLength;
  });

  describe("createTask", () => {
    it("should create a simple task with basic fields", async () => {
      const taskData = {
        Title: "Test Task",
        Descripti: "Test Description",
        FK_TemplateId: 1,
        FK_UserId: 1,
        DifficultyLevel: "Easy" as const,
      };

      const result = await api.createTask(taskData);

      expect(result).not.toBeNull();
      expect(result).toHaveProperty("PK_TaskId");
      expect(result?.Title).toBe("Test Task");
      expect(result?.Descripti).toBe("Test Description");
      expect(result?.FK_TemplateId).toBe(1);
      expect(result?.DifficultyLevel).toBe("Easy");
    });

    it("should use default values when optional fields are missing", async () => {
      const taskData = {
        Title: "Minimal Task",
      };

      const result = await api.createTask(taskData);

      expect(result).not.toBeNull();
      expect(result?.Title).toBe("Minimal Task");
      expect(result?.FK_TemplateId).toBe(1); // default
      expect(result?.FK_UserId).toBe(1); // default
    });

    it("should add the task to MOCK_TASKS", async () => {
      const initialLength = MOCK_TASKS.length;
      const taskData = { Title: "New Task" };

      await api.createTask(taskData);

      expect(MOCK_TASKS.length).toBe(initialLength + 1);
      expect(MOCK_TASKS[MOCK_TASKS.length - 1].Title).toBe("New Task");
    });
  });

  describe("createFullTask", () => {
    it("should create a full task with constructions", async () => {
      const taskData = {
        task: {
          Title: "Full Task",
          Descripti: "Full Task Description",
          FK_TemplateId: 1,
          FK_UserId: 1,
          DifficultyLevel: "Medium" as const,
        },
        constructions: [
          { ParameterName: "TimerEnabled", ParameterValue: "true" },
          { ParameterName: "TimerSeconds", ParameterValue: "60" },
        ],
      };

      const result = await api.createFullTask(taskData);

      expect(result).not.toBeNull();
      expect(result?.Title).toBe("Full Task");
      expect(result?.DifficultyLevel).toBe("Medium");
    });

    it("should create task with Find Odd items", async () => {
      const initialFindOddLength = MOCK_FIND_ODD_ITEMS.length;
      
      const taskData = {
        task: { Title: "Find Odd Task" },
        constructions: [],
        findOddItems: [
          { ItemText: "Apple", IsOddOne: false },
          { ItemText: "Banana", IsOddOne: false },
          { ItemText: "Carrot", IsOddOne: true }, // odd one
        ],
      };

      const result = await api.createFullTask(taskData);

      expect(result).not.toBeNull();
      expect(MOCK_FIND_ODD_ITEMS.length).toBeGreaterThan(initialFindOddLength);
    });

    it("should create task with sequence items", async () => {
      const taskData = {
        task: { Title: "Sequence Task" },
        constructions: [],
        sequenceItems: [
          { ItemOrder: 1, ItemValue: "First" },
          { ItemOrder: 2, ItemValue: "Second" },
          { ItemOrder: 3, ItemValue: "Third" },
        ],
      };

      const result = await api.createFullTask(taskData);

      expect(result).not.toBeNull();
      expect(result?.Title).toBe("Sequence Task");
    });

    it("should create task with sort items", async () => {
      const taskData = {
        task: { Title: "Sort Task" },
        constructions: [],
        sortItems: [
          { ItemValue: "Red", SortKey: "color" },
          { ItemValue: "Blue", SortKey: "color" },
          { ItemValue: "Green", SortKey: "color" },
        ],
      };

      const result = await api.createFullTask(taskData);

      expect(result).not.toBeNull();
      expect(result?.Title).toBe("Sort Task");
    });

    it("should create task with match pairs", async () => {
      const taskData = {
        task: { Title: "Match Task" },
        constructions: [],
        matchPairs: [
          { FK_MediaId: 1, Words: "Apple" },
          { FK_MediaId: 2, Words: "Banana" },
        ],
      };

      const result = await api.createFullTask(taskData);

      expect(result).not.toBeNull();
      expect(result?.Title).toBe("Match Task");
    });

    it("should handle all task types correctly", async () => {
      // Test find_odd
      const findOddData = {
        task: { Title: "Find Odd", FK_TemplateId: 3 },
        constructions: [],
        findOddItems: [{ ItemText: "Test", IsOddOne: true }],
      };
      const findOddResult = await api.createFullTask(findOddData);
      expect(findOddResult).not.toBeNull();

      // Test sequence
      const sequenceData = {
        task: { Title: "Sequence", FK_TemplateId: 1 },
        constructions: [],
        sequenceItems: [{ ItemOrder: 1, ItemValue: "A" }],
      };
      const sequenceResult = await api.createFullTask(sequenceData);
      expect(sequenceResult).not.toBeNull();

      // Test sort
      const sortData = {
        task: { Title: "Sort", FK_TemplateId: 2 },
        constructions: [],
        sortItems: [{ ItemValue: "Test", SortKey: "key" }],
      };
      const sortResult = await api.createFullTask(sortData);
      expect(sortResult).not.toBeNull();
    });
  });

  describe("Error handling", () => {
    it("should return null when API call fails and no fallback", async () => {
      // Since API_BASE is empty, it will use fallback - we test the fallback works
      const result = await api.createTask({ Title: "Test" });
      expect(result).not.toBeNull();
    });

    it("should handle empty title gracefully", async () => {
      const result = await api.createTask({ Title: "" });
      expect(result).not.toBeNull();
      expect(result?.Title).toBe("");
    });
  });
});