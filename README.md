# DIGS - Digital Investigation and Grievance System

**Version 0.1.0** | **Phase 3 Complete** | **July 23, 2025**

A comprehensive Labor Relations Digital Investigation and Grievance System built with React, TypeScript, and Power Platform integration.

## 🚀 Overview

DIGS is a modern, secure, and extensible application that manages the full lifecycle of labor-relations investigations and downstream grievances. Initially targeting Flight Attendants (AFA), the architecture supports future unionized workgroups (ALPA, IAM, etc.).

### Key Features
- **Case Management**: Complete CRUD operations for investigations
- **Grievance Management**: Union grievance lifecycle tracking
- **SLA Compliance**: Business-day aware deadline tracking
- **Analytics Dashboard**: Real-time metrics and reporting
- **Power Platform Integration**: SharePoint, Dataverse, Office365
- **Professional UI**: Modern design with shadcn/ui components

## 📊 Current Status

### ✅ Completed Phases (1-3)
- **Phase 1**: Foundation & Core Architecture
- **Phase 2**: Case Management Ecosystem
- **Phase 3**: Grievance Management Ecosystem

### 🔄 In Development
- **Phase 4**: User Management & Security
- **Phase 5**: Analytics & Intelligence
- **Phase 6**: Integration & Automation

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + React Query
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Power Platform**: SharePoint, Dataverse, Office365Users
- **Build Tools**: ESLint, Prettier

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── layout/          # Layout components (Sidebar, TopNav)
│   └── ui/              # shadcn/ui components
├── pages/               # Page components
│   ├── Dashboard.tsx    # Analytics dashboard
│   ├── Cases.tsx        # Case management
│   ├── CaseDetail.tsx   # Individual case view
│   └── Grievances.tsx   # Grievance management
├── services/            # Power Platform service layer
├── types/               # TypeScript type definitions
├── lib/                 # Utility functions
└── styles/              # Global styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Power Platform environment (optional for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd digs-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📱 Features

### Dashboard & Analytics
- Interactive KPI metrics
- Case volume trends with Recharts
- SLA compliance tracking
- Risk assessment analytics
- Real-time status indicators

### Case Management
- Comprehensive CRUD operations
- Advanced search and filtering
- Case status tracking with color-coded badges
- SLA deadline monitoring
- Risk scoring system
- Bulk operations support

### Grievance Management
- Union grievance lifecycle tracking
- Step progression monitoring
- Deadline management with alerts
- Grievance type categorization
- Resolution tracking

### Power Platform Integration
- SharePoint document management
- Dataverse entity operations
- Office365 user management
- Mock service layer ready for production

## 🔒 Security Features

- Role-based access control (planned)
- Microsoft Entra integration (planned)
- Multi-factor authentication (planned)
- Audit trail tracking
- Data encryption (planned)

## 📈 Roadmap

### Phase 4: User Management & Security (In Progress)
- Microsoft Entra ID integration
- Role-based access control
- User profile management
- Audit & compliance framework

### Phase 5: Analytics & Intelligence
- Executive dashboard enhancements
- Predictive analytics
- Custom reporting engine
- AI-powered insights

### Phase 6: Integration & Automation
- Microsoft 365 integration
- Power Automate workflows
- External system integration
- Communication automation

### Phase 7: Mobile & Accessibility
- Mobile-first responsive design
- WCAG 2.1 AA compliance
- Progressive Web App (PWA)
- Offline capabilities

## 🤝 Contributing

This project follows standard Git workflows:

1. Create a feature branch from `main`
2. Make your changes
3. Submit a pull request
4. Code review and merge

### Development Guidelines
- Follow TypeScript strict mode
- Use ESLint and Prettier for code formatting
- Write descriptive commit messages
- Update documentation for new features

## 📄 License

This project is proprietary software developed for internal labor relations management.

## 📞 Support

For technical support or questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation in `/docs`

## 🏆 Version History

### v0.1.0 (July 23, 2025) - Phase 3 Complete
- ✅ Foundation & Core Architecture
- ✅ Case Management Ecosystem
- ✅ Grievance Management Ecosystem
- ✅ Basic Analytics Dashboard
- ✅ Power Platform Service Layer
- ✅ Professional UI/UX with shadcn/ui

---

**Built with ❤️ by the DIGS Development Team**
