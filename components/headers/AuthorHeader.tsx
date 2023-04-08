import Image from "next/image";
import { getSocialIconComponent } from '../../utils/getSocialIconComponent'
import {Author} from "../../libs/getAuthors";

export default function AuthorHeader({author}: {author: Author}) {
  return (
    <section className="py-12 sm:py-16 bg-gray-50 md:py-20 lg:py-24">
      <div className="max-w-xl px-6 mx-auto lg:max-w-screen-xl sm:px-12 md:max-w-3xl lg:px-8">
        
        {/* Container */}
        <div className="flex flex-col items-center w-full md:flex-row md:justify-between">
          
          {/* Author Info */}
          <div className="flex flex-col items-center md:flex-row">
            
            {/* Image */}
            <div className="flex-shrink-0">
              <div className="relative w-24 h-24 bg-gray-100 rounded-xl">
                <Image
                  className="object-cover object-center rounded-2xl"
                  src={author.frontmatter.image}
                  alt={author.frontmatter.name}
                  fill
                  sizes="100vw" />
                <span className="absolute inset-0 shadow-inner rounded-xl" aria-hidden="true" />
              </div>
            </div>
            
            <div className="mt-6 text-center md:ml-5 md:mt-0 md:text-left">
              <p className="text-xs tracking-widest text-red-700 uppercase">
                {author.frontmatter.role}
              </p>
              <h1 className="mt-1.5 text-3xl font-medium tracking-normal text-gray-900 sm:text-4xl md:tracking-tight lg:leading-tight">
                {author.frontmatter.name}
              </h1>
            </div>
          </div>

          {/* Author Social Links */}
          <div className="mt-6 md:mt-0">
            
            {/* Links */}
            <ul className="flex items-center space-x-3">

              {author.frontmatter.social_links.map((socialLink: {name: string, url: string}) => (
                <li key={socialLink.name}>
                  <a href={socialLink.url} className="flex items-center justify-center w-10 h-10 transition duration-300 ease-in-out bg-transparent border rounded-full border-gray-300/70 sm:w-12 sm:h-12 group">
                    { getSocialIconComponent({
                      name: socialLink.name, 
                      props: { 
                        className: "w-4 h-4 text-gray-700 transition duration-300 ease-in-out transform group-hover:text-red-700 group-hover:scale-110" 
                      }
                    }) }
                  </a>
                </li>
              ))}
              
            </ul>
            
          </div>
          
        </div>
        
      </div>
    </section>
  );
}