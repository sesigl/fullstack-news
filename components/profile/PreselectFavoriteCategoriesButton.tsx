import {UseFormSetValue} from "react-hook-form/dist/types/form";
import {ProfileFormValues} from "./ProfileForm";
import {ReactNode, useEffect, useState} from "react";
import contains from "../../utils/contains";

export default function PreselectFavoriteCategoriesButton({buttonText, onClickFormFieldName, onClickSetValues, svgIcon, setValue, currentValues}: {buttonText: string, onClickFormFieldName: keyof ProfileFormValues, onClickSetValues: string[], svgIcon: ReactNode,setValue: UseFormSetValue<ProfileFormValues>, currentValues: string[]}) {

  const [isFollowed, setFollowed] = useState(contains(currentValues, onClickSetValues))

  useEffect(() => {
    setFollowed(contains(currentValues, onClickSetValues))
  }, [onClickSetValues, currentValues])

  return (
      <div className="bg-gray-200 p-5  rounded-2xl m-2">

        <div className="flex flex-row">
          <div className="flex items-start mt-0.5">
            {svgIcon}
          </div>
          <div className="ml-3">
            <span className="text-black font-bold">{buttonText}</span>
            <div className="text-sm">
              {onClickSetValues.join(', ')}
            </div>
          </div>
          <div className="flex-1 flex justify-end items-center">
            {!isFollowed && <button
                className="text-white rounded bg-red-700 hover:bg-red-800 flex items-center justify-center p-2" onClick={() =>
            {
              setValue(onClickFormFieldName, [...currentValues, ...onClickSetValues])
            }}>

              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
              </svg>

              <div className="mr-1">Follow</div>
            </button>}

            {isFollowed && <button
                className="text-white rounded bg-gray-600 flex items-center justify-center p-2" onClick={() =>
            {
              setValue(onClickFormFieldName, currentValues.filter(v => !onClickSetValues.includes(v)))
            }}>

              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
              </svg>

              <div className="ml-1 mr-1">Unfollow</div>
            </button>}

          </div>

        </div>
      </div>
  )

}
