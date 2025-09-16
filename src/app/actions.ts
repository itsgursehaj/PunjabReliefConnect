
'use server';

import {revalidatePath} from 'next/cache';
import type {Village, ContactSubmission, ContactMessageStatus, Comment, Report, Volunteer, AppUser, AuditLog, AuditLogAction, CloseVote, VillageStatus} from '@/types';
import { FormSchema, ContactFormSchema, CommentFormSchema } from '@/types';
import { getCoordinates } from '@/lib/maps';
import { db, auth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import {config} from 'dotenv';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { FieldValue } from 'firebase-admin/firestore';


// Load environment variables for server actions
config({path: `.env`});

const PRIMARY_ADMIN_EMAIL = process.env.FIREBASE_PRIMARY_ADMIN_EMAIL;

// --- Firestore Collection References ---
const villagesCollection = db.collection('villages');
const contactMessagesCollection = db.collection('contactMessages');
const auditLogCollection = db.collection('auditLog');


function getIpAddress() {
    const headersList = headers();
    const ipHeader = headersList.get('x-forwarded-for');
    if (!ipHeader) return 'N/A';
    const ip = ipHeader.split(',')[0].trim();
    // For local development, you might get '::1', so we can use a test IP
    if (ip === '::1' || ip === '127.0.0.1') {
      return '8.8.8.8'; // Google's DNS for testing geolocation
    }
    return ip;
}


async function logAuditEvent(
    user: DecodedIdToken,
    action: AuditLogAction,
    details: string
) {
    const ipAddress = getIpAddress();
    let locationData: Partial<AuditLog> = {};

    if (ipAddress && ipAddress !== 'N/A') {
        try {
            const geoResponse = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,message,country,countryCode,city`);
            const geoData = await geoResponse.json();
            if (geoData.status === 'success') {
                locationData = {
                    city: geoData.city,
                    country: geoData.country,
                    countryCode: geoData.countryCode
                };
            }
        } catch (e) {
            console.error("Failed to fetch geolocation data for IP:", ipAddress, e);
        }
    }

    const newLog: Omit<AuditLog, 'id'> = {
        timestamp: new Date().toISOString(),
        userId: user.email!,
        userName: user.name || user.email!.split('@')[0],
        action,
        details,
        ipAddress,
        ...locationData,
    };
    await auditLogCollection.add(newLog);
}


// Lightweight user verification for volunteer actions
async function verifyUser(idToken: string) {
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        if (!decodedToken.email) {
            throw new Error("No email found in user token.");
        }
        if (decodedToken.blocked) {
            throw new Error("This account has been blocked by an administrator.");
        }
        return decodedToken;
    } catch (error) {
        console.error("Error verifying user token:", error);
        throw new Error("Invalid authentication token. Please sign in again.");
    }
}

export async function saveContactMessage(
    prevState: { message: string },
    formData: FormData
) {
    const validatedFields = ContactFormSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
    });

    if (!validatedFields.success) {
        return {
            message: `Invalid form data: ${JSON.stringify(validatedFields.error.flatten().fieldErrors)}`,
        };
    }

    try {
        const newSubmission: Omit<ContactSubmission, 'id'> = {
            timestamp: new Date().toISOString(),
            status: 'new',
            ...validatedFields.data,
        };

        await contactMessagesCollection.add(newSubmission);

        revalidatePath('/admin/messages');
        return { message: 'success' };
    } catch (error) {
        console.error('Failed to save contact message:', error);
        return { message: 'Failed to save your message. Please try again.' };
    }
}


export async function createReliefRequest(
  prevState: {message: string},
  formData: FormData
) {
  const validatedFields = FormSchema.safeParse({
    name: formData.get('name'),
    contactNumber: formData.get('contactNumber'),
    villageName: formData.get('villageName'),
    district: formData.get('district'),
    pincode: formData.get('pincode'),
    needs: formData.getAll('needs'),
    otherNeed: formData.get('otherNeed'),
    privacyPolicy: formData.get('privacyPolicy') === 'true',
  });

  if (!validatedFields.success) {
    return {
      message: `Invalid form data: ${JSON.stringify(validatedFields.error.flatten().fieldErrors)}`,
    };
  }

  try {
    const querySnapshot = await villagesCollection
        .where('villageName', '==', validatedFields.data.villageName.trim())
        .where('contactNumber', '==', validatedFields.data.contactNumber)
        .get();

    if (!querySnapshot.empty) {
        return { message: 'A relief request for this village with the same contact number already exists. Please check the dashboard or contact us if you need to update an existing request.' };
    }

    const address = `${validatedFields.data.villageName}, ${validatedFields.data.district}, ${validatedFields.data.pincode}, Punjab, India`;
    const geocodeResult = await getCoordinates(address);

    if (geocodeResult.error) {
      console.warn(`Geocoding failed for address "${address}": ${geocodeResult.error}. Proceeding without coordinates.`);
    }

    const finalNeeds = validatedFields.data.needs
      .filter(need => need !== 'Other');
    if (validatedFields.data.otherNeed) {
      finalNeeds.push(validatedFields.data.otherNeed);
    }

    if (finalNeeds.length === 0) {
      return { message: 'Please select at least one need.' };
    }

    const newRequestDoc = villagesCollection.doc();
    const newRequest: Village = {
        id: newRequestDoc.id,
        timestamp: new Date().toISOString(),
        name: validatedFields.data.name,
        contactNumber: validatedFields.data.contactNumber,
        villageName: validatedFields.data.villageName,
        district: validatedFields.data.district,
        pincode: validatedFields.data.pincode,
        needs: finalNeeds.join(', '),
        status: 'open',
        lat: geocodeResult.coordinates?.lat ?? null,
        lng: geocodeResult.coordinates?.lng ?? null,
        comments: [],
        reports: [],
        views: 0,
        assignedTo: [],
        closeVotes: [],
    }

    await newRequestDoc.set(newRequest);

    revalidatePath('/dashboard');
    revalidatePath('/');
    return {message: 'success'};
  } catch (error) {
    console.error('Failed to write relief request:', error);
    return { message: 'Failed to save the request. Please try again.' };
  }
}


export async function getReliefRequests(forceRefresh = false): Promise<{
  data?: Village[];
  error?: string;
}> {
  try {
    const collections = await db.listCollections();
    const collectionExists = collections.some((col) => col.id === 'villages');

    if (!collectionExists) {
      console.log("The 'villages' collection does not exist yet. Returning empty array.");
      return { data: [] }; 
    }
    
    const snapshot = await villagesCollection.orderBy('timestamp', 'desc').get();
    const data: Village[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Village));
    return {data: data};
  } catch (error) {
    console.error('Error reading from Firestore in getReliefRequests:', error);
    return {error: 'Failed to fetch relief requests from database.'};
  }
}

export async function getReliefRequestById(id: string): Promise<{
  data?: Village;
  error?: string;
}> {
  try {
    const doc = await villagesCollection.doc(id).get();
    if (!doc.exists) {
      return { error: 'Relief request not found.' };
    }
    const village = { id: doc.id, ...doc.data() } as Village;
    return { data: village };
  } catch (error) {
    console.error(`Error reading from Firestore for ID ${id}:`, error);
    return { error: 'Failed to fetch relief request from database.' };
  }
}

export async function getReliefRequestsByVillageName(name: string): Promise<{
    data?: Village[];
    error?: string;
}> {
    try {
        const collections = await db.listCollections();
        const collectionExists = collections.some((col) => col.id === 'villages');
        if (!collectionExists) {
            return { data: [] };
        }

        const snapshot = await villagesCollection.where('villageName', '==', name).get();
        if (snapshot.empty) {
            return { data: [] };
        }
        const villages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Village));
        return { data: villages };
    } catch (error) {
        console.error(`Error reading from Firestore for village ${name}:`, error);
        return { error: 'Failed to fetch relief requests from database.' };
    }
}


export async function getContactMessages(): Promise<{
    data?: ContactSubmission[];
    unreadCount?: number;
    error?: string;
}> {
    try {
        const collections = await db.listCollections();
        const collectionExists = collections.some(col => col.id === 'contactMessages');
        if (!collectionExists) {
            return { data: [], unreadCount: 0 };
        }
        const snapshot = await contactMessagesCollection.orderBy('timestamp', 'desc').get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactSubmission));
        const unreadCount = data.filter(m => m.status === 'new').length;
        return { data, unreadCount };
    } catch (error) {
        console.error('Error reading contact messages:', error);
        return { error: 'Failed to fetch contact messages.' };
    }
}


export async function deleteReliefRequest(villageId: string, idToken: string) {
    try {
        const decodedToken = await verifyUser(idToken);
        const userEmail = decodedToken.email;

        if (userEmail !== PRIMARY_ADMIN_EMAIL) {
            return { error: 'You are not authorized to perform this action.' };
        }

        const villageDoc = await villagesCollection.doc(villageId).get();
        if (!villageDoc.exists) {
            return { error: 'Village not found.' };
        }
        const villageName = villageDoc.data()?.villageName;
        await villagesCollection.doc(villageId).delete();

        await logAuditEvent(decodedToken, 'DELETE_REQUEST', `Deleted single request for village: ${villageName} (ID: ${villageId})`);

        revalidatePath('/dashboard');
        revalidatePath(`/village/${villageId}`);
        return { success: true };

    } catch (error) {
        console.error('Error deleting relief request:', error);
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: 'Failed to delete request. An unknown error occurred.' };
    }
}


export async function deleteVillageRequestsByName(villageName: string, idToken: string) {
    try {
        const decodedToken = await verifyUser(idToken);
        const userEmail = decodedToken.email;

        if (userEmail !== PRIMARY_ADMIN_EMAIL) {
            return { error: 'You are not authorized to perform this action.' };
        }

        const snapshot = await villagesCollection.where('villageName', '==', villageName.trim()).get();

        if (snapshot.empty) {
            return { error: 'No requests found for this village to delete.' };
        }

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        await logAuditEvent(decodedToken, 'DELETE_ALL_REQUESTS', `Deleted all requests for village: ${villageName}`);

        revalidatePath('/dashboard');
        revalidatePath(`/village/${villageName}`);
        return { success: true };

    } catch (error) {
        console.error('Error deleting village requests:', error);
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: 'Failed to delete requests. An unknown error occurred.' };
    }
}

export async function updateMessageStatus(
  messageId: string,
  status: ContactMessageStatus,
  idToken: string
) {
    try {
        const decodedToken = await verifyUser(idToken);
        const userEmail = decodedToken.email;

        if (userEmail !== PRIMARY_ADMIN_EMAIL) {
            return { error: 'You are not authorized to perform this action.' };
        }

        const messageRef = contactMessagesCollection.doc(messageId);
        await messageRef.update({ status });

        const updatedDoc = await messageRef.get();
        const updatedMessage = { id: updatedDoc.id, ...updatedDoc.data() } as ContactSubmission;

        await logAuditEvent(decodedToken, 'UPDATE_MESSAGE_STATUS', `Updated message (ID: ${messageId.substring(0,5)}) status to ${status}`);

        revalidatePath('/admin/messages');
        revalidatePath('/dashboard');

        return { success: true, updatedMessage };

    } catch (error) {
        console.error('Error updating message status:', error);
         if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: 'Failed to update message status. An unknown error occurred.' };
    }
}


export async function addCommentToRequest(
  villageId: string,
  formData: FormData,
  idToken: string
) {
    try {
        const decodedToken = await verifyUser(idToken);

        const validatedFields = CommentFormSchema.safeParse({
            comment: formData.get('comment'),
        });

        if (!validatedFields.success) {
            return { error: 'Invalid comment data.' };
        }

        const villageRef = villagesCollection.doc(villageId);

        const newComment: Comment = {
            id: new Date().toISOString() + Math.random(),
            timestamp: new Date().toISOString(),
            author: decodedToken.email!,
            authorName: decodedToken.name || decodedToken.email!.split('@')[0],
            text: validatedFields.data.comment,
        };

        await villageRef.update({
            comments: FieldValue.arrayUnion(newComment)
        });

        const updatedDoc = await villageRef.get();
        const updatedVillage = { id: updatedDoc.id, ...updatedDoc.data() } as Village;
        const villageName = updatedVillage.villageName;

        await logAuditEvent(decodedToken, 'ADD_COMMENT', `Added comment to request for ${villageName}: "${validatedFields.data.comment.substring(0, 30)}..."`);

        revalidatePath('/dashboard');
        revalidatePath(`/village/${villageName}`);
        return { success: true, updatedVillage };

    } catch (error) {
        console.error('Error adding comment:', error);
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: 'Failed to add comment. An unknown error occurred.' };
    }
}

export async function deleteCommentFromRequest(villageId: string, commentId: string, idToken: string) {
    try {
        const decodedToken = await verifyUser(idToken);
        const userEmail = decodedToken.email!;

        const villageRef = villagesCollection.doc(villageId);
        const doc = await villageRef.get();

        if (!doc.exists) {
            return { error: 'Village not found.' };
        }

        const village = doc.data() as Village;
        const commentToDelete = village.comments?.find(c => c.id === commentId);

        if (!commentToDelete) {
            return { error: 'Comment not found.' };
        }

        if (commentToDelete.author !== userEmail && userEmail !== PRIMARY_ADMIN_EMAIL) {
            return { error: 'You are not authorized to delete this comment.' };
        }

        await villageRef.update({
            comments: FieldValue.arrayRemove(commentToDelete)
        });

        const updatedDoc = await villageRef.get();
        const updatedVillage = { id: updatedDoc.id, ...updatedDoc.data() } as Village;

        await logAuditEvent(decodedToken, 'DELETE_COMMENT', `Deleted a comment from request for ${village.villageName}.`);

        revalidatePath('/dashboard');
        revalidatePath(`/village/${village.villageName}`);
        return { success: true, updatedVillage };

    } catch (error) {
        console.error('Error deleting comment:', error);
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: 'Failed to delete comment. An unknown error occurred.' };
    }
}


export async function joinRequest(villageId: string, idToken: string) {
    try {
        const decodedToken = await verifyUser(idToken);
        const villageRef = villagesCollection.doc(villageId);
        const doc = await villageRef.get();

        if (!doc.exists) {
            return { error: 'Village not found.' };
        }

        const village = doc.data() as Village;

        if (village.assignedTo?.some(v => v.email === decodedToken.email!)) {
            return { error: 'You are already working on this request.' };
        }

        const newVolunteer: Volunteer = { email: decodedToken.email!, name: decodedToken.name || decodedToken.email!.split('@')[0] };

        await villageRef.update({
            assignedTo: FieldValue.arrayUnion(newVolunteer)
        });

        const updatedDoc = await villageRef.get();
        const updatedVillage = { id: updatedDoc.id, ...updatedDoc.data() } as Village;


        await logAuditEvent(decodedToken, 'JOIN_REQUEST', `Joined relief effort for village: ${village.villageName}`);

        revalidatePath('/dashboard');
        revalidatePath(`/village/${village.villageName}`);
        return { success: true, updatedVillage };

    } catch (error) {
        console.error('Error joining request:', error);
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: 'Failed to join request. An unknown error occurred.' };
    }
}


export async function unassignRequest(villageId: string, idToken: string) {
    try {
        const decodedToken = await verifyUser(idToken);
        const villageRef = villagesCollection.doc(villageId);
        const doc = await villageRef.get();

        if (!doc.exists) {
            return { error: 'Village not found.' };
        }

        const village = doc.data() as Village;
        const volunteerToRemove = village.assignedTo?.find(v => v.email === decodedToken.email!);


        if (!volunteerToRemove) {
            return { error: 'You are not assigned to this request.' };
        }

        await villageRef.update({
            assignedTo: FieldValue.arrayRemove(volunteerToRemove)
        });

        const updatedDoc = await villageRef.get();
        const updatedVillage = { id: updatedDoc.id, ...updatedDoc.data() } as Village;

        await logAuditEvent(decodedToken, 'UNASSIGN_REQUEST', `Left relief effort for village: ${village.villageName}`);

        revalidatePath('/dashboard');
        revalidatePath(`/village/${village.villageName}`);
        return { success: true, updatedVillage };

    } catch (error) {
        console.error('Error unassigning request:', error);
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: 'Failed to unassign request. An unknown error occurred.' };
    }
}


export async function addReportToRequest(
  villageId: string,
  reason: string,
  idToken: string
) {
    try {
        const decodedToken = await verifyUser(idToken);

        if (!reason || reason.trim().length < 5) {
            return { error: 'Please provide a valid reason for the report.' };
        }

        const villageRef = villagesCollection.doc(villageId);

        const newReport: Report = {
            id: new Date().toISOString() + Math.random(),
            timestamp: new Date().toISOString(),
            reporter: decodedToken.email!,
            reporterName: decodedToken.name || decodedToken.email!.split('@')[0],
            reason,
        };

        await villageRef.update({
            reports: FieldValue.arrayUnion(newReport)
        });

        const updatedDoc = await villageRef.get();
        const updatedVillage = { id: updatedDoc.id, ...updatedDoc.data() } as Village;


        await logAuditEvent(decodedToken, 'ADD_REPORT', `Reported request for ${updatedVillage.villageName}. Reason: ${reason.substring(0, 30)}...`);

        revalidatePath('/dashboard');
        revalidatePath(`/village/${updatedVillage.villageName}`);
        return { success: true, updatedVillage };

    } catch (error) {
        console.error('Error reporting request:', error);
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: 'Failed to report request. An unknown error occurred.' };
    }
}

export async function deleteReportFromRequest(villageId: string, reportId: string, idToken: string) {
    try {
        const decodedToken = await verifyUser(idToken);
        const userEmail = decodedToken.email!;

        if (userEmail !== PRIMARY_ADMIN_EMAIL) {
            return { error: 'You are not authorized to delete reports.' };
        }

        const villageRef = villagesCollection.doc(villageId);
        const doc = await villageRef.get();

        if (!doc.exists) {
            return { error: 'Village not found.' };
        }

        const village = doc.data() as Village;
        const reportToDelete = village.reports?.find(r => r.id === reportId);

        if (!reportToDelete) {
            return { error: 'Report not found.' };
        }

        await villageRef.update({
            reports: FieldValue.arrayRemove(reportToDelete)
        });

        const updatedDoc = await villageRef.get();
        const updatedVillage = { id: updatedDoc.id, ...updatedDoc.data() } as Village;

        await logAuditEvent(decodedToken, 'DELETE_REPORT', `Deleted a report from request for ${village.villageName}.`);

        revalidatePath('/dashboard');
        revalidatePath(`/village/${village.villageName}`);
        return { success: true, updatedVillage };

    } catch (error) {
        console.error('Error deleting report:', error);
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: 'Failed to delete report. An unknown error occurred.' };
    }
}


export async function incrementViewCount(villageId: string, idToken: string): Promise<{ success: boolean; error?: string; views?: number }> {
    try {
        const decodedToken = await verifyUser(idToken);
        const villageRef = villagesCollection.doc(villageId);
        
        await villageRef.update({
            views: FieldValue.increment(1)
        });

        const updatedDoc = await villageRef.get();
        const village = updatedDoc.data() as Village;
        
        await logAuditEvent(decodedToken, 'VIEW_VILLAGE_DETAILS', `Viewed details for village: ${village.villageName}`);

        revalidatePath('/dashboard');
        revalidatePath(`/village/${village.villageName}`);
        return { success: true, views: village.views };
    } catch (error) {
        console.error('Error incrementing view count:', error);
        return { success: false, error: 'Failed to update view count.' };
    }
}

export async function logCallClick(villageId: string, idToken: string): Promise<{ success: boolean; error?: string }> {
    try {
        const decodedToken = await verifyUser(idToken);
        const villageDoc = await villagesCollection.doc(villageId).get();
        if (!villageDoc.exists) {
            return { success: false, error: 'Village not found.' };
        }
        const village = villageDoc.data() as Village;
        await logAuditEvent(decodedToken, 'CALL_CONTACT', `Clicked to call contact for village: ${village.villageName}`);
        return { success: true };
    } catch (error) {
        console.error('Error logging call click:', error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to log action.' };
    }
}


export async function logMapClick(villageId: string, idToken: string): Promise<{ success: boolean; error?: string }> {
    try {
        const decodedToken = await verifyUser(idToken);
        const villageDoc = await villagesCollection.doc(villageId).get();
        if (!villageDoc.exists) {
            return { success: false, error: 'Village not found.' };
        }
        const village = villageDoc.data() as Village;
        await logAuditEvent(decodedToken, 'VIEW_MAP', `Clicked to open map for village: ${village.villageName}`);
        return { success: true };
    } catch (error) {
        console.error('Error logging map click:', error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to log action.' };
    }
}

export async function logLogin(idToken: string): Promise<{ success: boolean; error?: string }> {
    try {
        const decodedToken = await verifyUser(idToken);
        await logAuditEvent(decodedToken, 'LOGIN', `User logged in.`);
        return { success: true };
    } catch (error) {
        console.error('Error logging login event:', error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to log login action.' };
    }
}

export async function logLogout(idToken: string): Promise<{ success: boolean; error?: string }> {
    try {
        const decodedToken = await verifyUser(idToken);
        await logAuditEvent(decodedToken, 'LOGOUT', `User logged out.`);
        return { success: true };
    } catch (error) {
        console.error('Error logging logout event:', error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to log logout action.' };
    }
}


export async function getAllUsers(idToken: string): Promise<{ users?: AppUser[], error?: string }> {
    try {
        const decodedToken = await verifyUser(idToken);
        if (decodedToken.email !== PRIMARY_ADMIN_EMAIL && !decodedToken.customClaims?.admin) {
            return { error: 'You are not authorized to perform this action.' };
        }
        await logAuditEvent(decodedToken, 'VIEW_USERS', `Viewed the user management page.`);

        const listUsersResult = await auth.listUsers(1000);
        const users = listUsersResult.users.map(userRecord => {
            return {
                uid: userRecord.uid,
                email: userRecord.email || 'N/A',
                displayName: userRecord.displayName || 'N/A',
                role: userRecord.email === PRIMARY_ADMIN_EMAIL ? 'admin' : (userRecord.customClaims?.admin ? 'admin' : (userRecord.customClaims?.blocked ? 'blocked' : 'user')),
                lastSignInTime: userRecord.metadata.lastSignInTime,
                creationTime: userRecord.metadata.creationTime,
            };
        });
        return { users };
    } catch (error) {
        console.error('Error getting all users:', error);
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: 'An unknown error occurred while fetching users.' };
    }
}

export async function setUserRole(uid: string, role: 'admin' | 'user' | 'blocked', idToken: string): Promise<{ success: boolean; error?: string }> {
    try {
        const decodedToken = await verifyUser(idToken);
        if (decodedToken.email !== PRIMARY_ADMIN_EMAIL && !decodedToken.customClaims?.admin) {
            return { success: false, error: 'You are not authorized to perform this action.' };
        }

        const userToUpdate = await auth.getUser(uid);
        if (userToUpdate.email === PRIMARY_ADMIN_EMAIL) {
            return { success: false, error: 'The primary admin role cannot be changed.' };
        }

        const claims: { [key: string]: boolean } = { admin: false, blocked: false };
        if (role === 'admin') {
            claims.admin = true;
        } else if (role === 'blocked') {
            claims.blocked = true;
        }

        await auth.setCustomUserClaims(uid, claims);

        await logAuditEvent(decodedToken, 'SET_USER_ROLE', `Set role for user ${userToUpdate.email} to ${role}.`);

        revalidatePath('/admin/users');
        return { success: true };

    } catch (error) {
        console.error(`Error setting role for user ${uid}:`, error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'An unknown error occurred.' };
    }
}

export async function getAuditLogs(idToken: string): Promise<{ logs?: AuditLog[], error?: string }> {
    try {
        const decodedToken = await verifyUser(idToken);
        if (decodedToken.email !== PRIMARY_ADMIN_EMAIL && !decodedToken.customClaims?.admin) {
            return { error: 'You are not authorized to perform this action.' };
        }
        
        const collections = await db.listCollections();
        const collectionExists = collections.some(col => col.id === 'auditLog');
        if (!collectionExists) {
            return { logs: [] };
        }

        const snapshot = await auditLogCollection.orderBy('timestamp', 'desc').limit(500).get();
        const logs = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as AuditLog);
        return { logs };
    } catch (error) {
        console.error('Error getting audit logs:', error);
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: 'An unknown error occurred while fetching audit logs.' };
    }
}

export async function voteToCloseRequest(villageId: string, idToken: string) {
    try {
        const decodedToken = await verifyUser(idToken);
        const villageRef = villagesCollection.doc(villageId);
        const doc = await villageRef.get();

        if (!doc.exists) {
            return { error: 'Village not found.' };
        }

        const village = doc.data() as Village;

        if (village.closeVotes?.some(v => v.userId === decodedToken.email!)) {
            return { error: 'You have already voted to close this request.' };
        }

        const newVote: CloseVote = {
            userId: decodedToken.email!,
            userName: decodedToken.name || decodedToken.email!.split('@')[0],
            timestamp: new Date().toISOString()
        };

        await villageRef.update({
            closeVotes: FieldValue.arrayUnion(newVote)
        });

        const updatedDoc = await villageRef.get();
        const updatedVillage = { id: updatedDoc.id, ...updatedDoc.data() } as Village;

        await logAuditEvent(decodedToken, 'VOTE_CLOSE_REQUEST', `Voted to close request for village: ${village.villageName}`);

        revalidatePath(`/village/${village.villageName}`);
        return { success: true, updatedVillage };

    } catch (error) {
        console.error('Error voting to close request:', error);
        if (error instanceof Error) return { error: error.message };
        return { error: 'Failed to vote. An unknown error occurred.' };
    }
}

export async function updateRequestStatus(villageName: string, status: VillageStatus, idToken: string) {
    try {
        const decodedToken = await verifyUser(idToken);
        if (decodedToken.email !== PRIMARY_ADMIN_EMAIL) {
            return { error: 'You are not authorized to perform this action.' };
        }

        const snapshot = await villagesCollection.where('villageName', '==', villageName).get();
        if (snapshot.empty) {
            return { error: 'No requests found for this village.' };
        }

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { status: status });
        });
        await batch.commit();

        await logAuditEvent(decodedToken, 'UPDATE_REQUEST_STATUS', `Updated status to ${status} for all requests in village: ${villageName}`);

        revalidatePath('/dashboard');
        revalidatePath(`/village/${villageName}`);
        return { success: true };

    } catch (error) {
        console.error(`Error updating status for ${villageName}:`, error);
        if (error instanceof Error) return { error: error.message };
        return { error: 'Failed to update status. An unknown error occurred.' };
    }
}
