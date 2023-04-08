export default interface MetricPublisher {
  incrementCounter(key: string, increment: number): Promise<void>;

  incrementCounter(key: string, increment: number, additionalDimensions: Record<string, string>): Promise<void>;
}
