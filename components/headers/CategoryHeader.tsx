import Link from 'next/link'
import Image from "next/image";
import {ChevronRightIcon, HomeIcon} from '@heroicons/react/solid'
import siteConfig from '../../config/site.config'

interface Category {
  image: string,
  name: string
}

export default function CategoryHeader({category}: { category: Category }) {
  return (
    <section className="py-12 bg-gray-50 sm:py-20 lg:py-24">

      {/* Conatiner */}
      <div className="max-w-xl px-4 mx-auto lg:max-w-screen-xl lg:px-8 md:max-w-3xl sm:px-12">
        <div className="flex flex-col items-center w-full md:flex-row md:justify-between">

          {/* Category */}
          <div className="flex flex-col items-center order-2 mt-8 md:mt-0 md:order-1 md:flex-row">

            {/* Image */}
            <div className="flex-shrink-0">
              <div className="relative w-[100px] h-[100px] bg-gray-100 rounded-2xl">
                <Image
                  className="object-cover object-center rounded-2xl"
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="100vw" unoptimized={true}/>
                <span className="absolute inset-0 shadow-inner rounded-2xl" aria-hidden="true"/>
              </div>
            </div>

            <div className="mt-6 text-center md:ml-5 md:mt-0 md:text-left">
              <p className="text-xs tracking-widest text-red-700 uppercase">
                Recent in
              </p>
              <h1 className="mt-1.5 text-3xl font-medium tracking-normal text-gray-900 sm:text-4xl md:tracking-tight lg:leading-tight lg:text-5xl capitalize">
                {category.name}
              </h1>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="order-1 md:order-2">
            <nav aria-label="breadcrumb"
                 className="flex items-center space-x-1.5 sm:space-x-4 text-[15px]">
            <span>
              <Link
                href="/"
                className="flex items-center text-gray-500 no-underline transition duration-300 ease-in-out hover:text-gray-900 hover:no-underline group">

                <HomeIcon
                    className="flex-shrink-0 w-[1.125rem] h-[1.125rem] mr-2 text-gray-400 transition duration-300 ease-in-out group-hover:text-gray-500"/>
                {siteConfig.logoText}

              </Link>
              
            </span>

              <span className="text-gray-400">
              <ChevronRightIcon className="w-5 h-5 text-gray-400"/>
            </span>
              <span className="text-red-700">{category.name}</span>
            </nav>
          </div>

        </div>
      </div>

    </section>
  );
}
