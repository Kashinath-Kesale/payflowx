# PayFlowX

## Test Credentials
To access the dashboard, you can use the following test account:
- **Email**: `user1@payflowx.com`
- **Password**: `password123`

## How to Demo Reconciliation Mismatch
This system includes a simulated bank fee feature to demonstrate the reconciliation engine.

1.  **Create Payment**: Go to `/payments` and create a payment with amount `999`.
2.  **Process Settlements**: Go to `/settlements` and click "Process Settlements".
    *   *Note:* The system will automatically deduct `1` from the settlement amount to simulate a bank fee (Settlement = 998).
3.  **Run Reconciliation**: Go to `/reconciliation` and click "Run Analysis".
4.  **Verify**: You will see a `MISMATCHED` status for this transaction due to the amount difference (Payment 999 vs Settlement 998).

All other payment amounts will reconcile successfully.
