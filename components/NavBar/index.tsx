import Link from "next/link";
import { flex } from "styled-system/patterns";
import { pages } from "./pages";

const NavBar = () => {
  return (
    <nav
      className={flex({
        width: "1/4",
        direction: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      })}
    >
      {pages.map(({ name, icon, path }) => (
        <Link
          href={path}
          className={flex({ marginX: 16, marginY: 8, alignItems: "center" })}
        >
          {icon}
          {name}
        </Link>
      ))}
    </nav>
  );
};

export default NavBar;
