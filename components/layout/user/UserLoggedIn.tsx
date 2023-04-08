import Image from "next/image";
import {useUser} from "@auth0/nextjs-auth0";
import {Menu} from "@headlessui/react";
import {ChevronDownIcon} from "@heroicons/react/solid";
import Link from "next/link";
import {useRouter} from "next/router";

export default function UserLoggedIn() {
  const {user} = useUser();
  const router = useRouter();

  const loginMenu = [

    {
      "name": "Profile",
      "link": "/profile"
    },
    {
      "name": "Article Sources",
      "link": "/article-sources"
    },
    {
      "name": "Challenges",
      "link": "/challenges"
    },
    {
      "name": "Logout",
      "link": "/api/auth/logout"
    }
  ]

  return <>
    {/* Image */}
    <Menu as="div" className="relative hidden md:inline-block">
      {({open}) => {

        return <>
          <Menu.Button
              className={`flex items-center px-3 py-1 font-medium text-md group ${open ? 'text-red-700' : 'text-gray-800 hover:text-red-700 transition duration-300 ease-in-out'}`}
          >
            <div className="w-8 h-8 rounded">
              <Image
                className="rounded-full cursor-pointer"
                src={user?.picture ?? "https://fullstack-news-public-assets-15eab5f.s3.eu-central-1.amazonaws.com/images/user/blank-profile-picture.png"}
                alt={user?.name ?? "unknown"}
                width={32}
                height={32}
                style={{
                  maxWidth: "100%",
                  height: "auto"
                }} unoptimized={true}/>
            </div>
            <ChevronDownIcon
                className={`w-5 h-5 ml-2 transform duration-300 ${open ? 'rotate-180 text-red-700' : 'text-gray-600 group-hover:text-red-700'}`}
                aria-hidden="true"
            />
          </Menu.Button>


          <Menu.Items
              className="z-20 mt-3 absolute w-52 right-0 rounded-xl bg-white filter drop-shadow p-2.5 space-y-1">
            {loginMenu.map((subLink, i) => (
                <Menu.Item key={i}>
                  <Link
                    href={subLink.link}
                    className={`block rounded-lg py-3.5 px-5 font-medium ${router.pathname == subLink.link ? 'bg-gray-50 text-red-700' : 'text-gray-800 hover:bg-gray-50 hover:text-red-700 transition duration-300 ease-in-out'}`}>

                    {subLink.name}

                  </Link>
                </Menu.Item>
            ))}
          </Menu.Items>

        </>;
      }}
    </Menu>

    <div className={"hidden"}>
      <Link href="/api/auth/logout">Logout</Link>
      <Link href="/profile">Profile</Link>
    </div>
  </>;
}
