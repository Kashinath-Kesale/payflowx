type CounterName =
  | 'payments_success_total'
  | 'payments_failed_total'
  | 'payments_idempotent_hits_total'
  | 'settlements_settled_total'
  | 'settlements_failed_total'
  | 'reconciliation_matched_total'
  | 'reconciliation_mismatched_total';

export class AppMetrics {
  private static counters: Record<CounterName, number> = {
    payments_success_total: 0,
    payments_failed_total: 0,
    payments_idempotent_hits_total: 0,
    settlements_settled_total: 0,
    settlements_failed_total: 0,
    reconciliation_matched_total: 0,
    reconciliation_mismatched_total: 0,
  };

  static increment(name: CounterName) {
    this.counters[name]++;
  }

  static snapshot() {
    return { ...this.counters };
  }
}

