# AI-Driven Resume Evaluation Platform - Backend

A robust Node.js/Express backend API for the AI-Driven Holistic Resume Evaluation Platform. This backend handles resume processing, AI evaluation, user management, and provides comprehensive APIs for the frontend application.

## 🚀 Features

### Core API Functionality
- **Resume Processing**: Intelligent parsing of PDF/DOC files with context preservation
- **Universal Search**: Global search capability for files, folders, and candidates
- **AI Evaluation**: Holistic candidate assessment using advanced language models
- **User Management**: Authentication, authorization, and profile management
- **Account Creation**: Secure administrator-controlled user registration
- **Hiring Forms**: Configurable role definitions and evaluation criteria
- **Prompt Management**: Industry-specific evaluation prompts with version control
- **Audit Trail**: Complete logging system for compliance and accountability

### ✅ Recent Updates
- **Global Search**: Added backend endpoints for universal file and folder search
- **Stability**: Fixed critical crash in `auth` routes (middleware import)
- **Dependencies**: Updated to latest secure versions
- **Performance**: Optimized background processing and caching
- **Security**: Enhanced input validation and error handling

### Technical Features
- **File Upload**: Secure multi-format file handling (PDF, DOC, DOCX)
- **Background Processing**: Asynchronous job queues for AI evaluations
- **Caching**: Redis-based session and data caching
- **Security**: JWT authentication, rate limiting, input validation
- **Monitoring**: Comprehensive logging and error tracking
- **Protected Routes**: Administrator password protection for sensitive operations

## 🛠️ Technology Stack

- **Runtime**: Node.js 18.0.0+
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis 4.6.7
- **Authentication**: JWT with refresh tokens
- **File Processing**: Multer, pdf-parse, mammoth
- **Queue System**: Bull 4.11.3
- **AI Integration**: OpenAI/Anthropic/Google Gemini APIs
- **File Storage**: AWS S3
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Winston, Morgan
- **Validation**: Joi, express-validator
- **Email**: Nodemailer
- **Image Processing**: Sharp

## 📦 Installation & Setup

### Prerequisites
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- MongoDB 5.0 or higher
- Redis 6.0 or higher
- AWS account (for S3 file storage)

### Installation
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp ../my-app/.env.example .env

# Configure environment variables (see root README for details)
```

### Development
```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start
```

### Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── controllers/          # Route controllers
│   │   ├── authController.js     # Authentication endpoints
│   │   ├── resumeController.js   # Resume processing
│   │   ├── hiringFormController.js # Hiring form management
│   │   ├── promptController.js   # AI prompt management
│   │   ├── industryController.js # Industry configuration
│   │   └── auditTrail.js         # Audit logging
│   ├── middleware/           # Express middleware
│   │   ├── auth.js               # JWT authentication
│   │   └── errorHandler.js       # Error handling
│   ├── models/               # MongoDB schemas
│   │   ├── User.js               # User model
│   │   ├── Resume.js             # Resume model
│   │   ├── HiringForm.js         # Hiring form model
│   │   ├── Industry.js           # Industry model
│   │   ├── Prompt.js             # Prompt model
│   │   └── Company.js            # Company model
│   ├── routes/               # API route definitions
│   │   ├── auth.js               # Authentication routes
│   │   ├── resume.js             # Resume routes
│   │   ├── hiringForm.js         # Hiring form routes
│   │   ├── prompt.js             # Prompt routes
│   │   ├── industry.js           # Industry routes
│   │   ├── auditTrail.js         # Audit routes
│   │   └── index.js              # Route aggregator
│   ├── services/             # Business logic services
│   │   ├── aiService.js          # AI evaluation logic
│   │   ├── fileService.js        # File processing
│   │   └── emailService.js       # Email notifications
│   ├── utils/                # Utility functions
│   │   └── logger.js             # Logging utilities
│   └── workers/              # Background job processors
│       └── evaluationWorker.js   # AI evaluation queue
├── server.js                # Application entry point
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

### Resume Management
- `POST /api/resume/upload` - Upload resume file
- `GET /api/resume/:id` - Get resume details
- `GET /api/resume` - List user resumes
- `DELETE /api/resume/:id` - Delete resume

### Evaluation
- `POST /api/evaluation/start` - Start AI evaluation
- `GET /api/evaluation/:id` - Get evaluation results
- `GET /api/evaluation` - List evaluations

### Hiring Forms
- `POST /api/hiring-form` - Create hiring form
- `GET /api/hiring-form` - List hiring forms
- `PUT /api/hiring-form/:id` - Update hiring form
- `DELETE /api/hiring-form/:id` - Delete hiring form

### Prompt Management
- `POST /api/prompt` - Create evaluation prompt
- `GET /api/prompt` - List prompts
- `PUT /api/prompt/:id` - Update prompt
- `DELETE /api/prompt/:id` - Delete prompt

### Audit Trail
- `GET /api/audit-trail` - Get audit logs
- `GET /api/audit-trail/export` - Export audit data

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Admin, HR Manager, Recruiter permissions
- **Input Validation**: Comprehensive validation with Joi
- **Rate Limiting**: Configurable request limits
- **CORS Protection**: Cross-origin security
- **Helmet Security**: Security headers
- **File Validation**: Type and malware checking
- **Audit Logging**: Complete action tracking

## 🔧 Configuration

### Environment Variables
See the root README.md for complete environment configuration.

### Database Configuration
- **MongoDB**: Connection string and database name
- **Redis**: Host, port, and authentication
- **AWS S3**: Bucket configuration and credentials

### AI Integration
- **OpenAI**: API key and model selection
- **Anthropic**: API key and model configuration
- **Google Generative AI**: API key (Gemini) configuration
- **Custom Prompts**: Industry-specific evaluation templates

## 📊 Monitoring & Logging

### Winston Logging
- **Levels**: error, warn, info, debug
- **Transports**: Console, file rotation
- **Structured**: JSON format for parsing

### Performance Monitoring
- **Response Times**: API endpoint timing
- **Error Rates**: Failure tracking
- **Queue Status**: Background job monitoring
- **Database Queries**: Slow query logging

## 🚀 Deployment

### Production Setup
```bash
# Install production dependencies only
npm ci --only=production

# Set NODE_ENV=production
export NODE_ENV=production

# Start the server
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment-Specific Config
- **Development**: Local databases, debug logging
- **Staging**: Cloud databases, info logging
- **Production**: Optimized settings, warn+ logging

## 🧪 Testing Strategy

### Unit Tests
- Controller logic testing
- Service layer validation
- Utility function testing

### Integration Tests
- API endpoint testing
- Database operations
- External service mocking

### Coverage Goals
- **Lines**: 80% minimum
- **Functions**: 85% minimum
- **Branches**: 75% minimum

## 🔄 Background Processing

### Bull Queue System
- **Evaluation Queue**: AI processing jobs
- **Email Queue**: Notification sending
- **File Processing**: Document parsing

### Worker Management
- **Concurrency**: Configurable worker count
- **Retry Logic**: Failed job handling
- **Monitoring**: Queue status and metrics

## 🤝 Contributing

1. Follow the project's coding standards
2. Write comprehensive tests for new features
3. Update API documentation for changes
4. Ensure all tests pass before submitting

## 📝 License

MIT License - see LICENSE file for details.

---

**Part of the AI-Driven Holistic Resume Evaluation Platform**
