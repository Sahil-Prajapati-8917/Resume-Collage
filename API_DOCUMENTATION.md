# AI-Driven Resume Evaluation Platform - Backend API Documentation

## Overview

This document provides comprehensive API documentation for the AI-Driven Resume Evaluation Platform backend. The APIs are designed to support all frontend functionality including resume processing, AI evaluation, hiring form management, and audit trails.

## Base URL
```
https://api.resume-platform.com/v1
```

## Authentication

All API endpoints (except authentication endpoints) require JWT authentication:
```
Authorization: Bearer <token>
```

---

## 1. Authentication & User Management APIs

### POST /api/auth/login
**Purpose**: User authentication  
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "name": "Sarah Johnson",
    "email": "sarah.johnson@company.com",
    "role": "HR Manager",
    "department": "Human Resources"
  }
}
```

### POST /api/auth/logout
**Purpose**: User logout  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
{
  "message": "Logged out successfully"
}
```

### GET /api/auth/profile
**Purpose**: Get current user profile  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
{
  "personalInfo": {
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah.johnson@company.com",
    "phone": "+1 (555) 123-4567",
    "department": "Human Resources",
    "position": "Senior HR Manager",
    "location": "San Francisco, CA",
    "bio": "Experienced HR professional with 10+ years in talent acquisition."
  },
  "professionalInfo": {
    "joinDate": "2019-03-15",
    "totalEvaluations": 247,
    "successfulPlacements": 89,
    "averageTimeToHire": "18 days",
    "specializations": ["Technology", "Healthcare", "Finance"],
    "certifications": ["SHRM-CP", "PHR", "LinkedIn Recruiter"],
    "languages": ["English", "Spanish"]
  },
  "performance": {
    "quarterlyScore": 92,
    "candidateSatisfaction": 4.8,
    "hiringManagerRating": 4.9,
    "efficiencyScore": 88,
    "qualityScore": 95,
    "trend": "improving"
  }
}
```

### PUT /api/auth/profile
**Purpose**: Update user profile  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**: Profile update data (same structure as GET response)  
**Response**: Updated user profile

---

## 2. Dashboard APIs

### GET /api/dashboard/stats
**Purpose**: Get dashboard statistics  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
{
  "totalResumesProcessed": 247,
  "activeHiringForms": 8,
  "averageEvaluationScore": 72.5,
  "candidatesShortlisted": 43,
  "recentActivity": [
    {
      "id": 1,
      "candidate": "John Smith",
      "position": "Senior Developer",
      "score": 85,
      "status": "Shortlisted",
      "time": "2 hours ago"
    }
  ],
  "industryDistribution": [
    {
      "name": "Information Technology",
      "count": 45,
      "color": "bg-blue-500"
    },
    {
      "name": "Healthcare",
      "count": 32,
      "color": "bg-green-500"
    }
  ]
}
```

### GET /api/dashboard/recent-activity
**Purpose**: Get recent evaluation activity  
**Headers**: `Authorization: Bearer <token>`  
**Query Params**: `limit` (default: 10)  
**Response**: Array of recent evaluations with candidate info, scores, and status

---

## 3. Resume Upload & Processing APIs

### POST /api/resumes/upload
**Purpose**: Upload resume files  
**Headers**: `Authorization: Bearer <token>`  
**Request**: `multipart/form-data` with files  
**Response**:
```json
{
  "uploadedFiles": [
    {
      "id": "file_123",
      "name": "john_doe_resume.pdf",
      "size": 2048576,
      "type": "application/pdf",
      "uploadTime": "2024-01-20 14:30:00"
    }
  ],
  "status": "success"
}
```

### POST /api/resumes/parse
**Purpose**: Parse uploaded resume content  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**:
```json
{
  "fileId": "file_123"
}
```
**Response**:
```json
{
  "fileName": "john_doe_resume.pdf",
  "candidateName": "John Doe",
  "email": "john.doe@email.com",
  "phone": "+1 (555) 123-4567",
  "experience": "5+ years",
  "education": "Bachelor of Science in Computer Science",
  "skills": ["JavaScript", "React", "Node.js", "Python", "AWS"],
  "summary": "Experienced software developer with expertise in full-stack development...",
  "projects": [
    {
      "title": "E-commerce Platform",
      "description": "Led development of a scalable e-commerce solution serving 100K+ users",
      "technologies": ["React", "Node.js", "MongoDB", "AWS"]
    }
  ]
}
```

### POST /api/resumes/evaluate
**Purpose**: Start AI evaluation process  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**:
```json
{
  "resumeId": "file_123",
  "hiringFormId": "HF-001",
  "evaluationSettings": {
    "holistic": true,
    "evidenceHighlighting": true,
    "explainableAI": true,
    "strictMode": false
  }
}
```
**Response**:
```json
{
  "evaluationId": "eval_456",
  "status": "queued",
  "estimatedTime": "3-5 minutes"
}
```

---

## 4. Hiring Form Management APIs

