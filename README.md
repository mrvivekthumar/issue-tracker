# 🐛 IssueTracker Pro

<div align="center">

![IssueTracker Pro](https://img.shields.io/badge/IssueTracker-Pro-violet?style=for-the-badge&logo=bug&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

**A modern, full-stack issue tracking application built with Next.js 15 and advanced security features**

[🚀 Live Demo](https://your-app-url.vercel.app) • [📖 Documentation](https://docs.your-app.com) • [🐛 Report Bug](https://github.com/mrvivekthumar/issuetracker-pro/issues)

</div>

---

## ✨ Features

### 🔐 **Advanced Security & Permissions**
- **Creator-Based Access Control** - Only issue creators can edit and manage their issues
- **Role-Based Status Management** - Assigned users control issue status transitions
- **Secure API Endpoints** - Full authentication and authorization on all routes
- **Session Management** - Automatic session refresh and cross-tab synchronization

### 📊 **Professional Dashboard**
- **Real-Time Analytics** - Live issue statistics and performance metrics
- **Interactive Charts** - Beautiful data visualization with Recharts
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Glass Morphism UI** - Modern design with backdrop blur effects

### 🛠️ **Issue Management**
- **Rich Text Editor** - Markdown support with live preview
- **Dynamic Assignment** - Smart user assignment with avatar displays
- **Status Tracking** - Open, In Progress, Closed workflow
- **Search & Filter** - Advanced filtering by status, assignee, and keywords

### 🎨 **Modern UI/UX**
- **Tailwind CSS** - Utility-first styling with custom components
- **Smooth Animations** - Framer Motion powered transitions
- **Loading States** - Skeleton screens and optimistic updates
- **Toast Notifications** - Real-time feedback with React Hot Toast

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn**
- **Database** (PostgreSQL, MySQL, or SQLite)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mrvivekthumar/issuetracker-pro.git
   cd issuetracker-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="your-database-url"
   
   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Tech Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **TanStack Query** - Server state management

### **Backend**
- **Next.js API Routes** - Serverless functions
- **Prisma** - Modern database toolkit
- **NextAuth.js** - Authentication solution
- **Axios** - HTTP client for API calls

### **Database & Auth**
- **PostgreSQL/MySQL** - Production database
- **Google OAuth** - Social authentication
- **Prisma** - Database ORM and migrations

### **UI & Animations**
- **Recharts** - Chart library for analytics
- **React Hot Toast** - Notification system
- **React Icons** - Icon library
- **Framer Motion** - Animation library
- **React Markdown** - Markdown rendering

---

## 📂 Project Structure

```
issuetracker-pro/
├── 📁 app/                    # Next.js App Router
│   ├── 📁 api/               # API Routes
│   │   ├── 📁 issues/        # Issue CRUD operations
│   │   ├── 📁 users/         # User management
│   │   └── 📁 auth/          # Authentication
│   ├── 📁 components/        # Reusable components
│   ├── 📁 issues/           # Issue pages & components
│   ├── 📁 auth/             # Auth providers & config
│   └── 📄 layout.tsx        # Root layout
├── 📁 prisma/               # Database schema & migrations
├── 📁 lib/                  # Utility functions & configs
├── 📁 hooks/                # Custom React hooks
├── 📁 public/               # Static assets
└── 📄 package.json         # Dependencies & scripts
```

---

## 🔧 Key Features Deep Dive

### **Permission System**
```typescript
// Creator-based access control
const permissions = {
  canEdit: isCreator,           // Only creators can edit
  canChangeStatus: isAssignee,  // Only assignees change status
  canDelete: isCreator,         // Only creators can delete
  canAssign: isCreator         // Only creators can assign
};
```

### **Real-time Updates**
- Cross-tab synchronization using localStorage events
- Optimistic UI updates for better UX
- Automatic data refresh on focus

### **Security Features**
- API route protection with NextAuth.js
- Input validation with Zod schemas
- SQL injection prevention with Prisma
- XSS protection with proper sanitization

---

## 🚦 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data

# Type checking
npm run type-check   # Run TypeScript compiler
```

---

## 🌐 Deployment

### **Vercel (Recommended)**
1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically

### **Manual Deployment**
```bash
# Build the application
npm run build

# Start production server
npm run start
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Vercel** - For excellent hosting and deployment
- **Prisma** - For the modern database toolkit
- **Tailwind CSS** - For the utility-first CSS framework

---

## 📞 Support

- 📧 **Email**: support@issuetracker-pro.com
- 💬 **Discord**: [Join our community](https://discord.gg/your-server)
- 🐛 **Issues**: [GitHub Issues](https://github.com/mrvivekthumar/issuetracker-pro/issues)
- 📖 **Docs**: [Documentation](https://docs.issuetracker-pro.com)

---

<div align="center">

**Built with ❤️ by [Your Name](https://github.com/mrvivekthumar)**

⭐ **Star this repo if you find it helpful!**

</div>