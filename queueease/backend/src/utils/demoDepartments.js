const DEMO_DEPARTMENTS = [
  {
    _id: "demo-general-checkup",
    name: "General Checkup",
    description: "Walk-in general consultations",
    avgServiceTime: 12,
    isActive: true,
  },
  {
    _id: "demo-billing",
    name: "Billing Counter",
    description: "Payments and billing queries",
    avgServiceTime: 5,
    isActive: true,
  },
  {
    _id: "demo-pharmacy",
    name: "Pharmacy",
    description: "Medicine pickup",
    avgServiceTime: 4,
    isActive: true,
  },
];

const getDemoDepartments = () => DEMO_DEPARTMENTS;

module.exports = { DEMO_DEPARTMENTS, getDemoDepartments };