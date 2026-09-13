import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeading } from "@/components/toolkit";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { t } from "@/i18n";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { BookOpen, Calendar, Clock, Search, Tag } from "lucide-react";

export default function BlogIndexPage() {
  const allPosts = useMemo(() => getAllPosts(), []);
  const allTags = useMemo(() => getAllTags(), []);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchesTag = !selectedTag || post.tags.includes(selectedTag);
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q) ||
        post.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchesTag && matchesSearch;
    });
  }, [allPosts, selectedTag, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeading title={t("博客与技术教程")} description="" />

      {/* Header Info Banner */}
      <div className="rounded-xl border bg-card/60 p-5 shadow-xs backdrop-blur-xs">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <BookOpen className="size-5 text-primary" />
              {t("技术专栏与网络指南")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(
                "分享网络诊断、分流策略、WebRTC 隐私防护、节点测速与极客工具技巧。",
              )}
            </p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("搜索文章标题或标签…")}
              className="pl-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t pt-3">
            <span className="mr-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Tag className="size-3" />
              {t("标签：")}
            </span>
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={`cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                selectedTag === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t("全部")} ({allPosts.length})
            </button>
            {allTags.map(({ tag, count }) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  selectedTag === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tag} ({count})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Post Grid */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          <BookOpen className="mx-auto size-10 opacity-40" />
          <p className="mt-3 text-base font-medium">{t("未找到匹配的文章")}</p>
          <p className="mt-1 text-xs">
            {t("可以尝试更换关键词或清除标签筛选条件。")}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPosts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group block transition-transform hover:-translate-y-0.5"
            >
              <Card className="h-full border transition-shadow hover:border-primary/50 hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {post.readingTime} {t("分钟阅读")}
                    </span>
                  </div>
                  <CardTitle className="pt-2 text-lg font-bold transition-colors group-hover:text-primary">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {post.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[11px] font-normal"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
