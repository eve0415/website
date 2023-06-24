import type { FC, ReactNode } from "react";

import localFont from "next/font/local";

import "@assets/globals.css";
import NavBar from "@components/NavBar";
import { css } from "styled-system/css";

const font = localFont({
  src: "../assets/LINESeedJP_OTF_Rg.woff2",
  display: "swap",
});

export const metadata = {
  title: "eve0415",
};

const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <html lang="ja">
      <body
        className={`${font.className} ${css({
          bgColor: "#E5FCFB",
          minHeight: "100dvh",
          display: "flex",
        })}`}
      >
        <NavBar />

        <main className={css({ width: "3/4" })}>{children}</main>
      </body>
    </html>
  );
};

export default Layout;
