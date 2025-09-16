
import {z} from 'zod';

export type ReliefNeed = 'ਖਾਣਾ / Food' | 'ਪੀਣ ਵਾਲਾ ਪਾਣੀ / Drinking Water' | 'ਕੱਪੜੇ / Clothes' | 'ਦਵਾਈਆਂ / Medicine' | 'ਆਸਰਾ (ਟੈਂਟ, ਤਰਪਾਲ ਆਦਿ) / Shelter (Tent, Tarpaulin, etc.)' | 'ਪਸ਼ੂਆਂ ਦਾ ਚਾਰਾ / Animal Fodder' | 'Other';
export const reliefNeeds: ReliefNeed[] = ['ਖਾਣਾ / Food', 'ਪੀਣ ਵਾਲਾ ਪਾਣੀ / Drinking Water', 'ਕੱਪੜੇ / Clothes', 'ਦਵਾਈਆਂ / Medicine', 'ਆਸਰਾ (ਟੈਂਟ, ਤਰਪਾਲ ਆਦਿ) / Shelter (Tent, Tarpaulin, etc.)', 'ਪਸ਼ੂਆਂ ਦਾ ਚਾਰਾ / Animal Fodder', 'Other'];

export const districts: string[] = [
    'Amritsar ਅੰਮ੍ਰਿਤਸਰ',
    'Barnala ਬਰਨਾਲਾ',
    'Bathinda ਬਠਿੰਡਾ',
    'Faridkot ਫ਼ਰੀਦਕੋਟ',
    'Fatehgarh Sahib ਫਤਿਹਗੜ੍ਹ ਸਾਹਿਬ',
    'Fazilka ਫਾਜ਼ਿਲਕਾ',
    'Firozpur ਫ਼ਿਰੋਜ਼ਪੁਰ',
    'Gurdaspur ਗੁਰਦਾਸਪੁਰ',
    'Hoshiarpur ਹੁਸ਼ਿਆਰਪੁਰ',
    'Jalandhar ਜਲੰਧਰ',
    'Kapurthala ਕਪੂਰਥਲਾ',
    'Ludhiana ਲੁਧਿਆਣਾ',
    'Malerkotla ਮਲੇਰਕੋਟਲਾ',
    'Mansa ਮਾਨਸਾ',
    'Moga ਮੋਗਾ',
    'Pathankot ਪਠਾਨਕੋਟ',
    'Patiala ਪਟਿਆਲਾ',
    'Rupnagar ਰੂਪਨਗਰ',
    'Sahibzada Ajit Singh Nagar (Mohali) ਸਾਹਿਬਜ਼ਾਦਾ ਅਜੀਤ ਸਿੰਘ ਨਗਰ (ਮੋਹਾਲੀ)',
    'Sangrur ਸੰਗਰੂਰ',
    'Shaheed Bhagat Singh Nagar (Nawanshahr) ਸ਼ਹੀਦ ਭਗਤ ਸਿੰਘ ਨਗਰ (ਨਵਾਂ ਸ਼ਹਿਰ)',
    'Sri Muktsar Sahib ਸ੍ਰੀ ਮੁਕਤਸਰ ਸਾਹਿਬ',
    'Tarn Taran ਤਰਨਤਾਰਨ',
];

export type Volunteer = {
    email: string;
    name: string;
};

export type Comment = {
    id: string;
    timestamp: string;
    author: string; // email
    authorName: string;
    text: string;
};

export type Report = {
    id: string;
    timestamp: string;
    reporter: string; // email
    reporterName: string;
    reason: string;
};

export type Village = {
  id: string;
  timestamp: string;
  email?: string;
  villageName: string;
  district: string;
  pincode: string;
  name: string;
  contactNumber: string;
  needs: string;
  lat?: number | null;
  lng?: number | null;
  comments?: Comment[];
  reports?: Report[];
  views?: number;
  assignedTo?: Volunteer[];
};

export type ContactMessageStatus = 'new' | 'read' | 'closed';

export type ContactSubmission = {
    id: string;
    timestamp: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: ContactMessageStatus;
}

export type AppUser = {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user' | 'blocked';
  lastSignInTime: string;
  creationTime: string;
};

export const allAuditLogActions = [
  'VIEW_VILLAGE_DETAILS',
  'JOIN_REQUEST',
  'UNASSIGN_REQUEST',
  'ADD_COMMENT',
  'DELETE_COMMENT',
  'ADD_REPORT',
  'DELETE_REPORT',
  'DELETE_REQUEST',
  'DELETE_ALL_REQUESTS',
  'VIEW_MESSAGES',
  'UPDATE_MESSAGE_STATUS',
  'VIEW_USERS',
  'SET_USER_ROLE',
  'LOGIN',
  'CALL_CONTACT',
  'VIEW_MAP',
  'VIEW_AUDIT_LOG'
] as const;


export type AuditLogAction = typeof allAuditLogActions[number];

export type AuditLog = {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    action: AuditLogAction;
    details: string;
    ipAddress?: string;
    city?: string;
    country?: string;
    countryCode?: string;
};


export const VIllAGE_DATA: Village[] = [];

export const FormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters.')
    .regex(/^[a-zA-Z\s]+$/, 'Name must only contain English letters and spaces.'),
  contactNumber: z
    .string()
    .length(10, 'Contact number must be 10 digits.')
    .regex(/^\d{10}$/, 'Contact number must only contain 10 digits.'),
  villageName: z
    .string()
    .min(2, 'Village name must be at least 2 characters.')
    .regex(/^[a-zA-Z\s]+$/, 'Village name must only contain English letters and spaces.'),
  district: z.string().min(2, 'District must be at least 2 characters.'),
  pincode: z
    .string()
    .length(6, 'Pincode must be 6 digits.')
    .regex(/^\d{6}$/, 'Pincode must only contain 6 digits.'),
  needs: z.array(z.string()).min(1, {
    message: 'You have to select at least one item.',
  }),
  otherNeed: z.string().optional(),
  privacyPolicy: z.boolean().refine(val => val === true, {
    message: "You must agree to the Privacy Policy to submit the request."
  }),
}).refine(data => {
    if (data.needs.includes('Other') && (!data.otherNeed || data.otherNeed.trim().length < 2)) {
        return false;
    }
    return true;
}, {
    message: 'Please specify your need if you select "Other".',
    path: ['otherNeed'],
});

export const ContactFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    email: z.string().email('Please enter a valid email address.'),
    subject: z.string().min(5, 'Subject must be at least 5 characters.'),
    message: z.string().min(10, 'Message must be at least 10 characters.'),
});

export const CommentFormSchema = z.object({
    comment: z.string().min(5, 'Comment must be at least 5 characters.').max(500, 'Comment cannot exceed 500 characters.'),
});

    