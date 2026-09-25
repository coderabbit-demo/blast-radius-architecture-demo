import cron from "node-cron"
import { runNightlyReconciliation } from "./cron/nightly-reconciliation.js"
import { runRevenueReport } from "./cron/revenue-report.js"

cron.schedule("0 2 * * *", runNightlyReconciliation)
cron.schedule("0 6 * * 1", runRevenueReport)
