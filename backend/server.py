from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from enum import Enum
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'arcbrain')]

# Create the main app
app = FastAPI(title="Arc Brain - Decision Intelligence Platform", version="1.0.0")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Enums
class BrainType(str, Enum):
    FINANCE = "finance"
    STRATEGY = "strategy"
    PERSONAL = "personal"

class DecisionStatus(str, Enum):
    DRAFT = "draft"
    ANALYZING = "analyzing"
    REVIEWED = "reviewed"
    APPROVED = "approved"
    EXECUTED = "executed"
    COMPLETED = "completed"

class PriorityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class UserRole(str, Enum):
    ADMIN = "admin"
    DECISION_MAKER = "decision_maker"
    ADVISOR = "advisor"
    VIEWER = "viewer"

# Base Models
class BaseEntity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# User and Organization Models
class User(BaseEntity):
    email: str
    name: str
    role: UserRole
    organization_id: str
    avatar_url: Optional[str] = None
    preferences: Dict[str, Any] = Field(default_factory=dict)

class Organization(BaseEntity):
    name: str
    domain: str
    settings: Dict[str, Any] = Field(default_factory=dict)
    subscription_tier: str = "starter"
    member_count: int = 0

# Decision Models
class DecisionInput(BaseModel):
    problem_context: str
    desired_outcome: str
    constraints: List[str] = Field(default_factory=list)
    stakeholders: List[str] = Field(default_factory=list)
    deadline: Optional[datetime] = None
    budget_range: Optional[str] = None

class AIAnalysis(BaseModel):
    reasoning_steps: List[str] = Field(default_factory=list)
    pros_cons: Dict[str, List[str]] = Field(default_factory=dict)
    risk_assessment: Dict[str, str] = Field(default_factory=dict)
    recommendations: List[str] = Field(default_factory=list)
    confidence_score: float = 0.0
    estimated_impact: str = "unknown"

class Decision(BaseEntity):
    title: str
    brain_type: BrainType
    user_id: str
    organization_id: str
    decision_input: DecisionInput
    ai_analysis: Optional[AIAnalysis] = None
    status: DecisionStatus = DecisionStatus.DRAFT
    priority: PriorityLevel = PriorityLevel.MEDIUM
    tags: List[str] = Field(default_factory=list)
    collaborators: List[str] = Field(default_factory=list)
    execution_notes: Optional[str] = None
    outcome_tracked: bool = False
    roi_data: Optional[Dict[str, Any]] = None

# Template Models
class DecisionTemplate(BaseEntity):
    name: str
    description: str
    brain_type: BrainType
    category: str
    template_data: Dict[str, Any]
    usage_count: int = 0
    is_public: bool = True
    created_by: str
    organization_id: Optional[str] = None
    rating: float = 0.0
    tags: List[str] = Field(default_factory=list)

# Collaboration Models
class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    message_type: str = "text"

class Collaboration(BaseEntity):
    decision_id: str
    participants: List[str] = Field(default_factory=list)
    chat_messages: List[ChatMessage] = Field(default_factory=list)
    shared_notes: str = ""
    last_activity: datetime = Field(default_factory=datetime.utcnow)

# Analytics Models
class DecisionMetrics(BaseModel):
    total_decisions: int = 0
    decisions_by_status: Dict[str, int] = Field(default_factory=dict)
    decisions_by_brain: Dict[str, int] = Field(default_factory=dict)
    avg_decision_time: float = 0.0
    success_rate: float = 0.0
    roi_summary: Dict[str, Any] = Field(default_factory=dict)

# API Request/Response Models
class DecisionCreateRequest(BaseModel):
    title: str
    brain_type: BrainType
    problem_context: str
    desired_outcome: str
    constraints: List[str] = Field(default_factory=list)
    stakeholders: List[str] = Field(default_factory=list)
    deadline: Optional[datetime] = None
    priority: PriorityLevel = PriorityLevel.MEDIUM
    tags: List[str] = Field(default_factory=list)

class DecisionUpdateRequest(BaseModel):
    title: Optional[str] = None
    status: Optional[DecisionStatus] = None
    priority: Optional[PriorityLevel] = None
    tags: Optional[List[str]] = None
    execution_notes: Optional[str] = None

class TemplateCreateRequest(BaseModel):
    name: str
    description: str
    brain_type: BrainType
    category: str
    template_data: Dict[str, Any]
    is_public: bool = True
    tags: List[str] = Field(default_factory=list)

class AIAnalysisRequest(BaseModel):
    decision_id: str
    force_reanalyze: bool = False

