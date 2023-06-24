"use client";

import Item from "@components/NavBar/Item";
import { pages } from "@components/NavBar/pages";
import { useState } from "react";
import { css } from "styled-system/css";
import { center, circle, flex } from "styled-system/patterns";

export default function Button() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={circle({
          position: "fixed",
          top: "-20px",
          left: "-20px",
          height: 100,
          width: 100,
          zIndex: 100,
          backgroundColor: "#E5FCFB",
          hideFrom: "md",
        })}
        onClick={() => setOpen(!open)}
      >
        <div
          className={css({
            width: "1.5rem",
            height: "calc(0.125rem)",
            backgroundColor: "black",
            outline: "transparent solid 0.0625rem",
            transitionProperty: "background-color, transform",
            transitionDuration: "300ms",
            _before: {
              display: "block",
              top: "calc(-0.5rem)",
              position: "relative",
              content: '""',
              width: "1.5rem",
              height: "calc(0.125rem)",
              backgroundColor: "black",
              outline: "transparent solid 0.0625rem",
              transitionProperty: "background-color, transform",
              transitionDuration: "300ms",
            },
            _after: {
              display: "block",
              top: "calc(0.4rem)",
              position: "relative",
              content: '""',
              height: "calc(0.125rem)",
              backgroundColor: "black",
              transitionDuration: "300ms",
            },
            _open: {
              backgroundColor: "transparent",
              _before: {
                transform: "translateY(calc(0.5rem)) rotate(45deg)",
              },
              _after: {
                transform: "translateY(calc(-0.5rem)) rotate(-45deg)",
              },
            },
          })}
          // @ts-expect-error
          open={open}
        />
      </button>

      <nav
        className={center({
          width: "3/4",
          height: "100dvh",
          backgroundColor: "white",
          alignItems: "center",
          position: "absolute",
          zIndex: 10,
          display: open ? "flex" : "none",
        })}
      >
        <div
          className={flex({
            direction: "column",
            justifyContent: "center",
            fontSize: "xl",
          })}
        >
          {pages.map((page) => (
            <Item key={page.path} page={page} />
          ))}
        </div>
      </nav>
    </>
  );
}
