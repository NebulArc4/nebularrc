// MongoDB initialization script for ArcBrain
// This script runs when the MongoDB container starts for the first time

db = db.getSiblingDB('arcbrain');

// Create collections
db.createCollection('decisions');
db.createCollection('templates');
db.createCollection('collaborations');
db.createCollection('users');
db.createCollection('organizations');

// Create indexes for better performance
db.decisions.createIndex({ "user_id": 1 });
db.decisions.createIndex({ "organization_id": 1 });
db.decisions.createIndex({ "brain_type": 1 });
db.decisions.createIndex({ "status": 1 });
db.decisions.createIndex({ "created_at": -1 });

db.templates.createIndex({ "brain_type": 1 });
db.templates.createIndex({ "category": 1 });
db.templates.createIndex({ "is_public": 1 });
db.templates.createIndex({ "created_by": 1 });

db.collaborations.createIndex({ "decision_id": 1 });
db.collaborations.createIndex({ "participants": 1 });

// Insert sample templates
db.templates.insertMany([
  {
    id: "template-finance-001",
    name: "Investment Portfolio Analysis",
    description: "Comprehensive analysis for investment portfolio decisions",
    brain_type: "finance",
    category: "Investment",
    template_data: {
      problem_context: "Portfolio optimization and asset allocation",
      desired_outcome: "Optimal risk-adjusted returns",
      constraints: ["Risk tolerance", "Investment horizon", "Liquidity needs"],
      stakeholders: ["Investor", "Financial advisor", "Family members"]
    },
    usage_count: 0,
    is_public: true,
    created_by: "system",
    rating: 4.5,
    tags: ["portfolio", "investment", "asset-allocation"],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: "template-strategy-001",
    name: "Market Entry Strategy",
    description: "Strategic analysis for entering new markets",
    brain_type: "strategy",
    category: "Market Strategy",
    template_data: {
      problem_context: "Expanding into new market segments",
      desired_outcome: "Successful market penetration",
      constraints: ["Budget limitations", "Timeline", "Resource availability"],
      stakeholders: ["CEO", "Marketing team", "Sales team", "Investors"]
    },
    usage_count: 0,
    is_public: true,
    created_by: "system",
    rating: 4.2,
    tags: ["market-entry", "strategy", "expansion"],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: "template-personal-001",
    name: "Career Change Decision",
    description: "Personal decision framework for career transitions",
    brain_type: "personal",
    category: "Career",
    template_data: {
      problem_context: "Considering a career change or job transition",
      desired_outcome: "Improved job satisfaction and growth",
      constraints: ["Financial obligations", "Family considerations", "Timeline"],
      stakeholders: ["Self", "Family", "Mentor", "Career counselor"]
    },
    usage_count: 0,
    is_public: true,
    created_by: "system",
    rating: 4.7,
    tags: ["career", "personal", "transition"],
    created_at: new Date(),
    updated_at: new Date()
  }
]);

print("ArcBrain database initialized successfully!");
print("Collections created: decisions, templates, collaborations, users, organizations");
print("Sample templates inserted: 3"); 