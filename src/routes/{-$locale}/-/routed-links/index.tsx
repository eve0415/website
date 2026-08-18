import type { Locale } from '#i18n/locale';

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

/**
 * The `{-$locale}` segment for a link's `params`. Japanese is the unprefixed
 * locale, so its segment is absent rather than `ja`. The literal has to survive
 * inference — widened to `string`, the router rejects it.
 */
export const localeParams = (locale: Locale) => ({ locale: locale === 'en' ? ('en' as const) : undefined });
