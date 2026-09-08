export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  color: string;
}

export interface Question {
  id: string;
  trackingCode: string;
  title: string;
  description: string;
  categorySlug: string;
  categoryName: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  isAnonymous: boolean;
  authorName: string;
  location: string;
  createdAt: string;
  upvotes: number;
  status: 'awaiting_advice' | 'advice_given' | 'resolved';
  answersCount: number;
  contactEmail?: string;
}

export interface Answer {
  id: string;
  questionId: string;
  professionalId: string;
  professionalName: string;
  professionalRole: string;
  professionalAvatar: string;
  barLicenseNo: string;
  hideBarLicense?: boolean;
  content: string;
  createdAt: string;
  upvotes: number;
  isAccepted: boolean;
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  specialization: string[];
  location: string;
  rating: number;
  reviewCount: number;
  barLicenseNo: string;
  hideBarLicense?: boolean;
  phone?: string;
  email?: string;
  nidNumber?: string;
  hourlyFee: string;
  avatar: string;
  bio: string;
  answersCount: number;
  verified: boolean;
  kycStatus?: 'pending' | 'in_review' | 'verified';
  kycData?: {
    barRollNo?: string;
    barAssociation?: string;
    enrollmentYear?: string;
    nidNumber?: string;
    documentName?: string;
    documentUrl?: string;
    submittedAt?: string;
    rejectionReason?: string;
  };
}

export const MOCK_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Anti-Corruption & Bribes",
    slug: "bribes",
    icon: "🚨",
    description: "Illegal bribe demands, government office harassment & remedies",
    color: "rose",
  },
  {
    id: "cat-2",
    name: "Property & Land Disputes",
    slug: "property",
    icon: "🏠",
    description: "Land mutation, deed registration, boundary disputes & eviction",
    color: "amber",
  },
  {
    id: "cat-3",
    name: "Tax, Audit & Accounting",
    slug: "tax",
    icon: "💰",
    description: "Income tax returns, NBR notices, VAT audit & tax appeals",
    color: "cyan",
  },
  {
    id: "cat-4",
    name: "Employment & Labour Rights",
    slug: "employment",
    icon: "👔",
    description: "Salary withholding, wrongful termination, Provident Fund & notice period",
    color: "indigo",
  },
  {
    id: "cat-5",
    name: "Family Law & Inheritance",
    slug: "family",
    icon: "👨‍👩‍👧",
    description: "Divorce, alimony, child custody & Muslim/Hindu property distribution",
    color: "emerald",
  },
  {
    id: "cat-6",
    name: "Criminal Defense & Bail",
    slug: "criminal",
    icon: "⚖️",
    description: "FIR filing, police harassment, bail application & court proceedings",
    color: "slate",
  },
  {
    id: "cat-7",
    name: "Business & Corporate",
    slug: "business",
    icon: "💼",
    description: "Company registration, RJSC filing, contract disputes & IP rights",
    color: "blue",
  },
  {
    id: "cat-8",
    name: "Consumer Rights & Fraud",
    slug: "consumer",
    icon: "🛒",
    description: "E-commerce scams, defective products & DNCRP complaints",
    color: "orange",
  },
];

export const MOCK_QUESTIONS: Question[] = [
  {
    id: "b0000000-0000-0000-0000-000000000001",
    trackingCode: "UKIL-8942-X",
    title: "Demanded ৳50,000 Bribe for Land Mutation in Mirpur Land Office",
    description: "I submitted all valid land deeds and tax receipts for mutation last month, but the assistant officer refuses to process the file without an unofficial cash payment of ৳50,000. What are my immediate legal remedies under the Anti-Corruption Act and ACC hotline?",
    categorySlug: "bribes",
    categoryName: "Anti-Corruption & Bribes",
    urgency: "critical",
    isAnonymous: true,
    authorName: "Anonymous Citizen",
    location: "Mirpur, Dhaka",
    createdAt: "2 hours ago",
    upvotes: 34,
    status: "awaiting_advice",
    answersCount: 0,
    contactEmail: "user1@example.com",
  },
  {
    id: "b0000000-0000-0000-0000-000000000002",
    trackingCode: "UKIL-3419-A",
    title: "Employer Withholding Final Settlement & Provident Fund After Resignation",
    description: "I resigned with a full 60-day formal notice period. However, the company HR is delaying my final clearance payout and provident fund release for over 90 days citing internal policy review. Is this legal under Labour Law 2006?",
    categorySlug: "employment",
    categoryName: "Employment & Labour Rights",
    urgency: "high",
    isAnonymous: false,
    authorName: "Tanvir A.",
    location: "Chittagong",
    createdAt: "5 hours ago",
    upvotes: 19,
    status: "awaiting_advice",
    answersCount: 0,
  },
  {
    id: "b0000000-0000-0000-0000-000000000003",
    trackingCode: "UKIL-7721-M",
    title: "Unexpected Income Tax Audit Penalty Notice for Previous Assessment Year",
    description: "Received a formal show-cause notice from NBR claiming tax underpayment for 2023. I filed through an online portal correctly. Can a certified tax consultant help appeal this before the Deputy Commissioner of Taxes?",
    categorySlug: "tax",
    categoryName: "Tax, Audit & Accounting",
    urgency: "medium",
    isAnonymous: true,
    authorName: "Anonymous Citizen",
    location: "Sylhet",
    createdAt: "1 day ago",
    upvotes: 8,
    status: "awaiting_advice",
    answersCount: 0,
  },
  {
    id: "b0000000-0000-0000-0000-000000000004",
    trackingCode: "UKIL-9102-K",
    title: "Ancestor Property Distributed Without Female Heirs' Consent",
    description: "My uncle fraudulently registered our ancestral land deed by excluding my mother and aunt. What is the procedure to file a Partition Suit in Civil Court to nullify the false deed?",
    categorySlug: "family",
    categoryName: "Family Law & Inheritance",
    urgency: "high",
    isAnonymous: false,
    authorName: "Farhana K.",
    location: "Rajshahi",
    createdAt: "2 days ago",
    upvotes: 27,
    status: "awaiting_advice",
    answersCount: 0,
  },
];

export const MOCK_ANSWERS: Answer[] = [];

export const MOCK_PROFESSIONALS: Professional[] = [];
