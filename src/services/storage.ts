import {
  User,
  UserRole,
  CampusEvent,
  EventRegistration,
  CommunityPost,
  Comment,
  StudentClub,
  HackathonTeam,
  TeamJoinRequest,
  MarketplaceItem,
  MarketplaceInquiry,
  StudentTask,
  Notification,
  ContentReport,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CLUBS,
  INITIAL_EVENTS,
  INITIAL_REGISTRATIONS,
  INITIAL_POSTS,
  INITIAL_TEAMS,
  INITIAL_JOIN_REQUESTS,
  INITIAL_MARKETPLACE,
  INITIAL_TASKS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

const KEYS = {
  USERS: 'cv_users',
  CURRENT_USER_ID: 'cv_current_user_id',
  CLUBS: 'cv_clubs',
  EVENTS: 'cv_events',
  REGISTRATIONS: 'cv_registrations',
  POSTS: 'cv_posts',
  TEAMS: 'cv_teams',
  JOIN_REQUESTS: 'cv_join_requests',
  MARKETPLACE: 'cv_marketplace',
  INQUIRIES: 'cv_inquiries',
  TASKS: 'cv_tasks',
  NOTIFICATIONS: 'cv_notifications',
  REPORTS: 'cv_reports',
  INITIALIZED: 'cv_initialized_v2',
};

// Event listener for cross-component reactive updates
const listeners = new Set<() => void>();

export function subscribeToStore(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error in store listener:', e);
    }
  });
}

// Storage helpers
function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

