import Image from "next/image";

export interface HeaderProps { image: string, subheader: string, heading: string }
export default function AboutHeader({header}: {header: HeaderProps}) {
  return (
    <section className="relative py-16 bg-center bg-cover bg-gray-900/80 sm:py-24 lg:py-36">
      
      {/* Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          className="object-cover w-full h-full"
          src={header.image}
          alt=""
          fill
          sizes="100vw" />
        <div className="absolute inset-0 bg-gray-800/80 mix-blend-multiply" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="relative max-w-xl px-5 mx-auto lg:max-w-screen-xl lg:px-8 md:max-w-3xl sm:px-12">
        <div className="flex items-center justify-between w-full">
          <div className="max-w-xl">
            <p className="text-xs tracking-widest text-red-300 uppercase">
              {header.subheader}
            </p>
            <h1 className="mt-3 text-3xl font-medium tracking-normal text-white sm:mt-4 sm:text-4xl md:tracking-tight lg:leading-tight lg:text-5xl">
              {header.heading}
            </h1>
          </div>
        </div>
      </div>
      
    </section>
  );
}