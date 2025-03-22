import { defineCollection, z } from 'astro:content';

const sectionsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    sectionId: z.string(),
    items: z
      .array(
        z.object({
          title: z.string(),
          subtitle: z.string(),
          description: z.string(),
        })
      )
      .optional(),
  }),
});

export const collections = {
  'sections': sectionsCollection,
};