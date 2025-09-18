# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-native notes application designed for MacBook desktop users with an Apple-style interface. The app features AI-powered title generation, automatic tagging, and content polishing using OpenRouter API. All data is stored locally in browser's localStorage.

## Tech Stack

- **Frontend**: Next.js with static export (`output: 'export'`)
- **UI Components**: Shadcn/UI with Tailwind CSS
- **State Management**: React Hooks (`useState`, `useEffect`, `useContext`) + custom `useLocalStorage` hook
- **Markdown**: `react-markdown` for rendering
- **ID Generation**: `uuid` library
- **AI Integration**: OpenRouter API (deepseek/deepseek-chat-v3.1)

## Architecture

### Component Structure
- `AppLayout.jsx` - Three-column layout container
- `Sidebar.jsx` - Left icon bar
- `NoteList.jsx` - Middle column showing note titles
- `NoteListItem.jsx` - Individual note in list
- `Editor.jsx` - Right editor with title, content, and AI features
- `PolishModal.jsx` - Side-by-side comparison for AI-polished content
- `Settings.jsx` - API key configuration

### Data Model
```typescript
interface Note {
  id: string;           // UUID or timestamp
  title: string;
  content: string;      // Markdown text
  tags: string[];       // AI-generated tags
  createdAt: string;    // ISO 8601 format
  updatedAt: string;    // ISO 8601 format
}
```

### Storage
- `localStorage.getItem('notes')` - All notes array
- `localStorage.getItem('apiKey')` - OpenRouter API key

### AI API Calls
- **Endpoint**: `POST https://openrouter.ai/api/v1/chat/completions`
- **Headers**: Authorization Bearer + Content-Type
- **Models**: deepseek/deepseek-chat-v3.1
- **Features**: Title generation, tag extraction, content polishing

## Getting Started

1. **Setup**: `npx create-next-app@latest` with Tailwind CSS
2. **Install Shadcn/UI**: Follow official documentation
3. **Install dependencies**: 
   - `npm install react-markdown uuid`
   - `npm install -D @types/uuid`
4. **Configure static export**: Update `next.config.js` with `output: 'export'`

## Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run export          # Generate static files
npm run start           # Start production server

# Linting & Formatting
npm run lint            # ESLint check
npm run lint:fix        # ESLint auto-fix

# Testing (if implemented)
npm run test            # Run tests
npm run test:watch      # Watch mode for tests
```

## Key Implementation Patterns

### Custom Hook Pattern
- Create `useNotes.js` for localStorage management
- Provide CRUD operations: `addNote`, `updateNote`, `deleteNote`
- Implement debounced auto-save for performance

### AI Integration Flow
1. Read API key from localStorage via Settings component
2. Implement AI service layer in `api.js`
3. Handle loading states and error handling
4. Use debounced triggers for auto-tagging after content changes

### Styling Approach
- Use Shadcn/UI components for consistency
- Apply Apple-style design with Tailwind CSS
- Responsive design for MacBook screen sizes
- Dark mode support through Tailwind's dark mode

## File Structure
```
src/
├── components/
│   ├── AppLayout.jsx
│   ├── Sidebar.jsx
│   ├── NoteList.jsx
│   ├── NoteListItem.jsx
│   ├── Editor.jsx
│   ├── PolishModal.jsx
│   └── Settings.jsx
├── hooks/
│   └── useNotes.js
├── lib/
│   └── api.js          # AI service calls
├── styles/
│   └── globals.css
└── utils/
    └── debounce.js
```

## Development Workflow

1. **Phase 1**: Setup Next.js + Shadcn/UI + basic layout
2. **Phase 2**: Implement localStorage hooks and CRUD
3. **Phase 3**: Build note list and editor components
4. **Phase 4**: Add AI integration with API key management
5. **Phase 5**: Polish UI and add error handling
6. **Phase 6**: Test static export and deploy

## Git 工作流程

**重要**: 本项目使用自然语言 Git 工作流程。详细的指令手册请参考：`GIT-WORKFLOW.md`

### 快速参考
- **"请同步到 git"** - 提交所有更改并推送到 GitHub
- **"保存进度"** - 创建临时提交保存当前工作
- **"查看修改了什么"** - 显示当前的代码变更
- **"撤销刚才的修改"** - 恢复到上次提交状态

Claude Code 会自动处理所有 Git 技术细节，包括：
- 智能生成提交信息
- 处理合并冲突
- 分支管理
- 安全的撤销和恢复操作

## Common Tasks

- **Add new component**: Create in `src/components/` with Shadcn patterns
- **Update styles**: Use Tailwind classes, check `globals.css` for custom styles
- **Add new AI feature**: Extend `api.js` with new prompt templates
- **Handle localStorage**: Always use the `useNotes` hook for consistency
- **Git operations**: Use natural language commands as documented in `GIT-WORKFLOW.md`

## 重要提醒

- 请始终用中文和我沟通
- 对于 Git 操作，直接使用自然语言指令即可
- Claude Code 会自动处理所有技术细节

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.