// Initialize seed data if not present
export function initializeStore(forceReset = false): void {
  if (forceReset || !localStorage.getItem(KEYS.INITIALIZED)) {
    saveToStorage(KEYS.USERS, INITIAL_USERS);
    saveToStorage(KEYS.CURRENT_USER_ID, 'user-satyam');
    saveToStorage(KEYS.CLUBS, INITIAL_CLUBS);
    saveToStorage(KEYS.EVENTS, INITIAL_EVENTS);
    saveToStorage(KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    saveToStorage(KEYS.POSTS, INITIAL_POSTS);
    saveToStorage(KEYS.TEAMS, INITIAL_TEAMS);
    saveToStorage(KEYS.JOIN_REQUESTS, INITIAL_JOIN_REQUESTS);
    saveToStorage(KEYS.MARKETPLACE, INITIAL_MARKETPLACE);
    saveToStorage(KEYS.INQUIRIES, []);
    saveToStorage(KEYS.TASKS, INITIAL_TASKS);
    saveToStorage(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    saveToStorage(KEYS.REPORTS, []);
    localStorage.setItem(KEYS.INITIALIZED, 'true');
    notifyListeners();
  }
}

// Ensure store is initialized upon module load
if (typeof window !== 'undefined') {
  initializeStore();
}

// ========================
// USER & AUTH SERVICES
// ========================
export function getUsers(): User[] {
  return getFromStorage<User[]>(KEYS.USERS, INITIAL_USERS);
}

export function getCurrentUser(): User {
  const users = getUsers();
  const currentId = localStorage.getItem(KEYS.CURRENT_USER_ID) || 'user-satyam';
  return users.find((u) => u.id === currentId) || users[0] || INITIAL_USERS[0];
}

export function setCurrentUserId(userId: string): void {
  localStorage.setItem(KEYS.CURRENT_USER_ID, userId);
  notifyListeners();
}

export function switchRole(newRole: UserRole): void {
  const users = getUsers();
  const current = getCurrentUser();
  const targetUser = users.find((u) => u.role === newRole);
  if (targetUser) {
    setCurrentUserId(targetUser.id);
  } else {
    // If no existing user has this role, update current user role
    const updatedUsers = users.map((u) => (u.id === current.id ? { ...u, role: newRole } : u));
    saveToStorage(KEYS.USERS, updatedUsers);
  }
}

export function updateCurrentUserProfile(updates: Partial<User>): User {
  const users = getUsers();
  const current = getCurrentUser();
  const updatedUser = { ...current, ...updates };
  const updatedUsers = users.map((u) => (u.id === current.id ? updatedUser : u));
  saveToStorage(KEYS.USERS, updatedUsers);
  return updatedUser;
}

// ========================
// EVENTS & REGISTRATION
// ========================
export function getEvents(): CampusEvent[] {
  return getFromStorage<CampusEvent[]>(KEYS.EVENTS, INITIAL_EVENTS);
}

export function getEventById(id: string): CampusEvent | undefined {
  return getEvents().find((e) => e.id === id);
}

export function createEvent(eventData: Omit<CampusEvent, 'id' | 'registeredCount' | 'createdAt'>): CampusEvent {
  const events = getEvents();
  const newEvent: CampusEvent = {
    ...eventData,
    id: `event-${Date.now()}`,
    registeredCount: 0,
    createdAt: new Date().toISOString(),
  };
  saveToStorage(KEYS.EVENTS, [newEvent, ...events]);

  addNotification({
    userId: newEvent.organizerId,
    title: 'Event Created Successfully! 📅',
    message: `"${newEvent.title}" has been published and is now live for registration.`,
    type: 'event',
    linkTo: 'events',
  });

  return newEvent;
}

export function updateEvent(id: string, updates: Partial<CampusEvent>): CampusEvent | undefined {
  const events = getEvents();
  let updated: CampusEvent | undefined;
  const newEvents = events.map((e) => {
    if (e.id === id) {
      updated = { ...e, ...updates };
      return updated;
    }
    return e;
  });
  if (updated) {
    saveToStorage(KEYS.EVENTS, newEvents);
  }
  return updated;
}

export function deleteEvent(id: string): boolean {
  const events = getEvents();
  const filtered = events.filter((e) => e.id !== id);
  if (filtered.length !== events.length) {
    saveToStorage(KEYS.EVENTS, filtered);
    return true;
  }
  return false;
}

export function getRegistrations(): EventRegistration[] {
  return getFromStorage<EventRegistration[]>(KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
}

export function getUserRegistrations(userId?: string): EventRegistration[] {
  const uId = userId || getCurrentUser().id;
  return getRegistrations().filter((r) => r.userId === uId);
}

export function getEventRegistrations(eventId: string): EventRegistration[] {
  return getRegistrations().filter((r) => r.eventId === eventId);
}

export function registerForEvent(
  eventId: string,
  registrationData: {
    studentId: string;
    department: string;
    year: string;
    teamName?: string;
    notes?: string;
    createPrepTask?: boolean;
  }
): { success: boolean; message: string; registration?: EventRegistration } {
  const currentUser = getCurrentUser();
  const event = getEventById(eventId);

  if (!event) {
    return { success: false, message: 'Event not found.' };
  }

  const existingRegs = getRegistrations();
  const alreadyRegistered = existingRegs.find(
    (r) => r.eventId === eventId && r.userId === currentUser.id && r.status !== 'Cancelled'
  );

  if (alreadyRegistered) {
    return { success: false, message: 'You have already registered for this event.' };
  }

  if (event.registeredCount >= event.capacity) {
    return { success: false, message: 'Event capacity reached. Registration is full.' };
  }

  const ticketCode = `CV-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;

  const newReg: EventRegistration = {
    id: `reg-${Date.now()}`,
    eventId,
    userId: currentUser.id,
    userName: currentUser.name,
    userEmail: currentUser.email,
    studentId: registrationData.studentId,
    department: registrationData.department,
    year: registrationData.year,
    teamName: registrationData.teamName,
    ticketCode,
    registeredAt: new Date().toISOString(),
    status: 'Confirmed',
    notes: registrationData.notes,
  };

  saveToStorage(KEYS.REGISTRATIONS, [newReg, ...existingRegs]);

  // Increment event registeredCount
  updateEvent(eventId, { registeredCount: event.registeredCount + 1 });

  // Add notification
  addNotification({
    userId: currentUser.id,
    title: 'Registration Confirmed! 🎟️',
    message: `You are registered for "${event.title}". Ticket: ${ticketCode}.`,
    type: 'event',
    linkTo: 'registrations',
  });

  // Optional: create auto prep task in Module E
  if (registrationData.createPrepTask) {
    createTask({
      userId: currentUser.id,
      title: `Attend ${event.title}`,
      description: `Prepare notes, check venue (${event.venue}), and review participation requirements.`,
      category: 'Event registrations',
      priority: 'High',
      status: 'Todo',
      dueDate: event.date,
      linkedEventId: event.id,
      linkedEventTitle: event.title,
    });
  }

  return { success: true, message: 'Registration confirmed!', registration: newReg };
}

export function cancelRegistration(registrationId: string): boolean {
  const regs = getRegistrations();
  const target = regs.find((r) => r.id === registrationId);
  if (!target) return false;

  const updatedRegs = regs.map((r) =>
    r.id === registrationId ? { ...r, status: 'Cancelled' as const } : r
  );
  saveToStorage(KEYS.REGISTRATIONS, updatedRegs);

  // Decrement event counter
  const event = getEventById(target.eventId);
  if (event && event.registeredCount > 0) {
    updateEvent(event.id, { registeredCount: event.registeredCount - 1 });
  }

  addNotification({
    userId: target.userId,
    title: 'Registration Cancelled',
    message: `Your registration for "${event?.title || 'the event'}" has been cancelled.`,
    type: 'event',
    linkTo: 'events',
  });

  return true;
}

export function updateRegistrationStatus(
  registrationId: string,
  newStatus: 'Confirmed' | 'Waitlisted' | 'Cancelled' | 'Attended'
): boolean {
  const regs = getRegistrations();
  const updatedRegs = regs.map((r) => (r.id === registrationId ? { ...r, status: newStatus } : r));
  saveToStorage(KEYS.REGISTRATIONS, updatedRegs);
  return true;
}

// ========================
// COMMUNITY MODULE
// ========================
export function getPosts(): CommunityPost[] {
  return getFromStorage<CommunityPost[]>(KEYS.POSTS, INITIAL_POSTS);
}

export function createPost(postData: Omit<CommunityPost, 'id' | 'likes' | 'commentsCount' | 'comments' | 'reportCount' | 'createdAt'>): CommunityPost {
  const posts = getPosts();
  const newPost: CommunityPost = {
    ...postData,
    id: `post-${Date.now()}`,
    likes: [],
    commentsCount: 0,
    comments: [],
    reportCount: 0,
    isHidden: false,
    createdAt: new Date().toISOString(),
  };
  saveToStorage(KEYS.POSTS, [newPost, ...posts]);
  return newPost;
}

export function toggleLikePost(postId: string): void {
  const posts = getPosts();
  const currentUserId = getCurrentUser().id;

  const updatedPosts = posts.map((post) => {
    if (post.id === postId) {
      const alreadyLiked = post.likes.includes(currentUserId);
      const newLikes = alreadyLiked
        ? post.likes.filter((id) => id !== currentUserId)
        : [...post.likes, currentUserId];
      return { ...post, likes: newLikes };
    }
    return post;
  });

  saveToStorage(KEYS.POSTS, updatedPosts);
}

export function addCommentToPost(postId: string, content: string): Comment | null {
  const posts = getPosts();
  const currentUser = getCurrentUser();
  const targetPost = posts.find((p) => p.id === postId);
  if (!targetPost) return null;

  const newComment: Comment = {
    id: `comm-${Date.now()}`,
    postId,
    authorId: currentUser.id,
    authorName: currentUser.name,
    authorAvatar: currentUser.avatar,
    authorRole: currentUser.role === 'student' ? 'Student' : currentUser.role.toUpperCase(),
    content,
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  const updatedPosts = posts.map((p) => {
    if (p.id === postId) {
      return {
        ...p,
        commentsCount: p.commentsCount + 1,
        comments: [...p.comments, newComment],
      };
    }
    return p;
  });

  saveToStorage(KEYS.POSTS, updatedPosts);

  // Notify author if not commenting on own post
  if (targetPost.authorId !== currentUser.id) {
    addNotification({
      userId: targetPost.authorId,
      title: 'New Comment on Your Post 💬',
      message: `${currentUser.name} commented: "${content.slice(0, 60)}..."`,
      type: 'community',
      linkTo: 'community',
    });
  }

  return newComment;
}

export function deletePost(postId: string): boolean {
  const posts = getPosts();
  const filtered = posts.filter((p) => p.id !== postId);
  if (filtered.length !== posts.length) {
    saveToStorage(KEYS.POSTS, filtered);
    return true;
  }
  return false;
}

export function reportPost(postId: string, reason: ContentReport['reason'], details?: string): void {
  const currentUser = getCurrentUser();
  const posts = getPosts();
  const targetPost = posts.find((p) => p.id === postId);

  if (targetPost) {
    const updatedPosts = posts.map((p) =>
      p.id === postId ? { ...p, reportCount: (p.reportCount || 0) + 1 } : p
    );
    saveToStorage(KEYS.POSTS, updatedPosts);
  }

  const reports = getFromStorage<ContentReport[]>(KEYS.REPORTS, []);
  const newReport: ContentReport = {
    id: `rep-${Date.now()}`,
    contentId: postId,
    contentType: 'post',
    reporterId: currentUser.id,
    reporterName: currentUser.name,
    reason,
    details,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  saveToStorage(KEYS.REPORTS, [newReport, ...reports]);
}

export function getClubs(): StudentClub[] {
  return getFromStorage<StudentClub[]>(KEYS.CLUBS, INITIAL_CLUBS);
}

export function toggleClubMembership(clubId: string): void {
  const clubs = getClubs();
  const currentUser = getCurrentUser();
  const isMember = currentUser.joinedClubs.includes(clubId);

  // Update clubs member list
  const updatedClubs = clubs.map((c) => {
    if (c.id === clubId) {
      const newMembers = isMember
        ? c.members.filter((m) => m !== currentUser.id)
        : [...c.members, currentUser.id];
      return {
        ...c,
        members: newMembers,
        memberCount: isMember ? c.memberCount - 1 : c.memberCount + 1,
      };
    }
    return c;
  });
  saveToStorage(KEYS.CLUBS, updatedClubs);

  // Update current user
  const newJoined = isMember
    ? currentUser.joinedClubs.filter((id) => id !== clubId)
    : [...currentUser.joinedClubs, clubId];
  updateCurrentUserProfile({ joinedClubs: newJoined });
}

// ========================
// HACKATHON TEAM FINDER
// ========================
export function getTeams(): HackathonTeam[] {
  return getFromStorage<HackathonTeam[]>(KEYS.TEAMS, INITIAL_TEAMS);
}

export function getTeamById(id: string): HackathonTeam | undefined {
  return getTeams().find((t) => t.id === id);
}

export function createTeam(teamData: Omit<HackathonTeam, 'id' | 'openPositionsCount' | 'members' | 'isOpen' | 'createdAt'>): HackathonTeam {
  const teams = getTeams();
  const currentUser = getCurrentUser();

  const newTeam: HackathonTeam = {
    ...teamData,
    id: `team-${Date.now()}`,
    openPositionsCount: teamData.requiredRoles.length,
    isOpen: true,
    members: [
      {
        userId: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        role: 'Team Lead',
      },
    ],
    createdAt: new Date().toISOString(),
  };

  saveToStorage(KEYS.TEAMS, [newTeam, ...teams]);
  return newTeam;
}

export function getJoinRequests(): TeamJoinRequest[] {
  return getFromStorage<TeamJoinRequest[]>(KEYS.JOIN_REQUESTS, INITIAL_JOIN_REQUESTS);
}

export function submitJoinRequest(teamId: string, roleAppliedFor: string, message: string, portfolioUrl?: string): TeamJoinRequest | null {
  const team = getTeamById(teamId);
  const currentUser = getCurrentUser();
  if (!team) return null;

  const existingRequests = getJoinRequests();
  const alreadyRequested = existingRequests.find(
    (r) => r.teamId === teamId && r.userId === currentUser.id && r.status === 'Pending'
  );
  if (alreadyRequested) return null;

  const newRequest: TeamJoinRequest = {
    id: `req-${Date.now()}`,
    teamId,
    teamName: team.name,
    userId: currentUser.id,
    userName: currentUser.name,
    userAvatar: currentUser.avatar,
    userDepartment: currentUser.department,
    roleAppliedFor,
    skills: currentUser.skills,
    portfolioUrl: portfolioUrl || currentUser.portfolioUrl,
    message,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  saveToStorage(KEYS.JOIN_REQUESTS, [newRequest, ...existingRequests]);

  // Notify team owner
  addNotification({
    userId: team.ownerId,
    title: 'New Team Join Request 🤝',
    message: `${currentUser.name} wants to join "${team.name}" as ${roleAppliedFor}.`,
    type: 'team',
    linkTo: 'hackathon',
  });

  return newRequest;
}

export function handleJoinRequest(requestId: string, action: 'Accepted' | 'Rejected'): boolean {
  const requests = getJoinRequests();
  const targetReq = requests.find((r) => r.id === requestId);
  if (!targetReq) return false;

  const updatedReqs = requests.map((r) => (r.id === requestId ? { ...r, status: action } : r));
  saveToStorage(KEYS.JOIN_REQUESTS, updatedReqs);

  if (action === 'Accepted') {
    const teams = getTeams();
    const targetTeam = teams.find((t) => t.id === targetReq.teamId);
    if (targetTeam) {
      const user = getUsers().find((u) => u.id === targetReq.userId);
      const newMember = {
        userId: targetReq.userId,
        name: targetReq.userName,
        avatar: targetReq.userAvatar,
        role: targetReq.roleAppliedFor,
      };

      const newMembers = [...targetTeam.members, newMember];
      const isNowFull = newMembers.length >= targetTeam.maxTeamSize;

      const updatedTeams = teams.map((t) =>
        t.id === targetReq.teamId
          ? {
              ...t,
              members: newMembers,
              openPositionsCount: Math.max(0, t.openPositionsCount - 1),
              isOpen: !isNowFull,
            }
          : t
      );
      saveToStorage(KEYS.TEAMS, updatedTeams);
    }
  }

  // Notify applicant
  addNotification({
    userId: targetReq.userId,
    title: `Join Request ${action}! ${action === 'Accepted' ? '🎉' : ''}`,
    message: `Your request to join "${targetReq.teamName}" as ${targetReq.roleAppliedFor} was ${action.toLowerCase()}.`,
    type: 'team',
    linkTo: 'hackathon',
  });

  return true;
}

// Smart algorithmic teammate match score
export function calculateMatchScore(userA: User, candidate: User): number {
  if (userA.id === candidate.id) return 0;

  let score = 50; // base score

  // Skill complementarity / overlap
  const sharedSkills = candidate.skills.filter((s) => userA.skills.includes(s));
  const uniqueCandidateSkills = candidate.skills.filter((s) => !userA.skills.includes(s));

  // Shared skills give alignment (+10)
  score += Math.min(20, sharedSkills.length * 5);

  // Complementary (different) skills give high team value (+20)
  score += Math.min(20, uniqueCandidateSkills.length * 4);

  // Availability match
  if (userA.availability === candidate.availability) {
    score += 10;
  }

  // Collaboration format match
  if (userA.collaborationPreference === candidate.collaborationPreference) {
    score += 10;
  }

  // Interest overlap
  const sharedInterests = candidate.interests.filter((i) => userA.interests.includes(i));
  score += Math.min(15, sharedInterests.length * 5);

  return Math.min(99, Math.max(60, score));
}

// ========================
// CAMPUS MARKETPLACE
// ========================
export function getMarketplaceItems(): MarketplaceItem[] {
  return getFromStorage<MarketplaceItem[]>(KEYS.MARKETPLACE, INITIAL_MARKETPLACE);
}

export function createMarketplaceItem(itemData: Omit<MarketplaceItem, 'id' | 'savedCount' | 'createdAt'>): MarketplaceItem {
  const items = getMarketplaceItems();
  const newItem: MarketplaceItem = {
    ...itemData,
    id: `item-${Date.now()}`,
    savedCount: 0,
    createdAt: new Date().toISOString(),
  };
  saveToStorage(KEYS.MARKETPLACE, [newItem, ...items]);

  addNotification({
    userId: newItem.sellerId,
    title: 'Listing Published! 🛍️',
    message: `"${newItem.title}" is now active in the campus marketplace.`,
    type: 'marketplace',
    linkTo: 'marketplace',
  });

  return newItem;
}

export function updateMarketplaceItem(id: string, updates: Partial<MarketplaceItem>): MarketplaceItem | undefined {
  const items = getMarketplaceItems();
  let updated: MarketplaceItem | undefined;
  const newItems = items.map((i) => {
    if (i.id === id) {
      updated = { ...i, ...updates };
      return updated;
    }
    return i;
  });
  if (updated) {
    saveToStorage(KEYS.MARKETPLACE, newItems);
  }
  return updated;
}

export function deleteMarketplaceItem(id: string): boolean {
  const items = getMarketplaceItems();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length !== items.length) {
    saveToStorage(KEYS.MARKETPLACE, filtered);
    return true;
  }
  return false;
}

export function toggleSaveListing(itemId: string): void {
  const currentUser = getCurrentUser();
  const isSaved = currentUser.savedListings.includes(itemId);
  const items = getMarketplaceItems();

  const newSaved = isSaved
    ? currentUser.savedListings.filter((id) => id !== itemId)
    : [...currentUser.savedListings, itemId];
  updateCurrentUserProfile({ savedListings: newSaved });

  const updatedItems = items.map((i) => {
    if (i.id === itemId) {
      return {
        ...i,
        savedCount: isSaved ? Math.max(0, i.savedCount - 1) : i.savedCount + 1,
      };
    }
    return i;
  });
  saveToStorage(KEYS.MARKETPLACE, updatedItems);
}

export function sendMarketplaceInquiry(itemId: string, message: string, offerPrice?: number): MarketplaceInquiry | null {
  const items = getMarketplaceItems();
  const targetItem = items.find((i) => i.id === itemId);
  const currentUser = getCurrentUser();
  if (!targetItem) return null;

  const inquiries = getFromStorage<MarketplaceInquiry[]>(KEYS.INQUIRIES, []);
  const newInquiry: MarketplaceInquiry = {
    id: `inq-${Date.now()}`,
    itemId,
    itemTitle: targetItem.title,
    buyerId: currentUser.id,
    buyerName: currentUser.name,
    buyerAvatar: currentUser.avatar,
    sellerId: targetItem.sellerId,
    message,
    offerPrice,
    createdAt: new Date().toISOString(),
    status: 'New',
  };

  saveToStorage(KEYS.INQUIRIES, [newInquiry, ...inquiries]);

  // Notify seller
  addNotification({
    userId: targetItem.sellerId,
    title: 'New Marketplace Inquiry 🏷️',
    message: `${currentUser.name} asked about "${targetItem.title}"${offerPrice ? ` with offer $${offerPrice}` : ''}.`,
    type: 'marketplace',
    linkTo: 'marketplace',
  });

  return newInquiry;
}

// ========================
// STUDENT TASKS & PRODUCTIVITY
// ========================
export function getTasks(userId?: string): StudentTask[] {
  const allTasks = getFromStorage<StudentTask[]>(KEYS.TASKS, INITIAL_TASKS);
  const uId = userId || getCurrentUser().id;
  return allTasks.filter((t) => t.userId === uId);
}

export function createTask(taskData: Omit<StudentTask, 'id' | 'createdAt'>): StudentTask {
  const allTasks = getFromStorage<StudentTask[]>(KEYS.TASKS, INITIAL_TASKS);
  const newTask: StudentTask = {
    ...taskData,
    id: `task-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  saveToStorage(KEYS.TASKS, [newTask, ...allTasks]);
  return newTask;
}

export function updateTask(taskId: string, updates: Partial<StudentTask>): StudentTask | undefined {
  const allTasks = getFromStorage<StudentTask[]>(KEYS.TASKS, INITIAL_TASKS);
  let updated: StudentTask | undefined;
  const newTasks = allTasks.map((t) => {
    if (t.id === taskId) {
      updated = { ...t, ...updates };
      if (updates.status === 'Completed' && !t.completedAt) {
        updated.completedAt = new Date().toISOString();
      } else if (updates.status && updates.status !== 'Completed') {
        delete updated.completedAt;
      }
      return updated;
    }
    return t;
  });
  if (updated) {
    saveToStorage(KEYS.TASKS, newTasks);
  }
  return updated;
}

export function deleteTask(taskId: string): boolean {
  const allTasks = getFromStorage<StudentTask[]>(KEYS.TASKS, INITIAL_TASKS);
  const filtered = allTasks.filter((t) => t.id !== taskId);
  if (filtered.length !== allTasks.length) {
    saveToStorage(KEYS.TASKS, filtered);
    return true;
  }
  return false;
}

// ========================
// NOTIFICATIONS
// ========================
export function getNotifications(userId?: string): Notification[] {
  const all = getFromStorage<Notification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  const uId = userId || getCurrentUser().id;
  return all.filter((n) => n.userId === uId);
}

export function addNotification(notifData: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Notification {
  const all = getFromStorage<Notification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  const newNotif: Notification = {
    ...notifData,
    id: `notif-${Date.now()}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  saveToStorage(KEYS.NOTIFICATIONS, [newNotif, ...all]);
  return newNotif;
}

export function markNotificationAsRead(id: string): void {
  const all = getFromStorage<Notification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  const updated = all.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  saveToStorage(KEYS.NOTIFICATIONS, updated);
}

export function markAllNotificationsAsRead(userId?: string): void {
  const uId = userId || getCurrentUser().id;
  const all = getFromStorage<Notification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  const updated = all.map((n) => (n.userId === uId ? { ...n, isRead: true } : n));
  saveToStorage(KEYS.NOTIFICATIONS, updated);
}

// ========================
// CONTENT REPORTS & MODERATION
// ========================
export function getReports(): ContentReport[] {
  return getFromStorage<ContentReport[]>(KEYS.REPORTS, []);
}

export function updateReportStatus(reportId: string, status: ContentReport['status'], removeContent = false): void {
  const reports = getReports();
  const targetReport = reports.find((r) => r.id === reportId);
  const updatedReports = reports.map((r) => (r.id === reportId ? { ...r, status } : r));
  saveToStorage(KEYS.REPORTS, updatedReports);

  if (targetReport && removeContent && targetReport.contentType === 'post') {
    deletePost(targetReport.contentId);
  }
}