# Mock AI Analysis Function (to be replaced with real AI integration)
async def generate_ai_analysis(decision: Decision) -> AIAnalysis:
    """Generate AI analysis for a decision - mock implementation"""
    
    # Mock analysis based on brain type
    if decision.brain_type == BrainType.FINANCE:
        return AIAnalysis(
            reasoning_steps=[
                "Analyzed financial constraints and budget requirements",
                "Evaluated potential ROI and payback period",
                "Assessed financial risks and mitigation strategies",
                "Compared against industry benchmarks"
            ],
            pros_cons={
                "pros": ["Strong ROI potential", "Aligned with financial goals", "Scalable investment"],
                "cons": ["High upfront cost", "Market uncertainty", "Resource intensive"]
            },
            risk_assessment={
                "financial_risk": "Medium",
                "market_risk": "High",
                "operational_risk": "Low"
            },
            recommendations=[
                "Conduct detailed financial modeling",
                "Secure additional funding sources",
                "Implement phased rollout approach"
            ],
            confidence_score=0.78,
            estimated_impact="High positive impact on revenue"
        )
    elif decision.brain_type == BrainType.STRATEGY:
        return AIAnalysis(
            reasoning_steps=[
                "Analyzed competitive landscape and market positioning",
                "Evaluated strategic alignment with company goals",
                "Assessed resource requirements and capabilities",
                "Examined potential market opportunities"
            ],
            pros_cons={
                "pros": ["Competitive advantage", "Market expansion", "Brand strengthening"],
                "cons": ["Resource intensive", "Execution complexity", "Market saturation risk"]
            },
            risk_assessment={
                "competitive_risk": "Medium",
                "execution_risk": "High",
                "market_risk": "Low"
            },
            recommendations=[
                "Develop detailed execution roadmap",
                "Secure key partnerships",
                "Invest in market research"
            ],
            confidence_score=0.82,
            estimated_impact="Significant strategic advantage"
        )
    else:  # PERSONAL
        return AIAnalysis(
            reasoning_steps=[
                "Evaluated personal values and long-term goals",
                "Analyzed potential life impact and trade-offs",
                "Considered available resources and constraints",
                "Assessed timing and opportunity factors"
            ],
            pros_cons={
                "pros": ["Personal growth", "New opportunities", "Skill development"],
                "cons": ["Time investment", "Uncertainty", "Potential stress"]
            },
            risk_assessment={
                "personal_risk": "Medium",
                "financial_risk": "Low",
                "career_risk": "Low"
            },
            recommendations=[
                "Create detailed timeline and milestones",
                "Build support network",
                "Plan for contingencies"
            ],
            confidence_score=0.75,
            estimated_impact="Positive long-term personal development"
        )

# Utility Functions
def get_current_user_id() -> str:
    """Mock user authentication - replace with real auth"""
    return "user_123"

def get_current_organization_id() -> str:
    """Mock organization - replace with real org detection"""
    return "org_456"

# API Endpoints

# Health Check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Decision Management
@api_router.post("/decisions", response_model=Decision)
async def create_decision(request: DecisionCreateRequest):
    """Create a new decision for analysis"""
    
    decision_input = DecisionInput(
        problem_context=request.problem_context,
        desired_outcome=request.desired_outcome,
        constraints=request.constraints,
        stakeholders=request.stakeholders,
        deadline=request.deadline
    )
    
    decision = Decision(
        title=request.title,
        brain_type=request.brain_type,
        user_id=get_current_user_id(),
        organization_id=get_current_organization_id(),
        decision_input=decision_input,
        priority=request.priority,
        tags=request.tags
    )
    
    await db.decisions.insert_one(decision.dict())
    return decision

@api_router.get("/decisions", response_model=List[Decision])
async def get_decisions(
    brain_type: Optional[BrainType] = None,
    status: Optional[DecisionStatus] = None,
    skip: int = 0,
    limit: int = 100
):
    """Get decisions with optional filtering"""
    
    filter_query = {
        "user_id": get_current_user_id(),
        "organization_id": get_current_organization_id()
    }
    
    if brain_type:
        filter_query["brain_type"] = brain_type
    if status:
        filter_query["status"] = status
    
    decisions = await db.decisions.find(filter_query).skip(skip).limit(limit).to_list(limit)
    return [Decision(**decision) for decision in decisions]

@api_router.get("/decisions/{decision_id}", response_model=Decision)
async def get_decision(decision_id: str):
    """Get a specific decision"""
    
    decision = await db.decisions.find_one({"id": decision_id})
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    return Decision(**decision)

