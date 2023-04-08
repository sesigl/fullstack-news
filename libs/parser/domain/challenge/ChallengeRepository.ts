import Challenge from "./Challenge";

export default interface ChallengeRepository {

  findAll(): Promise<Challenge[]>

  findAllByUserId(userId: string): Promise<Challenge[]>;

  upsertChallenge(challenge: Challenge): Promise<Challenge>

  findById(challengeId: string): Promise<Challenge | null>;
}
