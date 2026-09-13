export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  readingTime: number;
  author?: string;
  cover?: string;
}

export interface Post extends PostMeta {
  content: string;
}

// Vite glob import of all markdown files in src/content/posts/
const rawPosts = import.meta.glob<string>("../content/posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

function parseFrontmatter(raw: string): {
  meta: Record<string, any>;
  body: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const yaml = match[1];
  const body = match[2];
  const meta: Record<string, any> = {};

  for (const line of yaml.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;

    const key = trimmed.slice(0, colonIndex).trim();
    let value: any = trimmed.slice(colonIndex + 1).trim();

    // Handle array like [tag1, tag2]
    if (value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((s: string) => s.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
    } else {
      value = value.replace(/^['"]|['"]$/g, "");
    }

    meta[key] = value;
  }

  return { meta, body };
}

const parsedPosts: Post[] = Object.entries(rawPosts).map(([path, raw]) => {
  // Extract slug from filename (e.g. "../content/posts/hello-world.md" -> "hello-world")
  const filename = path.split("/").pop() || "";
  const slug = filename.replace(/\.md$/, "");

  const { meta, body } = parseFrontmatter(raw);
  const wordsCount = body.trim().length;
  const readingTime = Math.max(1, Math.ceil(wordsCount / 400));

  return {
    slug,
    title: meta.title || slug,
    date: meta.date || "2026-09-13",
    description: meta.description || "",
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    author: meta.author || "一个机场",
    cover: meta.cover,
    readingTime,
    content: body,
  };
});

// Sort descending by date
parsedPosts.sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);

export function getAllPosts(): PostMeta[] {
  return parsedPosts.map(({ content, ...meta }) => meta);
}

export function getPostBySlug(slug: string): Post | undefined {
  return parsedPosts.find((p) => p.slug === slug);
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const post of parsedPosts) {
    for (const tag of post.tags) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function getPostsByTag(tag: string): PostMeta[] {
  return parsedPosts
    .filter((p) => p.tags.includes(tag))
    .map(({ content, ...meta }) => meta);
}
