import {Fragment} from 'react'
import {ArrowSmRightIcon} from '@heroicons/react/solid'
import socialLinks from '../../config/social'
import {getSocialIconComponent} from '../../utils/getSocialIconComponent'

export default function SidebarSocialLinks() {
  return (
    <div className="w-full p-5 bg-gray-50 sm:p-8 rounded-2xl">
      <h3 className="pb-2.5 text-2xl font-medium text-gray-900 border-b border-gray-300/70 relative before:content-[''] before:left-0 before:w-24 before:h-px before:-bottom-px before:bg-red-600 before:absolute">Follow us</h3>
      
      {/* Links */}
      <div className="pt-5">
        <div className="overflow-hidden">
          
          {socialLinks.map((socialLink, index) => (
            <Fragment key={index}>
              <a href={socialLink.href} target={"_blank"} className="flex items-center justify-between w-full group" rel="noreferrer">
                <div className="flex items-center">
                  <div>
                    <span className="flex items-center justify-center transition duration-300 ease-in-out bg-transparent border rounded-full w-9 h-9 border-gray-300/70">
                      { getSocialIconComponent({
                        name: socialLink.name, 
                        props: { 
                          className: "w-3.5 h-3.5 text-gray-700 transition duration-300 ease-in-out transform group-hover:text-red-700 group-hover:scale-110" 
                        }
                      }) }
                    </span>
                  </div>
                  <div className="relative flex flex-col flex-wrap col-span-3">
                    <div className="box-border flex flex-col justify-between flex-1 w-full px-6 md:px-0">
                      <div className="relative z-10 ml-3 text-base font-medium text-gray-700 capitalize duration-300 ease-in-out transition-color group-hover:text-red-600">
                        {socialLink.name}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <ArrowSmRightIcon className="text-red-400 w-5 h-5 mx-2 transition duration-300 ease-in-out group-hover:text-red-600 group-hover:translate-x-1.5" />
                </div>
              </a>

              {socialLinks.length != index && (
                <hr className="w-full my-2.5 border-t border-dashed border-gray-300/70 ml-13" />
              )}
            </Fragment>
          ))}

        </div>
      </div>

    </div>

  )
}
