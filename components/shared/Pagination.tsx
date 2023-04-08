import Link from 'next/link'
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/solid'

export default function SidebarSocialLinks() {
  return (
    <nav className="flex items-center justify-between">
      <div className="flex flex-1 w-0">
        
        {/* Previous Button */}
        <Link
          href="components/shared/Pagination#"
          className="inline-flex items-center justify-center h-12 px-4 text-sm font-medium text-gray-500 transition duration-300 ease-in-out bg-gray-50 hover:bg-gray-100 hover:text-gray-700 rounded-xl">

          <ChevronLeftIcon className="w-5 h-5 mr-2.5 text-gray-400" />Previous
        </Link>
      </div>

      {/* Pages */}
      <div className="hidden md:flex space-x-2.5">
        <Link
          href="components/shared/Pagination#"
          className="inline-flex items-center justify-center w-12 h-12 text-sm font-medium text-gray-500 transition duration-300 ease-in-out bg-gray-50 hover:bg-gray-100 hover:text-gray-700 rounded-xl">
           1 
        </Link>
        
        {/* Current: "bg-red-500 text-white", Default: "text-gray-500 transition duration-300 ease-in-out bg-gray-50 hover:bg-gray-100 hover:text-gray-700" */}
        <Link
          href="components/shared/Pagination#"
          className="inline-flex items-center justify-center w-12 h-12 text-sm font-medium text-white bg-red-600 rounded-xl"
          aria-current="page">
           2 
        </Link>
        <Link
          href="components/shared/Pagination#"
          className="inline-flex items-center justify-center w-12 h-12 text-sm font-medium text-gray-500 transition duration-300 ease-in-out bg-gray-50 hover:bg-gray-100 hover:text-gray-700 rounded-xl">
           3 
        </Link>
        <Link
          href="components/shared/Pagination#"
          className="inline-flex items-center justify-center w-12 h-12 text-sm font-medium text-gray-500 transition duration-300 ease-in-out bg-gray-50 hover:bg-gray-100 hover:text-gray-700 rounded-xl">
           4 
        </Link>
  
        <span className="inline-flex items-center justify-center w-12 h-12 text-base font-medium text-gray-500">
          ...
        </span>

        <Link
          href="components/shared/Pagination#"
          className="inline-flex items-center justify-center w-12 h-12 text-sm font-medium text-gray-500 transition duration-300 ease-in-out bg-gray-50 hover:bg-gray-100 hover:text-gray-700 rounded-xl">
           10 
        </Link>
      </div>

      {/* Next Button */}
      <div className="flex justify-end flex-1 w-0">
        <Link
          href="components/shared/Pagination#"
          className="inline-flex items-center justify-center h-12 px-4 text-sm font-medium text-gray-500 transition duration-300 ease-in-out bg-gray-50 hover:bg-gray-100 hover:text-gray-700 rounded-xl">
          Next<ChevronRightIcon className="w-5 h-5 ml-2.5 text-gray-400" />

        </Link>
      </div>

    </nav>
  );
}