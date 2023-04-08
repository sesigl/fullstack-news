import Link from 'next/link'
import Image from "next/image";
import siteConfig from '../../config/site.config'
import {useRouter} from 'next/router'
import {Fragment} from 'react'
import {Disclosure} from '@headlessui/react'
import AlgoliaSearch from "./AlgoliaSearch";
import SortMode, {getIconForSortMode} from "../../libs/interfaces/SortMode";
import capitalizeFirstLetter
  from "../../libs/parser/infrastructure/js/string/capitalizeFirstLetter";
import UserSubMenuMobile from "./user/UserSubMenuMobile";
import UserNavItemsDesktop from "./user/UserNavItemsDesktop";

export default function Navbar() {
  const router = useRouter();


  const mainItems = [
    {
      title: capitalizeFirstLetter(SortMode.HOT),
      href: `/`,
      activeSortValue: undefined,
      svgIcon: getIconForSortMode(SortMode.HOT)
    },
    {
      title: capitalizeFirstLetter(SortMode.NEW),
      href: `/sort/${SortMode.NEW}`,
      activeSortValue: SortMode.NEW,
      svgIcon: getIconForSortMode(SortMode.NEW)
    },
    {
      title: capitalizeFirstLetter(SortMode.TOP),
      href: `/sort/${SortMode.TOP}`,
      activeSortValue: SortMode.TOP,
      svgIcon: getIconForSortMode(SortMode.TOP)
    }
  ]

  const pagesSubmenu: {name: string, link: string}[] = [
    {
      "name": "About us",
      "link": "/about"
    },
    {
      "name": "Contact us",
      "link": "/contact"
    }
  ]

  const sortByValue = router.query.sort ? capitalizeFirstLetter(router.query.sort as string) : 'Hot'
  return (
    <Disclosure as="header" className="relative bg-transparent border-b border-gray-300/60">
      {({open}) => (
          <>
            <nav className="flex items-center h-20 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

              {/* Main navbar for large screens */}
              <div className="flex items-center justify-between w-full">

                {/* Logo */}
                <div className="flex items-center shrink-0">
                  <Link href="/" className="lg:hidden h-9">

                    <Image
                      src={siteConfig.favicon}
                      alt={siteConfig.logoText}
                      width={36}
                      height={36}
                      className="w-9 h-9" />

                  </Link>
                  <Link href="/" className="hidden lg:block h-9">

                    <Image
                      src={siteConfig.logo}
                      alt={siteConfig.logoText}
                      width={170}
                      height={36}
                      className="w-auto h-9" />

                  </Link>
                  {
                      sortByValue !== 'Hot' &&
                      <div className="md:hidden ml-6 flex flex-col items-center"
                           title={"Sorted by " + sortByValue}>{router.query.sort ?
                          <span>{getIconForSortMode(router.query.sort as SortMode)}</span> : getIconForSortMode(SortMode.HOT)} {sortByValue}</div>
                  }
                </div>

                {/* Navigation for large screens */}
                <div
                    className="ml-6 hidden md:flex justify-between items-center md:space-x-0.5 lg:space-x-2 text-xl md:text-base">

                  {
                    mainItems.map(item => (
                        (<Link
                          href={item.href}
                          key={"mainItem-" + item.href}
                          className={`flex flex-col content-center justify-items-center px-3 py-1 font-medium text-md ${(router.route === "/" || router.route === "/sort/[sort]") && router.query?.sort === item.activeSortValue ? 'text-red-700' : 'text-gray-800 transition duration-300 ease-in-out hover:text-red-700'}`}>

                          {item.svgIcon}
                          {item.title}

                        </Link>)
                    ))
                  }
                  <div className="flex-1"/>
                  <div className="pl-2 lg:pl-10 flex flex-row flex-shrink-0">
                            {pagesSubmenu.map(item => (
                                (<Link
                                  href={item.link}
                                  key={"otherItem-" + item.link}
                                  className={`flex flex-col content-center justify-items-center px-3 py-1 font-medium text-md transition duration-300 ease-in-out hover:text-red-700 ${(router.route === item.link) ? 'text-red-700' : ''}`}>

                                  {item.name}

                                </Link>)
                            ))
                            }
                  </div>
                </div>


                <AlgoliaSearch/>

                <UserNavItemsDesktop/>

                {/* Hamburger menu button */}
                <Disclosure.Button
                    className="flex items-center justify-center p-3 ml-6 transition duration-300 ease-in-out cursor-pointer rounded-xl bg-gray-50 hover:bg-gray-100 md:hidden group focus:outline-none">
              <span
                  className={`relative w-4 h-3.5 transition duration-500 ease-in-out transform rotate-0 ${open ? 'js-hamburger-open' : ''}`}>
                <span
                    className="absolute top-0 left-0 block w-full h-0.5 transition duration-300 ease-in-out transform rotate-0 bg-gray-600 rounded-full opacity-100 group-hover:bg-gray-900"/>
                <span
                    className="absolute left-0 block w-full h-0.5 transition duration-300 ease-in-out transform rotate-0 bg-gray-600 rounded-full opacity-100 top-1.5 group-hover:bg-gray-900"/>
                <span
                    className="absolute left-0 block w-full h-0.5 transition duration-300 ease-in-out transform rotate-0 bg-gray-600 rounded-full opacity-100 top-1.5 group-hover:bg-gray-900"/>
                <span
                    className="absolute left-0 block w-full h-0.5 transition duration-300 ease-in-out transform rotate-0 bg-gray-600 rounded-full opacity-100 top-3 group-hover:bg-gray-900"/>
              </span>
                </Disclosure.Button>

              </div>

            </nav>

            {/* Mobile menu */}
            <Disclosure.Panel>
              {({close: closePanel}) => (
                  <nav className=" md:hidden" aria-label="Global" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                      {
                        mainItems.map(item => (
                            (<Link
                              href={item.href}
                              key={"mobile-" + item.href}
                              onClick={() => {
                                closePanel()
                              }}
                              className={`flex flex-row content-start justify-items-start block px-4 py-3 font-medium rounded-lg ${(router.route === "/" || router.route === "/sort/[sort]") && router.query?.sort === item.activeSortValue ? 'bg-gray-50 text-red-700' : 'text-gray-800 hover:bg-gray-50 hover:text-red-700 transition duration-300 ease-in-out'}`}
                              aria-current="page">

                              {item.svgIcon}
                              <span
                                  className="flex-1 ml-2">{item.title}</span>

                            </Link>)
                        ))
                      }
                    </div>

                    <div className="pt-4 pb-3 border-t border-gray-300/70">
                      <UserSubMenuMobile/>
                    </div>

                    <div className="pt-4 pb-3 border-t border-gray-300/70">
                      <div
                          className="px-6 mt-2 text-xs font-medium tracking-widest text-gray-500 uppercase">Pages
                      </div>
                      <div className="px-2 mt-3 space-y-1">

                        <Fragment>
                          {pagesSubmenu.map((subLink, j) => (
                              (<Link
                                href={subLink.link}
                                key={j}
                                className={`block px-4 py-2 font-medium rounded-lg ${router.pathname == subLink.link ? 'bg-gray-50 text-red-700' : 'text-gray-600 hover:bg-gray-50 hover:text-red-700 transition duration-300 ease-in-out'}`}
                                aria-current="page">

                                {subLink.name}

                              </Link>)
                          ))}
                        </Fragment>

                      </div>
                    </div>
                  </nav>
              )}
            </Disclosure.Panel>
          </>
      )}
    </Disclosure>
  );
}
