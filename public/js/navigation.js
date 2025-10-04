// Navigation component for all portals
class Navigation {
  constructor(portalType, currentUser) {
    this.portalType = portalType;
    this.currentUser = currentUser;
    this.hospitalId = currentUser?.hospitalId || currentUser?.doctor?.hospitalId || currentUser?.ambulance?.hospitalId;
  }

  render() {
    const navItems = this.getNavItems();
    return `
      <nav class="navbar">
        <div class="nav-brand">
          <h2>RapidCare HMS</h2>
          <span class="nav-subtitle">${this.getPortalTitle()}</span>
        </div>
        <div class="nav-items">
          ${navItems.map(item => `
            <button type="button" class="nav-item ${item.active ? 'active' : ''}"
               onclick="${item.onclick}" data-section="${item.section}">
              ${item.icon} ${item.label}
            </button>
          `).join('')}
        </div>
        <div class="nav-user">
          <span class="user-info">${this.getUserInfo()}</span>
          <button class="btn btn-outline" onclick="logout()">Logout</button>
        </div>
      </nav>
    `;
  }

  getPortalTitle() {
    const titles = {
      'reception': 'Reception Portal',
      'doctor': 'Doctor Portal', 
      'ambulance': 'Ambulance Portal',
      'public': 'Public Portal'
    };
    return titles[this.portalType] || 'Portal';
  }

  getUserInfo() {
    if (this.portalType === 'reception') {
      return `Hospital: ${this.currentUser?.hospitalId || 'N/A'}`;
    } else if (this.portalType === 'doctor') {
      return `Dr. ${this.currentUser?.doctor?.name || this.currentUser?.doctor?.doctorId || 'N/A'}`;
    } else if (this.portalType === 'ambulance') {
      return `Ambulance: ${this.currentUser?.ambulance?.ambulanceId || 'N/A'}`;
    }
    return 'Public User';
  }

  getNavItems() {
    const baseItems = [
      { label: 'Dashboard', icon: '🏠', section: 'dashboard', onclick: 'showSection("dashboard")' }
    ];

    switch (this.portalType) {
      case 'reception':
        return [
          ...baseItems,
          { label: 'Hospital Info', icon: '🏥', section: 'hospital-info', onclick: 'showSection("hospital-info")' },
          { label: 'Beds', icon: '🛏️', section: 'beds', onclick: 'showSection("beds")' },
          { label: 'Doctors', icon: '👨‍⚕️', section: 'doctors', onclick: 'showSection("doctors")' },
          { label: 'Ambulances', icon: '🚑', section: 'ambulances', onclick: 'showSection("ambulances")' },
          { label: 'Emergencies', icon: '🚨', section: 'emergencies', onclick: 'showSection("emergencies")' },
          { label: 'Update DBMS', icon: '🗄️', section: 'dbms', onclick: 'showSection("dbms")' }
        ];
      
      case 'doctor':
        return [
          ...baseItems,
          { label: 'Profile', icon: '👤', section: 'profile', onclick: 'showSection("profile")' },
          { label: 'Attendance', icon: '📅', section: 'attendance', onclick: 'showSection("attendance")' }
        ];
      
      case 'ambulance':
        return [
          ...baseItems,
          { label: 'Profile', icon: '👤', section: 'profile', onclick: 'showSection("profile")' },
          { label: 'Emergency Form', icon: '🚨', section: 'emergency-form', onclick: 'showSection("emergency-form")' },
          { label: 'Emergency Status', icon: '📊', section: 'emergency-status', onclick: 'showSection("emergency-status")' }
        ];
      
      case 'public':
        return [
          { label: 'Hospitals', icon: '🏥', section: 'hospitals', onclick: 'showSection("hospitals")' },
          { label: 'Emergency Request', icon: '🚨', section: 'emergency-request', onclick: 'showSection("emergency-request")' }
        ];
      
      default:
        return baseItems;
    }
  }

  static addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 20px;
        background: linear-gradient(120deg, #0b6efd, #6610f2);
        color: white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        margin-bottom: 20px;
        border-radius: 8px;
      }
      
      .nav-brand h2 {
        margin: 0;
        font-size: 24px;
        font-weight: bold;
      }
      
      .nav-subtitle {
        font-size: 14px;
        opacity: 0.9;
        margin-left: 10px;
      }
      
      .nav-items {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      
      .nav-item {
        padding: 8px 16px;
        background: rgba(255,255,255,0.1);
        border-radius: 6px;
        text-decoration: none;
        color: white;
        transition: all 0.3s;
        cursor: pointer;
        border: 1px solid transparent;
        outline: none;
      }
      
      .nav-item:hover {
        background: rgba(255,255,255,0.2);
        transform: translateY(-1px);
      }
      
      .nav-item.active {
        background: rgba(255,255,255,0.3);
        border-color: rgba(255,255,255,0.5);
      }
      
      .nav-user {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .user-info {
        font-size: 14px;
        opacity: 0.9;
      }
      
      .btn-outline {
        background: transparent;
        border: 1px solid rgba(255,255,255,0.5);
        color: white;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .btn-outline:hover {
        background: rgba(255,255,255,0.1);
        border-color: white;
      }
      
      @media (max-width: 768px) {
        .navbar {
          flex-direction: column;
          gap: 12px;
        }
        
        .nav-items {
          justify-content: center;
        }
        
        .nav-item {
          font-size: 12px;
          padding: 6px 12px;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Global navigation functions
window.showSection = function(sectionName) {
  // Hide all sections
  const sections = document.querySelectorAll('.portal-section');
  sections.forEach(section => section.style.display = 'none');
  
  // Remove active class from all nav items
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => item.classList.remove('active'));
  
  // Show selected section
  const targetSection = document.getElementById(`section-${sectionName}`);
  if (targetSection) {
    targetSection.style.display = 'block';
  }
  
  // Add active class to clicked nav item
  const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
  if (activeNavItem) {
    activeNavItem.classList.add('active');
  }
  
  // Call section-specific load functions
  if (window[`load${sectionName.charAt(0).toUpperCase() + sectionName.slice(1).replace('-', '')}`]) {
    window[`load${sectionName.charAt(0).toUpperCase() + sectionName.slice(1).replace('-', '')}`]();
  }
};

window.logout = function() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('jwt');
    localStorage.removeItem('role');
    localStorage.removeItem('hospitalId');
    localStorage.removeItem('doctor');
    localStorage.removeItem('ambulance');
    window.location.href = '/';
  }
};

window.Navigation = Navigation;
