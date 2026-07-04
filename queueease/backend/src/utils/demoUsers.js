const DEMO_USERS = {
  "admin@queueease.com": {
    _id: "admin@queueease.com",
    name: "Admin",
    email: "admin@queueease.com",
    role: "admin",
    department: null,
    password: "admin123",
  },
};

const getDemoUser = (email) => {
  if (!email) return null;
  return DEMO_USERS[email.toLowerCase()] || null;
};

module.exports = { DEMO_USERS, getDemoUser };