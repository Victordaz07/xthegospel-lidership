/**
 * Universal User Profile Types
 * xTheGospel ID System
 * 
 * A unified identification system across all xTheGospel apps:
 * - Members, Investigators, Missionaries, Leaders, Teachers
 */

import { Timestamp } from 'firebase/firestore';

/** Apps available in the xTheGospel ecosystem */
export type XtgAppKey = 
  | 'member'        // Active church member
  | 'investigator'  // Learning about the gospel
  | 'missionary'    // Missionary preparation/service
  | 'leader'        // Ward/Stake leadership
  | 'teacher';      // Gospel teachers

/** Member status within the church */
export type MemberStatus = 
  | 'investigator'  // Not yet baptized
  | 'new_convert'   // Recently baptized (< 1 year)
  | 'active'        // Active member
  | 'less_active'   // Less active member
  | 'returned';     // Returned missionary

/** Missionary status */
export type MissionaryStatus = 
  | 'preparing'     // Preparing for mission
  | 'serving'       // Currently serving
  | 'returned';     // Returned missionary

/** Leadership calling types */
export type LeadershipRole = 
  | 'bishop'
  | 'bishopric_counselor'
  | 'ward_clerk'
  | 'elders_quorum_president'
  | 'relief_society_president'
  | 'young_men_president'
  | 'young_women_president'
  | 'primary_president'
  | 'sunday_school_president'
  | 'stake_president'
  | 'stake_counselor'
  | 'high_councilor'
  | 'other';

/** Teacher assignment types */
export type TeacherRole = 
  | 'sunday_school'
  | 'elders_quorum'
  | 'relief_society'
  | 'young_men'
  | 'young_women'
  | 'primary'
  | 'seminary'
  | 'institute';

/** Church unit information */
export interface ChurchUnit {
  stakeId: string;
  stakeName: string;
  wardId: string;
  wardName: string;
  country?: string;
  city?: string;
}

/** Baptism/Ordinance dates */
export interface OrdinanceDates {
  baptismDate?: string;        // ISO date string
  confirmationDate?: string;
  priesthood?: {
    aaronic?: string;          // Date received Aaronic priesthood
    melchizedek?: string;      // Date received Melchizedek priesthood
  };
  endowmentDate?: string;
  sealingDate?: string;
}

/** Universal User Profile - Stored in Firestore /users/{uid} */
export interface UniversalUserProfile {
  // === Identification ===
  uid: string;                 // Firebase UID (primary key)
  xthegospelId: string;        // Readable ID: "XTG-2026-ABC123"
  
  // === Basic Info ===
  displayName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  photoURL?: string;
  
  // === Dates ===
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  lastLoginAt: Timestamp | Date;
  birthDate?: string;          // ISO date string (private)
  
  // === Church Information ===
  memberStatus: MemberStatus;
  unit?: ChurchUnit;
  ordinances?: OrdinanceDates;
  
  // === Apps & Roles ===
  apps: Record<XtgAppKey, boolean>;
  roles: {
    missionary?: MissionaryStatus;
    leader?: LeadershipRole[];
    teacher?: TeacherRole[];
  };
  
  // === Privacy Settings ===
  privacy: {
    showPhone: boolean;
    showEmail: boolean;
    showBirthDate: boolean;
    shareWithLeaders: boolean;  // Allow ward leaders to see full profile
  };
  
  // === Metadata ===
  profileComplete: boolean;
  verifiedByLeader?: boolean;
  verifiedAt?: Timestamp | Date;
  verifiedBy?: string;         // UID of leader who verified
}

/** Minimal profile for sharing (QR code, etc) */
export interface ShareableProfile {
  xthegospelId: string;
  displayName: string;
  photoURL?: string;
  memberStatus: MemberStatus;
  unit?: {
    wardName: string;
    stakeName: string;
  };
}

/** Profile creation input */
export interface CreateProfileInput {
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  initialApp: XtgAppKey;
  memberStatus?: MemberStatus;
}

/** Default values for new profile */
export const DEFAULT_PROFILE_APPS: Record<XtgAppKey, boolean> = {
  member: false,
  investigator: false,
  missionary: false,
  leader: false,
  teacher: false,
};

export const DEFAULT_PRIVACY_SETTINGS: UniversalUserProfile['privacy'] = {
  showPhone: false,
  showEmail: false,
  showBirthDate: false,
  shareWithLeaders: true,
};
