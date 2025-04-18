CREATE TABLE credit_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    brand TEXT,
    credit_limit NUMERIC NOT NULL,
    available_limit NUMERIC NOT NULL,
    due_day INTEGER CHECK (due_day BETWEEN 1 AND 31),
    closing_day INTEGER CHECK (closing_day BETWEEN 1 AND 31),
    description TEXT,
    tag TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
