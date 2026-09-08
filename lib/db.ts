import { Question, Answer, Professional, Category, MOCK_QUESTIONS, MOCK_ANSWERS, MOCK_PROFESSIONALS, MOCK_CATEGORIES } from './mockData';
import { createClient } from './supabase/client';
import { getDefaultAvatar } from './avatar';

const LOCAL_STORAGE_KEY_QUESTIONS = 'ukil_questions_data_v3';
const LOCAL_STORAGE_KEY_ANSWERS = 'ukil_answers_data_v3';
const LOCAL_STORAGE_KEY_CONSULTATIONS = 'ukil_consultations_data_v3';

export interface ConsultationRequest {
  id: string;
  professionalId: string;
  professionalName: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  preferredDate: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

// Initial default consultations
const INITIAL_CONSULTATIONS: ConsultationRequest[] = [];

// Helper to get initial stored data
export function getStoredQuestions(): Question[] {
  if (typeof window === 'undefined') return MOCK_QUESTIONS;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_QUESTIONS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading localStorage questions", e);
  }
  return MOCK_QUESTIONS;
}

export function saveStoredQuestions(questions: Question[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_QUESTIONS, JSON.stringify(questions));
  } catch (e) {
    console.error("Error saving questions to localStorage", e);
  }
}

export function getStoredAnswers(): Answer[] {
  if (typeof window === 'undefined') return MOCK_ANSWERS;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ANSWERS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading localStorage answers", e);
  }
  return MOCK_ANSWERS;
}

export function saveStoredAnswers(answers: Answer[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_ANSWERS, JSON.stringify(answers));
  } catch (e) {
    console.error("Error saving answers to localStorage", e);
  }
}

export function getStoredConsultations(): ConsultationRequest[] {
  if (typeof window === 'undefined') return INITIAL_CONSULTATIONS;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CONSULTATIONS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading localStorage consultations", e);
  }
  return INITIAL_CONSULTATIONS;
}

export function saveStoredConsultations(consultations: ConsultationRequest[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_CONSULTATIONS, JSON.stringify(consultations));
  } catch (e) {
    console.error("Error saving consultations to localStorage", e);
  }
}

const LOCAL_STORAGE_KEY_PROFESSIONALS = 'ukil_professionals_data_v3';

export function getStoredProfessionals(): Professional[] {
  if (typeof window === 'undefined') return MOCK_PROFESSIONALS;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PROFESSIONALS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}
  return MOCK_PROFESSIONALS;
}

export function saveStoredProfessionals(professionals: Professional[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PROFESSIONALS, JSON.stringify(professionals));
  } catch (e) {}
}

export interface PlatformStats {
  issuesResolved: number;
  verifiedLawyers: number;
  anonymousPercentage: number;
  avgAdviceTime: string;
}

const LOCAL_STORAGE_KEY_STATS = 'ukil_platform_stats_v3';

const DEFAULT_PLATFORM_STATS: PlatformStats = {
  issuesResolved: 0,
  verifiedLawyers: 0,
  anonymousPercentage: 100,
  avgAdviceTime: '< 4 Hours',
};

export function getStoredPlatformStats(): PlatformStats {
  if (typeof window === 'undefined') return DEFAULT_PLATFORM_STATS;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_STATS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}
  return DEFAULT_PLATFORM_STATS;
}

export function saveStoredPlatformStats(stats: PlatformStats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_STATS, JSON.stringify(stats));
  } catch (e) {}
}

const LOCAL_STORAGE_KEY_CATEGORIES = 'ukil_categories_data_v3';

export function getStoredCategories(): Category[] {
  if (typeof window === 'undefined') return MOCK_CATEGORIES;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CATEGORIES);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}
  return MOCK_CATEGORIES;
}

export function saveStoredCategories(categories: Category[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch (e) {}
}

export interface AdminPermissions {
  manage_kyc: boolean;
  manage_questions: boolean;
  manage_answers: boolean;
  manage_consultations: boolean;
  manage_categories: boolean;
  view_analytics: boolean;
  manage_admins: boolean;
}

export type AdminRole = 'super_admin' | 'admin' | 'moderator';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isSuperAdmin: boolean;
  permissions: AdminPermissions;
  department?: string;
  status: 'active' | 'suspended';
  addedBy?: string;
  createdAt: string;
  lastLogin?: string;
}

const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    id: 'admin-super-01',
    email: 'superadmin@ukil.com',
    name: 'Chief Registrar (Super Admin)',
    role: 'super_admin',
    isSuperAdmin: true,
    permissions: {
      manage_kyc: true,
      manage_questions: true,
      manage_answers: true,
      manage_consultations: true,
      manage_categories: true,
      view_analytics: true,
      manage_admins: true,
    },
    department: 'Supreme Council & Judicial Oversight',
    status: 'active',
    addedBy: 'Root System',
    createdAt: '2026-01-01',
  },
  {
    id: 'admin-super-02',
    email: 'md72905talha@gmail.com',
    name: 'S M Munemul Islam (Super Admin)',
    role: 'super_admin',
    isSuperAdmin: true,
    permissions: {
      manage_kyc: true,
      manage_questions: true,
      manage_answers: true,
      manage_consultations: true,
      manage_categories: true,
      view_analytics: true,
      manage_admins: true,
    },
    department: 'Executive Judicial Authority',
    status: 'active',
    addedBy: 'Root System',
    createdAt: '2026-01-01',
  },
  {
    id: 'admin-full-01',
    email: 'admin@ukil.com',
    name: 'Operations Director (Full Access Admin)',
    role: 'admin',
    isSuperAdmin: false,
    permissions: {
      manage_kyc: true,
      manage_questions: true,
      manage_answers: true,
      manage_consultations: true,
      manage_categories: true,
      view_analytics: true,
      manage_admins: true,
    },
    department: 'Platform Operations & Moderation',
    status: 'active',
    addedBy: 'Chief Registrar (Super Admin)',
    createdAt: '2026-01-05',
  },
];

