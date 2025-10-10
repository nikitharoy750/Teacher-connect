# Teacher Connect

A comprehensive educational platform designed to bridge the education gap in rural areas by connecting teachers and students through technology.

## 🌟 Features

### Core Functionality
- **Dual Authentication System**: Separate login portals for teachers and students
- **Video Library**: Browse and watch educational videos with filtering by subject and grade
- **Video-to-Audio Conversion**: Convert videos to audio format for bandwidth-limited users
- **Credit System**: Students earn credits by uploading content and taking tests
- **AI-Powered Doubt Resolution**: Get instant answers to educational questions
- **Offline Support**: Download content for areas with poor connectivity
- **Teacher-Student Interaction**: Upvoting system and leaderboards

### For Teachers
- Upload and manage educational videos
- Track video performance and student engagement
- Upload supplementary notes and materials
- View analytics and student progress

### For Students
- Access comprehensive video library
- Take practice tests and earn credits
- Upload educational content to earn rewards
- Get AI-powered help with doubts
- Compete on leaderboards
- Download content for offline viewing

## 🚀 Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Backend**: Supabase (Database, Authentication, File Storage)
- **AI Integration**: OpenAI API (for doubt resolution)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd teacher-connect-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your actual credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🗄️ Database Setup

### Supabase Tables

Create the following tables in your Supabase project:

```sql
-- Users table
CREATE TABLE users (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('teacher', 'student')) NOT NULL,
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Videos table
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  audio_url TEXT,
  thumbnail_url TEXT,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  duration INTEGER NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  upvotes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0
);

-- Tests table
CREATE TABLE tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  max_score INTEGER NOT NULL,
  time_limit INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress table
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  credits_earned INTEGER DEFAULT 0
);
```

## 🎯 Demo Credentials

For testing purposes, you can use these demo credentials:

- **Teacher**: teacher@demo.com / password
- **Student**: student@demo.com / password

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   └── ProtectedRoute.tsx # Route protection
├── contexts/           # React contexts
│   ├── AuthContext.tsx # Authentication state
│   └── SupabaseContext.tsx # Supabase client
├── lib/               # Utility libraries
│   └── supabase.ts    # Supabase configuration
├── pages/             # Page components
│   ├── Home.tsx       # Landing page
│   ├── Login.tsx      # Authentication
│   ├── TeacherDashboard.tsx
│   ├── StudentDashboard.tsx
│   └── VideoLibrary.tsx
├── App.tsx            # Main app component
├── main.tsx          # App entry point
└── style.css         # Global styles
```

## 🌍 Impact

Teacher Connect aims to:
- Reduce teacher shortage in rural areas
- Provide quality education access regardless of location
- Enable peer-to-peer learning through student contributions
- Support offline learning in low-connectivity areas
- Gamify education through credits and leaderboards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

---

**Made with ❤️ for rural education**
