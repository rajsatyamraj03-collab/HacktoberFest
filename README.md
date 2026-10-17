# CampusVerse — One Campus. Every Opportunity.

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://campusverse-psi.vercel.app)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**CampusVerse** is an all-in-one digital campus ecosystem uniting college students, student clubs, hackathon participants, and university administrators into one modern, responsive platform.

---

## 🌟 The 5 Integrated Modules

1. **College Event Discovery & Registration Platform**:
   - Filter by categories (*Hackathons, Workshops, Cultural Fests, Sports, Seminars, Competitions, Club Activities, Placements*), formats (*In-Person, Hybrid, Virtual*), and dates.
   - Comprehensive event details, schedules, venue details, and organizer contacts.
   - Real-time registration with duplicate prevention, capacity enforcement, and digital ticket passes with unique ticket codes.
   - Export to calendar (`.ics`) and organizer CSV participant roster management with attendance check-in.

2. **Student Community Portal**:
   - Multi-category feed (*Discussions, Questions, Project Showcases, Study Tips, Announcements, Opportunities*).
   - Real upvoting with animated counters, reply threads, bookmarking, and link sharing.
   - Student Clubs & Societies (*GDSC, ACM, E-Cell, Campus Design Collective*) with one-click membership.
   - Community reporting and safety moderation queue.

3. **Hackathon Team-Finding & Collaboration Platform**:
   - **Smart Algorithmic Matchmaker**: Transparent compatibility scoring (e.g. *94% Match*) based on complementary skill gaps, collaboration preferences, and time availability.
   - Searchable participant directory with filter by skills, experience, and target roles.
   - Team creation with project pitches, problem statements, tech stacks, and open role tags.
   - Collaboration hub with join requests, applicant review, and roster management.

4. **Campus Marketplace for Buying & Selling**:
   - Student essentials (*Books & Textbooks, Electronics & Accessories, Hostel Essentials, Lab Supplies, Sports Equipment, Stationery*).
   - Safe peer-to-peer discovery without exposing phone numbers.
   - Condition filters (*New, Like new, Good, Acceptable*), price sorting, and instant buyer inquiry messaging with custom counter-offers.
   - Designated public campus meeting zone guidelines.

5. **Student Productivity & Task Management**:
   - Dual view: Interactive Kanban Board (*Todo, In Progress, Completed*) and Structured Table view.
   - Priority levels (*Urgent, High, Medium, Low*), due dates, and categories.
   - Automated integration with registered events (creates preparation tasks upon registration).
   - Weekly goal completion gauges, overdue alerts, and celebratory confetti animations.

---

## 🎭 1-Click Role & Persona Switcher

Switch roles instantly via the navbar badge or profile menu to test different permission levels:

- **Satyam Raj** (`student`): Discover events, register, form teams, buy/sell, manage tasks.
- **Priya Sharma** (`organizer`): Create campus events, monitor attendance, export CSV participant rosters.
- **Alex Chen** (`moderator`): Review reported content and moderate posts.
- **Dr. Aris Thorne** (`admin`): Dean of Student Affairs & Innovation with full ecosystem control.

---

## ⚡ 90-Second Hackathon Demo Tour

CampusVerse features a built-in guided tour assistant in the bottom-left corner that walks judges through each core workflow:
1. **Dashboard Overview**
2. **Event Discovery & Pass Generation**
3. **Community Feed & Club Participation**
4. **Smart Teammate Matching & Join Requests**
5. **Campus Marketplace Inquiries**
6. **Task Kanban Board Completion**

---

## 🚀 Getting Started Locally

```bash
# Clone the repository
git clone https://github.com/rajsatyamraj03-collab/HacktoberFest.git
cd HacktoberFest

# Install dependencies
npm install

# Start local development server
npm run dev
```

Navigate to `http://localhost:5173/` in your browser.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite 5
- **Design System**: Vanilla CSS with custom design tokens, responsive 12-column grid, glassmorphism, and dark mode support
- **Icons**: `lucide-react`
- **Effects**: `canvas-confetti`
- **Storage**: Client-side reactive persistent database engine with `localStorage`
- **Deployment**: Vercel & Cloudflare Edge Tunnels

---

## 📄 License

MIT License. Built for collegiate innovation, HacktoberFest, and modern campus life.
