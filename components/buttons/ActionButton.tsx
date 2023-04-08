import Link from "next/link";

export default function ActionButton({
                                       disabled,
                                       link,
                                       svgPath,
                                       text,
                                       buttonTitle,
                                       color,
                                       onButtonClick = () => {
                                       },
                                       active = false
                                     }: { disabled?: boolean, color: string, link?: string, svgPath: string, text: string | number, buttonTitle: string, onButtonClick: () => void, active: boolean }) {

  const buttonClassNameBase = "bg-transparent rounded"
  const disabledButtonClassName = disabled ? "" : "hover:bg-slate-200"
  const buttonClassName = "flex flex-row space-x-1 py-1 px-1 mr-0"
  const hasVotedClassName = disabled ? "text-gray-500" : (active ? "text-red-700" : "text-"+color)
  const hasVotedSvgColor = disabled ? "gray" : (active ? "rgb(185 28 28 / var(--tw-text-opacity)" : color)

  onButtonClick = disabled ? () => {
  } : onButtonClick


  const InnerCmp = () => <button
      className={`${buttonClassNameBase} ${buttonClassName} ${hasVotedClassName} ${disabledButtonClassName}`}
      title={buttonTitle}
      onClick={onButtonClick}
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5" fill="none"
         viewBox="0 0 24 24"
         stroke={hasVotedSvgColor} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
            d={svgPath}/>
    </svg>
    <span
        className={"grow-0 text-sm"}>{text}</span>
  </button>

  return <> {
    disabled || !link ? <InnerCmp/> :
        <Link href={link}>

          <InnerCmp/>

        </Link>
  }
  </>;
}