export interface FeedEntry { href: string, image:string }
export default function SidebarSocialLinks({feed}: {feed: FeedEntry[]}) {
  return (
    <div className="w-full p-5 bg-gray-50 sm:p-8 rounded-2xl">
      <h3 className="pb-2.5 text-2xl font-medium text-gray-900 border-b border-gray-300/70 relative before:content-[''] before:left-0 before:w-24 before:h-px before:-bottom-px before:bg-red-600 before:absolute">Instagram</h3>
      <div className="pt-6">
        <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-4">

          {feed.map((item, index) => (
            <div key={index} className="relative z-0 w-full overflow-hidden transition duration-300 ease-in-out transform translate-y-0 shadow-sm cursor-pointer pt-full rounded-2xl group hover:-translate-y-1">
              <a href={item.href} className="absolute inset-0 z-10 w-full h-full shadow-md rounded-2xl" />
              <div className="absolute inset-0 w-full h-full bg-gray-100 bg-center bg-no-repeat bg-cover z-[-1]" style={{backgroundImage: `url(${item.image})`}} />
              <div className="absolute inset-0 flex items-center justify-center w-full h-full transition duration-300 ease-in-out opacity-0 group-hover:opacity-90 bg-gradient-to-br">
                <div  className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600" viewBox="0 0 512 512" fill="currentColor">
                    <path xmlns="http://www.w3.org/2000/svg" d="M349.33 69.33a93.62 93.62 0 0193.34 93.34v186.66a93.62 93.62 0 01-93.34 93.34H162.67a93.62 93.62 0 01-93.34-93.34V162.67a93.62 93.62 0 0193.34-93.34h186.66m0-37.33H162.67C90.8 32 32 90.8 32 162.67v186.66C32 421.2 90.8 480 162.67 480h186.66C421.2 480 480 421.2 480 349.33V162.67C480 90.8 421.2 32 349.33 32z" />
                    <path xmlns="http://www.w3.org/2000/svg" d="M377.33 162.67a28 28 0 1128-28 27.94 27.94 0 01-28 28zM256 181.33A74.67 74.67 0 11181.33 256 74.75 74.75 0 01256 181.33m0-37.33a112 112 0 10112 112 112 112 0 00-112-112z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}