import { Question, Answer, Professional, Category, MOCK_QUESTIONS, MOCK_ANSWERS, MOCK_PROFESSIONALS, MOCK_CATEGORIES } from './mockData';
import { createClient } from './supabase/client';
import { getDefaultAvatar } from './avatar';

const LOCAL_STORAGE_KEY_QUESTIONS = 'ukil_questions_data_v2';
const LOCAL_STORAGE_KEY_ANSWERS = 'ukil_answers_data_v2';
const LOCAL_STORAGE_KEY_CONSULTATIONS = 'ukil_consultations_data_v2';

export interface ConsultationRequest {
  id: string;
  professionalId: string;
  professionalName: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  preferredDate: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'completed';
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

const LOCAL_STORAGE_KEY_PROFESSIONALS = 'ukil_professionals_data_v2';

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

// Data Access Service (Hybrid: Live Supabase with LocalStorage offline/caching)
export const DataService = {
  // Get all categories
  getCategories(): Category[] {
    return MOCK_CATEGORIES;
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

      if (!aErr && dbAnswers && dbAnswers.length > 0) {
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

      if (!cErr && dbConsults && dbConsults.length > 0) {
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

      if (!pErr && dbProfs && dbProfs.length > 0) {
        const mappedProfs: Professional[] = dbProfs.map((p: any) => ({
          id: p.id,
          name: p.full_name,
          role: 'Verified Legal Advocate',
          specialization: Array.isArray(p.specializations) && p.specializations.length > 0 ? p.specializations : [],
          location: p.location || '',
          rating: p.rating ? Number(p.rating) : 5.0,
          reviewCount: p.review_count || 0,
          barLicenseNo: p.bar_license_no || '',
          hourlyFee: p.hourly_fee || '',
          avatar: p.avatar_url || getDefaultAvatar(p.full_name),
          bio: p.bio || '',
          answersCount: 0,
          verified: p.is_verified ?? true,
        }));
        saveStoredProfessionals(mappedProfs);
      }
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
        supabase.from('answers').update({ is_accepted: true }).eq('id', answerId).then(() => {});
      }
      if (questionId.length > 30) {
        supabase.from('questions').update({ status: 'resolved' }).eq('id', questionId).then(() => {});
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
    return profs.find((p) => p.id === id) || profs[0];
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
};

