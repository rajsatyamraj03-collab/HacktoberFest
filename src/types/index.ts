export type UserRole = 'student' | 'organizer' | 'moderator' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  college: string;
  department: string;
  year: string;
  bio: string;
  skills: string[];
  interests: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  experienceLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  preferredRoles?: string[];
  availability?: 'Full-time' | 'Evenings' | 'Weekends' | 'Flexible';
  collaborationPreference?: 'In-Person' | 'Hybrid' | 'Remote';
  joinedClubs: string[];
  savedListings: string[];
  savedPosts: string[];
  createdAt: string;
}

export type EventCategory = 
  | 'Hackathons'
  | 'Technical workshops'
  | 'Cultural fests'
  | 'Sports'
  | 'Seminars and guest lectures'
  | 'Competitions'
  | 'Club activities'
  | 'Career and placement events';

export type EventFormat = 'In-Person' | 'Hybrid' | 'Virtual';
export type EventStatus = 'Draft' | 'Published' | 'Cancelled';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  organizerId: string;
  organizerName: string;
  organizerAvatar: string;
  organizerClub?: string;
  date: string;
  time: string;
  endDate?: string;
  venue: string;
  format: EventFormat;
  registrationDeadline: string;
  capacity: number;
  registeredCount: number;
  coverImage: string;
  tags: string[];
  eligibility: string;
  participationRules: string[];
  schedule: { time: string; activity: string }[];
  contactEmail: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  status: EventStatus;
  createdAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  studentId: string;
  department: string;
  year: string;
  teamName?: string;
  ticketCode: string;
  registeredAt: string;
  status: 'Confirmed' | 'Waitlisted' | 'Cancelled' | 'Attended';
  notes?: string;
}

export type PostCategory =
  | 'Programming and DSA'
  | 'AI and machine learning'
  | 'Web development'
  | 'Startups and entrepreneurship'
  | 'Placements and internships'
  | 'Design and creativity'
  | 'Campus events'
  | 'General student discussions';

export type PostType = 'Discussion' | 'Question' | 'Project Showcase' | 'Study Tip' | 'Announcement' | 'Internship' | 'Opportunity';

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorDepartment: string;
  category: PostCategory;
  postType: PostType;
  tags: string[];
  imageUrl?: string;
  likes: string[]; // array of user IDs
  commentsCount: number;
  comments: Comment[];
  clubId?: string;
  clubName?: string;
  isPinned?: boolean;
  reportCount: number;
  isHidden?: boolean;
  createdAt: string;
}

export interface StudentClub {
  id: string;
  name: string;
  description: string;
  category: string;
  logo: string;
  coverImage: string;
  leadName: string;
  leadId: string;
  memberCount: number;
  members: string[]; // user IDs
  tags: string[];
  isVerified: boolean;
}

export interface HackathonTeam {
  id: string;
  name: string;
  hackathonName: string;
  logo: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  projectIdea: string;
  problemStatement: string;
  proposedSolution: string;
  techStack: string[];
  requiredRoles: string[];
  openPositionsCount: number;
  maxTeamSize: number;
  members: {
    userId: string;
    name: string;
    avatar: string;
    role: string;
  }[];
  isOpen: boolean;
  createdAt: string;
}

export interface TeamJoinRequest {
  id: string;
  teamId: string;
  teamName: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userDepartment: string;
  roleAppliedFor: string;
  skills: string[];
  portfolioUrl?: string;
  message: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: string;
}

export type MarketplaceCategory =
  | 'Books and textbooks'
  | 'Electronics and accessories'
  | 'Hostel essentials'
  | 'Stationery'
  | 'Clothing and accessories'
  | 'Sports equipment'
  | 'Lab and academic supplies'
  | 'Miscellaneous student items';

export type ItemCondition = 'New' | 'Like new' | 'Good' | 'Acceptable';

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  isNegotiable: boolean;
  category: MarketplaceCategory;
  condition: ItemCondition;
  pickupLocation: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerCollege: string;
  sellerRating: number;
  status: 'Available' | 'Sold' | 'Reserved';
  savedCount: number;
  createdAt: string;
}

export interface MarketplaceInquiry {
  id: string;
  itemId: string;
  itemTitle: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  sellerId: string;
  message: string;
  offerPrice?: number;
  createdAt: string;
  status: 'New' | 'Replied' | 'Closed';
}

export type TaskCategory =
  | 'Assignments'
  | 'Exams'
  | 'Projects'
  | 'Event registrations'
  | 'Hackathon milestones'
  | 'Personal tasks'
  | 'Club activities';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'Todo' | 'In Progress' | 'Completed';

export interface StudentTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  linkedEventId?: string;
  linkedEventTitle?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'event' | 'team' | 'community' | 'marketplace' | 'task' | 'system';
  isRead: boolean;
  linkTo?: string;
  createdAt: string;
}

export interface ContentReport {
  id: string;
  contentId: string;
  contentType: 'post' | 'listing' | 'comment';
  reporterId: string;
  reporterName: string;
  reason: 'Spam' | 'Harassment' | 'Inappropriate Content' | 'Misleading/Scam' | 'Other';
  details?: string;
  status: 'Pending' | 'Dismissed' | 'Action Taken';
  createdAt: string;
}
