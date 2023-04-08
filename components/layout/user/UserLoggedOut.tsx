import Link from "next/link";

export default function UserLoggedOut() {
  return <>
    <Link href="/profile" className="hidden md:inline-block">

      <button
          className="text-white py-1.5 px-4 rounded bg-red-700 hover:bg-red-800">
        Sign In
      </button>

    </Link>
  </>;
}
