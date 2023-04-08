import {Controller, useForm} from "react-hook-form";
import {ErrorMessage} from '@hookform/error-message';
import {trackEvent} from "../../libs/parser/infrastructure/splitbee/trackEvent";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import UserViewModel from "../../libs/interfaces/viewModels/UserViewModel";
import PreselectCategoriesModal from "./PreselectCategoriesModal";
import {useEffect, useState} from "react";
import objectHash from "object-hash";

export type ProfileFormValues = {
  displayName: string;
  newsletter: boolean;
  favoriteCategories: string[]
};

export default function ProfileForm({
                                      user,
                                      allExistingCategories
                                    }: { user: UserViewModel, allExistingCategories: string[]}) {

  const [isPreselectCategoryModalVisible, setIsPreselectCategoryModalVisible] = useState(false)

  const {register, control, setValue, watch, formState: {errors}} = useForm<ProfileFormValues>();
  const onSubmit = async (data: ProfileFormValues) => {
    await fetch("/api/updateUserData", {
      credentials: 'include',
      method: 'POST',
      body: JSON.stringify({
        allowNewsletter: data.newsletter,
        displayName: data.displayName,
        favoriteCategories: data.favoriteCategories
      }),
      headers: {
        'Content-Type': 'application/json'
      },
    })

    trackEvent("Profile save", {userId: user.id})
    .catch(console.error)
  }

  const watchAll = watch()

  const [currentFavoriteCategories, setCurrentFavoriteCategories] = useState(watchAll.favoriteCategories)

  useEffect(() => {
    setCurrentFavoriteCategories(watchAll.favoriteCategories)
  }, [watchAll.favoriteCategories])

  useEffect(() => {
    console.log('fireee')
    onSubmit(watchAll)
  }, [objectHash(watchAll)])

  const inputClassName = "appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter focus:outline-none focus:ring-2 focus:ring-red-100 focus:bg-white duration-300 ease-in-out rounded py-3 px-4 read-only:text-gray-500"
  const infoClassName = "text-grey-dark text-xs italic p-1 text-gray-500"
  const errorClassName = "text-red-500 text-xs italic p-1"

  const animatedComponents = makeAnimated();
  const options= allExistingCategories.map(category => ({
    value: category, label: category
  }))

  return (
      <div className="flex">
        {/* Content */}
        <div className="relative flex flex-col flex-wrap mt-6">
          <div
              className={`box-border flex flex-col justify-between flex-1 w-full md:px-0`}>
            <div>
              <form className="flex flex-col items-start">

                <div className="bg-white rounded flex flex-col my-2">
                  <div className="-mx-3 md:flex mb-6">
                    <div className="md:w-1/2 px-3 mb-6 md:mb-0">
                      <label
                          className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2"
                          htmlFor="favoriteCategories">
                        Favorite categories
                      </label>

                      <Controller
                          control={control}
                          defaultValue={user.favoriteCategories}
                          name="favoriteCategories"
                          render={({ field: { onChange, value}}) => (
                              <div className="flex">
                              <Select
                                  value={options.filter(c => value.includes(c.value))}
                                  onChange={val => onChange(val.map(c => c.value))}
                                  options={options}
                                  isMulti
                                  components={animatedComponents}
                              />
                                <div className="flex space-x-3 p-2 cursor-pointer">
                                  <div onClick={() => setIsPreselectCategoryModalVisible(true)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                                    </svg>
                                  </div>

                                </div>

                              </div>
                          )}
                      />


                      <p className={infoClassName}>Select your favorite categories to list matching
                        articles first. Click the settings icon behind to select from popular presets.</p>
                      <ErrorMessage errors={errors} name="favoriteCategories"
                                    render={({message}) => <p
                                        className={errorClassName}>{message}</p>}/>

                    </div>
                  </div>
                  <div className="-mx-3 md:flex mb-6">
                    <div className="md:w-1/2 px-3 mb-6 md:mb-0">
                      <label
                          className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2"
                          htmlFor="grid-display-name">
                        Display Name
                      </label>
                      <input
                          className={inputClassName}
                          {...register("displayName", {
                            required: true,
                            minLength: {
                              value: 3, message: "Display Name is too short"
                            },
                            maxLength: {
                              value: 50,
                              message: "Display Name is too long"
                            },
                            value: user?.displayName ?? ""
                          })} type="text"/>
                      <p className={infoClassName}>Your Display Name is shown in comments you
                        write.</p>
                      <ErrorMessage errors={errors} name="displayName"
                                    render={({message}) => <p
                                        className={errorClassName}>{message}</p>}/>

                    </div>
                  </div>
                  <div className="-mx-3 md:flex mb-6">
                    <div className="md:w-full px-3">
                      <label
                          className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2"
                          htmlFor="grid-email">
                        email
                      </label>
                      <input
                          className={inputClassName}
                          type="email"
                          value={user?.email as string}
                          readOnly={true}/>
                      <p className={infoClassName}>Read-only, not visible to others, Get
                        in contact
                        with us
                        if you
                        want to change your email address. (we did not built this feature yet) </p>
                    </div>
                  </div>
                  <div className="-mx-3 md:flex mb-2">
                    <div className="md:w-1/2 px-3 mb-6 md:mb-0 flex flex-col items-start">
                      <div
                          className="uppercase tracking-wide text-grey-darker text-xs font-bold mb-2">
                        Email Notifications
                      </div>
                      <div className="flex items-center p-3">
                        <input
                            {...register("newsletter", {
                              value: user?.allowNewsletter ?? false
                            })} type="checkbox" id="newsletter"
                            className="w-4 h-4 accent-red-700 border-0 rounded-md focus:ring-0  cursor-pointer mx-auto"/>
                        <label
                            className="tracking-wide ml-2  cursor-pointer select-none flex-1"
                            htmlFor="newsletter">
                          Newsletter
                        </label>
                      </div>
                    </div>

                  </div>
                </div>

              </form>
            </div>
          </div>
        </div>
        <PreselectCategoriesModal setValue={setValue} isVisible={isPreselectCategoryModalVisible} currentValues={currentFavoriteCategories} onClose={() => setIsPreselectCategoryModalVisible(false)}/>
      </div>
  )
}
