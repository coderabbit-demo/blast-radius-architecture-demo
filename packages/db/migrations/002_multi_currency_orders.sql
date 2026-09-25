-- Orders can now be charged in the customer's local currency.
-- subtotal_cents / tax_cents / total_cents hold minor units of orders.currency.
ALTER TABLE orders ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE orders ADD COLUMN fx_rate NUMERIC(18, 8) NOT NULL DEFAULT 1;