### GET /api/hiring-forms
**Purpose**: Get all hiring forms  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
[
  {
    "id": "1",
    "title": "Senior Software Engineer - IT",
    "industry": "Information Technology"
  },
  {
    "id": "2",
    "title": "Product Manager - Healthcare",
    "industry": "Healthcare"
  }
]
```

### POST /api/hiring-forms
**Purpose**: Create new hiring form  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**:
```json
{
  "title": "Senior Software Engineer",
  "industry": "Information Technology",
  "experienceLevel": "Senior (8-12 years)",
  "jobType": "full-time",
  "responsibilities": ["Lead development of web applications"],
  "requirements": ["5+ years of experience with React"],
  "roleExpectations": ["Lead a team of 3-5 developers"],
  "performanceIndicators": ["Complete projects within 10% of budget"]
}
```
**Response**:
```json
{
  "id": "HF-001",
  "message": "Hiring form created successfully"
}
```

### GET /api/hiring-forms/:id
**Purpose**: Get specific hiring form  
**Headers**: `Authorization: Bearer <token>`  
**Response**: Complete hiring form details

### PUT /api/hiring-forms/:id
**Purpose**: Update hiring form  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**: Updated hiring form data  
**Response**: Updated hiring form

### DELETE /api/hiring-forms/:id
**Purpose**: Delete hiring form  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
{
  "message": "Hiring form deleted successfully"
}
```

---

## 5. Evaluation Results APIs

### GET /api/evaluations
**Purpose**: Get all evaluation results  
**Headers**: `Authorization: Bearer <token>`  
**Query Params**: 
- `status` (all, shortlisted, under-review, needs-review, rejected)
- `dateRange` (today, week, month, all)
- `search` (candidate name, position, industry)

**Response**:
```json
[
  {
    "id": 1,
    "candidateName": "John Smith",
    "position": "Senior Software Engineer",
    "industry": "Information Technology",
    "score": 85,
    "confidence": "High",
    "status": "Shortlisted",
    "evaluatedAt": "2024-01-20 14:30",
    "resumeFile": "john_smith_resume.pdf",
    "hiringForm": "Senior Developer Evaluation",
    "evaluator": "AI System v2.1"
  }
]
```

### GET /api/evaluations/:id
**Purpose**: Get specific evaluation details  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
{
  "candidateInfo": {
    "name": "John Smith",
    "position": "Senior Software Engineer",
    "industry": "Information Technology"
  },
  "overallScore": 85,
  "confidence": "High",
  "detailedScores": {
    "experience": 88,
    "skills": 82,
    "projects": 90,
    "education": 75,
    "communication": 78
  },
  "strengths": [
    "Strong technical leadership experience",
    "Led multiple high-impact projects"
  ],
  "gaps": [
    "Limited experience with cloud-native architectures"
  ],
  "evidence": [
    {
      "type": "project",
      "text": "Led development of microservices architecture serving 1M+ users",
      "relevance": "High",
      "score": 9
    }
  ],
  "evaluationMetadata": {
    "evaluatedAt": "2024-01-20 14:30",
    "evaluator": "AI System v2.1",
    "promptVersion": "Senior Developer Evaluation v1.2"
  }
}
```

### POST /api/evaluations/:id/override
**Purpose**: Human override of AI recommendation  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**:
```json
{
  "action": "approve|reject|review",
  "reason": "Strong technical leadership experience aligns well with team needs",
  "userId": "user_123"
}
```
**Response**:
```json
{
  "message": "Override applied successfully"
}
```

---

## 6. Prompt Management APIs

### GET /api/prompts
**Purpose**: Get all prompts by industry  
**Headers**: `Authorization: Bearer <token>`  
**Query Params**: `industry` (optional)  
**Response**:
```json
{
  "Information Technology": [
    {
      "id": 1,
      "name": "Senior Developer Evaluation",
      "version": "1.2",
      "isDefault": true,
      "prompt": "Evaluate this IT candidate holistically...",
      "createdAt": "2024-01-15",
      "lastModified": "2024-01-20",
      "usageCount": 45
    }
  ],
  "Healthcare": [...]
}
```

### POST /api/prompts
**Purpose**: Create new evaluation prompt  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**:
```json
{
  "name": "Full-Stack Developer",
  "industry": "Information Technology",
  "prompt": "Evaluate this candidate for a full-stack developer position...",
  "version": "1.0"
}
```
**Response**:
```json
{
  "id": "prompt_789",
  "message": "Prompt created successfully"
}
```

### PUT /api/prompts/:id
**Purpose**: Update existing prompt  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**: Updated prompt data  
**Response**: Updated prompt

### DELETE /api/prompts/:id
**Purpose**: Delete prompt  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
{
  "message": "Prompt deleted successfully"
}
```

