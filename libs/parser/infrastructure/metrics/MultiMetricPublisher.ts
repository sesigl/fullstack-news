import {inject, injectable} from "tsyringe";
import DatadogMetricPublisher from "./DatadogMetricPublisher";
import CloudwatchMetricPublisher from "./CloudwatchMetricPublisher";
import MetricPublisher from "../../domain/service/MetricPublisher";

@injectable()
export default class MultiMetricPublisher implements MetricPublisher {

  constructor(
      @inject(DatadogMetricPublisher) private readonly datadogMetricPublisher: DatadogMetricPublisher,
      @inject(CloudwatchMetricPublisher) private readonly cloudwatchMetricPublisher: CloudwatchMetricPublisher,
  ) {
  }

  async incrementCounter(key: string, increment: number, additionalDimensions: Record<string, string> = {}): Promise<void> {
    await Promise.all([
      this.datadogMetricPublisher.incrementCounter(key, increment, additionalDimensions),
      this.cloudwatchMetricPublisher.incrementCounter(key, increment, additionalDimensions)
    ])
  }

}
