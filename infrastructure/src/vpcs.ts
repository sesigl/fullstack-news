import * as aws from "@pulumi/aws";
import {Output} from "@pulumi/pulumi";
import {lambda} from "@pulumi/aws/types/output";
import FunctionVpcConfig = lambda.FunctionVpcConfig;

export function deployVpcs(): Output<FunctionVpcConfig> {
  const fullStackNewsVpc = new aws.ec2.Vpc("fullstack-news-main", {
    cidrBlock: "172.30.0.0/16",
    tags: {
      Name: "fullstack-news-main",
    },
  });

  // subnets
  const subnetPrivate = new aws.ec2.Subnet("fullstack-news-main-private", {
    vpcId: fullStackNewsVpc.id,
    cidrBlock: "172.30.1.0/24",
    tags: {
      Name: "fullstack-news-main-private",
    },
    availabilityZone: 'eu-central-1b'
  });

  const subnetPublic = new aws.ec2.Subnet("fullstack-news-main-public", {
    vpcId: fullStackNewsVpc.id,
    cidrBlock: "172.30.2.0/24",
    tags: {
      Name: "fullstack-news-main-public",
    },
    availabilityZone: 'eu-central-1b'
  });

  const igw = new aws.ec2.InternetGateway("fullstack-news-main-igw", {
    vpcId: fullStackNewsVpc.id,
    tags: {
      Name: "fullstack-news-main-igw",
    },
  });

  let natGwEip = new aws.ec2.Eip("fullstack-news-main-nat-gw-eip", {
    vpc: true,
  });

  const nat = new aws.ec2.NatGateway("fullstack-news-main-nat", {
    allocationId: natGwEip.id,
    subnetId: subnetPublic.id,
    tags: {
      Name: "fullstack-news-main-nat",
    },
  }, {
    dependsOn: [igw],
  });

  const routeTablePrivate = new aws.ec2.RouteTable("fullstack-news-main-private-route-table", {
    vpcId: fullStackNewsVpc.id,

    routes: [
      {
        cidrBlock: '0.0.0.0/0',
        natGatewayId: nat.id
      },
    ],
    tags: {
      Name: "fullstack-news-main-private-route-table",
    },
  });

  const routeTableAssociationPrivate = new aws.ec2.RouteTableAssociation("fullstack-news-main-private-rta", {
    subnetId: subnetPrivate.id,
    routeTableId: routeTablePrivate.id,
  });

  const routeTablePublic = new aws.ec2.RouteTable("fullstack-news-main-public-route-table", {
    vpcId: fullStackNewsVpc.id,

    routes: [
      {
        cidrBlock: '0.0.0.0/0',
        gatewayId: igw.id,
      },
    ],
    tags: {
      Name: "fullstack-news-main-public-route-table",
    },
  });

  const routeTableAssociationPublic = new aws.ec2.RouteTableAssociation("fullstack-news-main-public-rta", {
    subnetId: subnetPublic.id,
    routeTableId: routeTablePublic.id,
  });
  const securityGroupAllowAll = new aws.ec2.SecurityGroup('allowAll', {
    egress: [
      {protocol: '-1', fromPort: 0, toPort: 0, cidrBlocks: ['0.0.0.0/0']}
    ],
    ingress: [
      {protocol: '-1', fromPort: 0, toPort: 0, self: true}
    ],
    vpcId: fullStackNewsVpc.id
  });

  return securityGroupAllowAll.id.apply(securityGroupId =>
      fullStackNewsVpc.id.apply(vpcId =>
          subnetPrivate.id.apply(privateSubnetId => {
            const functionVpcConfig: FunctionVpcConfig = {
              securityGroupIds: [securityGroupId], subnetIds: [privateSubnetId], vpcId: vpcId
            }
            return functionVpcConfig
          })
      )
  )
}
