import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, postSlug } from '../blog';
import { defaultLocale, t } from '../i18n';

export async function GET(context: APIContext) {
  const posts = await getPosts(defaultLocale);

  return rss({
    title: 'Cutefish',
    description: t(defaultLocale, 'site.description'),
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${postSlug(post.id)}/`,
    })),
  });
}