### POST /api/prompts/:id/set-default
**Purpose**: Set prompt as default for industry  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
{
  "message": "Default prompt updated"
}
```

### POST /api/prompts/:id/duplicate
**Purpose**: Duplicate existing prompt  
**Headers**: `Authorization: Bearer <token>`  
**Response**: New prompt object

---

## 7. Evaluation History APIs

### GET /api/history
**Purpose**: Get evaluation history with filtering  
**Headers**: `Authorization: Bearer <token>`  
**Query Params**:
- `search` (candidate name, job title, industry)
- `status` (completed, pending, error)
- `dateFilter` (today, week, month, all)

**Response**:
```json
[
  {
    "id": 1,
    "candidateName": "John Doe",
    "jobTitle": "Senior Software Engineer",
    "industry": "Information Technology",
    "submittedDate": "2024-12-20",
    "evaluatedDate": "2024-12-20",
    "status": "completed",
    "score": 85,
    "recommendation": "shortlist",
    "resumeFile": "john_doe_resume.pdf"
  }
]
```

### GET /api/history/stats
**Purpose**: Get history statistics  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
{
  "totalEvaluations": 247,
  "shortlisted": 43,
  "forReview": 28,
  "rejected": 15
}
```

### GET /api/history/export
**Purpose**: Export evaluation data  
**Headers**: `Authorization: Bearer <token>`  
**Query Params**: `format` (csv, excel)  
**Response**: File download

### GET /api/history/:id/resume
**Purpose**: Download resume file  
**Headers**: `Authorization: Bearer <token>`  
**Response**: File download

---

## 8. Audit Trail APIs

### GET /api/audit
**Purpose**: Get audit logs with filtering  
**Headers**: `Authorization: Bearer <token>`  
**Query Params**:
- `search` (candidate, user, action, position)
- `action` (Evaluation Completed, Human Override, Resume Uploaded, etc.)
- `dateFilter` (today, yesterday, week, all)

**Response**:
```json
[
  {
    "id": 1,
    "timestamp": "2024-01-20 14:35:22",
    "action": "Evaluation Completed",
    "user": "AI System v2.1",
    "candidateName": "John Smith",
    "position": "Senior Software Engineer",
    "industry": "Information Technology",
    "score": 85,
    "confidence": "High",
    "promptVersion": "Senior Developer Evaluation v1.2",
    "hiringFormId": "HF-001",
    "resumeFile": "john_smith_resume.pdf",
    "ipAddress": "192.168.1.100",
    "sessionId": "sess_abc123",
    "details": {
      "processingTime": "2.3s",
      "evidenceCount": 12,
      "strengthsCount": 4,
      "gapsCount": 2
    }
  }
]
```

### GET /api/audit/:id
**Purpose**: Get specific audit entry details  
**Headers**: `Authorization: Bearer <token>`  
**Response**: Complete audit entry with all metadata

### POST /api/audit/log
**Purpose**: Create audit log entry (internal use)  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**: Audit event data  
**Response**:
```json
{
  "id": "audit_123",
  "timestamp": "2024-01-20 14:35:22"
}
```

### GET /api/audit/export
**Purpose**: Export audit trail  
**Headers**: `Authorization: Bearer <token>`  
**Response**: CSV file download

---

## 9. Background Job & Notification APIs

### GET /api/jobs/status/:jobId
**Purpose**: Check background job status  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
{
  "status": "pending|processing|completed|failed",
  "progress": 75,
  "result": {
    "evaluationId": "eval_456",
    "score": 85
  }
}
```

### POST /api/notifications/send
**Purpose**: Send notification (internal)  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**: Notification data  
**Response**:
```json
{
  "messageId": "notif_789"
}
```

### GET /api/notifications
**Purpose**: Get user notifications  
**Headers**: `Authorization: Bearer <token>`  
**Response**: Array of notifications

---

## 10. File Management APIs

### GET /api/files/:fileId
**Purpose**: Download uploaded file  
**Headers**: `Authorization: Bearer <token>`  
**Response**: File download

### DELETE /api/files/:fileId
**Purpose**: Delete uploaded file  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
{
  "message": "File deleted successfully"
}
```

---

## Error Responses

All APIs return consistent error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` (401): Invalid or missing authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid input data
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

---

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- File upload endpoints: 10 requests per minute
- All other endpoints: 100 requests per minute

---

## MongoDB Database Schema & Models

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String, // unique, indexed
  password: String, // bcrypt hashed
  personalInfo: {
    firstName: String,
    lastName: String,
    phone: String,
    department: String,
    position: String,
    location: String,
    bio: String,
    avatar: String // URL to profile image
  },
  professionalInfo: {
    joinDate: Date,
    totalEvaluations: Number,
    successfulPlacements: Number,
    averageTimeToHire: String,
    specializations: [String],
    certifications: [String],
    languages: [String]
  },
  performance: {
    quarterlyScore: Number,
    candidateSatisfaction: Number,
    hiringManagerRating: Number,
    efficiencyScore: Number,
    qualityScore: Number,
    trend: String // "improving", "stable", "declining"
  },
  role: String, // "Admin", "HR Manager", "Recruiter"
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })
db.users.createIndex({ "department": 1 })
db.users.createIndex({ "isActive": 1 })
```

