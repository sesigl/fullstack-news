export default function PostFetchInformation({personalized}: {personalized: boolean}) {

  const color = personalized ? "bg-red-600" : "bg-gray-400"

  return (
      <section className="pt-6 pb-0 bg-gray-50">
        <div
            className=" max-w-2xl px-4 mx-auto sm:px-6 lg:px-8 lg:max-w-screen-2xl lg:flex lg:items-start cursor-pointer">
          <div className={`flex flex-column rounded-full ${color} p-2 px-3`}
               data-tip={personalized ?
                   "Articles that are in your favorite categories are always on top." :
                   "Login to select favorite categories to enjoy a personalized experience." }
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                 strokeWidth={1.5}
                 stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"/>
            </svg>
            <span className="ml-2">{personalized ? "Personalized" : "Not personalized"}</span>
          </div>
        </div>
      </section>)

}
