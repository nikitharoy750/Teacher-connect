# 🚀 Supabase Setup Guide for Teacher Connect

## Current Status
✅ **Demo Mode Active**: Your app currently works in demo mode with simulated uploads  
🔄 **Next Step**: Set up real Supabase for actual video uploads

## 📋 Quick Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Choose organization and enter:
   - **Name**: `teacher-connect`
   - **Database Password**: (create a strong password)
   - **Region**: Choose closest to your users
5. Wait for project creation (~2 minutes)

### 2. Get Your Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **Anon Public Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Update Environment Variables
Replace the content in `teacher-connect-app/.env`:

```env
# Replace with your actual Supabase credentials
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Add OpenAI key for AI features
VITE_OPENAI_API_KEY=your-openai-key-here
```

### 4. Create Database Tables
Run these SQL commands in your Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('teacher', 'student')),
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create videos table
CREATE TABLE public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  audio_url TEXT,
  thumbnail_url TEXT,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  duration INTEGER DEFAULT 0,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  upvotes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('videos', 'videos', true),
  ('thumbnails', 'thumbnails', true);

-- Set up Row Level Security policies
CREATE POLICY "Users can view all videos" ON public.videos
  FOR SELECT USING (true);

CREATE POLICY "Teachers can insert their own videos" ON public.videos
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own videos" ON public.videos
  FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own videos" ON public.videos
  FOR DELETE USING (auth.uid() = teacher_id);

-- Storage policies
CREATE POLICY "Anyone can view videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY "Teachers can upload videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'thumbnails');

CREATE POLICY "Teachers can upload thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'thumbnails' AND auth.role() = 'authenticated');
```

### 5. Test Your Setup
1. Restart your development server: `npm run dev`
2. Try uploading a video as a teacher
3. Check your Supabase dashboard → **Storage** to see uploaded files
4. Check **Table Editor** → **videos** to see metadata

## 🎯 What Works Now

### ✅ **Demo Mode Features**
- ✅ Video upload with progress tracking
- ✅ Automatic thumbnail generation
- ✅ Video duration detection
- ✅ Form validation and error handling
- ✅ Local storage for demo data
- ✅ Beautiful upload interface with drag & drop

### 🔄 **After Supabase Setup**
- 🚀 Real file uploads to cloud storage
- 🚀 Persistent video library
- 🚀 Multi-user support
- 🚀 Real-time data synchronization
- 🚀 Secure authentication
- 🚀 Scalable storage

## 🛠️ Troubleshooting

### Issue: "Upload failed"
- Check your Supabase credentials in `.env`
- Verify storage buckets are created
- Check browser console for detailed errors

### Issue: "Authentication required"
- Make sure you're logged in as a teacher
- Check RLS policies are set up correctly

### Issue: Large file uploads fail
- Supabase has a 50MB limit per file
- Consider implementing chunked uploads for larger files
- Add file size validation in the UI

## 📈 Next Steps

1. **Set up real Supabase** (follow steps above)
2. **Test video uploads** with real files
3. **Add video compression** for better performance
4. **Implement video streaming** for better playback
5. **Add video analytics** and view tracking

## 💡 Pro Tips

- **File Naming**: Videos are automatically renamed with timestamps
- **Thumbnails**: Auto-generated from video at 10% duration
- **Progress**: Real-time upload progress with status updates
- **Error Handling**: Comprehensive error messages and retry logic
- **Security**: All uploads are authenticated and validated

---

**Need Help?** Check the Supabase documentation or ask for assistance!
