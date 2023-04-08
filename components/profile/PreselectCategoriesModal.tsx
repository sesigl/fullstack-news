import {useEffect, useState} from "react";
import PreselectFavoriteCategoriesButton from "./PreselectFavoriteCategoriesButton";
import {UseFormSetValue} from "react-hook-form/dist/types/form";
import {ProfileFormValues} from "./ProfileForm";


const presets = [
  {
    name: 'frontend',
    categories: [
      'Angular',
      'CSS',
      'Developer-tools',
      'JavaScript',
      'React',
      'Software-craftsmanship',
      'TypeScript',
      'Vue',
      'Web-design',
      'Web-development'
    ].sort()
  },
  {
    name: 'backend',
    categories: [
      '.NET',
      'Cloud',
      'Computer-Science',
      'Databases',
      'DevOps',
      'Developer-tools',
      'Go',
      'Java',
      'Kotlin',
      'Rust',
      'Software-craftsmanship'
    ].sort()
  },
]

export function getCategoriesForPreset(presetName: string): string[] {

  const matchingPreset = presets.find( (p) => p.name === presetName)

  if (!matchingPreset) {
    throw new Error(`No preset found for name ${presetName}`)
  }

  return matchingPreset.categories
}

export default function PreselectCategoriesModal({isVisible, onClose, setValue, currentValues}: {isVisible: boolean, onClose: () => void, setValue: UseFormSetValue<ProfileFormValues>, currentValues: string[]}) {

  const [isVisibleState, setIsVisibleState] = useState(isVisible)

  useEffect(() => {
    setIsVisibleState(isVisible)
  }, [isVisible])

  return (
      <>
      {isVisibleState ? (
      <div id="defaultModal" aria-hidden="true" className="fixed top-0 left-0 right-0 z-50 w-full h-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full bg-black bg-opacity-25">
        <div className="relative w-full h-full max-w-2xl md:h-auto  m-auto">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Popular Category Presets
              </h3>
              <button onClick={() => onClose()} type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="defaultModal">
                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                Many developers specialize in a certain area (e. g. Frontend), which fit often to roles in companies like Frontend Engineer. Follow a preselection of categories of your desired role.
              </p>
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                If your categories contain a full preset, your categories will be updated in case of presets are adapted.
              </p>
              <div className="text-base leading-relaxed text-gray-500 dark:text-gray-400 flex flex-col">

                <PreselectFavoriteCategoriesButton
                    onClickFormFieldName="favoriteCategories"
                    onClickSetValues={getCategoriesForPreset('frontend')}
                    buttonText="Frontend Preset"
                    setValue={setValue}
                    svgIcon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.25 2.25 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 01-5.276 3.67m0 0a9 9 0 01-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25" />
                    </svg>}
                    currentValues={currentValues}
                />

                <PreselectFavoriteCategoriesButton
                    onClickFormFieldName="favoriteCategories"
                    onClickSetValues={getCategoriesForPreset('backend')}
                    buttonText="Backend Preset"
                    setValue={setValue}
                    svgIcon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
                    </svg>}
                    currentValues={currentValues}
                />

              </div>
            </div>

          </div>
        </div>
      </div>) : <></>
  }
        </>
  )

}
