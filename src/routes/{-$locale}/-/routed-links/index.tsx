import { createLink } from '@tanstack/react-router';

import { Button } from '#components/button';

import { CometLink } from './comet-link';
import { ProjectCard } from './project-card';

/**
 * The design library renders plain anchors and knows nothing about routing —
 * `createLink` is what puts the router behind one without the component
 * learning about it. `to` is typed against the route tree, so a link to a page
 * that does not exist is a compile error rather than a dead href.
 */
export const ButtonLink = createLink(Button);
export const CometNavLink = createLink(CometLink);
export const ProjectCardLink = createLink(ProjectCard);
