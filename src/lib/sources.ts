import type { ImageResult } from "../types";

/**
 * Image search. Wikipedia and AniList need no key and cover what Unsplash
 * can't: fictional characters, shows, games, brands, and people. Unsplash stays
 * for real-world photos.
 */

export type SourceId = "wikipedia" | "anime" | "photos";

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as
    | string
    | undefined;

export const SOURCES: { id: SourceId; label: string; hint: string }[] = [
    {
        id: "wikipedia",
        label: "Wikipedia",
        hint: "People, characters, games, films, brands",
    },
    { id: "anime", label: "Anime", hint: "Shows, manga, and whole casts" },
    ...(UNSPLASH_KEY
        ? [
              {
                  id: "photos" as const,
                  label: "Photos",
                  hint: "Stock photos of real things",
              },
          ]
        : []),
];

const check = async (response: Response) => {
    if (!response.ok) throw new Error(`Search failed (${response.status})`);
    return response.json();
};

interface WikiPage {
    pageid: number;
    index: number;
    title: string;
    thumbnail?: { source: string };
}

export async function searchWikipedia(
    query: string,
    signal?: AbortSignal
): Promise<ImageResult[]> {
    const params = new URLSearchParams({
        action: "query",
        generator: "search",
        gsrsearch: query,
        gsrlimit: "30",
        prop: "pageimages",
        piprop: "thumbnail",
        pithumbsize: "256",
        // The default "free" filter drops fair-use art, which is nearly every
        // fictional character.
        pilicense: "any",
        format: "json",
        origin: "*",
    });
    const data = await check(
        await fetch(`https://en.wikipedia.org/w/api.php?${params}`, { signal })
    );
    const pages = Object.values(data.query?.pages ?? {}) as WikiPage[];

    return pages
        .filter((page) => page.thumbnail)
        .sort((a, b) => a.index - b.index)
        .map((page) => ({
            id: `wiki-${page.pageid}`,
            name: page.title.replace(/\s\(.*\)$/, ""),
            image: page.thumbnail!.source.split("?")[0],
        }));
}

/** Best guess at a picture for a plain name, used by "Find pictures". */
export async function findPicture(
    name: string,
    signal?: AbortSignal
): Promise<string | null> {
    const results = await searchWikipedia(name, signal);
    return results[0]?.image ?? null;
}

const ANILIST_URL = "https://graphql.anilist.co";

async function anilist<T>(
    query: string,
    variables: Record<string, unknown>,
    signal?: AbortSignal
): Promise<T> {
    const response = await fetch(ANILIST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
        signal,
    });
    if (response.status === 429) {
        throw new Error("Too many searches. Wait a moment and try again.");
    }
    const { data } = await check(response);
    return data as T;
}

interface AniMedia {
    id: number;
    type: "ANIME" | "MANGA";
    title: { english: string | null; romaji: string };
    coverImage: { large: string };
}

interface AniCharacter {
    id: number;
    // userPreferred, because full gives "Luffy Monkey" for Monkey D. Luffy.
    name: { userPreferred: string };
    image: { large: string };
}

export interface AnimeResults {
    media: (ImageResult & { mediaId: number; kind: string })[];
    characters: ImageResult[];
}

const toCharacter = (character: AniCharacter): ImageResult => ({
    id: `ani-char-${character.id}`,
    name: character.name.userPreferred,
    image: character.image.large,
});

// AniList's placeholder for characters with no art.
const hasArt = (character: AniCharacter) =>
    !character.image.large.includes("/default.");

export async function searchAnime(
    query: string,
    signal?: AbortSignal
): Promise<AnimeResults> {
    const data = await anilist<{
        media: { media: AniMedia[] };
        characters: { characters: AniCharacter[] };
    }>(
        `query ($q: String) {
            media: Page(perPage: 9) {
                media(search: $q, sort: SEARCH_MATCH, isAdult: false) {
                    id type
                    title { english romaji }
                    coverImage { large }
                }
            }
            characters: Page(perPage: 18) {
                characters(search: $q, sort: SEARCH_MATCH) {
                    id
                    name { userPreferred }
                    image { large }
                }
            }
        }`,
        { q: query },
        signal
    );

    return {
        media: data.media.media.map((media) => ({
            id: `ani-media-${media.id}`,
            mediaId: media.id,
            kind: media.type === "ANIME" ? "Anime" : "Manga",
            name: media.title.english ?? media.title.romaji,
            image: media.coverImage.large,
        })),
        characters: data.characters.characters
            .filter(hasArt)
            .map(toCharacter),
    };
}

export async function fetchCast(
    mediaId: number,
    signal?: AbortSignal
): Promise<ImageResult[]> {
    const data = await anilist<{
        Media: { characters: { nodes: AniCharacter[] } };
    }>(
        `query ($id: Int) {
            Media(id: $id) {
                characters(sort: [ROLE, RELEVANCE, ID], perPage: 50) {
                    nodes {
                        id
                        name { userPreferred }
                        image { large }
                    }
                }
            }
        }`,
        { id: mediaId },
        signal
    );
    return data.Media.characters.nodes.filter(hasArt).map(toCharacter);
}

interface UnsplashPhoto {
    id: string;
    urls: { raw: string };
    alt_description: string | null;
    description: string | null;
    user: { name: string };
    links: { download_location: string };
}

export async function searchPhotos(
    query: string,
    signal?: AbortSignal
): Promise<ImageResult[]> {
    const params = new URLSearchParams({
        query,
        per_page: "30",
        client_id: UNSPLASH_KEY ?? "",
    });
    const data = await check(
        await fetch(`https://api.unsplash.com/search/photos?${params}`, {
            signal,
        })
    );

    return (data.results as UnsplashPhoto[]).map((photo) => ({
        id: `unsplash-${photo.id}`,
        name: query,
        image: `${photo.urls.raw}&w=256&h=256&fit=crop&crop=entropy&q=75&fm=jpg`,
        credit: `Photo by ${photo.user.name} on Unsplash`,
        // Required by the Unsplash API guidelines when a photo is used.
        onUse: () => {
            const url = new URL(photo.links.download_location);
            url.searchParams.set("client_id", UNSPLASH_KEY ?? "");
            fetch(url).catch(() => undefined);
        },
    }));
}