### HiringForms Collection
```javascript
{
  _id: ObjectId,
  title: String,
  industry: String, // indexed
  experienceLevel: String, // "Entry Level", "Junior", "Mid-Level", "Senior", "Lead/Principal"
  jobType: String, // "full-time", "internship", "placement"
  responsibilities: [String],
  requirements: [String],
  roleExpectations: [String],
  performanceIndicators: [String],
  cutOffSettings: {
    autoShortlist: Number, // default: 80
    manualReview: Number, // default: 60
    autoReject: Number // default: 40
  },
  isActive: Boolean,
  createdBy: ObjectId, // references Users._id
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.hiringForms.createIndex({ "industry": 1 })
db.hiringForms.createIndex({ "isActive": 1 })
db.hiringForms.createIndex({ "createdBy": 1 })
db.hiringForms.createIndex({ "createdAt": -1 })
```

### Resumes Collection
```javascript
{
  _id: ObjectId,
  fileName: String,
  originalName: String,
  fileSize: Number,
  fileType: String,
  filePath: String, // S3 or local storage path
  uploadedBy: ObjectId, // references Users._id
  uploadedAt: Date,
  parsedContent: {
    candidateName: String,
    email: String,
    phone: String,
    experience: String,
    education: String,
    skills: [String],
    summary: String,
    projects: [{
      title: String,
      description: String,
      technologies: [String],
      duration: String,
      role: String
    }],
    workExperience: [{
      company: String,
      position: String,
      duration: String,
      responsibilities: [String]
    }],
    education: [{
      institution: String,
      degree: String,
      year: String,
      field: String
    }]
  },
  processingStatus: String, // "uploaded", "parsed", "processing", "completed", "error"
  processingError: String,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.resumes.createIndex({ "uploadedBy": 1 })
db.resumes.createIndex({ "uploadedAt": -1 })
db.resumes.createIndex({ "processingStatus": 1 })
db.resumes.createIndex({ "parsedContent.candidateName": "text", "parsedContent.skills": "text" })
db.resumes.createIndex({ "parsedContent.email": 1 })
```

### Evaluations Collection
```javascript
{
  _id: ObjectId,
  resumeId: ObjectId, // references Resumes._id, indexed
  hiringFormId: ObjectId, // references HiringForms._id, indexed
  evaluatedBy: ObjectId, // references Users._id
  overallScore: Number, // 0-100, indexed
  confidence: String, // "High", "Medium", "Low"
  status: String, // "pending", "processing", "completed", "failed", "overridden"
  recommendation: String, // "shortlist", "review", "reject"
  
  // Detailed scoring breakdown
  detailedScores: {
    experience: Number, // 0-100
    skills: Number, // 0-100
    projects: Number, // 0-100
    education: Number, // 0-100
    communication: Number // 0-100
  },
  
  // AI analysis results
  strengths: [String],
  gaps: [String],
  evidence: [{
    type: String, // "project", "experience", "skill", "domain"
    text: String,
    relevance: String, // "High", "Medium", "Low"
    score: Number, // 0-10
    source: String // where in resume this was found
  }],
  
  // Evaluation metadata
  promptVersion: String,
  processingTime: Number, // in seconds
  aiModel: String, // "gpt-4", "claude-3", etc.
  evaluationSettings: {
    holistic: Boolean,
    evidenceHighlighting: Boolean,
    explainableAI: Boolean,
    strictMode: Boolean
  },
  
  // Human override information
  humanOverride: {
    action: String, // "approve", "reject", "review"
    reason: String,
    overriddenBy: ObjectId, // references Users._id
    overriddenAt: Date,
    originalRecommendation: String
  },
  
  // Timestamps
  queuedAt: Date,
  startedAt: Date,
  evaluatedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// Critical Indexes for Performance
db.evaluations.createIndex({ "resumeId": 1 })
db.evaluations.createIndex({ "hiringFormId": 1 })
db.evaluations.createIndex({ "evaluatedBy": 1 })
db.evaluations.createIndex({ "overallScore": 1 })
db.evaluations.createIndex({ "status": 1 })
db.evaluations.createIndex({ "recommendation": 1 })
db.evaluations.createIndex({ "evaluatedAt": -1 })
db.evaluations.createIndex({ "createdAt": -1 })
db.evaluations.createIndex({ "status": 1, "evaluatedAt": -1 })
db.evaluations.createIndex({ "hiringFormId": 1, "overallScore": -1 })
```

### Prompts Collection
```javascript
{
  _id: ObjectId,
  name: String,
  industry: String, // indexed
  prompt: String, // the actual prompt text
  version: String, // "1.0", "1.1", etc.
  isDefault: Boolean, // default prompt for industry
  usageCount: Number, // track usage statistics
  isActive: Boolean,
  createdBy: ObjectId, // references Users._id
  lastModifiedBy: ObjectId, // references Users._id
  changes: [{
    version: String,
    changes: [String],
    modifiedBy: ObjectId,
    modifiedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.prompts.createIndex({ "industry": 1 })
db.prompts.createIndex({ "isDefault": 1 })
db.prompts.createIndex({ "isActive": 1 })
db.prompts.createIndex({ "createdBy": 1 })
db.prompts.createIndex({ "industry": 1, "isDefault": 1 })
```

