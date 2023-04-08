import {ErrorMessage} from "@hookform/error-message";
import {UseFormRegister} from "react-hook-form/dist/types/form";
import {FieldErrors, FieldName, FieldValues} from "react-hook-form";
import {FieldPath} from "react-hook-form/dist/types/path";
import {FieldValuesFromFieldErrors} from "@hookform/error-message/dist/types";
import capitalizeFirstLetter
  from "../../libs/parser/infrastructure/js/string/capitalizeFirstLetter";

export default function ChallengeFormInputField<TFieldValues extends FieldValues>({label, placeholder, description, register, name, errors, type}: {
  label: string,
  placeholder: string,
  description: string,
  name: FieldPath<TFieldValues> & FieldName<FieldValuesFromFieldErrors<FieldErrors<TFieldValues>>>,
  register: UseFormRegister<TFieldValues>,
  errors: FieldErrors<TFieldValues>,
  type: "text" | "textarea"
}) {
  const infoClassName = "text-grey-dark text-xs italic p-1 text-gray-500"
  const inputClassName = "appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter focus:outline-none focus:ring-2 focus:ring-red-100 focus:bg-white duration-300 ease-in-out rounded py-3 px-4 read-only:text-gray-500"
  const errorClassName = "text-red-500 text-xs italic p-1"

  return <div className="w-full">
    <div className="">
      <label
          className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2"
          htmlFor="name">
        {label}
      </label>

      {
          type === "text" && <input
              className={inputClassName}
              {...register(name, {
                required: true,
                minLength: {
                  value: 3, message: `${capitalizeFirstLetter(name)} is too short`
                },
              })} type="text" placeholder={placeholder}/>
      }

      {
          type === "textarea" && <textarea
              className={inputClassName + " h-80"}

              {...register(name, {
            required: true,
            minLength: {
              value: 3, message: `${capitalizeFirstLetter(name)} is too short`
            },
          })}
          placeholder={placeholder}
          >
          </textarea>
      }

      <p className={infoClassName}>{description}</p>
      <ErrorMessage errors={errors} name={name}
                    render={({message}) => <p
                        className={errorClassName}>{message}</p>}/>

    </div>
  </div>

}
