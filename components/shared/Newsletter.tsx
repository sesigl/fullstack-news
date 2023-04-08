import Image from "next/image";
import {ChangeEventHandler, ReactNode, useState} from "react";

export interface NewsletterProps {formAction: string, frontmatter: {formButtonText: string, formFooterText: string, subtext: string, bannerTitle: string, description: string, title: string, formPlaceholder: string}}

export default function Newsletter({newsletter, extraContent}: {newsletter: NewsletterProps, extraContent?: ReactNode}) {

  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleNewsletterInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setEmail(event.target.value);
  };

  async function handleNewsletterSignUp() {

    try {
      const result = await fetch("/api/addUserToNewsletter", {
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({
          email: email
        }),
        headers: {
          'Content-Type': 'application/json'
        },
      })

      if (!result.ok) {
        setError(true)
        console.error(result.statusText)
      } else {
        setEmail("")
        setSuccess(true)
        setError(false)
      }
    } catch (e) {
      setError(true)
      console.error(e)
    }


  }

  return (
    <section className="py-12 bg-gray-50 sm:py-20 lg:py-24">
      <div className="max-w-screen-xl px-5 mx-auto sm:px-6 lg:px-8">
       
        {/* Content */}
        <div className="flex flex-col items-center max-w-xl mx-auto text-center">
          <div className="relative w-24 h-auto animate-orbit">
            <Image
              src="/images/paper-airplane.png"
              alt="Newsletter"
              width={500}
              height={145}
              sizes="100vw"
              style={{
                width: "100%",
                height: "auto"
              }} />
          </div>
  
          <h2 className="mt-6 text-3xl font-medium tracking-normal text-gray-900 sm:text-4xl sm:mt-8 md:tracking-tight lg:leading-tight lg:text-5xl">{newsletter.frontmatter.bannerTitle}</h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-500">
            {newsletter.frontmatter.subtext}
          </p>

          {
            extraContent
          }


          {/* Newsletter signup container */}
          <div className="flex flex-col items-center w-full mt-8 sm:mt-10">
            <div className="relative w-full max-w-xl rounded-3xl h-14">
              
              {/* Newsletter signup form */}
              <div className="transition duration-300 ease-in-out bg-transparent border border-gray-300/70 rounded-3xl group">
                <input type="email" onKeyPress={(event) => {event.key === "Enter" ? handleNewsletterSignUp() : 0}} value={email} onChange={handleNewsletterInputChange} className="bg-white hover:bg-transparent text-gray-800 h-14 w-full pl-6 pr-36 py-3.5 border-0 border-transparent rounded-3xl leading-5 transition  focus:outline-none focus:ring-2 focus:ring-red-100 focus:bg-white duration-300 ease-in-out text-sm" placeholder={newsletter.frontmatter.formPlaceholder} autoComplete="email" />
                <button onClick={handleNewsletterSignUp} type="submit" className="uppercase tracking-widest text-red-700 inline-flex items-center h-11 absolute right-3 top-1.5 outline-none bg-transparent text-text-red-600 py-2 px-4 md:px-6 text-tiny sm:font-medium duration-300 ease-in-out focus:outline-none before:content-[&quot;&quot;] before:h-6 before:w-px before:bg-gray-300/70 before:left-0 before:right-auto before:absolute transition before:transition before:ease-in-out before:duration-300 hover:text-red-600">
                  {newsletter.frontmatter.formButtonText}
                </button>
              </div>

            </div>
            { success && <p className="mt-4 font-medium text-center text-green-600">You have successfully signed up.</p>}
            { error && <p className="mt-4 font-medium text-center text-red-600">Something went wrong. Check your mail address or try again later.</p>}
            <p className="mt-4 text-sm text-center text-gray-500">{newsletter.frontmatter.formFooterText}</p>
          </div>
        </div>

      </div>
    </section>
  );
}
