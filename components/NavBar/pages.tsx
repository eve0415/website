import { AiFillHome } from "react-icons/ai";
import { MdContactPage, MdFace, MdWork } from "react-icons/md";

export const pages = [
  {
    name: "Home",
    icon: <AiFillHome />,
    path: "/",
  },
  {
    name: "About Me",
    icon: <MdFace />,
    path: "/me",
  },
  {
    name: "Projects",
    icon: <MdWork />,
    path: "/projects",
  },
  {
    name: "Contact",
    icon: <MdContactPage />,
    path: "/contact",
  },
] as const;
