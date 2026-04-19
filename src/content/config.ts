import { defineCollection, z } from 'astro:content';

// FAQ entries — one markdown file per question
const faqs = defineCollection({
  type: 'content',
  schema: z.object({
    question: z.string(),
    order: z.number().default(99),
    featured: z.boolean().default(false),
  }),
});

// Testimonials — one file per person
const testimonials = defineCollection({
  type: 'content',
  schema: z.object({
    author: z.string(),
    rating: z.number().min(1).max(5).default(5),
    featured: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

// Demo cards shown in "Inside the box" section
const cards = defineCollection({
  type: 'data',
  schema: z.object({
    number: z.string(),
    type: z.enum(['yes-no', 'nominate']),
    question: z.string(),
    palette: z.enum(['cyan', 'pink', 'white', 'cream', 'black']).default('cyan'),
    order: z.number().default(99),
  }),
});

export const collections = { faqs, testimonials, cards };
