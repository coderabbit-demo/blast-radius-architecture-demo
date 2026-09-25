CREATE TABLE customers (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id                 TEXT PRIMARY KEY,
  customer_id        TEXT NOT NULL REFERENCES customers(id),
  status             TEXT NOT NULL DEFAULT 'pending',
  subtotal_cents     INTEGER NOT NULL,
  tax_cents          INTEGER NOT NULL,
  total_cents        INTEGER NOT NULL,
  stripe_payment_intent TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refunds (
  id           TEXT PRIMARY KEY,
  order_id     TEXT NOT NULL REFERENCES orders(id),
  amount_cents INTEGER NOT NULL,
  reason       TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE invoices (
  id           TEXT PRIMARY KEY,
  order_id     TEXT NOT NULL REFERENCES orders(id),
  amount_cents INTEGER NOT NULL,
  pdf_url      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
