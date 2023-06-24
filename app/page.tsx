import Image from "next/image";
import { css } from "styled-system/css";
import { circle, flex } from "styled-system/patterns";

export default function Page() {
  return (
    <div
      className={flex({
        direction: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100dvh",
      })}
    >
      <div
        className={circle({
          size: 300,
          position: "relative",
        })}
      >
        <Image
          src="https://eve0415.net/cdn-cgi/imagedelivery/e1FmkEoJCgY0rL0NK8GfGA/648ac891-edcf-4ae6-2c20-9cc7adae0401/public"
          alt="me"
          className={css({ borderRadius: "50%" })}
          fill
        />
      </div>

      <h1 className={css({ fontSize: "5xl" })}>eve0415</h1>
      <p className={css({ fontSize: "lg", fontSizeAdjust: {} })}>
        学生というステータスを失った人
      </p>
    </div>
  );
}
