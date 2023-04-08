import fs from "fs"
import path from "path"

interface InstagramFeedEntry {
  image: string;
  href: string
}

export function getInstagramFeed(): InstagramFeedEntry[] {

  const instagramImages = fs.readdirSync(path.join(process.cwd(), "public/images/instagram"))
  return instagramImages.map((filename) => {
    return {
      image: `/images/instagram/${filename}`,
      href: "#"
    }
  })
}