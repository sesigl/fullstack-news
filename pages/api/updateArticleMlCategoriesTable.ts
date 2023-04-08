import {NextApiRequest, NextApiResponse} from "next";
import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import ArticleMlCategoryCockroachRepository, {
  ArticleMlCategoryMapping
} from "../../libs/parser/infrastructure/cockroach/ArticleMlCategoryCockroachRepository";

export const API_KEY = "a193mf833di82jmedkj3";

let container = ContainerProvider.getContainerProvider();

const articleMlCategoryMappings: ArticleMlCategoryMapping[] = [
  {"ml_category_check": "entrepreneurship", "category": "Entrepreneurship"},
  {"ml_category_check": "growth-marketing", "category": "Entrepreneurship"},
  {"ml_category_check": "business-growth", "category": "Entrepreneurship"},
  {"ml_category_check": "startup", "category": "Entrepreneurship"},
  {"ml_category_check": "business", "category": "Entrepreneurship"},
  {"ml_category_check": "branding", "category": "Entrepreneurship" },

  {"ml_category_check": "blockchain", "category": "Blockchain"},
  {"ml_category_check": "cryptocurrency", "category": "Blockchain"},
  {"ml_category_check": "nft", "category": "Blockchain"},

  {"ml_category_check": "jobs", "category": "Jobs"},
  {"ml_category_check": "career", "category": "Jobs"},

  {"ml_category_check": "cloud-computing", "category": "Cloud"},
  {"ml_category_check": "google-cloud", "category": "Cloud"},
  {"ml_category_check": "amazon-web-services", "category": "Cloud"},
  {"ml_category_check": "serverless", "category": "Cloud"},

  {"ml_category_check": "relational-databases", "category": "Databases"},
  {"ml_category_check": "no-sql-databases", "category": "Databases"},

  {"ml_category_check": "data-science", "category": "Data-science"},
  {"ml_category_check": "neural-networks", "category": "Data-science"},
  {"ml_category_check": "artificial-intelligence", "category": "Data-science"},
  {"ml_category_check": "ai", "category": "Data-science"},
  {"ml_category_check": "machine-learning", "category": "Data-science" },

  {"ml_category_check": "developer-tools", "category": "Developer-tools" },

  {"ml_category_check": "developer-relations", "category": "Developer-relations" },

  {"ml_category_check": "devops", "category": "DevOps" },
  {"ml_category_check": "site-reliability-engineering", "category": "DevOps" },

  {"ml_category_check": "computer-science", "category": "Computer-Science" },
  {"ml_category_check": "math", "category": "Computer-Science" },

  {"ml_category_check": "game-development", "category": "Game-Development" },

  {"ml_category_check": "java-programming-language", "category": "Java" },

  {"ml_category_check": "go-programming-language", "category": "Go" },

  {"ml_category_check": "rust-programming-language", "category": "Rust" },

  {"ml_category_check": "python-programming-language", "category": "Python" },

  {"ml_category_check": "c-programming-language", "category": "C" },

  {"ml_category_check": "typescript-programming-language", "category": "TypeScript" },

  {"ml_category_check": "kotlin-programming-language", "category": "Kotlin" },

  {"ml_category_check": ".net-programming-language", "category": ".NET" },

  {"ml_category_check": "css", "category": "CSS" },


  {"ml_category_check": "analytics", "category": "Data" },
  {"ml_category_check": "data-engineering", "category": "Data" },

  {"ml_category_check": "android", "category": "Android" },
  {"ml_category_check": "ios", "category": "iOS" },

  {"ml_category_check": "ux-design", "category": "Web-design" },
  {"ml_category_check": "web-design", "category": "Web-design" },

  {"ml_category_check": "software-testing", "category": "Software-craftsmanship" },
  {"ml_category_check": "software-craftsmanship", "category": "Software-craftsmanship" },
  {"ml_category_check": "software-architecture", "category": "Software-craftsmanship" },
  {"ml_category_check": "clean-code", "category": "Software-craftsmanship" },

  {"ml_category_check": "web-development", "category": "Web-development" },
  {"ml_category_check": "frontend", "category": "Web-development" },
  {"ml_category_check": "gamification", "category": "Web-development" },

  {"ml_category_check": "javascript-programming-language", "category": "JavaScript" },
  {"ml_category_check": "react-javascript", "category": "React" },
  {"ml_category_check": "angular-javascript", "category": "Angular" },
  {"ml_category_check": "vue-javascript", "category": "Vue" },

  {"ml_category_check": "security", "category": "Security" },
  {"ml_category_check": "hacking", "category": "Security" }

]

export default async function handler(request: NextApiRequest,
                                      response: NextApiResponse) {

  if (request.query.key !== API_KEY) {
    response.status(400).send({error: 'invalid'})
  } else {

    let articleMlCategoryCockroachRepository = container.resolve(ArticleMlCategoryCockroachRepository);

    await articleMlCategoryCockroachRepository.syncCategories(articleMlCategoryMappings)

    response.status(200).send('')
  }

}