### AuditTrail Collection
```javascript
{
  _id: ObjectId,
  timestamp: Date, // indexed
  action: String, // indexed
  userId: ObjectId, // references Users._id, indexed
  sessionId: String,
  ipAddress: String,
  userAgent: String,
  
  // Action-specific data
  targetId: ObjectId, // could be evaluation, resume, prompt, etc.
  targetType: String, // "evaluation", "resume", "prompt", "hiringForm"
  
  // Details based on action type
  details: {
    // For Evaluation Completed
    evaluationId: ObjectId,
    candidateName: String,
    position: String,
    industry: String,
    score: Number,
    confidence: String,
    processingTime: Number,
    
    // For Human Override
    originalScore: Number,
    newStatus: String,
    overrideReason: String,
    
    // For Resume Upload
    fileName: String,
    fileSize: Number,
    fileType: String,
    
    // For Prompt Modified
    previousVersion: String,
    newVersion: String,
    changes: [String],
    
    // For System Errors
    errorType: String,
    errorMessage: String,
    errorCode: String,
    retryAttempts: Number
  },
  
  // Metadata
  requestId: String, // for tracing
  correlationId: String, // for related actions
  createdAt: Date
}

// Indexes for Audit Performance
db.auditTrail.createIndex({ "timestamp": -1 })
db.auditTrail.createIndex({ "action": 1 })
db.auditTrail.createIndex({ "userId": 1 })
db.auditTrail.createIndex({ "targetType": 1 })
db.auditTrail.createIndex({ "sessionId": 1 })
db.auditTrail.createIndex({ "timestamp": -1, "action": 1 })
db.auditTrail.createIndex({ "userId": 1, "timestamp": -1 })
```

### BackgroundJobs Collection
```javascript
{
  _id: ObjectId,
  jobId: String, // unique job identifier
  type: String, // "resume_evaluation", "email_notification", "report_generation"
  status: String, // "queued", "processing", "completed", "failed", "cancelled"
  priority: Number, // 1-10, higher number = higher priority
  
  // Job data
  payload: {
    // For resume evaluation
    resumeId: ObjectId,
    hiringFormId: ObjectId,
    evaluationSettings: Object,
    
    // For email notifications
    to: String,
    subject: String,
    template: String,
    data: Object
  },
  
  // Progress tracking
  progress: Number, // 0-100
  currentStep: String,
  totalSteps: Number,
  
  // Results
  result: Object, // job completion result
  error: {
    message: String,
    stack: String,
    code: String
  },
  
  // Timing
  queuedAt: Date,
  startedAt: Date,
  completedAt: Date,
  retryCount: Number,
  maxRetries: Number,
  nextRetryAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.backgroundJobs.createIndex({ "status": 1 })
db.backgroundJobs.createIndex({ "type": 1 })
db.backgroundJobs.createIndex({ "priority": -1 })
db.backgroundJobs.createIndex({ "queuedAt": 1 })
db.backgroundJobs.createIndex({ "nextRetryAt": 1 })
db.backgroundJobs.createIndex({ "status": 1, "priority": -1 })
```

### Notifications Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // references Users._id, indexed
  type: String, // "evaluation_completed", "resume_uploaded", "system_alert"
  title: String,
  message: String,
  
  // Notification data
  data: {
    evaluationId: ObjectId,
    candidateName: String,
    score: Number,
    // other relevant data
  },
  
  // Status
  isRead: Boolean, // indexed
  readAt: Date,
  
  // Delivery channels
  channels: {
    inApp: Boolean,
    email: Boolean,
    push: Boolean
  },
  
  // Timestamps
  createdAt: Date,
  expiresAt: Date
}

