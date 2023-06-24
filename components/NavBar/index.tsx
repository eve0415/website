import { center, flex } from "styled-system/patterns";
import Button from "./Button";
import Item from "./Item";
import { pages } from "./pages";

const NavBar = () => {
  return (
    <>
      <Button />

      <nav
        className={center({
          width: "1/4",
          backgroundColor: "white",
          alignItems: "center",
          hideBelow: "md",
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
};

export default NavBar;
