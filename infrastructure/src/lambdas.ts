import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsnative from "@pulumi/aws-native";
import {local} from "@pulumi/command";
import * as awsx from "@pulumi/awsx";
import {Input, Output, OutputInstance} from "@pulumi/pulumi";
import {lambda} from "@pulumi/aws/types/output";
import FunctionVpcConfig = lambda.FunctionVpcConfig;

export function deployLambdas(
  // vpcConfig: Output<FunctionVpcConfig>
  ): OutputInstance<string> {

  // const filesystem = new aws.efs.FileSystem("fsn-lambda-fs", {
  //   tags: {
  //     Name: "fsn-lambda-fs",
  //   },
  //   availabilityZoneName: 'eu-central-1b',
  //   encrypted: true
  // });

  // const mountTarget = new aws.efs.MountTarget(`fsn-mount-target`, {
  //   fileSystemId: filesystem.id,
  //   subnetId: vpcConfig.subnetIds[0],
  //   securityGroups: [vpcConfig.securityGroupIds[0]],
  // })

  // const ap = new aws.efs.AccessPoint("fsn-lambda-ap-ml_models", {
  //   fileSystemId: filesystem.id,
  //   posixUser: {uid: 1001, gid: 1001},
  //   rootDirectory: {
  //     path: "/ml_models",
  //     creationInfo: {ownerGid: 1001, ownerUid: 1001, permissions: "755"}
  //   },
  //   tags: {
  //     Name: "fsn-lambda-ap-ml_models",
  //   },
  // }, {dependsOn: mountTarget});


  const image = awsx.ecr.buildAndPushImage("fsn-categorySuggester", {
    context: "deployables/python-functions/categorySuggestion",
  });

  const role = new aws.iam.Role("fsnCategorySuggesterRole", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({Service: "lambda.amazonaws.com"}),
    inlinePolicies: [
      {
        name: "my_inline_policy",
        policy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [{
            Action: [
              "ec2:DescribeInstances",
              "ec2:CreateNetworkInterface",
              "ec2:AttachNetworkInterface",
              "ec2:DescribeNetworkInterfaces",
              "ec2:DeleteNetworkInterface"
            ],
            Effect: "Allow",
            Resource: "*",
          }],
        }),
      },

    ],
  });
  new aws.iam.RolePolicyAttachment("lambdaFullAccess", {
    role: role.name,
    policyArn: aws.iam.ManagedPolicy.AWSLambdaExecute,
  });

  const lambda = new aws.lambda.Function("categorySuggester", {
    packageType: "Image",
    imageUri: image.imageValue,
    role: role.arn,
    timeout: 900,
    // vpcConfig: {
    //   subnetIds: vpcConfig.subnetIds,
    //   securityGroupIds: vpcConfig.securityGroupIds,
    // },
    // fileSystemConfig: {arn: ap.arn, localMountPath: "/mnt/ml_models"},
    memorySize: 8184,
    reservedConcurrentExecutions: 1,
    ephemeralStorage: {
      size: 10240
    }
  });


  // const lambdaRole = new awsnative.iam.Role("lambdaRole", {
  //   assumeRolePolicyDocument: {
  //     Version: "2012-10-17",
  //     Statement: [
  //       {
  //         Action: "sts:AssumeRole",
  //         Principal: {
  //           Service: "lambda.amazonaws.com",
  //         },
  //         Effect: "Allow",
  //         Sid: "",
  //       },
  //     ],
  //   },
  // });
  //
  // const lambdaRoleAttachment = new aws.iam.RolePolicyAttachment(
  //     "lambdaRoleAttachment",
  //     {
  //       role: pulumi.interpolate`${lambdaRole.roleName}`,
  //       policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
  //     }
  // );
  //
  // const lambda = new awsnative.lambda.Function("lambda", {
  //   role: lambdaRole.arn,
  //   // runtime: "python3.9",
  //   // handler: "fetchSuggestedCategory.lambda_handler",
  //   // code: {
  //   //   s3Key: "python-functions/lambda/deps.zip",
  //   //   s3Bucket: "fullstack-news-lambdas-763ecdb"
  //   // },
  //   packageType: "Image",
  //   imageUri: image.imageValue,
  // });

  const lambdaUrl = new awsnative.lambda.Url("fsn-categorySuggester", {
    targetFunctionArn: lambda.arn,
    authType: awsnative.lambda.UrlAuthType.None,
  });

  const awsCommand = new local.Command("aws-command", {
    create: pulumi.interpolate`aws lambda add-permission --function-name ${lambda.name} --action lambda:InvokeFunctionUrl --principal '*' --function-url-auth-type NONE --statement-id FunctionURLAllowPublicAccess`
  }, {deleteBeforeReplace: true, dependsOn: [lambda]})

  let functionUrl: OutputInstance<string> = lambdaUrl.functionUrl;

  const endpointSchedule: aws.cloudwatch.EventRuleEventSubscription = aws.cloudwatch.onSchedule(
      "categorySuggesterSchedule",
      "cron(45 5 * * ? *)",
      lambda
  )

  return functionUrl;

}