@api_router.put("/decisions/{decision_id}", response_model=Decision)
async def update_decision(decision_id: str, request: DecisionUpdateRequest):
    """Update a decision"""
    
    update_data = {k: v for k, v in request.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.decisions.update_one(
        {"id": decision_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    updated_decision = await db.decisions.find_one({"id": decision_id})
    return Decision(**updated_decision)

@api_router.post("/decisions/{decision_id}/analyze", response_model=AIAnalysis)
async def analyze_decision(decision_id: str, request: AIAnalysisRequest):
    """Generate AI analysis for a decision"""
    
    decision = await db.decisions.find_one({"id": decision_id})
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    decision_obj = Decision(**decision)
    
    # Check if analysis already exists and force_reanalyze is False
    if decision_obj.ai_analysis and not request.force_reanalyze:
        return decision_obj.ai_analysis
    
    # Generate new analysis
    ai_analysis = await generate_ai_analysis(decision_obj)
    
    # Update decision with analysis
    await db.decisions.update_one(
        {"id": decision_id},
        {
            "$set": {
                "ai_analysis": ai_analysis.dict(),
                "status": DecisionStatus.REVIEWED,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return ai_analysis

# Template Management
@api_router.post("/templates", response_model=DecisionTemplate)
async def create_template(request: TemplateCreateRequest):
    """Create a new decision template"""
    
    template = DecisionTemplate(
        name=request.name,
        description=request.description,
        brain_type=request.brain_type,
        category=request.category,
        template_data=request.template_data,
        is_public=request.is_public,
        created_by=get_current_user_id(),
        organization_id=get_current_organization_id() if not request.is_public else None,
        tags=request.tags
    )
    
    await db.templates.insert_one(template.dict())
    return template

@api_router.get("/templates", response_model=List[DecisionTemplate])
async def get_templates(
    brain_type: Optional[BrainType] = None,
    category: Optional[str] = None,
    is_public: bool = True,
    skip: int = 0,
    limit: int = 50
):
    """Get decision templates"""
    
    filter_query = {}
    if brain_type:
        filter_query["brain_type"] = brain_type
    if category:
        filter_query["category"] = category
    
    if is_public:
        filter_query["is_public"] = True
    else:
        filter_query["organization_id"] = get_current_organization_id()
    
    templates = await db.templates.find(filter_query).skip(skip).limit(limit).to_list(limit)
    return [DecisionTemplate(**template) for template in templates]

# Analytics
@api_router.get("/analytics/overview", response_model=DecisionMetrics)
async def get_analytics_overview():
    """Get decision analytics overview"""
    
    org_id = get_current_organization_id()
    
    # Get total decisions
    total_decisions = await db.decisions.count_documents({"organization_id": org_id})
    
    # Get decisions by status
    status_pipeline = [
        {"$match": {"organization_id": org_id}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    status_results = await db.decisions.aggregate(status_pipeline).to_list(100)
    decisions_by_status = {result["_id"]: result["count"] for result in status_results}
    
    # Get decisions by brain type
    brain_pipeline = [
        {"$match": {"organization_id": org_id}},
        {"$group": {"_id": "$brain_type", "count": {"$sum": 1}}}
    ]
    brain_results = await db.decisions.aggregate(brain_pipeline).to_list(100)
    decisions_by_brain = {result["_id"]: result["count"] for result in brain_results}
    
    return DecisionMetrics(
        total_decisions=total_decisions,
        decisions_by_status=decisions_by_status,
        decisions_by_brain=decisions_by_brain,
        avg_decision_time=4.5,  # Mock data
        success_rate=0.78,  # Mock data
        roi_summary={"positive": 65, "negative": 15, "neutral": 20}  # Mock data
    )

# Collaboration
@api_router.post("/decisions/{decision_id}/collaborate")
async def start_collaboration(decision_id: str):
    """Start collaboration on a decision"""
    
    decision = await db.decisions.find_one({"id": decision_id})
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    collaboration = Collaboration(
        decision_id=decision_id,
        participants=[get_current_user_id()]
    )
    
    await db.collaborations.insert_one(collaboration.dict())
    return {"message": "Collaboration started", "collaboration_id": collaboration.id}

@api_router.post("/decisions/{decision_id}/chat")
async def add_chat_message(decision_id: str, message: str):
    """Add a chat message to decision collaboration"""
    
    chat_message = ChatMessage(
        user_id=get_current_user_id(),
        message=message
    )
    
    await db.collaborations.update_one(
        {"decision_id": decision_id},
        {
            "$push": {"chat_messages": chat_message.dict()},
            "$set": {"last_activity": datetime.utcnow()}
        }
    )
    
    return {"message": "Chat message added", "message_id": chat_message.id}

# Include the router in the main app
app.include_router(api_router)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Arc Brain - Decision Intelligence Platform API"} 