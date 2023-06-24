import { center, flex } from "styled-system/patterns";
import Item from "./Item";
import { pages } from "./pages";

const NavBar = () => {
  return (
    <nav
      className={center({
        width: "1/4",
        backgroundColor: "white",
        alignItems: "center",
      })}
    >
      <div
        className={flex({
          direction: "column",
          justifyContent: "center",
          fontSize: "xl",
          height: "100dvh",
        })}
      >
        {pages.map((page) => (
          <Item key={page.path} page={page} />
        ))}
      </div>
    </nav>
  );
};

export default NavBar;
