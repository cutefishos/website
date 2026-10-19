import { getCollection } from 'astro:content';
import type { Locale } from './i18n';

export async function getPosts(locale: Locale) {
  const posts = await getCollection('blog', (post) => {
    return post.id.startsWith(`${locale}/`) && !post.data.draft;
  });

  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function postSlug(id: string): string {
  return id.slice(id.indexOf('/') + 1);
}

export function formatDate(locale: Locale, date: Date): string {
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}
