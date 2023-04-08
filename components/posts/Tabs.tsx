import {ReactNode, useState} from "react";

export default function Tabs({tabContent}: {tabContent: Record<string, ReactNode>}) {
  const color = "red"
  const [openTab, setOpenTab] = useState(0);
  return (
      <>
        <div className="flex flex-wrap flex-1">
          <div className="w-full my-5 flex flex-col">
            <div>
              <ul
                  className="flex mb-0 list-none flex-wrap pt-3 pb-4 flex-row mx-10"
                  role="tablist"
              > {Object.keys(tabContent).map((tabLabel, index) => (
                  <li key={tabLabel} className="-mb-px mr-2 last:mr-0 flex-auto text-center">
                    <a
                        className={
                            "text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
                            (openTab === index
                                ? "text-white bg-" + color + "-700"
                                : "text-" + color + "-700 bg-gray-100")
                      }
                      onClick={e => {
                        e.preventDefault();
                        setOpenTab(index);
                      }}
                        data-toggle="tab"
                        href={"#link" + index}
                        role="tablist"
                    >
                      {tabLabel}
                    </a>
                  </li>
              ))}
              </ul>
            </div>
            <div
                className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6  flex-1">
              <div className="px-4 py-5 flex-auto mx-6">
                <div className="tab-content tab-space h-full">
                  {Object.values(tabContent).map((tc, index) => (
                      <div className={(openTab === index ? "block" : "hidden") + " h-full"} id={"link" + (index)}
                           key={"link" + index}>
                        {tc}
                      </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
  );
}