// Indexes
db.notifications.createIndex({ "userId": 1 })
db.notifications.createIndex({ "isRead": 1 })
db.notifications.createIndex({ "createdAt": -1 })
db.notifications.createIndex({ "userId": 1, "isRead": 1 })
db.notifications.createIndex({ "userId": 1, "createdAt": -1 })
```

### Settings Collection
```javascript
{
  _id: ObjectId,
  key: String, // unique, indexed
  value: Mixed, // could be string, number, object, etc.
  category: String, // "system", "ai", "email", "security"
  description: String,
  isPublic: Boolean, // whether this setting is exposed to frontend
  updatedBy: ObjectId, // references Users._id
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.settings.createIndex({ "key": 1 }, { unique: true })
db.settings.createIndex({ "category": 1 })
db.settings.createIndex({ "isPublic": 1 })
```

---

## Security Considerations

1. **Authentication**: JWT tokens with 15-minute expiration
2. **Authorization**: Role-based access control
3. **Input Validation**: All inputs validated and sanitized
4. **File Security**: Uploaded files scanned for malware
5. **Data Encryption**: Sensitive data encrypted at rest
6. **Audit Logging**: All actions logged for compliance
7. **Rate Limiting**: Prevent abuse and DoS attacks

---

## MongoDB Performance & Optimization

### Connection Management
```javascript
// MongoDB Connection Setup
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maximum number of sockets in the connection pool
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000, // How long a send or receive on a socket can take
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};
```

### Query Optimization Patterns
```javascript
// Aggregation Pipeline for Dashboard Stats
const getDashboardStats = async (userId) => {
  return await Evaluations.aggregate([
    {
      $match: {
        evaluatedBy: new ObjectId(userId),
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalEvaluations: { $sum: 1 },
        averageScore: { $avg: '$overallScore' },
        shortlistedCount: {
          $sum: { $cond: [{ $eq: ['$recommendation', 'shortlist'] }, 1, 0] }
        }
      }
    },
    {
      $lookup: {
        from: 'resumes',
        localField: 'resumeId',
        foreignField: '_id',
        as: 'resume'
      }
    },
    {
      $unwind: '$resume'
    },
    {
      $lookup: {
        from: 'hiringforms',
        localField: 'hiringFormId',
        foreignField: '_id',
        as: 'hiringForm'
      }
    },
    {
      $unwind: '$hiringForm'
    },
    {
      $group: {
        _id: '$hiringForm.industry',
        count: { $sum: 1 },
        avgScore: { $avg: '$overallScore' }
      }
    }
  ]);
};

// Efficient Pagination with Cursor-based Pagination
const getEvaluationsPaginated = async (filters, page = 1, limit = 20) => {
  const query = buildQuery(filters);
  
  // Use cursor-based pagination for better performance
  const evaluations = await Evaluations.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit)
    .populate('resumeId', 'candidateName fileName')
    .populate('hiringFormId', 'title industry')
    .lean(); // Return plain JavaScript objects for better performance
    
  const total = await Evaluations.countDocuments(query);
  
  return {
    evaluations,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};
