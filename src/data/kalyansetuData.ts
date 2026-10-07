export interface AudienceCategory {
  number: string;
  title: string;
  description: string;
  extendedStory: string;
}

export const WHO_WE_SERVE_CATEGORIES: AudienceCategory[] = [
  {
    number: '01',
    title: 'People Facing Food Insecurity',
    description: 'People who may struggle to afford even basic nourishing meals.',
    extendedStory: 'Food security is not a given for many individuals. Kalyan Setu begins with them.',
  },
  {
    number: '02',
    title: 'Students',
    description: 'Affordable food for students managing limited budgets and life away from home.',
    extendedStory: 'Hostel food is often inadequate. Outside food is expensive. Students deserve better.',
  },
  {
    number: '03',
    title: 'Workers',
    description: 'Accessible nourishment for people working long hours and managing everyday expenses.',
    extendedStory:
      'A worker who skips a meal to save money loses energy and dignity both. We intend to change that.',
  },
  {
    number: '04',
    title: 'Drivers & Daily Workers',
    description:
      'People who spend most of their day working outside and often depend on affordable food options.',
    extendedStory:
      "Those who keep cities moving often can't afford to stop and eat a proper meal.",
  },
  {
    number: '05',
    title: 'People Living Away From Home',
    description:
      'Affordable and dependable food for people who cannot easily access home-cooked meals.',
    extendedStory: 'Distance from home should not mean distance from a wholesome meal.',
  },
  {
    number: '06',
    title: 'Low-Income Families',
    description: 'Food solutions designed with affordability and everyday dignity in mind.',
    extendedStory: 'Dignity at the table is not a luxury. Every family deserves it.',
  },
];

export interface MilestoneItem {
  title: string;
  shortTitle: string;
  description: string;
}

export const COMPLETED_MILESTONES: MilestoneItem[] = [
  {
    shortTitle: 'Idea and concept fully developed',
    title: 'Idea & Concept Developed',
    description: 'The core problem, audience, and solution have been clearly identified and defined.',
  },
  {
    shortTitle: 'Brand identity created (name, logo, visuals)',
    title: 'Brand Identity Created',
    description: 'Name (KalyanSetu), logo, visual system, and brand language fully developed.',
  },
  {
    shortTitle: 'Initial business planning completed',
    title: 'Initial Business Planning',
    description: 'Basic business model, revenue approach, and cost structure outlined.',
  },
  {
    shortTitle: 'Market and problem research done',
    title: 'Market & Problem Research',
    description: 'Research conducted on food insecurity, affordability gaps, and target communities.',
  },
  {
    shortTitle: 'Target audience identified',
    title: 'Target Audience Identified',
    description: 'Six primary audiences defined and documented.',
  },
  {
    shortTitle: 'Founder-led development underway',
    title: 'Founder-Led Development',
    description: 'All current work being led and executed personally by the founder.',
  },
  {
    shortTitle: 'Trademark search — no active similar mark found',
    title: 'Trademark Search Completed',
    description: 'KALYANSETU — No active similar mark found.',
  },
  {
    shortTitle: 'MCA account created',
    title: 'MCA Account Created',
    description: 'Ministry of Corporate Affairs account set up for incorporation.',
  },
  {
    shortTitle: 'SPICe+ Part A — incorporation process initiated',
    title: 'SPICe+ Part A Initiated',
    description: 'Company incorporation process formally started.',
  },
  {
    shortTitle: 'NIC Code selected (56100)',
    title: 'NIC Code Selected',
    description: 'Business Activity Code 56100 — Restaurants and mobile food service activities.',
  },
  {
    shortTitle: 'Company names shortlisted (KALYANSETU PVT LTD / SHUBHODAYA PVT LTD)',
    title: 'Company Names Shortlisted',
    description: 'KALYANSETU PRIVATE LIMITED and SHUBHODAYA PRIVATE LIMITED.',
  },
  {
    shortTitle: 'Website development in progress',
    title: 'Website Development In Progress',
    description: 'Official website being designed and developed.',
  },
];

export const REMAINING_MILESTONES: MilestoneItem[] = [
  {
    shortTitle: 'Domain registration',
    title: 'Domain Registration',
    description: 'Official domain to be registered and linked to the website.',
  },
  {
    shortTitle: 'Website launch',
    title: 'Website Launch',
    description: 'Complete website to be tested, finalized, and made live.',
  },
  {
    shortTitle: 'Full legal/company registration',
    title: 'Full Legal Registration',
    description: 'Complete SPICe+ process and receive Certificate of Incorporation.',
  },
  {
    shortTitle: 'Pilot location identified',
    title: 'Pilot Location',
    description: 'Identify the first physical or semi-physical food service point.',
  },
  {
    shortTitle: 'Supplier network established',
    title: 'Supplier Network',
    description: 'Build relationships with trusted, local food suppliers.',
  },
  {
    shortTitle: 'Equipment procurement',
    title: 'Equipment Procurement',
    description: 'Source kitchen or food service equipment for pilot operations.',
  },
  {
    shortTitle: 'Core team formation',
    title: 'Core Team Formation',
    description: 'Recruit initial team members aligned with the mission.',
  },
  {
    shortTitle: 'Initial operations setup',
    title: 'Initial Operations Setup',
    description: 'Establish workflows, hygiene standards, and service processes.',
  },
  {
    shortTitle: 'Marketing and outreach',
    title: 'Marketing & Outreach',
    description: 'Begin community outreach, social presence, and pilot promotion.',
  },
  {
    shortTitle: 'Pilot launch',
    title: 'Pilot Launch',
    description: 'Serve the first customers. Validate the model. Refine and grow.',
  },
];

export const PROGRESS_TIMELINE = [
  { label: 'Brand & Research', statusText: 'Done', state: 'done' as const },
  { label: 'Legal Setup', statusText: 'In Progress', state: 'active' as const },
  { label: 'Website', statusText: 'Next', state: 'pending' as const },
  { label: 'Pilot Location', statusText: 'Next', state: 'pending' as const },
  { label: 'Operations', statusText: 'Future', state: 'pending' as const },
  { label: 'LAUNCH', statusText: 'Goal', state: 'goal' as const },
];

export const CONTACT_REASONS = [
  'General Inquiry',
  'Partner With Us',
  'Investor',
  'Volunteer',
  'Collaborate',
  'Media',
  'Just Saying Hi',
] as const;
