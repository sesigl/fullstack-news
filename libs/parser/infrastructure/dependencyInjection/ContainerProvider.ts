import "reflect-metadata"

import {container, registry} from "tsyringe";
import {PrismaClient} from "@prisma/client";
import ArticleCockroachRepository from "../cockroach/ArticleCockroachRepository";
import FingerprintHttpClient from "../fingerprint/FingerprintHttpClient";
import VoteCockroachRepository from "../cockroach/VoteCockroachRepository";
import CommentCockroachRepository from "../cockroach/CommentCockroachRepository";
import S3StaticAssetUploader from "../aws/s3/S3StaticAssetUploader";
import MultiMetricPublisher from "../metrics/MultiMetricPublisher";
import UserCockroachRepository from "../cockroach/UserCockroachRepository";
import NewsletterClient from "../../domain/service/NewsletterClient";
import SendInBlueNewsletterClient from "../newsletter/SendInBlueNewsletterClient";
import SmashingMagazineParser from "../parser/SmashingMagazineParser";
import HackernoonParser from "../parser/HackernoonParser";
import CssTricksParser from "../parser/CssTricksParser";
import FreeCodeCampParser from "../parser/FreeCodeCampParser";
import DeveloperWayParser from "../parser/DeveloperWayParser";
import RemoteParser from "../parser/RemoteParser";
import ArticleSourceCockroachRepository from "../cockroach/ArticleSourceCockroachRepository";
import UserApplicationService from "../../application/user/UserApplicationService";
import NodeJsCodeExecutor from "../codeExecutor/NodeJsCodeExecutor";
import ChallengeCockroachRepository from "../cockroach/ChallengeCockroachRepository";
import ArticleMlCategoryCockroachRepository
  from "../cockroach/ArticleMlCategoryCockroachRepository";

container.register<PrismaClient>(PrismaClient, {
  useValue: new PrismaClient()
});

@registry([
  // registry is optional, all you need is to use the same token when registering
  {token: "ArticleRepository", useToken: ArticleCockroachRepository},
  {token: "CommentRepository", useToken: CommentCockroachRepository},
  {token: "VoteRepository", useToken: VoteCockroachRepository},
  {token: "UserRepository", useToken: UserCockroachRepository},
  {token: "ArticleSourceRepository", useToken: ArticleSourceCockroachRepository},
  {token: "ChallengeRepository", useToken: ChallengeCockroachRepository},
  {token: "ArticleMlCategoryRepository", useToken: ArticleMlCategoryCockroachRepository},
  {token: "GetUserApplicationService", useToken: UserApplicationService},
  {token: "ContentParser", useToken: FreeCodeCampParser},
  {token: "ContentParser", useToken: SmashingMagazineParser},
  {token: "ContentParser", useToken: HackernoonParser},
  {token: "ContentParser", useToken: CssTricksParser},
  {token: "ContentParser", useToken: DeveloperWayParser},
  {token: "Parser", useToken: RemoteParser},
  {token: "VisitRepository", useToken: FingerprintHttpClient},
  {token: "StaticAssetUploader", useToken: S3StaticAssetUploader},
  {token: "MetricPublisher", useToken: MultiMetricPublisher},
  {token: "NewsletterClient", useToken: SendInBlueNewsletterClient},
  {token: "CodeExecutor", useToken: NodeJsCodeExecutor}
])
export default class ContainerProvider {
  static getContainerProvider() {
    return container
  }
}