```

### Caching Strategy with Redis
```javascript
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache frequently accessed data
const getCachedData = async (key, fetchFunction, ttl = 300) => {
  try {
    const cached = await client.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    
    const data = await fetchFunction();
    await client.setex(key, ttl, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error('Cache error:', error);
    return await fetchFunction();
  }
};

// Usage example
const getDashboardStatsCached = (userId) => {
  return getCachedData(
    `dashboard_stats_${userId}`,
    () => getDashboardStats(userId),
    600 // 10 minutes cache
  );
};
```

### Bulk Operations for Performance
```javascript
// Bulk insert for audit logs
const bulkInsertAuditLogs = async (logs) => {
  try {
    await AuditTrail.insertMany(logs, { ordered: false });
  } catch (error) {
    console.error('Bulk insert error:', error);
    // Fallback to individual inserts
    for (const log of logs) {
      try {
        await AuditTrail.create(log);
      } catch (individualError) {
        console.error('Individual insert error:', individualError);
      }
    }
  }
};

// Bulk update for notifications
const markNotificationsAsRead = async (userId, notificationIds) => {
  await Notifications.updateMany(
    { 
      _id: { $in: notificationIds.map(id => new ObjectId(id)) },
      userId: new ObjectId(userId)
    },
    { 
      $set: { isRead: true, readAt: new Date() }
    }
  );
};
```

### MongoDB Index Optimization
```javascript
// Create compound indexes for complex queries
const createOptimizedIndexes = async () => {
  // Evaluations collection indexes
  await Evaluations.createIndex(
    { status: 1, evaluatedAt: -1 },
    { name: 'status_evaluatedAt_compound' }
  );
  
  await Evaluations.createIndex(
    { hiringFormId: 1, overallScore: -1 },
    { name: 'hiringForm_score_compound' }
  );
  
  await Evaluations.createIndex(
    { evaluatedBy: 1, createdAt: -1 },
    { name: 'evaluator_created_compound' }
  );
  
  // Audit trail indexes for time-based queries
  await AuditTrail.createIndex(
    { timestamp: -1, action: 1 },
    { name: 'timestamp_action_compound' }
  );
  
  await AuditTrail.createIndex(
    { userId: 1, timestamp: -1 },
    { name: 'user_timestamp_compound' }
  );
  
  // Text search indexes
  await Resumes.createIndex(
    { 
      'parsedContent.candidateName': 'text',
      'parsedContent.skills': 'text',
      'parsedContent.summary': 'text'
    },
    { 
      name: 'resume_text_search',
      weights: {
        'parsedContent.candidateName': 10,
        'parsedContent.skills': 5,
        'parsedContent.summary': 1
      }
    }
  );
};
```

### Performance Monitoring
```javascript
// MongoDB performance monitoring
const monitorPerformance = () => {
  // Enable slow query logging
  mongoose.set('debug', (collectionName, method, query, doc) => {
    console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
  });
  
  // Monitor connection pool
  setInterval(() => {
    const admin = mongoose.connection.db.admin();
    admin.serverStatus().then(status => {
      console.log('MongoDB Connections:', status.connections);
      console.log('MongoDB Operations:', status.opcounters);
    });
  }, 60000); // Every minute
};
```

## Performance Considerations

1. **Caching**: Frequently accessed data cached in Redis with TTL
2. **Pagination**: Cursor-based pagination for large datasets
3. **Async Processing**: AI evaluations processed asynchronously with Bull Queue
4. **File Streaming**: Large files streamed during upload/download
5. **Database Optimization**: 
   - Compound indexes for complex queries
   - Text search indexes for resume content
   - Lean queries for better performance
   - Connection pooling with proper configuration
6. **Bulk Operations**: Bulk inserts/updates for audit logs and notifications
7. **CDN**: Static assets served via CDN
8. **Query Optimization**: Use aggregation pipelines for complex analytics

---

## Testing

All APIs should have comprehensive test coverage:
- Unit tests for business logic
- Integration tests for API endpoints
- Load tests for performance
- Security tests for vulnerabilities

---

## Deployment

### Environment Variables
```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key
DATABASE_URL=your-database-url
REDIS_URL=your-redis-url
AWS_S3_BUCKET=your-s3-bucket
OPENAI_API_KEY=your-openai-key
```

### Health Check
`GET /api/health` - Returns service status and dependencies

---

## Complete Node.js/Express Implementation Example

### Project Structure
```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── resumeController.js
│   │   ├── evaluationController.js
│   │   ├── hiringFormController.js
│   │   ├── promptController.js
│   │   ├── auditController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Resume.js
│   │   ├── Evaluation.js
│   │   ├── HiringForm.js
│   │   ├── Prompt.js
│   │   └── AuditTrail.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── resumes.js
│   │   ├── evaluations.js
│   │   ├── hiringForms.js
│   │   ├── prompts.js
│   │   ├── audit.js
│   │   └── dashboard.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── resumeService.js
│   │   ├── evaluationService.js
│   │   ├── aiService.js
│   │   ├── emailService.js
│   │   └── fileService.js
│   ├── utils/
│   │   ├── database.js
│   │   ├── redis.js
│   │   ├── logger.js
│   │   └── helpers.js
│   ├── workers/
│   │   ├── evaluationWorker.js
│   │   └── emailWorker.js
│   └── app.js
├── config/
│   ├── database.js
│   ├── redis.js
│   └── aws.js
├── tests/
├── package.json
└── server.js
```

### Package.json Dependencies
```json
{
  "name": "resume-evaluation-backend",
  "version": "1.0.0",
  "description": "AI-Driven Resume Evaluation Platform Backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "redis": "^4.6.7",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "joi": "^17.9.2",
    "multer": "^1.4.5-lts.1",
    "bull": "^4.11.3",
    "nodemailer": "^6.9.4",
    "aws-sdk": "^2.1450.0",
    "sharp": "^0.32.5",
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.6.0",
    "express-rate-limit": "^6.10.0",
    "helmet": "^7.0.0",
    "cors": "^2.8.5",
    "compression": "^1.7.4",
    "morgan": "^1.10.0",
    "winston": "^3.10.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "supertest": "^6.3.3",
    "eslint": "^8.47.0",
    "prettier": "^3.0.2"
  }
}
```

### Main Application File (app.js)
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resumes');
const evaluationRoutes = require('./routes/evaluations');
const hiringFormRoutes = require('./routes/hiringForms');
const promptRoutes = require('./routes/prompts');
const auditRoutes = require('./routes/audit');
const dashboardRoutes = require('./routes/dashboard');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { connectDB } = require('./utils/database');
const { connectRedis } = require('./utils/redis');
const logger = require('./utils/logger');

const app = express();

// Connect to databases
connectDB();
connectRedis();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/hiring-forms', hiringFormRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check MongoDB connection
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check Redis connection
    const redis = require('./utils/redis');
    const redisStatus = redis.client.isOpen ? 'connected' : 'disconnected';
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoStatus,
        redis: redisStatus,
        api: 'running'
      },
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

module.exports = app;
```

### Server File (server.js)
```javascript
require('dotenv').config();
const app = require('./src/app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
```

### Authentication Controller Example
```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m'
  });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }

    const { email, password, firstName, lastName, department, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists'
        }
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      personalInfo: {
        firstName,
        lastName,
        department
      },
      role: role || 'Recruiter'
    });

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`,
        role: user.role,
        department: user.personalInfo.department
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Server error during registration'
      }
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: {
          code: 'ACCOUNT_DISABLED',
          message: 'Account has been disabled'
        }
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    logger.info(`User logged in: ${email}`);

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`,
        role: user.role,
        department: user.personalInfo.department
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Server error during login'
      }
    });
  }
};
```

