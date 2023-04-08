import {inject, injectable} from "tsyringe";
import type ChallengeRepository from "../domain/challenge/ChallengeRepository";
import type MetricPublisher from "../domain/service/MetricPublisher";
import Challenge from "../domain/challenge/Challenge";
import {CreateChallengeCommand} from "../../interfaces/commands/CreateChallengeCommand";
import ChallengeFactory from "../domain/challenge/ChallengeFactory";
import type UserRepository from "../domain/entity/user/UserRepository";
import User from "../domain/entity/user/User";
import {adminUsers} from "../../configuration";
import {UpdateChallengeCommand} from "../../interfaces/commands/UpdateChallengeCommand";
import type CodeExecutor from "../domain/challenge/CodeExecutor";
import RunCodeResult from "../domain/challenge/RunCodeResult";

interface RunChallengeCommand {
  challengeId: string,
  solutionCode: string
}

@injectable()
export default class ChallengeApplicationService {

  constructor(
      @inject("ChallengeRepository") private readonly challengeRepository: ChallengeRepository,
      @inject(ChallengeFactory) private readonly challengeFactory: ChallengeFactory,
      @inject("MetricPublisher") private readonly metricPublisher: MetricPublisher,
      @inject("UserRepository") private readonly userRepository: UserRepository,
      @inject("CodeExecutor") private readonly codeExecutor: CodeExecutor,
  ) {
  }

  async getAllFor(userId: string): Promise<Challenge[]> {

    const user = await this.userRepository.findById(userId)

    if (adminUsers.includes(user?.email)) {
      return await this.challengeRepository.findAll();
    }

    return await this.challengeRepository.findAllByUserId(userId)
  }

  async get(challengeId: string): Promise<Challenge | null> {
    return await this.challengeRepository.findById(challengeId)
  }

  async createOrUpdate(createChallengeCommand: CreateChallengeCommand | UpdateChallengeCommand): Promise<Challenge> {
    let user = await this.getUser(createChallengeCommand.auth0UserId);

    let challenge = this.challengeFactory.create(createChallengeCommand, user.id, false);

    if (createChallengeCommand.type === "update" && createChallengeCommand.id) {
      const existingChallenge = await this.challengeRepository.findById(createChallengeCommand.id)

      if (!existingChallenge) {
        throw new Error("Given id does not exist")
      }

      if (existingChallenge.creatorUserId !== user.id && !adminUsers.includes(user.email)) {
        throw new Error(`Access denied, user ${user.id} is not the owner of the challenge`)
      }
    }

    // all new or changed challenges are not public and require a review
    challenge.approved = false

    const createdChallenge = await this.challengeRepository.upsertChallenge(challenge)

    await this.metricPublisher.incrementCounter('challenges.increment', 1)

    return Promise.resolve(createdChallenge);
  }

  private async getUser(authUserId: string) {
    let user: User | undefined
    user = await this.userRepository.findByAuth0Id(authUserId)

    if (!user) {
      throw new Error(`User with auth0Id ${authUserId} does not exists.`)
    }
    return user;
  }

  async runChallengeSolution(runChallengeCommand: RunChallengeCommand, auth0UserId: string): Promise<RunCodeResult> {
    await this.getUser(auth0UserId);

    const challenge = await this.challengeRepository.findById(runChallengeCommand.challengeId)

    if (!challenge) {
      throw new Error(`Challenge ${runChallengeCommand.challengeId} not found`)
    }

    let code = `${challenge.testCode};${runChallengeCommand.solutionCode}`;
    return this.codeExecutor.run(code, challenge.programmingLanguage)
  }
}
