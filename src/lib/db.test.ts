import { describe, expect, it } from "vitest";
import { migrateLegacyList } from "./db";
import { parseNames } from "../sheets/NamesSheet";
import { nameFromFile } from "./image";

describe("migrateLegacyList", () => {
    it("carries tier placement from tier names to tier ids", () => {
        const list = migrateLegacyList(
            {
                id: "123",
                name: "Pies",
                createdAt: "2025-01-01T00:00:00.000Z",
                tiers: [
                    { name: "S", color: "#ffb3ba" },
                    { name: "A", color: "#ffdfba" },
                ],
                items: [
                    { id: "x", name: "Apple", image: "🍎", tier: "A" },
                    { id: "y", name: "Pecan", image: "🥧", tier: null },
                ],
            },
            "done"
        );

        const [apple, pecan] = list.items;
        expect(apple.tierId).toBe(list.tiers[1].id);
        expect(pecan.tierId).toBeNull();
        expect(list.id).toBe("123");
        expect(list.createdAt).toBe(Date.UTC(2025, 0, 1));
    });
});

describe("parseNames", () => {
    it("splits lines and strips list markers", () => {
        expect(parseNames("1. Goku\n- Vegeta\n* Piccolo\n\n", [])).toEqual([
            "Goku",
            "Vegeta",
            "Piccolo",
        ]);
    });

    it("splits commas only when there are no line breaks", () => {
        expect(parseNames("Goku, Vegeta", [])).toEqual(["Goku", "Vegeta"]);
        expect(parseNames("Goku, the hero\nVegeta", [])).toEqual([
            "Goku, the hero",
            "Vegeta",
        ]);
    });

    it("removes duplicates, including against existing items", () => {
        expect(parseNames("Goku\ngoku\nVegeta", ["VEGETA"])).toEqual(["Goku"]);
    });
});

describe("nameFromFile", () => {
    it.each([
        ["IMG_2041.jpg", ""],
        ["Screenshot 2026-10-31 121142.png", ""],
        ["PXL_20261031_120000.jpg", ""],
        ["3f2b8c1e-9a4d-4e21-8f6a-1b2c3d4e5f60.jpeg", ""],
        ["image.png", ""],
        ["Rock Lee.png", "Rock Lee"],
        ["sasuke_final-form.webp", "sasuke final form"],
    ])("%s becomes %j", (file, name) => {
        expect(nameFromFile(file)).toBe(name);
    });
});
