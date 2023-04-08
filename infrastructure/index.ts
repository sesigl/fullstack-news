import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

import axios from "axios";
import {User} from "@pulumi/aws/iam";
import {deployLambdas} from "./src/lambdas";
import {setupEcrRepositories} from "./src/ecr";

// const lambdaVpcConfig = deployVpcs()

setupEcrRepositories()

const categorySuggesterLambdaUrl = deployLambdas(
    //lambdaVpcConfig
)

function setupWebsiteStaticAssetBucket() {
  return new aws.s3.Bucket("fullstack-news-public-assets");
}

function setupStaticAssetBucketForArticles() {
  const fullstackNewsWebsiteUser = new aws.iam.User("fullstack-news-website", {});

  new aws.iam.UserPolicy("websiteUserAllowCloudwatchPutMetrics", {
    user: fullstackNewsWebsiteUser.id,
    policy: {
      Version: "2012-10-17",
      Statement: [{
        Action: ["cloudwatch:PutMetricData"],
        Effect: "Allow",
        Resource: "*",
      }],
    },
  });

  new aws.iam.UserPolicy("websiteUserAllowSesRawEmail", {
    user: fullstackNewsWebsiteUser.id,
    policy: {
      Version: "2012-10-17",
      Statement: [{
        Action: ["ses:SendRawEmail"],
        Effect: "Allow",
        Resource: "*",
      }],
    },
  });

  // for prod
  createBucketWithWriteAclAccessForUser("fullstack-news-article-assets", fullstackNewsWebsiteUser);

  // for dev and non-prod
  createBucketWithWriteAclAccessForUser("fullstack-news-article-assets-np", fullstackNewsWebsiteUser);
}

function createBucketWithWriteAclAccessForUser(name: string, fullstackNewsWebsiteUser: User) {
  const bucket = new aws.s3.Bucket(name);

  const allowAccessFromAnotherAccountPolicyDocument = aws.iam.getPolicyDocumentOutput({
    statements: [{
      principals: [{
        type: "AWS",
        identifiers: [fullstackNewsWebsiteUser.arn],
      }],
      actions: [
        "s3:PutObject",
        "s3:PutObjectAcl",
      ],
      resources: [
        bucket.arn,
        pulumi.interpolate`${bucket.arn}/*`,
      ],
    }],
  });
  new aws.s3.BucketPolicy("bucket-" + name + "-write-access", {
    bucket: bucket.id,
    policy: allowAccessFromAnotherAccountPolicyDocument.json,
  });
}

function createCloudwatchDashboards() {
  new aws.cloudwatch.Dashboard("Fullstack News Overview", {
    dashboardBody: `{
  "widgets": [
        {
            "height": 6,
            "width": 6,
            "y": 0,
            "x": 0,
            "type": "metric",
            "properties": {
                "metrics": [
                    [ { "expression": "SELECT SUM(\\"categoryImage.notFound\\") FROM FULLSTACKNEWS WHERE host = 'production'", "label": "Missing Category Images", "id": "q1", "region": "eu-central-1" } ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "eu-central-1",
                "stat": "Sum",
                "period": 300,
                "title": "Missing Category Images"
            }
        },
        {
            "type": "metric",
            "x": 6,
            "y": 0,
            "width": 6,
            "height": 6,
            "properties": {
                "metrics": [
                    [ { "expression": "SELECT SUM(pagevisit) FROM SCHEMA(FULLSTACKNEWS, host,path) WHERE host = 'production' GROUP BY path", "label": "", "id": "q1", "period": 300 } ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "eu-central-1",
                "stat": "Average",
                "period": 300,
                "title": "Page visits group by graph"
            }
        }
    ]
}
`,
    dashboardName: "Fullstack-News-Overview",
  });
}

createCloudwatchDashboards();

// Create an AWS resource (S3 Bucket)
const bucket = setupWebsiteStaticAssetBucket();
setupStaticAssetBucketForArticles();

const records = [
  new aws.route53.Record(
      "fullstack-news.com",
      {
        name: "",
        zoneId: "Z00762741KL680F03C516",
        type: "A",
        records: ["76.76.21.21"],
        ttl: 300
      }),
  new aws.route53.Record(
      "www.fullstack-news.com",
      {
        name: "www",
        zoneId: "Z00762741KL680F03C516",
        type: "CNAME",
        records: ["cname.vercel-dns.com"],
        ttl: 300
      }),
  new aws.route53.Record(
      "metrics.fullstack-news-com",
      {
        name: "metrics",
        zoneId: "Z00762741KL680F03C516",
        type: "A",
        records: ["15.197.237.80", "3.33.195.10"],
        ttl: 300
      }),
  new aws.route53.Record(
      "fullstack-news.com-google-search",
      {
        name: "",
        zoneId: "Z00762741KL680F03C516",
        type: "TXT",
        records: ["google-site-verification=QNYOOu_fWI_7de92s83bKRqAqGaJ_bDWzq5iQZd7rTs"],
        ttl: 300
      })
];

createExternalEndpointCallSchedule("https://www.fullstack-news.com/api/updateArticleMlCategoriesTable?key=a193mf833di82jmedkj3", "21 3 * * ? *", "updateArticleMlCategoriesTableEndpoint");
createExternalEndpointCallSchedule("https://www.fullstack-news.com/api/fetchAndStoreNewArticles?key=a193mf833di82jmedkj3&limit=2", "*/30 * * * ? *", "parseArticlesEndpoint");
createExternalEndpointCallSchedule("https://www.fullstack-news.com/api/syncArticlesToAlgolia?key=a193mf833di82jmedkj3", "1 0 * * ? *", "syncAlgolia");

function createExternalEndpointCallSchedule(url: string, schedule: string, name: string) {
  const callSyncAlgoliaEndpoint: aws.cloudwatch.EventRuleEventHandler = async (
      _event: aws.cloudwatch.EventRuleEvent
  ) => {
    await axios.get(url)
  };

  aws.cloudwatch.onSchedule(
      name,
      "cron(" + schedule + ")",
      callSyncAlgoliaEndpoint
  )
}


// Export the name of the bucket
export const bucketName = bucket.id;
export const lambdaPublicUrl = categorySuggesterLambdaUrl.apply(x => x);
