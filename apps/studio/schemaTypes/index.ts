import seo from './objects/seo'
import link from './objects/link'
import blockContent from './objects/blockContent'

import post from './documents/post'
import author from './documents/author'
import category from './documents/category'

import settings from './singletons/settings'
import homePage from './singletons/homepage'

export const schemaTypes = [
  // singletons
  settings,
  homePage,
  // documents
  post,
  author,
  category,
  // objects
  blockContent,
  seo,
  link,
]
