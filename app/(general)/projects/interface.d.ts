interface Base {
  name: string;
  image: string;
  description: string;
}

export interface SimpleProject extends Base {
  url: string;
}

export interface AdvancedProject extends Base {
  links: {
    name: string;
    svg: JSX.Element;
    url: string;
  }[];
}
