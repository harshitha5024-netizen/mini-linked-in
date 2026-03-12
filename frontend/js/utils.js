/**
 * Utility Functions
 * Shared helpers used across all pages
 */

// ============================================
// Toast Notifications
// ============================================

/**
 * Initialize toast container (call once on page load)
 */
function initToasts() {
  if (!document.querySelector('.toast-container')) {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

/**
 * Show a toast notification
 * @param {string} message - Toast message
 * @param {string} type - 'success', 'error', or 'info'
 * @param {number} duration - Duration in ms
 */
function showToast(message, type = 'info', duration = 4000) {
  initToasts();
  const container = document.querySelector('.toast-container');

  const icons = {
    success: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>',
    error: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
    info: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================
// Date/Time Formatting
// ============================================

/**
 * Format a date to relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
function timeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 5) return `${diffWeek}w ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;

  return past.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// ============================================
// Avatar Helpers
// ============================================

/**
 * Get avatar HTML for a user
 * @param {Object} user - User object with name and profileImage
 * @param {string} sizeClass - CSS class for size
 * @returns {string} HTML string
 */
function getAvatarHTML(user, sizeClass = '') {
  if (user?.profileImage) {
    return `<img src="${user.profileImage}" alt="${user.name}" class="profile-avatar ${sizeClass}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
            <div class="profile-avatar default-avatar ${sizeClass}" style="display:none;">${getInitials(user.name)}</div>`;
  }
  return `<div class="profile-avatar default-avatar ${sizeClass}">${getInitials(user?.name || 'U')}</div>`;
}

/**
 * Get initials from a name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ============================================
// Auth State Management
// ============================================

/** Current user data cache */
let currentUser = null;

/**
 * Check if user is authenticated and redirect if not
 * @param {boolean} requireProfile - Whether to require a MongoDB profile
 * @returns {Promise<Object|null>} Current user data
 */
function checkAuth(requireProfile = true) {
  return new Promise((resolve) => {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        window.location.href = '/login';
        resolve(null);
        return;
      }

      if (requireProfile) {
        try {
          currentUser = await api.getCurrentUser();
          resolve(currentUser);
        } catch (error) {
          console.error('Failed to get user profile:', error);
          resolve(null);
        }
      } else {
        resolve(user);
      }
    });
  });
}

/**
 * Logout the current user
 */
async function logout() {
  try {
    await firebase.auth().signOut();
    currentUser = null;
    window.location.href = '/login';
  } catch (error) {
    showToast('Failed to logout', 'error');
  }
}

// ============================================
// Loading States
// ============================================

/**
 * Show a skeleton loading placeholder
 * @param {number} count - Number of skeleton items
 * @returns {string} HTML string
 */
function skeletonPosts(count = 3) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="card p-4 mb-4 animate-fade-in-up stagger-${i + 1}">
        <div class="flex items-center gap-3 mb-4">
          <div class="skeleton" style="width:48px;height:48px;border-radius:50%"></div>
          <div class="flex-1">
            <div class="skeleton" style="width:40%;height:14px;margin-bottom:6px"></div>
            <div class="skeleton" style="width:25%;height:12px"></div>
          </div>
        </div>
        <div class="skeleton" style="width:100%;height:12px;margin-bottom:8px"></div>
        <div class="skeleton" style="width:80%;height:12px;margin-bottom:8px"></div>
        <div class="skeleton" style="width:60%;height:12px;margin-bottom:16px"></div>
        <div class="skeleton" style="width:100%;height:200px;margin-bottom:12px;border-radius:8px"></div>
      </div>`;
  }
  return html;
}

/**
 * Show a full-page loading spinner
 */
function showPageLoader() {
  const loader = document.createElement('div');
  loader.id = 'page-loader';
  loader.className = 'page-loader';
  loader.innerHTML = '<div class="spinner spinner-lg"></div>';
  document.body.appendChild(loader);
}

/**
 * Hide the full-page loading spinner
 */
function hidePageLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 300);
  }
}

// ============================================
// Navbar Helper
// ============================================

/**
 * Generate the navbar HTML
 * @param {string} activePage - Currently active page name
 * @returns {string} Navbar HTML
 */
function generateNavbar(activePage = '') {
  return `
  <nav class="navbar">
    <div class="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
      <!-- Logo -->
      <a href="/feed" class="flex items-center gap-2 no-underline">
        <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background:var(--accent-gradient)">
          <svg width="22" height="22" fill="white" viewBox="0 0 24 24"><path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
        </div>
        <span class="font-bold text-lg hidden sm:block" style="color:var(--linkedin-blue)">Mini<span style="color:var(--text-primary)">LinkedIn</span></span>
      </a>

      <!-- Nav Links -->
      <div class="flex items-center gap-1">
        <a href="/feed" class="nav-link ${activePage === 'feed' ? 'active' : ''}" id="nav-feed">
          <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
          <span>Home</span>
        </a>
        <a href="/profile" class="nav-link ${activePage === 'profile' ? 'active' : ''}" id="nav-profile">
          <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
          <span>Profile</span>
        </a>
        <a href="/jobs" class="nav-link ${activePage === 'jobs' ? 'active' : ''}" id="nav-jobs">
          <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125v-4.25m16.5 0a2.25 2.25 0 00-2.25-2.25H4.875a2.25 2.25 0 00-2.25 2.25m16.5 0V9.45c0-.621-.504-1.125-1.125-1.125h-4.371m-6.629 0l-1.125-1.125M6.375 8.325h4.371M12 9.075v10.5M15 9.075v1.5M9 9.075v1.5"/></svg>
          <span>Jobs</span>
        </a>
        <a href="/notifications" class="nav-link ${activePage === 'notifications' ? 'active' : ''}" id="nav-notifications">
          <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>
          <span>Alerts</span>
          <span class="badge" id="notif-badge" style="display:none">0</span>
        </a>
        <button onclick="logout()" class="nav-link" style="border:none;background:none;cursor:pointer" id="nav-logout">
          <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/></svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  </nav>`;
}

/**
 * Update notification badge count
 */
async function updateNotificationBadge() {
  try {
    const data = await api.getNotifications();
    const badge = document.getElementById('notif-badge');
    if (badge && data.unreadCount > 0) {
      badge.textContent = data.unreadCount > 99 ? '99+' : data.unreadCount;
      badge.style.display = 'flex';
    } else if (badge) {
      badge.style.display = 'none';
    }
  } catch (error) {
    // Silently fail for badge updates
  }
}

// ============================================
// Misc Helpers
// ============================================

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Debounce function for search/input
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Initialize toasts on load
document.addEventListener('DOMContentLoaded', initToasts);
