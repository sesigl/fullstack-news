import Visit from "./Visit";

export default interface VisitRepository {
  findVisitorVisitsBy(visitorId: string, visitorRequestId: string): Promise<Visit[]>
}