import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import product from './src/schemas/product';

export default defineConfig({
  name: 'default',
  title: 'Bijouterie 925',
  projectId: 'eq84rswz',
  dataset: 'production',
  plugins: [deskTool()],
  schema: {
    types: [product],
  },
});
