import CloudwatchMetricPublisher from "./CloudwatchMetricPublisher";

describe("CloudwatchMetricPublisher", () => {
  it("send test metric", async () => {
    let cloudwatchMetricPublisher = new CloudwatchMetricPublisher();
    await cloudwatchMetricPublisher.incrementCounter("my.test.key", 1)
  })
})
