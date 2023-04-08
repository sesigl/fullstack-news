from http.server import BaseHTTPRequestHandler
from transformers import pipeline

def execute_ml():
    classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    sequence_to_classify = "Saving Settings for a Custom WordPress Block in the Block Editor We’ve accomplished a bunch of stuff in this series! We created a custom WordPress block that fetches data from an external API and renders it on the front end. Then we took that work and extended it so the data also renders directly in the WordPress block editor. After that, we created a settings UI for the block using components from the WordPress InspectorControls package.There’s one last bit for us to cover and that’s saving the settings options. If we recall from the last article, we’re technically able to “save” our selections in the block settings UI, but those aren’t actually stored anywhere."
    candidate_labels = [
                         "blockchain",
                         "career",
                         "cloud",
                         "databases",
                         "data-science",
                         "developer-tools",
                         "devops",
                         "site-reliability-engineering",
                         "developer-relations",
                         "computer-science",
                         "math",
                         "gaming",
                         "java-programming-language",
                         "go-programming-language",
                         "javascript-programming-language",
                         "rust-programming-language",
                         "python-programming-language",
                         "c-programming-language",
                         "typescript-programming-language",
                         "kotlin-programming-language",
                         "analytics",
                         "data-engineering",
                         ".net-programming-language",
                         "mobile-development",
                         "android",
                         "ios",
                         "css",
                         "ux-design",
                         "software-testing",
                         "web-development",
                         "neural-networks",
                         "artificial-intelligence",
                         "security",
                         "jobs"
                         ]
    classification_res = classifier(sequence_to_classify, candidate_labels, multi_label=True)
    return str(classification_res)


if __name__ == '__main__':
    result = execute_ml()
    print(result.encode('utf-8'))
