import {injectable} from "tsyringe";
import metrics from "datadog-metrics";
import MetricPublisher from "../../domain/service/MetricPublisher";

const host = process.env.VERCEL_ENV || "dev";
metrics.init({
  apiHost: "datadoghq.eu",
  host: host
});

@injectable()
export default class DatadogMetricPublisher implements MetricPublisher {

  async incrementCounter(key: string, increment: number, additionalDimensions: Record<string, string> = {}) {
    metrics.increment(key, increment);
    await this.sendMetrics()
  }

  private sendMetrics(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      metrics.flush(() => setTimeout(() => resolve(true), 0), (e) => reject(e))
    })
  }
}
