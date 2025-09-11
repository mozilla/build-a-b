import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {documentInternationalization} from '@sanity/document-internationalization'
import {internationalizedArray} from 'sanity-plugin-internationalized-array'

export default defineConfig({
  name: 'default',
  title: 'Mozilla Billionaire Blast-Off',

  projectId: 'ik0si9ep',
  dataset: 'production',

  plugins: [
    structureTool(),
    visionTool(),
    documentInternationalization({
      supportedLanguages: [{id: 'en', title: 'English'}],
      schemaTypes: ['post', 'author', 'category', 'blockContent'],
    }),
    internationalizedArray({
      languages: [{id: 'en', title: 'English'}],
      fieldTypes: ['string', 'text'],
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
