import {getContentPage} from "../../libs/getContentPage";

export default function Head() {

  const {contact} = getStaticProps();

  return <>
    <title>{contact.frontmatter.title}</title>
    <meta name="description" content={contact.frontmatter.description}/>
    <meta property="og:description" content={contact.frontmatter.description}/>
    <meta name="twitter:description" content={contact.frontmatter.description}/>
  </>

}

function getStaticProps() {
  return {
    contact: getContentPage('content/pages/imprint.md'),
    newsletter: getContentPage('content/shared/newsletter.md')
  };
}
