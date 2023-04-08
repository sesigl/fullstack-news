import Link from 'next/link'
import Image from "next/image";
import siteConfig from '../../config/site.config'
import socialLinks from '../../config/social'
import MenuLinks from '../../config/menus'
import {getSocialIconComponent} from '../../utils/getSocialIconComponent'

export default function Footer() {
  return (
    <footer className="py-12 bg-white sm:py-20 lg:py-24">
      <div className="max-w-2xl px-4 mx-auto lg:max-w-screen-xl sm:px-6 lg:px-8">

        {/* Logo & Social Links */}
        <div className="sm:flex sm:justify-between sm:items-center">

          {/* Logo */}
          <div className="flex items-center justify-center">
            <Link href="/" className="block h-10">

              <Image
                src={siteConfig.logo}
                alt={siteConfig.logoText}
                width={188}
                height={40}
                placeholder="blur"
                blurDataURL={siteConfig.logo}
                className="w-auto h-10" />

            </Link>
          </div>

          {/* Social Links*/}
          <div className="flex items-center justify-center mt-6 sm:mt-0">
            <ul className="flex items-center space-x-3 sm:ml-4">
              {socialLinks.map((item) => (
                  <li key={item.name}>
                    <a href={item.href}
                       target={"_blank"}
                       className="flex items-center justify-center w-10 h-10 transition duration-300 ease-in-out bg-transparent border rounded-full border-gray-300/70 sm:w-12 sm:h-12 group" rel="noreferrer">
                      <span className="sr-only">{item.name}</span>
                      {getSocialIconComponent({
                        name: item.name,
                        props: {
                          className: "w-3.5 h-3.5 text-gray-700 transition duration-300 ease-in-out transform group-hover:text-red-700 group-hover:scale-110"
                        }
                      })}
                    </a>
                  </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Footer Links Container */}
        <div
            className="pt-10 mt-10 border-t md:flex md:justify-between md:items-center border-t-gray-300/70">

          {/* Footer Links */}
          <nav className="flex flex-wrap items-center justify-center -mx-5 -my-2 md:justify-start"
               aria-label="Footer">
            {MenuLinks.footer.map((item) => (
                (<Link
                  key={item.name}
                  href={item.link}
                  className="px-5 py-2 text-base text-gray-500 transition duration-300 ease-in-out hover:text-red-700">

                  {item.name}

                </Link>)
            ))}

            <span
                className="px-5 py-2 text-base text-gray-500 transition duration-300 ease-in-out hover:text-red-700 cursor-pointer"
                onClick={() => {
                  //@ts-ignore
                  window.displayPreferenceModal()
                }}>
                Manage Cookie Preferences
              </span>

            <Link
              href={"https://app.termly.io/notify/18231006-9766-40f2-bdbe-d5af52f59d75"}
              target={"_blank"}
              className="px-5 py-2 text-base text-gray-500 transition duration-300 ease-in-out hover:text-red-700 cursor-pointer">
              
                Data Subject Access Request
              
            </Link>
          </nav>

          {/* Copyright Text */}
          <p className="flex items-center justify-center mt-8 ml-0 text-base text-gray-400 md:ml-6 shrink-0 md:mt-0">
            {siteConfig.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
