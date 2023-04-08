import MetricPublisher from "../../../libs/parser/domain/service/MetricPublisher";

export default class FakeMetricPublisher implements MetricPublisher {

  public increments: { key: string, increment: number, additionalDimensions: Record<string, string> }[] = []

  async incrementCounter(key: string, increment: number, additionalDimensions: Record<string, string> = {}) {
    this.increments.push({key, increment, additionalDimensions});
  }

}
