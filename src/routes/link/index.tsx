import type { FC, FormEvent } from "react";

import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface SocialLink {
  name: string;
  url: string;
  handle: string;
  icon: string;
  color: string;
}

const socialLinks: SocialLink[] = [
  {
    name: "GitHub",
    url: "https://github.com/eve0415",
    handle: "eve0415",
    icon: "GH",
    color: "hover:border-[#238636]/50",
  },
  {
    name: "Twitter / X",
    url: "https://twitter.com/eveevekun",
    handle: "@eveevekun",
    icon: "X",
    color: "hover:border-text-secondary/50",
  },
  {
    name: "Bluesky",
    url: "https://bsky.app/profile/eve0415.net",
    handle: "@eve0415.net",
    icon: "BS",
    color: "hover:border-[#0085ff]/50",
  },
  {
    name: "Discord",
    url: "#",
    handle: "eve0415",
    icon: "DC",
    color: "hover:border-[#5865F2]/50",
  },
];

const SocialLinkCard: FC<{ link: SocialLink; index: number }> = ({ link, index }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <a
      href={link.url}
      target={link.url !== "#" ? "_blank" : undefined}
      rel={link.url !== "#" ? "noopener noreferrer" : undefined}
      className={`group flex items-center gap-4 rounded-lg border border-border-subtle bg-bg-secondary p-4 transition-all duration-normal ${link.color} hover:shadow-lg ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <span className="flex size-12 items-center justify-center rounded-lg bg-bg-tertiary font-mono text-sm text-text-muted transition-colors group-hover:bg-accent-primary/10 group-hover:text-accent-primary">
        {link.icon}
      </span>
      <div>
        <span className="block font-medium text-text-primary group-hover:text-accent-primary">
          {link.name}
        </span>
        <span className="font-mono text-sm text-text-muted">{link.handle}</span>
      </div>
      <span className="ml-auto text-text-muted transition-transform group-hover:translate-x-1">
        →
      </span>
    </a>
  );
};

const CurrentTime: FC = () => {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const jstTime = new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now);
      setTime(jstTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span className="font-mono text-accent-primary tabular-nums">{time || "--:--:--"}</span>;
};

const LinkPage: FC = () => {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormState("submitting");

    // Simulate form submission - in production this would call a Cloudflare Worker
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For now, just show success
    setFormState("success");
    setFormData({ name: "", email: "", message: "" });

    // Reset after 3 seconds
    setTimeout(() => setFormState("idle"), 3000);
  };

  return (
    <main className="min-h-dvh px-6 py-24 md:px-12">
      {/* Header */}
      <header className="mb-16">
        <Link
          to="/"
          className="group mb-8 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent-primary"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          <span>Index</span>
        </Link>
        <h1 className="animate-fade-in-up font-bold text-4xl tracking-tight md:text-5xl">Link</h1>
        <p className="mt-4 text-text-secondary">連絡先 / SNS</p>
      </header>

      <div className="grid gap-16 lg:grid-cols-2">
        {/* Social Links */}
        <section>
          <h2 className="mb-8 font-mono text-sm text-text-muted uppercase tracking-wider">
            // Social
          </h2>
          <div className="grid gap-4">
            {socialLinks.map((link, index) => (
              <SocialLinkCard key={link.name} link={link} index={index} />
            ))}
          </div>

          {/* Direct email */}
          <div className="mt-8 rounded-lg border border-border-subtle border-dashed bg-bg-secondary/50 p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-bg-tertiary font-mono text-sm text-text-muted">
                @
              </span>
              <div>
                <span className="block text-sm text-text-muted">直接メール</span>
                <a
                  href="mailto:eve@eve0415.net"
                  className="font-mono text-text-secondary transition-colors hover:text-accent-primary"
                >
                  eve@eve0415.net
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section>
          <h2 className="mb-8 font-mono text-sm text-text-muted uppercase tracking-wider">
            // Contact
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label
                htmlFor="name"
                className="mb-2 block text-sm text-text-secondary transition-colors group-focus-within:text-accent-primary"
              >
                お名前
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-border-subtle bg-bg-secondary px-4 py-3 text-text-primary transition-all duration-fast placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                placeholder="山田太郎"
                disabled={formState === "submitting"}
              />
            </div>
            <div className="group">
              <label
                htmlFor="email"
                className="mb-2 block text-sm text-text-secondary transition-colors group-focus-within:text-accent-primary"
              >
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-lg border border-border-subtle bg-bg-secondary px-4 py-3 text-text-primary transition-all duration-fast placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                placeholder="you@example.com"
                disabled={formState === "submitting"}
              />
            </div>
            <div className="group">
              <label
                htmlFor="message"
                className="mb-2 block text-sm text-text-secondary transition-colors group-focus-within:text-accent-primary"
              >
                メッセージ
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                className="w-full resize-none rounded-lg border border-border-subtle bg-bg-secondary px-4 py-3 text-text-primary transition-all duration-fast placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                placeholder="ご用件をお書きください..."
                disabled={formState === "submitting"}
              />
            </div>
            <button
              type="submit"
              disabled={formState === "submitting" || formState === "success"}
              className={`group relative w-full overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-fast ${
                formState === "success"
                  ? "bg-accent-primary/20 text-accent-primary"
                  : "bg-accent-primary text-bg-primary hover:shadow-accent-glow/20 hover:shadow-lg"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span className="relative z-10">
                {formState === "submitting" ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-bg-primary border-t-transparent" />
                    送信中...
                  </span>
                ) : formState === "success" ? (
                  "送信完了！ ✓"
                ) : (
                  "送信する"
                )}
              </span>
            </button>
            {formState === "success" && (
              <p className="animate-fade-in-up text-center text-accent-primary text-sm">
                メッセージが送信されました。ありがとうございます！
              </p>
            )}
            {formState === "error" && (
              <p className="animate-fade-in-up text-center text-accent-tertiary text-sm">
                エラーが発生しました。もう一度お試しください。
              </p>
            )}
          </form>
        </section>
      </div>

      {/* Location / Time */}
      <section className="mt-24 border-border-subtle border-t pt-12">
        <div className="flex flex-wrap gap-8 text-sm text-text-muted md:gap-12">
          <div>
            <span className="block font-mono text-xs uppercase tracking-wider">Location</span>
            <span className="mt-1 block text-text-secondary">Tokyo, Japan</span>
          </div>
          <div>
            <span className="block font-mono text-xs uppercase tracking-wider">Timezone</span>
            <span className="mt-1 block text-text-secondary">UTC+9 (JST)</span>
          </div>
          <div>
            <span className="block font-mono text-xs uppercase tracking-wider">Current Time</span>
            <span className="mt-1 block">
              <CurrentTime />
            </span>
          </div>
          <div>
            <span className="block font-mono text-xs uppercase tracking-wider">Status</span>
            <span className="mt-1 flex items-center gap-2 text-text-secondary">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-accent-primary" />
              </span>
              Available
            </span>
          </div>
        </div>
      </section>

      {/* Navigation hint */}
      <div className="mt-16 flex justify-center">
        <Link
          to="/skills"
          className="group flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent-primary"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          <span>Skills Matrix</span>
        </Link>
      </div>
    </main>
  );
};

export const Route = createFileRoute("/link/")({
  component: LinkPage,
});
