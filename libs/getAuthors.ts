import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface Author {
  bio: string;
  frontmatter: {
    image: string,
    name: string,
    role: string,
    social_links: {
      name: string,
      url: string,
      role: string
    }[]
  };
  slug: string
}

export function getAuthors(): Author[] {
  const authorFiles = fs.readdirSync(path.join(process.cwd(), 'public', "content/authors"))
  return authorFiles.map((filename) => {
    const slug = filename.replace(".md", "")
    const authorContents = fs.readFileSync(
        path.join(process.cwd(), "public", "content/authors", filename),
        "utf8"
    )

    const {data: frontmatter, content: bio} = matter(authorContents)

    return {
      slug,
      frontmatter,
      bio,
    } as Author
  })
}