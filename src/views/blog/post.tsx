import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ToolCard } from "@/components/toolkit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { t } from "@/i18n";
import { getPostBySlug } from "@/lib/posts";
import { ArrowLeft, Calendar, Clock, Share2, Tag, User } from "lucide-react";
import { marked } from "marked";
import { toast } from "sonner";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = useMemo(() => (slug ? getPostBySlug(slug) : undefined), [slug]);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} - 一个机场 IP`;
      window.scrollTo(0, 0);
    } else {
      document.title = `${t("文章未找到")} - 一个机场 IP`;
    }
  }, [post]);

  const htmlContent = useMemo(() => {
    if (!post) return "";
    return marked.parse(post.content, {
      gfm: true,
      breaks: true,
    }) as string;
  }, [post]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t("链接已复制到剪贴板！"));
    }
  };

  if (!post) {
    return (
      <div className="rounded-xl border border-dashed p-16 text-center">
        <h2 className="text-xl font-bold text-foreground">
          {t("文章不存在或已移除")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("很抱歉，您访问的文章可能已被更名或删除。")}
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/blog" className="gap-2">
            <ArrowLeft className="size-4" />
            {t("返回文章列表")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Navigation & Action Bar */}
      <div className="flex items-center justify-between border-b pb-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Link to="/blog">
            <ArrowLeft className="size-4" />
            {t("返回博客列表")}
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="gap-1.5 text-xs"
        >
          <Share2 className="size-3.5" />
          {t("分享文章")}
        </Button>
      </div>

      {/* Post Header */}
      <header className="space-y-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {post.date}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {post.readingTime} {t("分钟阅读")}
          </span>
          {post.author && (
            <span className="flex items-center gap-1.5">
              <User className="size-3.5" />
              {post.author}
            </span>
          )}
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <Tag className="size-3 text-muted-foreground" />
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {/* Main Markdown Body */}
      <article
        className="blog-prose rounded-xl border bg-card p-6 shadow-xs sm:p-8"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* Footer Meta / Author card */}
      <ToolCard title={t("关于本文与作者")}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t(
              "本文由「一个机场 IP」发布。如有任何技术疑问或排查建议，欢迎在 Telegram 群组或 X (Twitter) 与我们交流探讨。",
            )}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <a
                href="https://t.me/yiyige163"
                target="_blank"
                rel="noopener noreferrer"
              >
                Telegram
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a
                href="https://x.com/ygjc_cc"
                target="_blank"
                rel="noopener noreferrer"
              >
                X (@ygjc_cc)
              </a>
            </Button>
          </div>
        </div>
      </ToolCard>
    </div>
  );
}
