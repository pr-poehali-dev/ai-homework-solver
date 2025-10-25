CREATE TABLE IF NOT EXISTS tasks_history (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    subject VARCHAR(100),
    solution TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_session VARCHAR(255)
);

CREATE INDEX idx_tasks_created_at ON tasks_history(created_at DESC);
CREATE INDEX idx_tasks_user_session ON tasks_history(user_session);
