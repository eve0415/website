import type { FC, PropsWithChildren } from "react";

import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";

import rootCss from "./__root.css?url";

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

const RootDocument: FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="ja">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-bg-primary text-text-primary">
        {children}
        <Scripts />
      </body>
    </html>
  );
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "eve0415",
      },
      {
        name: "description",
        content: "eve0415 - エンジニア",
      },
      {
        name: "theme-color",
        content: "#0a0a0a",
      },
      {
        property: "og:title",
        content: "eve0415",
      },
      {
        property: "og:description",
        content: "eve0415 - エンジニア",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: "https://eve0415.net",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:site",
        content: "@eveevekun",
      },
    ],
    links: [
      { rel: "stylesheet", href: rootCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "canonical", href: "https://eve0415.net" },
    ],
  }),
  component: RootComponent,
});
