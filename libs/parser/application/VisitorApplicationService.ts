import {inject, injectable} from "tsyringe";
import type VisitRepository from "../domain/entity/visit/VisitRepository";
import type MetricPublisher from "../domain/service/MetricPublisher";

@injectable()
export default class VisitorApplicationService {

  constructor(
      @inject("VisitRepository") private readonly visitRepository: VisitRepository,
      @inject("MetricPublisher") private readonly metricPublisher: MetricPublisher
  ) {
  }

  async checkVisitorIdAndRecordPageVisit(visitorId: string, visitorRequestId: string): Promise<boolean> {
    let visits = await this.visitRepository.findVisitorVisitsBy(visitorId, visitorRequestId);

    if (visits.length > 0) {
      this.metricPublisher.incrementCounter('visit.valid', 1).catch(err => console.error(err))
      return true
    } else {
      console.warn(`Recorded page visit with unknown visitor id ['${visitorId}'] or request-id ['${visitorRequestId}']`)
      this.metricPublisher.incrementCounter('visit.invalid', 1).catch(err => console.error(err))
      return false
    }
  }

  async recordPageVisit(): Promise<boolean> {
    this.metricPublisher.incrementCounter('visit.valid', 1).catch(err => console.error(err))
    return true
  }

}
