export type CustomItem = {
  title: string;
  categories: string[];
  category: string[];
  creator: string;
  isoDate: string;
  link: string
  "media:content": {
    $: {
      url: string
    }
  },
  'content:encoded': string,
  'dc:creator': string,
  'media:thumbnail': {
    $: {
      url: string
    }
  }
};
