import fs from 'fs';
import matter from 'gray-matter';
import path from "path";

export interface ContentPage {
  frontmatter: { [p: string]: any };
  content: string
}

export function getContentPage(filePath: string): ContentPage {
  const readFileContents = fs.readFileSync(path.join(process.cwd(), 'public', filePath), 'utf8')
  const {data: frontmatter, content} = matter(readFileContents)

  return {
    frontmatter,
    content,
  }
}