const LOCAL_STORAGE_KEY_ADMIN_USERS = 'ukil_admin_users_data_v3';

export function getStoredAdminUsers(): AdminUser[] {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_USERS;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ADMIN_USERS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}
  return DEFAULT_ADMIN_USERS;
}

export function saveStoredAdminUsers(users: AdminUser[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_ADMIN_USERS, JSON.stringify(users));
  } catch (e) {}
}

// Data Access Service (Hybrid: Live Supabase with LocalStorage offline/caching)
export const DataService = {
  // Get all categories
  getCategories(): Category[] {
    return getStoredCategories();
  },

  // Get all questions
  getQuestions(): Question[] {
    return getStoredQuestions();
  },

  // Synchronize questions and answers from Supabase into cache
  async syncFromSupabase(): Promise<void> {
    const supabase = createClient();
    if (!supabase) return;

    try {
      // 1. Fetch Questions
      const { data: dbQuestions, error: qErr } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!qErr && dbQuestions && dbQuestions.length > 0) {
        const mappedQuestions: Question[] = dbQuestions.map((q) => {
          const cat = MOCK_CATEGORIES.find((c) => c.slug === q.category_slug);
          return {
            id: q.id,
            trackingCode: q.tracking_code,
            title: q.title,
            description: q.description,
            categorySlug: q.category_slug || 'bribes',
            categoryName: cat ? cat.name : 'General Legal Advice',
            urgency: (q.urgency as any) || 'medium',
            isAnonymous: q.is_anonymous ?? true,
            authorName: q.author_name || 'Anonymous Citizen',
            location: q.location || 'Bangladesh',
            createdAt: q.created_at ? new Date(q.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently',
            upvotes: q.upvotes || 0,
            status: (q.status as any) || 'awaiting_advice',
            answersCount: q.answers_count || 0,
            contactEmail: q.contact_email || undefined,
          };
        });
        saveStoredQuestions(mappedQuestions);
      }

      // 2. Fetch Answers with Professional Profile
      const { data: dbAnswers, error: aErr } = await supabase
        .from('answers')
        .select('*, profiles(*)');

      if (!aErr && dbAnswers) {
        const mappedAnswers: Answer[] = dbAnswers.map((a: any) => {
          const prof = a.profiles;
          return {
            id: a.id,
            questionId: a.question_id,
            professionalId: a.professional_id,
            professionalName: prof?.full_name || 'Verified Advocate',
            professionalRole: prof?.role === 'professional' ? 'Verified Advocate' : 'Legal Advisor',
            professionalAvatar: prof?.avatar_url || getDefaultAvatar(prof?.full_name),
            barLicenseNo: prof?.bar_license_no || '',
            hideBarLicense: Boolean(prof?.hide_bar_license),
            content: a.content,
            createdAt: a.created_at ? new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently',
            upvotes: a.upvotes || 0,
            isAccepted: a.is_accepted || false,
          };
        });
        saveStoredAnswers(mappedAnswers);
      }

      // 3. Fetch Consultations
      const { data: dbConsults, error: cErr } = await supabase
        .from('consultation_requests')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });

      if (!cErr && dbConsults) {
        const mappedConsults: ConsultationRequest[] = dbConsults.map((c: any) => ({
          id: c.id,
          professionalId: c.professional_id,
          professionalName: c.profiles?.full_name || 'Advocate',
          clientName: c.client_name,
          clientPhone: c.client_phone,
          preferredDate: c.preferred_date ? c.preferred_date.substring(0, 10) : '',
          notes: c.notes || '',
          status: (c.status as any) || 'pending',
          createdAt: c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Just now',
        }));
        saveStoredConsultations(mappedConsults);
      }

      // 4. Fetch Verified Professionals
      const { data: dbProfs, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'professional');

      if (!pErr && dbProfs) {
        const mappedProfs: Professional[] = dbProfs.map((p: any) => ({
          id: p.id,
          name: p.full_name,
          role: 'Verified Legal Advocate',
          specialization: Array.isArray(p.specializations) && p.specializations.length > 0 ? p.specializations : [],
          location: p.location || '',
          rating: p.rating ? Number(p.rating) : 5.0,
          reviewCount: p.review_count || 0,
          barLicenseNo: p.bar_license_no || '',
          hideBarLicense: Boolean(p.hide_bar_license),
          phone: p.phone || '',
          email: p.email || '',
          nidNumber: p.nid_number || '',
          hourlyFee: p.hourly_fee || '',
          avatar: p.avatar_url || getDefaultAvatar(p.full_name),
          bio: p.bio || '',
          answersCount: 0,
          verified: p.is_verified ?? false,
          kycStatus: (p.kyc_status as any) || (p.is_verified ? 'verified' : 'pending'),
          kycData: (p.kyc_data as any) || undefined,
        }));
        saveStoredProfessionals(mappedProfs);
      }

      // 5. Fetch and synchronize live Platform Impact Stats
      await this.getPlatformStatsAsync();

      // 6. Fetch and synchronize Admin Users
      await this.syncAdminUsersFromSupabase();
    } catch (err) {
      console.warn('Sync from Supabase failed, using local cache:', err);
    }
  },

  // Get single question by ID or Tracking Code
  getQuestionByIdOrCode(identifier: string): Question | undefined {
    const questions = getStoredQuestions();
    const clean = identifier.trim().toUpperCase();
    return questions.find(
      (q) => q.id.toUpperCase() === clean || q.trackingCode.toUpperCase() === clean
    );
  },

  // Asynchronously get single question from Supabase if not found locally
  async getQuestionByIdOrCodeAsync(identifier: string): Promise<Question | undefined> {
    const local = this.getQuestionByIdOrCode(identifier);
    if (local) return local;

    const supabase = createClient();
    if (!supabase) return undefined;

    try {
      const clean = identifier.trim().toUpperCase();
      let query = supabase.from('questions').select('*');
      if (clean.startsWith('UKIL-')) {
        query = query.eq('tracking_code', clean);
      } else if (clean.length > 30) {
        query = query.eq('id', identifier.trim());
      } else {
        query = query.or(`tracking_code.eq.${clean},id.eq.${identifier.trim()}`);
      }

      const { data, error } = await query.single();
      if (!error && data) {
        const cat = MOCK_CATEGORIES.find((c) => c.slug === data.category_slug);
        const mapped: Question = {
          id: data.id,
          trackingCode: data.tracking_code,
          title: data.title,
          description: data.description,
          categorySlug: data.category_slug || 'bribes',
          categoryName: cat ? cat.name : 'General Legal Advice',
          urgency: (data.urgency as any) || 'medium',
          isAnonymous: data.is_anonymous ?? true,
          authorName: data.author_name || 'Anonymous Citizen',
          location: data.location || 'Bangladesh',
          createdAt: data.created_at ? new Date(data.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently',
          upvotes: data.upvotes || 0,
          status: (data.status as any) || 'awaiting_advice',
          answersCount: data.answers_count || 0,
          contactEmail: data.contact_email || undefined,
        };

        const existing = getStoredQuestions();
        if (!existing.some((x) => x.id === mapped.id)) {
          saveStoredQuestions([mapped, ...existing]);
        }
        return mapped;
      }
    } catch (e) {
      console.warn('Error fetching question async from Supabase:', e);
    }
    return undefined;
  },

  // Add new question (No-Signup)
  addQuestion(newQuestion: Omit<Question, 'id' | 'createdAt' | 'upvotes' | 'status' | 'answersCount' | 'trackingCode'> & { trackingCode?: string }): Question {
    const questions = getStoredQuestions();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = newQuestion.trackingCode || `UKIL-${randomNum}-X`;

    const created: Question = {
      ...newQuestion,
      id: `q-${Date.now()}`,
      trackingCode,
      createdAt: 'Just now',
      upvotes: 1,
      status: 'awaiting_advice',
      answersCount: 0,
    };

    const updated = [created, ...questions];
    saveStoredQuestions(updated);

    // Persist asynchronously to Supabase
    const supabase = createClient();
    if (supabase) {
      supabase
        .from('questions')
        .insert({
          tracking_code: trackingCode,
          title: newQuestion.title,
          description: newQuestion.description,
          category_slug: newQuestion.categorySlug,
          urgency: newQuestion.urgency,
          is_anonymous: newQuestion.isAnonymous,
          author_name: newQuestion.authorName,
          contact_email: newQuestion.contactEmail || null,
          location: newQuestion.location || 'Bangladesh',
          status: 'awaiting_advice',
          upvotes: 1,
          answers_count: 0,
        })
        .then(({ error }) => {
          if (error) {
            console.error('Supabase question insert error:', error);
          } else {
            // Re-sync quietly in background to bind database UUID
            DataService.syncFromSupabase();
          }
        });
    }

    return created;
  },

  // Upvote question
  upvoteQuestion(questionId: string, increment: number): number {
    const questions = getStoredQuestions();
    let newCount = 0;
    const updated = questions.map((q) => {
      if (q.id === questionId) {
        newCount = Math.max(0, q.upvotes + increment);
        return { ...q, upvotes: newCount };
      }
      return q;
    });
    saveStoredQuestions(updated);

    const supabase = createClient();
    if (supabase && questionId.includes('-') && questionId.length > 30) {
      supabase.from('questions').update({ upvotes: newCount }).eq('id', questionId).then(() => {});
    }

    return newCount;
  },

  // Get all answers
  getAnswers(): Answer[] {
    return getStoredAnswers();
  },

  // Get answers for question (by ID or tracking code)
  getAnswersForQuestion(questionId: string): Answer[] {
    const answers = getStoredAnswers();
    const cleanId = questionId.trim().toUpperCase();
    const targetQ = this.getQuestionByIdOrCode(questionId);
    let matched = answers.filter((a) => {
      if (a.questionId.toUpperCase() === cleanId) return true;
      if (targetQ) {
        if (
          a.questionId.toUpperCase() === targetQ.id.toUpperCase() ||
          a.questionId.toUpperCase() === targetQ.trackingCode.toUpperCase()
        ) {
          return true;
        }
      }
      return false;
    });

    // Fallback to MOCK_ANSWERS if cached stored answers didn't contain this question's answers
    if (matched.length === 0) {
      matched = MOCK_ANSWERS.filter((a) => {
        if (a.questionId.toUpperCase() === cleanId) return true;
        if (targetQ) {
          if (
            a.questionId.toUpperCase() === targetQ.id.toUpperCase() ||
            a.questionId.toUpperCase() === targetQ.trackingCode.toUpperCase()
          ) {
            return true;
          }
        }
        return false;
      });
    }

    return matched;
  },

  // Asynchronously get answers directly from Supabase with live join
  async getAnswersForQuestionAsync(questionId: string): Promise<Answer[]> {
    const cached = this.getAnswersForQuestion(questionId);
    const supabase = createClient();
    if (!supabase) return cached;

    try {
      const targetQ = this.getQuestionByIdOrCode(questionId);
      let queryId = (targetQ && targetQ.id.length > 30) ? targetQ.id : questionId;

      if (queryId.length < 30 && targetQ?.trackingCode) {
        const { data: qData } = await supabase
          .from('questions')
          .select('id')
          .eq('tracking_code', targetQ.trackingCode)
          .single();
        if (qData?.id) queryId = qData.id;
      }

      if (queryId.length > 30) {
        const { data: dbAnswers, error } = await supabase
          .from('answers')
          .select('*, profiles(*)')
          .eq('question_id', queryId);

        if (!error && dbAnswers && dbAnswers.length > 0) {
          const liveAnswers: Answer[] = dbAnswers.map((a: any) => {
            const prof = a.profiles;
            return {
              id: a.id,
              questionId: a.question_id,
              professionalId: a.professional_id,
              professionalName: prof?.full_name || 'Verified Advocate',
              professionalRole: prof?.role === 'professional' ? 'Verified Advocate' : 'Legal Advisor',
              professionalAvatar: prof?.avatar_url || getDefaultAvatar(prof?.full_name),
              barLicenseNo: prof?.bar_license_no || '',
              hideBarLicense: Boolean(prof?.hide_bar_license),
              content: a.content,
              createdAt: a.created_at ? new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently',
              upvotes: a.upvotes || 0,
              isAccepted: a.is_accepted || false,
            };
          });

          // Merge live answers into stored answers
          const currentStored = getStoredAnswers();
          const filtered = currentStored.filter((a) => a.questionId !== queryId && a.questionId !== questionId);
          saveStoredAnswers([...liveAnswers, ...filtered]);
          return liveAnswers;
        }
      }
    } catch (err) {
      console.warn('Error fetching live answers from Supabase:', err);
    }

    return cached;
  },

  // Add new answer (for lawyers)
  addAnswer(answerData: {
    questionId: string;
    professionalId: string;
    professionalName: string;
    professionalRole: string;
    professionalAvatar: string;
    barLicenseNo: string;
    hideBarLicense?: boolean;
    content: string;
  }): Answer {
    const answers = getStoredAnswers();
    const targetQ = this.getQuestionByIdOrCode(answerData.questionId);
    const resolvedQuestionId = (targetQ && targetQ.id.length > 30) ? targetQ.id : answerData.questionId;
    const resolvedProfId = answerData.professionalId || '';

    const newAnswer: Answer = {
      id: `ans-${Date.now()}`,
      ...answerData,
      questionId: resolvedQuestionId,
      professionalId: resolvedProfId,
      createdAt: 'Just now',
      upvotes: 1,
      isAccepted: false,
    };

    const updatedAnswers = [newAnswer, ...answers];
    saveStoredAnswers(updatedAnswers);

    // Update question status and answersCount locally
    const questions = getStoredQuestions();
    let updatedAnswersCount = 1;
    const updatedQuestions = questions.map((q) => {
      if (q.id === answerData.questionId || (targetQ && q.id === targetQ.id)) {
        updatedAnswersCount = q.answersCount + 1;
        return {
          ...q,
          answersCount: updatedAnswersCount,
          status: q.status === 'resolved' ? ('resolved' as const) : ('advice_given' as const),
        };
      }
      return q;
    });
    saveStoredQuestions(updatedQuestions);

    // Persist to Supabase if valid UUID
    const supabase = createClient();
    if (supabase) {
      const persist = async () => {
        let qId = resolvedQuestionId;
        if (qId.length < 30 && targetQ?.trackingCode) {
          const { data: dbQ } = await supabase
            .from('questions')
            .select('id')
            .eq('tracking_code', targetQ.trackingCode)
            .single();
          if (dbQ?.id) qId = dbQ.id;
        }

        if (qId && qId.length > 30) {
          const { error: insErr } = await supabase.from('answers').insert({
            question_id: qId,
            professional_id: resolvedProfId,
            content: answerData.content,
            upvotes: 1,
            is_accepted: false,
          });

          if (!insErr) {
            await supabase
              .from('questions')
              .update({
                answers_count: updatedAnswersCount,
                status: 'advice_given',
              })
              .eq('id', qId);
            DataService.syncFromSupabase();
          } else {
            console.error('Supabase answer insert error:', insErr);
          }
        }
      };
      persist();
    }

    return newAnswer;
  },

  // Accept solution
  acceptSolution(answerId: string, questionId: string) {
    const answers = getStoredAnswers();
    const updatedAnswers = answers.map((a) => {
      if (a.questionId === questionId) {
        return { ...a, isAccepted: a.id === answerId };
      }
      return a;
    });
    saveStoredAnswers(updatedAnswers);

    // Mark question as resolved
    const questions = getStoredQuestions();
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        return { ...q, status: 'resolved' as const };
      }
      return q;
    });
    saveStoredQuestions(updatedQuestions);

    const supabase = createClient();
    if (supabase) {
      if (answerId.length > 30) {
        supabase.from('answers').update({ is_accepted: true }).eq('id', answerId).then(() => {
          this.getPlatformStatsAsync();
        });
      }
      if (questionId.length > 30) {
        supabase.from('questions').update({ status: 'resolved' }).eq('id', questionId).then(() => {
          this.getPlatformStatsAsync();
        });
      }
    }
  },

  // Upvote answer
  upvoteAnswer(answerId: string, increment: number): number {
    const answers = getStoredAnswers();
    let newCount = 0;
    const updated = answers.map((a) => {
      if (a.id === answerId) {
        newCount = Math.max(0, a.upvotes + increment);
        return { ...a, upvotes: newCount };
      }
      return a;
    });
    saveStoredAnswers(updated);

    const supabase = createClient();
    if (supabase && answerId.length > 30) {
      supabase.from('answers').update({ upvotes: newCount }).eq('id', answerId).then(() => {});
    }

    return newCount;
  },

  // Get professionals
  getProfessionals(): Professional[] {
    return getStoredProfessionals();
  },

  getProfessionalById(id: string): Professional | undefined {
    const profs = getStoredProfessionals();
    return profs.find((p) => p.id === id);
  },

  // Update lawyer profile locally and sync to cache
  updateProfessionalProfile(id: string, updates: Partial<Professional>): Professional | null {
    const profs = getStoredProfessionals();
    let updatedProf: Professional | null = null;
    const updatedList = profs.map((p) => {
      if (p.id === id) {
        updatedProf = { ...p, ...updates };
        return updatedProf;
      }
      return p;
    });
    if (updatedProf) {
      saveStoredProfessionals(updatedList);
    }
    return updatedProf;
  },

  // Submit KYC verification
  submitKycVerification(id: string, kycData: any, autoApprove: boolean = true) {
    const profs = getStoredProfessionals();
    const updated = profs.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          verified: autoApprove ? true : p.verified,
          kycStatus: autoApprove ? ('verified' as const) : ('in_review' as const),
          barLicenseNo: kycData.barRollNo || p.barLicenseNo,
          nidNumber: kycData.nidNumber || p.nidNumber,
          kycData: {
            ...p.kycData,
            ...kycData,
            submittedAt: new Date().toISOString(),
          },
        };
      }
      return p;
    });
    saveStoredProfessionals(updated);

    const supabase = createClient();
    if (supabase) {
      const updatePayload: any = {
        kyc_status: autoApprove ? 'verified' : 'in_review',
        is_verified: autoApprove,
        nid_number: kycData.nidNumber || null,
        kyc_data: {
          ...kycData,
          submitted_at: new Date().toISOString(),
        },
      };
      if (kycData.barRollNo) {
        updatePayload.bar_license_no = kycData.barRollNo;
      }
      if (id.length > 30) {
        supabase.from('profiles').update(updatePayload).eq('id', id).then(() => {});
      }
    }
  },

  // Consultation booking
  addConsultation(requestData: Omit<ConsultationRequest, 'id' | 'status' | 'createdAt'>): ConsultationRequest {
    const list = getStoredConsultations();
    const created: ConsultationRequest = {
      ...requestData,
      id: `consult-${Date.now()}`,
      status: 'pending',
      createdAt: 'Just now',
    };
    const updated = [created, ...list];
    saveStoredConsultations(updated);

    const supabase = createClient();
    if (supabase && requestData.professionalId.length > 30) {
      supabase
        .from('consultation_requests')
        .insert({
          professional_id: requestData.professionalId,
          client_name: requestData.clientName,
          client_phone: requestData.clientPhone,
          client_email: requestData.clientEmail || null,
          preferred_date: new Date(requestData.preferredDate || Date.now()).toISOString(),
          notes: requestData.notes,
          status: 'pending',
        })
        .then(({ error }) => {
          if (error) console.error('Supabase consultation insert error:', error);
        });
    }

    return created;
  },

  getConsultations(): ConsultationRequest[] {
    return getStoredConsultations();
  },

  // Synchronous Platform Impact Stats for instant render
  getPlatformStats(): PlatformStats {
    const cached = getStoredPlatformStats();
    if (cached && (cached.issuesResolved > 0 || cached.verifiedLawyers > 0)) {
      return cached;
    }

    const questions = getStoredQuestions();
    const answers = getStoredAnswers();
    const profs = getStoredProfessionals();

    const acceptedQIds = new Set(answers.filter((a) => a.isAccepted).map((a) => a.questionId));
    const resolvedCount = questions.filter((q) => q.status === 'resolved' || acceptedQIds.has(q.id)).length;
    const verifiedCount = profs.filter((p) => p.verified !== false).length;
    const totalQ = questions.length;
    const anonQ = questions.filter((q) => q.isAnonymous).length;
    const anonymousPercentage = totalQ > 0 ? Math.round((anonQ / totalQ) * 100) : 100;

    return {
      issuesResolved: resolvedCount,
      verifiedLawyers: verifiedCount,
      anonymousPercentage,
      avgAdviceTime: '< 4 Hours',
    };
  },

  // Asynchronous live Platform Impact Stats from database
  async getPlatformStatsAsync(): Promise<PlatformStats> {
    const supabase = createClient();
    if (!supabase) return this.getPlatformStats();

    try {
      // 1. Live count of verified lawyers directly from accounts in Supabase
      const { count: verifiedCount, error: profErr } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'professional')
        .eq('is_verified', true);

      // 2. Live questions for resolved count, anonymous %, and advice turnaround calculation
      const { data: dbQuestions, error: qErr } = await supabase
        .from('questions')
        .select('id, status, is_anonymous, created_at');

      // 3. Live answers for accepted solutions and advice timestamps
      const { data: dbAnswers, error: aErr } = await supabase
        .from('answers')
        .select('question_id, is_accepted, created_at');

      if (qErr && !dbQuestions) {
        return this.getPlatformStats();
      }

      const questionsList = dbQuestions || [];
      const answersList = dbAnswers || [];

      // A. Issues Resolved: count questions that are resolved or have an accepted answer
      const acceptedQuestionIds = new Set(
        answersList.filter((a) => a.is_accepted).map((a) => a.question_id)
      );
      const issuesResolved = questionsList.filter(
        (q) => q.status === 'resolved' || acceptedQuestionIds.has(q.id)
      ).length;

      // B. Verified Lawyers: count of verified professional accounts on the website
      const verifiedLawyers = typeof verifiedCount === 'number'
        ? verifiedCount
        : getStoredProfessionals().filter((p) => p.verified !== false).length;

      // C. Anonymous Friendly %: percentage of questions submitted anonymously
      const totalQuestions = questionsList.length;
      const anonymousQuestions = questionsList.filter((q) => q.is_anonymous === true).length;
      const anonymousPercentage = totalQuestions > 0
        ? Math.round((anonymousQuestions / totalQuestions) * 100)
        : 100;

      // D. Average Advice Time: dynamic turnaround from question creation to first response
      const adviceDurationsInHours: number[] = [];
      const answersByQ = new Map<string, string[]>();

      for (const ans of answersList) {
        if (!ans.question_id || !ans.created_at) continue;
        if (!answersByQ.has(ans.question_id)) {
          answersByQ.set(ans.question_id, []);
        }
        answersByQ.get(ans.question_id)!.push(ans.created_at);
      }

      for (const q of questionsList) {
        const timestamps = answersByQ.get(q.id);
        if (!timestamps || timestamps.length === 0 || !q.created_at) continue;

        const qTime = new Date(q.created_at).getTime();
        const firstAnsTime = Math.min(...timestamps.map((t) => new Date(t).getTime()));
        const diffHours = (firstAnsTime - qTime) / (1000 * 60 * 60);

        if (diffHours >= 0 && diffHours < 720) {
          adviceDurationsInHours.push(diffHours);
        }
      }

      let avgAdviceTime = '< 4 Hours';
      if (adviceDurationsInHours.length > 0) {
        const avgHours =
          adviceDurationsInHours.reduce((sum, val) => sum + val, 0) / adviceDurationsInHours.length;
        if (avgHours < 1) {
          avgAdviceTime = '< 1 Hour';
        } else if (avgHours <= 2) {
          avgAdviceTime = '< 2 Hours';
        } else if (avgHours <= 4) {
          avgAdviceTime = '< 4 Hours';
        } else if (avgHours <= 12) {
          avgAdviceTime = '< 12 Hours';
        } else if (avgHours <= 24) {
          avgAdviceTime = '< 24 Hours';
        } else {
          avgAdviceTime = `< ${Math.ceil(avgHours)} Hours`;
        }
      }

      const calculatedStats: PlatformStats = {
        issuesResolved,
        verifiedLawyers,
        anonymousPercentage,
        avgAdviceTime,
      };

      saveStoredPlatformStats(calculatedStats);
      return calculatedStats;
    } catch (err) {
      console.warn('Error fetching live platform stats from Supabase:', err);
      return this.getPlatformStats();
    }
  },

  // ==========================================
  // ADMIN DASHBOARD METHODS
  // ==========================================

  // Admin: Get all professionals (including unverified & in_review)
  getAllProfessionalsAdmin(): Professional[] {
    return getStoredProfessionals();
  },

  // Admin: Update Lawyer KYC Verification Status
  adminUpdateKycStatus(
    id: string,
    status: 'verified' | 'in_review' | 'pending',
    isVerified: boolean,
    rejectionReason?: string
  ): Professional | null {
    const profs = getStoredProfessionals();
    let updatedProf: Professional | null = null;
    const updated = profs.map((p) => {
      if (p.id === id) {
        updatedProf = {
          ...p,
          verified: isVerified,
          kycStatus: status,
          kycData: {
            ...p.kycData,
            rejectionReason: rejectionReason || undefined,
          },
        };
        return updatedProf;
      }
      return p;
    });
    saveStoredProfessionals(updated);

    const supabase = createClient();
    if (supabase) {
      const updateData: any = {
        kyc_status: status,
        is_verified: isVerified,
      };
      if (rejectionReason) {
        updateData.kyc_data = {
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString(),
        };
      }
      if (id.length > 30) {
        supabase.from('profiles').update(updateData).eq('id', id).then(() => {
          this.getPlatformStatsAsync();
        });
      }
    }

    return updatedProf;
  },

  // Admin: Delete question and cascade delete answers
  adminDeleteQuestion(id: string): void {
    const questions = getStoredQuestions();
    const updatedQ = questions.filter((q) => q.id !== id);
    saveStoredQuestions(updatedQ);

    const answers = getStoredAnswers();
    const updatedA = answers.filter((a) => a.questionId !== id);
    saveStoredAnswers(updatedA);

    const supabase = createClient();
    if (supabase && id.length > 30) {
      supabase.from('questions').delete().eq('id', id).then(() => {
        this.getPlatformStatsAsync();
      });
    }
  },

  // Admin: Update question (status, urgency, title, category)
  adminUpdateQuestion(id: string, updates: Partial<Question>): Question | null {
    const questions = getStoredQuestions();
    let updatedQuestion: Question | null = null;
    const updated = questions.map((q) => {
      if (q.id === id) {
        updatedQuestion = { ...q, ...updates };
        return updatedQuestion;
      }
      return q;
    });
    saveStoredQuestions(updated);

    const supabase = createClient();
    if (supabase && id.length > 30) {
      const sbUpdates: any = {};
      if (updates.status) sbUpdates.status = updates.status;
      if (updates.urgency) sbUpdates.urgency = updates.urgency;
      if (updates.title) sbUpdates.title = updates.title;
      if (updates.categorySlug) sbUpdates.category_slug = updates.categorySlug;

      supabase.from('questions').update(sbUpdates).eq('id', id).then(() => {
        this.getPlatformStatsAsync();
      });
    }

    return updatedQuestion;
  },

  // Admin: Delete answer
  adminDeleteAnswer(id: string): void {
    const answers = getStoredAnswers();
    const target = answers.find((a) => a.id === id);
    const updated = answers.filter((a) => a.id !== id);
    saveStoredAnswers(updated);

    if (target) {
      const questions = getStoredQuestions();
      const updatedQuestions = questions.map((q) => {
        if (q.id === target.questionId) {
          const newCount = Math.max(0, q.answersCount - 1);
          return {
            ...q,
            answersCount: newCount,
            status: newCount === 0 ? ('awaiting_advice' as const) : q.status,
          };
        }
        return q;
      });
      saveStoredQuestions(updatedQuestions);
    }

    const supabase = createClient();
    if (supabase && id.length > 30) {
      supabase.from('answers').delete().eq('id', id).then(() => {
        this.getPlatformStatsAsync();
      });
    }
  },

  // Admin: Toggle answer accepted solution status
  adminToggleAnswerAccepted(answerId: string): boolean {
    const answers = getStoredAnswers();
    let isAcceptedNow = false;
    let targetQId = '';
    const updated = answers.map((a) => {
      if (a.id === answerId) {
        isAcceptedNow = !a.isAccepted;
        targetQId = a.questionId;
        return { ...a, isAccepted: isAcceptedNow };
      }
      return a;
    });
    saveStoredAnswers(updated);

    if (targetQId) {
      const questions = getStoredQuestions();
      const updatedQuestions = questions.map((q) => {
        if (q.id === targetQId) {
          return {
            ...q,
            status: isAcceptedNow ? ('resolved' as const) : q.status,
          };
        }
        return q;
      });
      saveStoredQuestions(updatedQuestions);
    }

    const supabase = createClient();
    if (supabase && answerId.length > 30) {
      supabase.from('answers').update({ is_accepted: isAcceptedNow }).eq('id', answerId).then(() => {
        this.getPlatformStatsAsync();
      });
    }

    return isAcceptedNow;
  },

  // Admin: Update consultation booking status
  adminUpdateConsultationStatus(id: string, status: ConsultationRequest['status']): void {
    const list = getStoredConsultations();
    const updated = list.map((c) => (c.id === id ? { ...c, status } : c));
    saveStoredConsultations(updated);

    const supabase = createClient();
    if (supabase && id.length > 30) {
      supabase.from('consultation_requests').update({ status }).eq('id', id).then(() => {});
    }
  },

  // Admin: Category management
  adminAddCategory(category: Category): void {
    const categories = this.getCategories();
    if (categories.some((c) => c.slug === category.slug)) return;
    const updated = [...categories, category];
    saveStoredCategories(updated);

    const supabase = createClient();
    if (supabase) {
      supabase.from('categories').insert({
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        description: category.description,
        color: category.color,
      }).then(() => {});
    }
  },

  adminUpdateCategory(category: Category): void {
    const categories = this.getCategories();
    const updated = categories.map((c) => (c.slug === category.slug ? category : c));
    saveStoredCategories(updated);

    const supabase = createClient();
    if (supabase) {
      supabase.from('categories').update({
        name: category.name,
        icon: category.icon,
        description: category.description,
        color: category.color,
      }).eq('slug', category.slug).then(() => {});
    }
  },

  adminDeleteCategory(slug: string): void {
    const categories = this.getCategories();
    const updated = categories.filter((c) => c.slug !== slug);
    saveStoredCategories(updated);

    const supabase = createClient();
    if (supabase) {
      supabase.from('categories').delete().eq('slug', slug).then(() => {});
    }
  },

  // Admin: Comprehensive platform health metrics
  adminGetMetrics() {
    const questions = getStoredQuestions();
    const answers = getStoredAnswers();
    const profs = getStoredProfessionals();
    const consultations = getStoredConsultations();

    const pendingKyc = profs.filter(
      (p) => p.kycStatus === 'in_review' || (p.kycStatus === 'pending' && !p.verified)
    ).length;
    const verifiedProfs = profs.filter((p) => p.verified === true).length;
    const resolvedQuestions = questions.filter((q) => q.status === 'resolved').length;
    const awaitingQuestions = questions.filter((q) => q.status === 'awaiting_advice').length;

    return {
      totalQuestions: questions.length,
      resolvedQuestions,
      awaitingQuestions,
      totalAnswers: answers.length,
      acceptedAnswers: answers.filter((a) => a.isAccepted).length,
      totalLawyers: profs.length,
      verifiedLawyers: verifiedProfs,
      pendingKycLawyers: pendingKyc,
      totalConsultations: consultations.length,
      pendingConsultations: consultations.filter((c) => c.status === 'pending').length,
    };
  },

  // ==========================================
  // SUPER ADMIN & RBAC ADMIN USER MANAGEMENT
  // ==========================================

  getAdminUsers(): AdminUser[] {
    return getStoredAdminUsers();
  },

  getAdminUserByEmail(email: string): AdminUser | undefined {
    const users = getStoredAdminUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  async syncAdminUsersFromSupabase(): Promise<AdminUser[]> {
    const supabase = createClient();
    if (!supabase) return getStoredAdminUsers();

    try {
      const { data, error } = await (supabase
        .from('admin_users' as any) as any)
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: AdminUser[] = data.map((d: any) => ({
          id: d.id,
          email: d.email,
          name: d.name,
          role: (d.role as 'super_admin' | 'admin' | 'moderator') || 'admin',
          isSuperAdmin: Boolean(d.is_super_admin),
          permissions: {
            manage_kyc: Boolean(d.permissions?.manage_kyc),
            manage_questions: Boolean(d.permissions?.manage_questions),
            manage_answers: Boolean(d.permissions?.manage_answers),
            manage_consultations: Boolean(d.permissions?.manage_consultations),
            manage_categories: Boolean(d.permissions?.manage_categories),
            view_analytics: Boolean(d.permissions?.view_analytics),
            manage_admins: Boolean(d.permissions?.manage_admins),
          },
          department: d.department || 'Administration',
          status: (d.status as 'active' | 'suspended') || 'active',
          addedBy: d.added_by || 'Root System',
          createdAt: d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Recently',
          lastLogin: d.last_login ? new Date(d.last_login).toLocaleDateString() : undefined,
        }));

        saveStoredAdminUsers(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Error fetching admin users from Supabase:', e);
    }
    return getStoredAdminUsers();
  },

  addAdminUser(
    newAdmin: Omit<AdminUser, 'id' | 'createdAt'>,
    operatorEmail: string
  ): { success: boolean; user?: AdminUser; error?: string } {
    const users = getStoredAdminUsers();
    const operator = users.find((u) => u.email.toLowerCase() === operatorEmail.toLowerCase());

    // Authorization check: Operator must be super_admin or have manage_admins permission
    if (!operator || (!operator.isSuperAdmin && !operator.permissions.manage_admins)) {
      return {
        success: false,
        error: 'Access Denied: You do not possess privileges to add administrative users.',
      };
    }

    // Protection rule: Only a Super Admin can create another Super Admin
    if ((newAdmin.isSuperAdmin || newAdmin.role === 'super_admin') && !operator.isSuperAdmin) {
      return {
        success: false,
        error: 'Access Denied: Only a Super Admin can grant Super Admin privileges or create another Super Admin.',
      };
    }

    // Check duplicate email
    if (users.some((u) => u.email.toLowerCase() === newAdmin.email.toLowerCase())) {
      return {
        success: false,
        error: 'An administrator with this email address already exists.',
      };
    }

    const created: AdminUser = {
      ...newAdmin,
      id: `admin-${Date.now()}`,
      createdAt: new Date().toLocaleDateString(),
      addedBy: operator.name || operator.email,
    };

    const updated = [...users, created];
    saveStoredAdminUsers(updated);

    // Sync to Supabase
    const supabase = createClient();
    if (supabase) {
      (supabase
        .from('admin_users' as any) as any)
        .insert({
          email: created.email,
          name: created.name,
          role: created.role,
          is_super_admin: created.isSuperAdmin,
          permissions: created.permissions,
          department: created.department || 'Administration',
          status: created.status,
          added_by: created.addedBy,
        })
        .then(({ error }: any) => {
          if (error) console.error('Error inserting admin user into Supabase:', error);
        });
    }

    return { success: true, user: created };
  },

  updateAdminUser(
    id: string,
    updates: Partial<AdminUser>,
    operatorEmail: string
  ): { success: boolean; user?: AdminUser; error?: string } {
    const users = getStoredAdminUsers();
    const operator = users.find((u) => u.email.toLowerCase() === operatorEmail.toLowerCase());
    const target = users.find((u) => u.id === id);

    if (!operator || (!operator.isSuperAdmin && !operator.permissions.manage_admins)) {
      return {
        success: false,
        error: 'Access Denied: You do not possess privileges to manage administrator roles.',
      };
    }

    if (!target) {
      return { success: false, error: 'Administrator user not found.' };
    }

    // Protection rule: If target is Super Admin and operator is NOT Super Admin
    if (target.isSuperAdmin && !operator.isSuperAdmin) {
      return {
        success: false,
        error: 'Access Denied: Super Admin is protected by root authority. Only a Super Admin can reconfigure a Super Admin profile.',
      };
    }

    // Protection rule: Non-super admin cannot elevate anyone to Super Admin
    if ((updates.isSuperAdmin || updates.role === 'super_admin') && !operator.isSuperAdmin) {
      return {
        success: false,
        error: 'Access Denied: Only a Super Admin can grant Super Admin privileges.',
      };
    }

    let updatedUser: AdminUser | undefined;
    const updated = users.map((u) => {
      if (u.id === id) {
        updatedUser = { ...u, ...updates };
        return updatedUser;
      }
      return u;
    });

    if (updatedUser) {
      saveStoredAdminUsers(updated);

      const supabase = createClient();
      if (supabase && id.length > 30) {
        const sbPayload: any = {};
        if (updates.name) sbPayload.name = updates.name;
        if (updates.role) sbPayload.role = updates.role;
        if (updates.isSuperAdmin !== undefined) sbPayload.is_super_admin = updates.isSuperAdmin;
        if (updates.permissions) sbPayload.permissions = updates.permissions;
        if (updates.department) sbPayload.department = updates.department;
        if (updates.status) sbPayload.status = updates.status;

        (supabase
          .from('admin_users' as any) as any)
          .update(sbPayload)
          .eq('id', id)
          .then(({ error }: any) => {
            if (error) console.error('Error updating admin user in Supabase:', error);
          });
      }
    }

    return { success: true, user: updatedUser };
  },

  deleteAdminUser(
    targetId: string,
    operatorEmail: string
  ): { success: boolean; error?: string } {
    const users = getStoredAdminUsers();
    const operator = users.find((u) => u.email.toLowerCase() === operatorEmail.toLowerCase());
    const target = users.find((u) => u.id === targetId);

    if (!operator || (!operator.isSuperAdmin && !operator.permissions.manage_admins)) {
      return {
        success: false,
        error: 'Access Denied: You do not possess privileges to delete administrator users.',
      };
    }

    if (!target) {
      return { success: false, error: 'Administrator user not found.' };
    }

    // CRITICAL SECURITY INVARIANT: NO OTHER ADMIN CAN REMOVE SUPER ADMIN!
    // ONLY SUPER ADMIN CAN REMOVE SUPER ADMIN!
    if (target.isSuperAdmin || target.role === 'super_admin') {
      if (!operator.isSuperAdmin) {
        return {
          success: false,
          error: 'Access Denied: Super Admin is protected by root authority. No other administrator (even with full access) can remove the Super Admin.',
        };
      }

      // Check if this is the last Super Admin
      const superAdmins = users.filter((u) => u.isSuperAdmin || u.role === 'super_admin');
      if (superAdmins.length <= 1) {
        return {
          success: false,
          error: 'Action Denied: Cannot remove the last remaining Super Admin on the platform.',
        };
      }
    }

    const updated = users.filter((u) => u.id !== targetId);
    saveStoredAdminUsers(updated);

    const supabase = createClient();
    if (supabase && targetId.length > 30) {
      (supabase
        .from('admin_users' as any) as any)
        .delete()
        .eq('id', targetId)
        .then(({ error }: any) => {
          if (error) console.error('Error deleting admin user from Supabase:', error);
        });
    }

    return { success: true };
  },
};


