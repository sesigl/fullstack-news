# Fullstack News
Welcome to Fullstack News, a platform for reading and sharing news articles on technology, programming, and other related topics. This project uses a combination of cutting-edge technologies to provide a fast, secure, and seamless reading experience.
## Technologies
The platform is built using the following technologies:
<ul><li>CockroachDB: A distributed SQL database that provides scalability, resilience, and strong consistency.</li><li>TypeScript: A statically typed superset of JavaScript that makes code more predictable and easier to debug.</li><li>Next.js: A React-based web framework that provides server-side rendering, static site generation, and automatic code splitting.</li><li>Tailwind CSS: A utility-first CSS framework that enables rapid UI development and easy customization.</li><li>Vercel: A cloud platform for static and serverless deployment, providing fast and secure hosting for our application.</li><li>AWS: A cloud platform that provides a range of services for storage, computation, and networking.</li><li>Prisma: An ORM framework that simplifies database access and management, including automatic migrations and data modeling.</li><li>Auth0: An authentication and authorization platform that provides secure and easy-to-use identity management.</li><li>Algolia: A search-as-a-service platform that enables fast and efficient search capabilities for our users.</li><li>Fingerprint: A guest user handling library that provides a secure and privacy-focused way to track guest user activity.</li><li>Datadog: A logging and monitoring platform that enables us to track and analyze application performance and user behavior.</li></ul><h2>Installation</h2>
To run the platform locally, you need to have Node.js and npm installed. Then, clone the repository and install the dependencies using the following commands:

``` bash
git clone https://github.com/sesigl/fullstack-news.git
cd fullstack-news
npm install
```

You also need to set up a CockroachDB instance and configure the connection string in the  `.env`  file:

```
DATABASE_URL=""

AWS_ACCESS_KEY_CUSTOM=""
AWS_SECRET_KEY_CUSTOM=""
AWS_REGION_CUSTOM=""
AWS_ARTICLE_ASSET_BUCKET=""

DATADOG_API_KEY=""
FINGERPRINT_API_SECRET_KEY=""

ALGOLIA_ADMIN_API_KEY=""
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=""
NEXT_PUBLIC_ALGOLIA_INDEX=""
#NEXT_PUBLIC_ALGOLIA_INDEX=""

AUTH0_SECRET=""
AUTH0_BASE_URL=""
AUTH0_ISSUER_BASE_URL=""
AUTH0_CLIENT_ID=""
AUTH0_CLIENT_SECRET=""
AUTH0_AUDIENCE=""
AUTH0_SCOPE=""
```

Finally, start the development server by running:

``` bash
npm run dev
```
<h2>Contributing</h2>
This project is on hold.

<h2>License</h2>
Everything, <b>excluding the design</b>, in this project is licensed under the <a href="LICENSE" target="_new">MIT License</a>. To use the design for a project, you must  <a href="https://www.tailwindawesome.com/resources/banter" target="_new">buy the template</a>.
