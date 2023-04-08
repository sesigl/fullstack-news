import {Fragment} from "react";
import Link from "next/link";
import {useUser} from "@auth0/nextjs-auth0";
import {useRouter} from "next/router";

export default function UserSubMenuMobile() {
  const {user} = useUser();
  const router = useRouter();

  const userSubmenu = user ? [
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
  ] : [
    {
      "name": "Sign In",
      "link": "/profile"
    }
  ]


  return <>
    <div
        className="px-6 mt-2 text-xs font-medium tracking-widest text-gray-500 uppercase">User
    </div>
    <div className="px-2 mt-3 space-y-1">

      <Fragment>
        {userSubmenu.map((subLink, j) => (
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
  </>;
}
