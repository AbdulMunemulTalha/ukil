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
  hourlyFee: string;
  avatar: string;
  bio: string;
  answersCount: number;
  verified: boolean;
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
    status: "advice_given",
    answersCount: 2,
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
    status: "resolved",
    answersCount: 3,
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
    status: "advice_given",
    answersCount: 1,
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
    status: "advice_given",
    answersCount: 1,
  },
];

export const MOCK_ANSWERS: Answer[] = [
  {
    id: "c0000000-0000-0000-0000-000000000001",
    questionId: "b0000000-0000-0000-0000-000000000001",
    professionalId: "a0000000-0000-0000-0000-000000000001",
    professionalName: "Advocate Mahmud Hasan",
    professionalRole: "Senior Supreme Court Advocate",
    professionalAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    barLicenseNo: "DBA-9812-SC",
    content: "Under Section 161 of the Penal Code and Anti-Corruption Commission Act 2004, demanding an unofficial fee is a grave offense. You should:\n1. Call the ACC Hotline at 106 immediately to register a trap report.\n2. Submit a written complaint to the Assistant Commissioner (Land) or UNO with your mutation receipt copy.\n3. Keep documentary evidence of the file submission date.",
    createdAt: "1 hour ago",
    upvotes: 24,
    isAccepted: false,
  },
  {
    id: "c0000000-0000-0000-0000-000000000002",
    questionId: "b0000000-0000-0000-0000-000000000001",
    professionalId: "a0000000-0000-0000-0000-000000000002",
    professionalName: "Nusrat Jahan, Bar-at-Law",
    professionalRole: "Advocate & Civil Rights Practitioner",
    professionalAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    barLicenseNo: "BAR-4412-DH",
    content: "You can also file a writ petition under Article 102 of the Constitution for failure of public duty if the land office delays processing beyond the statutory 45-day limit for mutation.",
    createdAt: "30 mins ago",
    upvotes: 11,
    isAccepted: false,
  },
  {
    id: "c0000000-0000-0000-0000-000000000003",
    questionId: "b0000000-0000-0000-0000-000000000002",
    professionalId: "a0000000-0000-0000-0000-000000000003",
    professionalName: "Kamrul Islam, FCA",
    professionalRole: "Chartered Accountant & Labour Law Advisor",
    professionalAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    barLicenseNo: "ICAB-7712",
    content: "Under Section 30 of the Labour Act 2006, all outstanding dues including Provident Fund and gratuity MUST be disbursed within 30 working days of separation. Delay beyond 30 days incurs statutory interest penalties. You can file a formal complaint with the Department of Inspection for Factories and Establishments (DIFE).",
    createdAt: "3 hours ago",
    upvotes: 18,
    isAccepted: true,
  },
  {
    id: "c0000000-0000-0000-0000-000000000004",
    questionId: "b0000000-0000-0000-0000-000000000004",
    professionalId: "a0000000-0000-0000-0000-000000000002",
    professionalName: "Nusrat Jahan, Bar-at-Law",
    professionalRole: "Advocate & Civil Rights Practitioner",
    professionalAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    barLicenseNo: "BAR-4412-DH",
    content: "Under Muslim Personal Law (Shariat) Application Act and Transfer of Property Act, female heirs have absolute, vested Quranic shares (Faraid) that cannot be alienated without their registered consent. Immediate steps:\n1. Obtain certified copies of the fraudulent deed (Khatian & Dalil) from the Sub-Registry office.\n2. File a Declaration and Partition Suit in the competent Joint District Judge Court under Specific Relief Act Section 42 & 39 to declare the deed void.\n3. Apply for an ad-interim injunction under Order 39, Rules 1 & 2 of the CPC to prevent any third-party transfer or construction on the ancestral land during trial.",
    createdAt: "1 day ago",
    upvotes: 19,
    isAccepted: true,
  },
  {
    id: "c0000000-0000-0000-0000-000000000005",
    questionId: "b0000000-0000-0000-0000-000000000003",
    professionalId: "a0000000-0000-0000-0000-000000000003",
    professionalName: "Kamrul Islam, FCA",
    professionalRole: "Chartered Accountant & Tax Consultant",
    professionalAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    barLicenseNo: "ICAB-7712",
    content: "Under Section 120 & 130 of the Income Tax Act 2023, an audit penalty notice cannot be enforced without a formal show-cause hearing. Immediate steps:\n1. File an application for inspection of audit records and request an extension of time before the Deputy Commissioner of Taxes (DCT).\n2. Gather proof of online return submission (acknowledgment slip IT-10B) and wealth statement.\n3. If unresolved, file an appeal before the Commissioner of Taxes (Appeals) within 45 days.",
    createdAt: "12 hours ago",
    upvotes: 14,
    isAccepted: false,
  },
];

export const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    name: "Advocate Mahmud Hasan",
    role: "Supreme Court Advocate",
    specialization: ["Anti-Corruption", "Property & Land Law", "Writ Petitions"],
    location: "Dhaka Court & Supreme Court",
    rating: 4.9,
    reviewCount: 48,
    barLicenseNo: "DBA-9812-SC",
    hourlyFee: "৳2,500 / Session",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80",
    bio: "Over 14 years of practice specializing in land disputes, anti-corruption writ petitions, and public interest litigation.",
    answersCount: 142,
    verified: true,
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    name: "Nusrat Jahan, Bar-at-Law",
    role: "Advocate & Civil Rights Practitioner",
    specialization: ["Family & Inheritance", "Employment Rights", "Cyber Law"],
    location: "Gulshan, Dhaka",
    rating: 4.8,
    reviewCount: 36,
    barLicenseNo: "BAR-4412-DH",
    hourlyFee: "৳3,000 / Session",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    bio: "UK trained barrister advocate representing clients in civil rights, workplace disputes, family partition suits, and cyber harassment.",
    answersCount: 89,
    verified: true,
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    name: "Kamrul Islam, FCA",
    role: "Chartered Accountant & Tax Consultant",
    specialization: ["Income Tax Appeals", "NBR Show Cause", "Corporate Audit"],
    location: "Motijheel Commercial Area, Dhaka",
    rating: 5.0,
    reviewCount: 52,
    barLicenseNo: "ICAB-7712",
    hourlyFee: "৳2,000 / Session",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    bio: "Fellow Chartered Accountant assisting individuals and corporate entities in NBR audits, tax optimization, and VAT appeals.",
    answersCount: 110,
    verified: true,
  },
];
