export interface LocationsInfo {heading: string, locations: {city: string, state: string, street_address: string, postal_code: string}[]}

export default function ContactLocations({locationsInfo}: {locationsInfo: LocationsInfo}) {
  return (
    <div className="max-w-xl px-5 mx-auto sm:px-8 lg:px-0 md:max-w-2xl lg:max-w-none lg:pr-48">
      <h3 className="pb-2.5 text-2xl font-medium text-gray-900 border-b border-gray-300/70 relative before:content-[''] before:left-0 before:w-24 before:h-px before:-bottom-px before:bg-red-600 before:absolute">{locationsInfo.heading}</h3>
      
      {/* Container */}
      <div className="relative mt-10">
        <div className="grid gap-12 sm:grid-cols-2">

          {locationsInfo.locations.map((location) => (
            <div key={location.city}>
              <h3 className="text-lg font-medium leading-6 text-gray-900 ">{`${location.state == "DC" ? location.city + " DC" : location.city}`}</h3>
              <div className="mt-2 space-y-1 text-md">
                <p className="text-gray-500">
                  {location.street_address}
                </p>
                <p className="text-gray-500">
                  {`${location.city}, ${location.state ? location.state : ''} ${location.postal_code}`}
                </p>
              </div>
            </div>
          ))}
          
        </div>
      </div>
      
    </div>
  )
}