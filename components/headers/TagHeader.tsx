import Link from 'next/link'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/solid'
import siteConfig from '../../config/site.config'

export default function TagHeader({tag}: {tag: string}) {
  return (
    <section className="py-12 bg-gray-50 sm:py-20 lg:py-24">
      
      {/* Conatiner */}
      <div className="max-w-xl px-4 mx-auto lg:max-w-screen-xl lg:px-8 md:max-w-3xl sm:px-12">
        <div className="flex items-center justify-between w-full">
         
          {/* Tag */}
          <div>
            <p className="text-xs tracking-widest text-red-700 uppercase">
              Recent in
            </p>
            <h1 className="mt-2 text-3xl font-medium tracking-normal text-gray-900 sm:text-4xl md:tracking-tight lg:leading-tight lg:text-5xl">
              {tag}
            </h1>
          </div>
          
          {/* Breadcrumb */}
          <div className="hidden md:block">
            <nav aria-label="breadcrumb" className="flex items-center space-x-1.5 sm:space-x-4 text-[15px]">
              <span>
                <Link
                  href="/pages"
                  className="flex items-center text-gray-500 no-underline transition duration-300 ease-in-out hover:text-gray-900 hover:no-underline group">

                  <HomeIcon className="sm:inline-block hidden flex-shrink-0 w-[1.125rem] h-[1.125rem] mr-2 text-gray-400 transition duration-300 ease-in-out group-hover:text-gray-500" />
                  {siteConfig.logoText}

                </Link>
                
              </span>
              
              <span className="text-gray-400">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              </span>
              <span className="text-red-700">{tag}</span>
            </nav>
          </div>

        </div>
      </div>

    </section>
  );
}