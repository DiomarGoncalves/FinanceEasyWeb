CREATE TABLE credit_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_name TEXT NOT NULL,
    credit_limit NUMERIC(15, 2) NOT NULL, -- Renomeado de "limit" para "credit_limit"
    due_date INTEGER NOT NULL,
    closing_date INTEGER NOT NULL
);
