import {injectable} from "tsyringe";
import axios from "axios";
import Visit from "../../domain/entity/visit/Visit";
import VisitRepository from "../../domain/entity/visit/VisitRepository";

interface FingerprintResponse {
  visitorId: string,
  visits: { requestId: string, timestamp: number }[]
}

@injectable()
export default class FingerprintHttpClient implements VisitRepository {

  async findVisitorVisitsBy(visitorId: string, visitorRequestId: string): Promise<Visit[]> {
    const response = await axios.get<FingerprintResponse>(`https://eu.api.fpjs.io/visitors/${visitorId}?api_key=${process.env.FINGERPRINT_API_SECRET_KEY}&request_id=${visitorRequestId}`)

    return response.data.visits.map(visit => {
      return new Visit(new Date(visit.timestamp))
    })

  }

}