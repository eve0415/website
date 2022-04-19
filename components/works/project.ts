import type { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import type { Tag } from '.';

export interface Project {
    name: string;
    description: string;
    image: string;
    language: string;
    tag: readonly Tag[] | null;
    link: readonly {
        name: string;
        url: string;
        svg: EmotionJSX.Element;
    }[];
}