### Resume Controller Example
```javascript
const multer = require('multer');
const Resume = require('../models/Resume');
const Evaluation = require('../models/Evaluation');
const { processResumeFile } = require('../services/resumeService');
const { queueEvaluation } = require('../services/evaluationService');
const logger = require('../utils/logger');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOC files are allowed.'), false);
    }
  }
});

// @desc    Upload resume files
// @route   POST /api/resumes/upload
// @access  Private
exports.uploadResumes = async (req, res) => {
  try {
    upload.array('files', 5)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          error: {
            code: 'FILE_UPLOAD_ERROR',
            message: err.message
          }
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: {
            code: 'NO_FILES',
            message: 'No files uploaded'
          }
        });
      }

      const uploadedFiles = [];

      for (const file of req.files) {
        try {
          // Process file (upload to S3, parse content, etc.)
          const fileData = await processResumeFile(file, req.user.id);
          
          // Create resume record
          const resume = await Resume.create({
            fileName: file.originalname,
            originalName: file.originalname,
            fileSize: file.size,
            fileType: file.mimetype,
            filePath: fileData.filePath,
            uploadedBy: req.user.id,
            parsedContent: fileData.parsedContent,
            processingStatus: 'uploaded'
          });

          uploadedFiles.push({
            id: resume._id,
            name: file.originalname,
            size: file.size,
            type: file.mimetype,
            uploadTime: resume.createdAt
          });

          logger.info(`Resume uploaded: ${file.originalname} by user ${req.user.id}`);
        } catch (fileError) {
          logger.error(`Error processing file ${file.originalname}:`, fileError);
        }
      }

      res.json({
        uploadedFiles,
        status: 'success'
      });
    });
  } catch (error) {
    logger.error('Resume upload error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Server error during file upload'
      }
    });
  }
};

// @desc    Parse resume content
// @route   POST /api/resumes/parse
// @access  Private
exports.parseResume = async (req, res) => {
  try {
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'File ID is required'
        }
      });
    }

    const resume = await Resume.findOne({
      _id: fileId,
      uploadedBy: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Resume not found'
        }
      });
    }

    // Update processing status
    resume.processingStatus = 'parsed';
    await resume.save();

    res.json(resume.parsedContent);
  } catch (error) {
    logger.error('Resume parse error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Server error during resume parsing'
      }
    });
  }
};

// @desc    Start AI evaluation
// @route   POST /api/resumes/evaluate
// @access  Private
exports.startEvaluation = async (req, res) => {
  try {
    const { resumeId, hiringFormId, evaluationSettings } = req.body;

    // Validation
    if (!resumeId || !hiringFormId) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Resume ID and Hiring Form ID are required'
        }
      });
    }

    // Check if resume exists and belongs to user
    const resume = await Resume.findOne({
      _id: resumeId,
      uploadedBy: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Resume not found'
        }
      });
    }

    // Check if evaluation already exists
    const existingEvaluation = await Evaluation.findOne({
      resumeId,
      hiringFormId
    });

    if (existingEvaluation) {
      return res.status(400).json({
        error: {
          code: 'EVALUATION_EXISTS',
          message: 'Evaluation already exists for this resume and hiring form'
        }
      });
    }

    // Create evaluation record
    const evaluation = await Evaluation.create({
      resumeId,
      hiringFormId,
      evaluatedBy: req.user.id,
      status: 'pending',
      evaluationSettings: evaluationSettings || {
        holistic: true,
        evidenceHighlighting: true,
        explainableAI: true,
        strictMode: false
      },
      queuedAt: new Date()
    });

    // Queue for background processing
    await queueEvaluation(evaluation._id);

    logger.info(`Evaluation queued: ${evaluation._id} for resume ${resumeId}`);

    res.json({
      evaluationId: evaluation._id,
      status: 'queued',
      estimatedTime: '3-5 minutes'
    });
  } catch (error) {
    logger.error('Start evaluation error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Server error starting evaluation'
      }
    });
  }
};
```

### MongoDB Models Example (User.js)
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    phone: String,
    department: String,
    position: String,
    location: String,
    bio: String,
    avatar: String
  },
  professionalInfo: {
    joinDate: Date,
    totalEvaluations: {
      type: Number,
      default: 0
    },
    successfulPlacements: {
      type: Number,
      default: 0
    },
    averageTimeToHire: String,
    specializations: [String],
    certifications: [String],
    languages: [String]
  },
  performance: {
    quarterlyScore: Number,
    candidateSatisfaction: {
      type: Number,
      min: 0,
      max: 5
    },
    hiringManagerRating: {
      type: Number,
      min: 0,
      max: 5
    },
    efficiencyScore: {
      type: Number,
      min: 0,
      max: 100
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    trend: {
      type: String,
      enum: ['improving', 'stable', 'declining']
    }
  },
  role: {
    type: String,
    enum: ['Admin', 'HR Manager', 'Recruiter'],
    default: 'Recruiter'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  refreshTokens: [String]
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ isActive: 1 });

// Middleware to hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshTokens;
  return user;
};

module.exports = mongoose.model('User', userSchema);
```

### Environment Configuration (.env.example)
```env
# Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_URL=mongodb://localhost:27017/resume-evaluation
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here

# AWS Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AI Service Configuration
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

This complete implementation example provides a production-ready foundation for your AI-driven resume evaluation platform with MongoDB, including proper authentication, file handling, background processing, and comprehensive error handling.
