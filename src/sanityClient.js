import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: 'eq84rswz',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2023-01-01',
});
