# AI-Driven Holistic Resume Evaluation Platform

A comprehensive, multi-industry AI hiring platform that evaluates candidates holistically rather than relying on rigid keyword matching. Built with React, Vite, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **Multi-Industry Support**: Configurable evaluation prompts for IT, Healthcare, Finance, Manufacturing, and more
- **Holistic Evaluation**: AI assesses experience context, project ownership, and domain relevance
- **Explainable AI**: Every score comes with detailed reasoning and evidence highlighting
- **Human Override**: Recruiters can override AI decisions with audit trail logging
- **Resume Parsing**: Intelligent parsing of PDF/DOC files with context preservation
- **Industry-Specific Prompts**: Customizable evaluation criteria per industry

### Key Components
1. **Dashboard**: Overview of evaluations, statistics, and quick actions
2. **Resume Upload**: Drag-and-drop interface with real-time parsing preview
3. **Hiring Forms**: Define role requirements, cut-offs, and evaluation weights
4. **Prompt Management**: Configure industry-specific evaluation prompts
5. **Evaluation Results**: Review AI scores, evidence, and detailed analysis
6. **Audit Trail**: Complete logging system for compliance and accountability

## 🛠️ Technology Stack

- **Frontend**: React 19.2.0
- **Build Tool**: Vite (rolldown-vite)
- **Styling**: Tailwind CSS 4.1.18
- **Routing**: React Router DOM
- **UI Components**: Radix UI primitives
- **Icons**: Heroicons React & Lucide React
- **File Upload**: react-dropzone
- **HTTP Client**: Axios
- **Utilities**: class-variance-authority, clsx, tailwind-merge
- **Animations**: tw-animate-css

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd resume-project/my-app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
my-app/
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # Main application layout with navigation
│   │   └── ui/                 # Reusable UI components
│   │       ├── avatar.tsx      # User avatar component
│   │       ├── badge.tsx       # Status and category badges
│   │       ├── button.tsx      # Custom button variants
│   │       ├── card.tsx        # Content container cards
│   │       ├── input.tsx       # Form input fields
│   │       ├── label.tsx       # Form labels
│   │       ├── navigation-menu.tsx # Navigation components
│   │       ├── select.tsx      # Dropdown select components
│   │       ├── separator.tsx   # Visual separators
│   │       ├── sheet.tsx       # Slide-out panels
│   │       ├── sidebar.tsx     # Navigation sidebar
│   │       ├── skeleton.tsx    # Loading placeholders
│   │       ├── textarea.tsx    # Multi-line text inputs
│   │       └── tooltip.tsx     # Hover tooltips
│   ├── pages/
│   │   ├── Dashboard.jsx        # Overview and statistics
│   │   ├── ResumeUpload.jsx     # File upload and parsing
│   │   ├── HiringForm.jsx      # Role configuration
│   │   ├── PromptManagement.jsx # Industry prompts
│   │   ├── EvaluationResults.jsx # AI results and analysis
│   │   └── AuditTrail.jsx      # System logging
│   ├── hooks/
│   │   └── use-mobile.ts       # Mobile detection hook
│   ├── lib/
│   │   └── utils.ts            # Utility functions
│   ├── App.jsx                 # Main application component
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles
├── public/                    # Static assets
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## 🎯 Key Features Explained

### Holistic Evaluation
Unlike traditional systems that rely on keyword matching, our platform:
- Evaluates project complexity and ownership
- Assesses technical depth beyond surface-level skills
- Considers domain-specific experience context
- Treats missing portfolio links as soft signals, not penalties

### Industry-Specific Intelligence
Each industry has tailored evaluation criteria:
- **IT**: Focus on architecture, system design, and technical leadership
- **Healthcare**: Emphasis on regulatory compliance and domain knowledge
- **Finance**: Priority on analytical skills and risk management
- **Manufacturing**: Focus on process optimization and quality control

### Explainable AI
Every evaluation includes:
- Overall score (0-100) with confidence level
- Detailed breakdown by category (experience, skills, projects, etc.)
- Evidence highlighting from the resume
- Clear reasoning for strengths and gaps

### Human-in-the-Loop
Recruiters can:
- Override AI decisions with reasons
- Provide feedback for system improvement
- Review evidence before making decisions
- Track all changes in the audit trail

## 🔧 Configuration

### Hiring Forms
Create detailed role specifications including:
- Basic information (title, industry, experience level)
- Key responsibilities and requirements
- Evaluation weights and cut-off thresholds
- Industry-specific criteria

### Prompt Management
Configure AI evaluation prompts:
- Industry-specific templates
- Custom scoring guidelines
- Version control and rollback
- Usage tracking and analytics

### Audit Trail
Comprehensive logging captures:
- All user actions and system events
- Evaluation details and overrides
- Session information and IP addresses
- Export functionality for compliance

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop and mobile
- **Modern Interface**: Clean, professional design with Tailwind CSS
- **Interactive Elements**: Smooth transitions and hover effects
- **Accessibility**: Semantic HTML and keyboard navigation
- **Real-time Updates**: Dynamic content without page refreshes

## 🔒 Security & Compliance

- **Role-Based Access**: Different permissions for HR, managers, and admins
- **Data Privacy**: Secure document handling and storage
- **Audit Logging**: Complete traceability for compliance
- **No Demographic Analysis**: Focus on skills and experience only

## 📊 Analytics & Reporting

- **Evaluation Statistics**: Track success rates and decision patterns
- **Prompt Performance**: Monitor AI effectiveness across industries
- **User Activity**: Understand platform usage patterns
- **Export Capabilities**: CSV export for audit and analysis

## 🚀 Deployment

The application is ready for deployment to any static hosting service:

```bash
# Build the application
npm run build

# Deploy the dist/ folder to your hosting service
```

Compatible with:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Success Metrics

The platform aims to:
- Reduce false rejections by 40%
- Improve shortlist quality by 35%
- Decrease recruiter screening time by 60%
- Achieve 90% recruiter trust in AI decisions

## 🔄 Future Enhancements (Phase 2)

- Interview scheduling integration
- Video resume analysis
- Advanced analytics dashboard
- Multi-language support
- API integrations with ATS systems
- Machine learning model improvements

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the audit trail for system issues

---

**Built with ❤️ for fairer, more effective hiring processes**
