import Link from "next/link";
import ChallengeViewModel from "../../libs/interfaces/viewModels/ChallengeViewModel";
import TypeScriptSvg from "./programming-language-icons/TypeScriptSvg";
import JavaScriptSvg from "./programming-language-icons/JavaScriptSvg";

export default function ChallengeList(props: { challenges: ChallengeViewModel[] }) {

  return (
      <div className="max-w-xl px-5 mx-auto sm:px-8 lg:px-0 md:max-w-2xl lg:max-w-none lg:pr-48">
        <div className="relative">
          <h3 className="pb-2.5 text-2xl font-medium text-gray-900 border-b border-gray-300/70 relative before:content-[''] before:left-0 before:w-24 before:h-px before:-bottom-px before:bg-red-600 before:absolute">Coding
            tasks</h3>
          <Link href="/challenge/create">

            <button
              className="text-white py-1.5 px-4 rounded bg-red-700 hover:bg-red-800 absolute absolute top-0 right-0">
            +
          </button>

        </Link>
      </div>
      {/* Container */}
      <div className="relative mt-10">
        <div className="grid gap-12 sm:grid-cols-1">

          {props.challenges.map(challenge => {

            return (
              <div key={challenge.id}>
                <Link href={`/challenge/${challenge.id}`}>
                  <div className="flex align-middle">
                    {challenge.language === "typescript" ?
                        <TypeScriptSvg/>
                        : <JavaScriptSvg/>
                    }
                    <h3 className="text-lg font-medium leading-6 text-gray-900 ml-2 mt-0.5">{challenge.name}</h3>
                  </div>
                </Link>
                <div className="mt-2 space-y-1 text-md">
                  <p className="text-gray-500">
                    {challenge.description}
                  </p>
                  {
                    challenge.approved ?
                        (<p className="text-green-500 flex -ml-1">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                               strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12"/>
                          </svg>

                          <span>Approved</span>
                        </p>) :
                        (
                            <p className="text-yellow-600 flex  -ml-1" title={"Our experts check your submission. Usually this takes a few hours. You will receive a message from use once it got approved. In case you are interested, we plan that our most active users can also approve article sources soon."}>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                              </svg>

                              <span>In Review</span>
                            </p>
                        )
                  }

                </div>
              </div>
          )})}

        </div>
      </div>
    </div>
  );
}
