import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'internalName',
      title: 'Internal name',
      type: 'string',
      description: 'A short internal identifier for editors (not shown on the site unless used).',
    }),
    defineField({
      name: 'href',
      title: 'URL',
      type: 'url',
      description: 'Relative or absolute URL.',
    }),
    defineField({
      name: 'name',
      title: 'Display name',
      type: 'string',
      description: 'Visible label for the link (used in navs/buttons).',
    }),
  ],
})
