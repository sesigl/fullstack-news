import Link from 'next/link'
import {ArrowSmRightIcon} from '@heroicons/react/solid'
import Image from "next/image";

export interface CareersProps {
  text: string,
  heading: string,
  locations: { name: string, icon: string, text: string }[],
  action: { href: string, text: string }
}

export default function Careers({careers}: { careers: CareersProps }) {
  return (
    <section className="py-12 bg-white sm:py-20 lg:py-28">
      <div
          className="grid max-w-xl gap-12 px-5 mx-auto sm:max-w-3xl sm:px-6 md:px-8 lg:max-w-screen-xl lg:grid-cols-2 lg:gap-16">

        {/* Content */}
        <div>
          <h2 className="max-w-lg text-3xl font-medium tracking-normal text-gray-900 sm:text-4xl md:tracking-tight lg:leading-tight lg:text-5xl">{careers.heading}</h2>
          <div className="mx-auto mt-6 text-lg leading-8 text-gray-500">
            <p>
              {careers.text}
            </p>
            <Link
              href={careers.action.href}
              className="inline-flex items-center mt-4 text-red-600 no-underline transition duration-300 ease-in-out sm:mt-5 hover:text-red-700 group">

              {careers.action.text}
              <ArrowSmRightIcon
                  className="w-5 h-5 ml-2 transition duration-300 ease-in-out group-hover:text-red-700 group-hover:translate-x-1.5"/>

            </Link>
          </div>
        </div>

        {/* Locations */}
        <div className="flex flex-col justify-center">
          <ul className="space-y-12 lg:space-y-14">

            {careers.locations.map((location) => (
                <li key={location.name} className="flex">
                  <div
                      className="flex items-center justify-center text-gray-600 rounded-lg w-14 h-14 sm:w-16 sm:h-16 shrink-0">

                    <Image
                      src={location.icon}
                      alt={location.name}
                      width={300}
                      height={300}
                      className="w-6 h-6 opacity-70 sm:w-7 sm:h-7"
                      style={{
                        maxWidth: "100%",
                        height: "auto"
                      }} />

                  </div>

                  <div className="w-full ml-3.5 sm:ml-6">
                    <p className="text-lg font-medium leading-6 text-gray-900">{location.name}</p>
                    <p className="mt-2 text-base text-gray-500">{location.text}</p>
                  </div>
                </li>
            ))}

          </ul>
        </div>

      </div>
    </section>
  );
}
