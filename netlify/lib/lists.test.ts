import { describe, expect, it } from "vitest";
import { cleanImage, decodeCover, pageOfFeed, parseSubmission, LIMITS } from "./lists";

const tiers = [{ id: "t1", name: "S", color: "#ff6b6b" }];
const items = [{ id: "i1", name: "Goku", image: null, tierId: "t1" }];
const valid = { title: "Best", author: "Nicole", tiers, items };

const inline = (bytes: number) =>
    `data:image/jpeg;base64,${"A".repeat(Math.ceil((bytes * 4) / 3))}`;

describe("parseSubmission", () => {
    it("accepts a valid list and defaults a blank author to Anonymous", () => {
        const result = parseSubmission({ ...valid, author: "   " });
        expect(result.ok && result.value.author).toBe("Anonymous");
    });

    it.each([
        ["no title", { ...valid, title: "  " }],
        ["bad color", { ...valid, tiers: [{ ...tiers[0], color: "red" }] }],
        ["no tiers", { ...valid, tiers: [] }],
        ["nothing ranked", { ...valid, items: [{ ...items[0], tierId: null }] }],
        ["duplicate ids", { ...valid, items: [items[0], items[0]] }],
    ])("rejects %s", (_name, body) => {
        expect(parseSubmission(body).ok).toBe(false);
    });

    it("rejects too many items", () => {
        const many = Array.from({ length: LIMITS.items + 1 }, (_, i) => ({
            ...items[0],
            id: `i${i}`,
        }));
        expect(parseSubmission({ ...valid, items: many }).ok).toBe(false);
    });

    it("sends items pointing at unknown tiers back to the tray", () => {
        const result = parseSubmission({
            ...valid,
            items: [items[0], { ...items[0], id: "i2", tierId: "nope" }],
        });
        expect(result.ok && result.value.items[1].tierId).toBeNull();
    });

    it("strips control characters and caps lengths", () => {
        const result = parseSubmission({
            ...valid,
            title: `a\u0000b\n${"x".repeat(200)}`,
        });
        expect(result.ok && result.value.title.startsWith("a b x")).toBe(true);
        expect(result.ok && result.value.title.length).toBe(LIMITS.title);
    });
});

describe("cleanImage", () => {
    it("allows the search CDNs over https", () => {
        const url = "https://s4.anilist.co/file/a.png";
        expect(cleanImage(url)).toBe(url);
    });

    it.each([
        ["other hosts", "https://evil.example/x.png"],
        ["plain http", "http://s4.anilist.co/a.png"],
        ["svg", "data:image/svg+xml;base64,AAAA"],
        ["script urls", "javascript:alert(1)"],
    ])("drops %s", (_name, value) => {
        expect(cleanImage(value)).toBeNull();
    });

    it("drops oversized inline images", () => {
        expect(cleanImage(inline(LIMITS.inlineImageBytes + 1024))).toBeNull();
        expect(cleanImage(inline(1024))).not.toBeNull();
    });
});

describe("decodeCover", () => {
    it("requires real JPEG bytes", () => {
        const jpeg = btoa(String.fromCharCode(0xff, 0xd8, 0xff, 0xe0));
        const png = btoa(String.fromCharCode(0x89, 0x50, 0x4e, 0x47));
        expect(decodeCover(`data:image/jpeg;base64,${jpeg}`)).not.toBeNull();
        expect(decodeCover(`data:image/jpeg;base64,${png}`)).toBeNull();
    });
});

describe("pageOfFeed", () => {
    const entry = (id: string, createdAt: number, forks: number) => ({
        id,
        title: `List ${id}`,
        author: id === "b" ? "Nicole" : "Sam",
        itemCount: 1,
        forks,
        createdAt,
        updatedAt: createdAt,
    });
    const index = [entry("a", 1, 9), entry("b", 2, 0), entry("c", 3, 4)];
    const options = { sort: "new", query: "", offset: 0, limit: 2 } as const;

    it("sorts by newest and by forks", () => {
        const ids = (sort: "new" | "top") =>
            pageOfFeed(index, { ...options, sort }).lists.map((e) => e.id);
        expect(ids("new")).toEqual(["c", "b"]);
        expect(ids("top")).toEqual(["a", "c"]);
    });

    it("searches titles and authors, and pages", () => {
        const found = pageOfFeed(index, { ...options, query: "nicole" });
        expect(found.lists.map((e) => e.id)).toEqual(["b"]);
        expect(pageOfFeed(index, options).nextOffset).toBe(2);
        expect(pageOfFeed(index, { ...options, offset: 2 }).nextOffset).toBeNull();
    });
});
