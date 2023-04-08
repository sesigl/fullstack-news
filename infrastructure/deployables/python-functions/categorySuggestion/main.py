from http.server import BaseHTTPRequestHandler
from transformers import pipeline
import os
import requests
import pandas as pd
from sqlalchemy.engine import create_engine

article_update_count = 10
match_threshold = 0.7

categories = [
    {"ml_category_check": "blockchain", "category": "blockchain" },
    {"ml_category_check": "cryptocurrency", "category": "blockchain" },

    {"ml_category_check": "jobs", "category": "jobs" },
    {"ml_category_check": "career", "category": "jobs" },

    {"ml_category_check": "cloud-computing", "category": "cloud" },
    {"ml_category_check": "google-cloud", "category": "cloud" },
    {"ml_category_check": "amazon-web-services", "category": "cloud" },
    {"ml_category_check": "serverless", "category": "cloud" },

    {"ml_category_check": "relational-databases", "category": "databases" },
    {"ml_category_check": "no-sql-databases", "category": "databases" },

    {"ml_category_check": "data-science", "category": "data-science" },
    {"ml_category_check": "neural-networks", "category": "data-science" },
    {"ml_category_check": "artificial-intelligence", "category": "data-science" },

    {"ml_category_check": "developer-tools", "category": "developer-tools" },

    {"ml_category_check": "developer-relations", "category": "developer-relations" },

    {"ml_category_check": "devops", "category": "devops" },
    {"ml_category_check": "site-reliability-engineering", "category": "devops" },

    {"ml_category_check": "computer-science", "category": "computer-science" },
    {"ml_category_check": "math", "category": "computer-science" },
    
    {"ml_category_check": "game-development", "category": "game-development" },

    {"ml_category_check": "java-programming-language", "category": "java-programming-language" },
    
    {"ml_category_check": "go-programming-language", "category": "go-programming-language" },
    
    {"ml_category_check": "javascript-programming-language", "category": "javascript-programming-language" },
    
    {"ml_category_check": "rust-programming-language", "category": "rust-programming-language" },
    
    {"ml_category_check": "python-programming-language", "category": "python-programming-language" },
    
    {"ml_category_check": "c-programming-language", "category": "c-programming-language" },
    
    {"ml_category_check": "typescript-programming-language", "category": "typescript-programming-language" },
    
    {"ml_category_check": "kotlin-programming-language", "category": "kotlin-programming-language" },
    
    {"ml_category_check": ".net-programming-language", "category": ".net-programming-language" },

    {"ml_category_check": "css", "category": "css" },


    {"ml_category_check": "analytics", "category": "data" },
    {"ml_category_check": "data-engineering", "category": "data" },

    {"ml_category_check": "android", "category": "android" },
    {"ml_category_check": "ios", "category": "ios" },

    {"ml_category_check": "ux-design", "category": "ux-design" },

    {"ml_category_check": "software-testing", "category": "software-craftsmanship" },
    {"ml_category_check": "software-craftsmanship", "category": "software-craftsmanship" },
    {"ml_category_check": "software-architecture", "category": "software-craftsmanship" },
    {"ml_category_check": "clean-code", "category": "software-craftsmanship" },

    {"ml_category_check": "web-development", "category": "web-development" },

    {"ml_category_check": "security", "category": "security" },
    {"ml_category_check": "hacking", "category": "security" }

    ]

def execute_ml():
    print(os.environ)

    print("Request example.com")
    response = requests.get('http://example.com')
    print(response.status_code)
    print(response.content)

    engine = create_engine('cockroachdb://sesigl:wJ0108xHkKxDR3IIciw0Lg@free-tier13.aws-eu-central-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&options=--cluster%3Dfullstack-news-2691', connect_args={'sslmode': 'verify-ca', 'sslrootcert':'/opt/.postgresql/root.crt'})

    df_articles = get_articles_df(engine)

    result = []

    for index, row in df_articles.iterrows():
        update_res = get_category_and_update_row(text=row['title'] + " " + row['description'] + " " + ' '.join(row['tags']), article_id=row['id'], engine=engine)
        result.append(update_res)

    
    return str(result)

def get_articles_df(engine):
    df_articles = pd.read_sql(f'''
    SELECT * FROM "Article"
    WHERE ml_categories = ARRAY[]
    ORDER by "parsedAt" DESC 
    LIMIT {article_update_count}

    ''', engine)
    df_articles = df_articles.reset_index()  # make sure indexes pair with number of rows

    return df_articles

def get_category_and_update_row(text, article_id, engine):
    article_ml_mapping = get_article_ml_mapping(engine)

    categories_for_article = get_categories(text, article_ml_mapping)

    with engine.connect() as con:
        con.execute(f'''
        UPDATE "Article"
        SET ml_categories = ARRAY{categories_for_article}
        WHERE id='{article_id}';
        ''')

    return {"article_id": article_id, "text": text, "categories_for_article": categories_for_article}

def find_real_category_for_ml_check_category(ml_check_category, article_ml_mapping):
  return [article_ml_mapping[i]['category'] for i in range(len(article_ml_mapping)) if article_ml_mapping[i]['ml_category_check'] == ml_check_category][0]

def get_ml_categories(article_ml_mapping):
  return list(map(lambda x: x['ml_category_check'], article_ml_mapping))

def get_categories(text, article_ml_mapping):
  sequence_to_classify = text

  candidate_labels = get_ml_categories(article_ml_mapping)

  classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
  classification_res = classifier(sequence_to_classify, candidate_labels, multi_label=True)

  result_categories = []

  if classification_res['scores'][0] > match_threshold:
    result_categories.append(find_real_category_for_ml_check_category(classification_res['labels'][0], article_ml_mapping))

  if classification_res['scores'][1] > match_threshold:
    result_categories.append(find_real_category_for_ml_check_category(classification_res['labels'][1], article_ml_mapping))

  if classification_res['scores'][2] > match_threshold:
    result_categories.append(find_real_category_for_ml_check_category(classification_res['labels'][2], article_ml_mapping))
  
  if len(result_categories) == 0:
    return ["other"]
  else:
    return list(set(result_categories))

def get_article_ml_mapping(engine):
    categories_from_db = []

    df_category_mappings = pd.read_sql('''
    SELECT * FROM "ArticleMlCategory"
    ''', engine)
    
    df_category_mappings = df_category_mappings.reset_index()  # make sure indexes pair with number of rows


    for index, row in df_category_mappings.iterrows():
        categories_from_db.append({"ml_category_check": row['ml_category_check'], "category": row['article_category'] })

    return categories_from_db

def handler(event, context):

    result = execute_ml()

    return {
    'statusCode': 200,
    'body': result
    }




if __name__ == '__main__':
    result = execute_ml()
    print(result.encode('utf-8'))
