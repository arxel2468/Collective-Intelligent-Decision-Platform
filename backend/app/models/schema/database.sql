-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Workspaces
CREATE TABLE workspaces (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Workspace Members
CREATE TABLE workspace_members (
    workspace_id UUID REFERENCES workspaces(id),
    user_id UUID REFERENCES users(id),
    role VARCHAR(50) NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (workspace_id, user_id)
);

-- Discussions
CREATE TABLE discussions (
    id UUID PRIMARY KEY,
    workspace_id UUID REFERENCES workspaces(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    discussion_id UUID REFERENCES discussions(id),
    parent_id UUID REFERENCES messages(id) NULL,
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Message Analysis
CREATE TABLE message_analysis (
    id UUID PRIMARY KEY,
    message_id UUID REFERENCES messages(id),
    sentiment_score FLOAT,
    perspective_vector JSON, -- Vector representation of the message's perspective
    detected_biases JSON, -- Array of detected biases with confidence scores
    analyzed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Perspectives
CREATE TABLE perspectives (
    id UUID PRIMARY KEY,
    discussion_id UUID REFERENCES discussions(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Perspective Messages
CREATE TABLE perspective_messages (
    perspective_id UUID REFERENCES perspectives(id),
    message_id UUID REFERENCES messages(id),
    relevance_score FLOAT NOT NULL,
    PRIMARY KEY (perspective_id, message_id)
);

-- Cognitive Biases
CREATE TABLE cognitive_biases (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    detection_patterns JSON, -- Patterns used for detection
    mitigation_strategies TEXT
);

-- Decision Processes
CREATE TABLE decision_processes (
    id UUID PRIMARY KEY,
    discussion_id UUID REFERENCES discussions(id),
    title VARCHAR(200) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'in_progress',
    process_template VARCHAR(100),
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL
);

-- Decision Process Stages
CREATE TABLE decision_stages (
    id UUID PRIMARY KEY,
    process_id UUID REFERENCES decision_processes(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL
);

-- Decision Documents
CREATE TABLE decision_documents (
    id UUID PRIMARY KEY,
    process_id UUID REFERENCES decision_processes(id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bias Interventions
CREATE TABLE bias_interventions (
    id UUID PRIMARY KEY,
    discussion_id UUID REFERENCES discussions(id),
    bias_id UUID REFERENCES cognitive_biases(id),
    intervention_type VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    displayed_at TIMESTAMP NULL,
    acknowledged_at TIMESTAMP NULL
);

-- User Feedback
CREATE TABLE user_feedback (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    feedback_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL, -- 'intervention', 'analysis', etc.
    target_id UUID NOT NULL,
    rating INTEGER,
    comments TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Decision Quality Metrics
CREATE TABLE decision_quality_metrics (
    id UUID PRIMARY KEY,
    process_id UUID REFERENCES decision_processes(id),
    metric_name VARCHAR(100) NOT NULL,
    metric_value FLOAT NOT NULL,
    calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Visualization Settings
CREATE TABLE visualization_settings (
    user_id UUID REFERENCES users(id),
    visualization_type VARCHAR(100) NOT NULL,
    settings JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, visualization_type)
);
