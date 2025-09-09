import admin from 'firebase-admin';

const db = admin.firestore();

export interface GroupMember {
  userID: string;
  username: string;
  name: string;
  bio: string;
  isApproved: boolean;
  joinedOn: admin.firestore.Timestamp;
}

export interface Group {
  id?: string;
  name: string;
  admins: string[];
  createdOn: admin.firestore.Timestamp;
  updatedOn: admin.firestore.Timestamp;
  itineraryID: string;
  chatID: string;
  inviteCode: string;
  members: GroupMember[];
}

export interface CreateGroupData {
  userID: string;
  username: string;
  name: string;
  bio: string;
  itineraryID?: string;
}

export interface JoinGroupData {
  userID: string;
  username: string;
  name: string;
  bio: string;
}

// Generate a random 8-character invite code
function generateInviteCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Check if invite code already exists
async function isInviteCodeUnique(inviteCode: string): Promise<boolean> {
  const snapshot = await db.collection('groups').where('inviteCode', '==', inviteCode).get();
  return snapshot.empty;
}

// Generate a unique invite code
async function generateUniqueInviteCode(): Promise<string> {
  let inviteCode: string;
  let isUnique = false;
  
  do {
    inviteCode = generateInviteCode();
    isUnique = await isInviteCodeUnique(inviteCode);
  } while (!isUnique);
  
  return inviteCode;
}

// Get all groups where user is a member
export async function getGroups(userID: string): Promise<Group[]> {
  try {
    // Since we can't efficiently query nested objects in Firestore arrays,
    // we need to get all groups and filter them
    const groupsSnapshot = await db.collection('groups').get();

    if (groupsSnapshot.empty) {
      return [];
    }

    const groups: Group[] = [];
    groupsSnapshot.forEach(doc => {
      const data = doc.data();
      // Check if the user is a member of this group
      const isMember = data.members && data.members.some((member: GroupMember) => member.userID === userID);
      if (isMember) {
        groups.push({
          id: doc.id,
          ...data
        } as Group);
      }
    });

    return groups;
  } catch (error) {
    console.error('Error getting groups:', error);
    throw new Error('Failed to get groups');
  }
}

// Get specific group data by group ID
export async function getGroupData(groupID: string): Promise<Group | null> {
  try {
    const groupDoc = await db.collection('groups').doc(groupID).get();
    
    if (!groupDoc.exists) {
      return null;
    }

    return {
      id: groupDoc.id,
      ...groupDoc.data()
    } as Group;
  } catch (error) {
    console.error('Error getting group data:', error);
    throw new Error('Failed to get group data');
  }
}

// Create a new group
export async function createGroup(groupName: string, adminData: CreateGroupData): Promise<{ groupId: string; inviteCode: string }> {
  try {
    const now = admin.firestore.Timestamp.now();
    const inviteCode = await generateUniqueInviteCode();
    
    const adminMember: GroupMember = {
      userID: adminData.userID,
      username: adminData.username,
      name: adminData.name,
      bio: adminData.bio,
      isApproved: true,
      joinedOn: now
    };

    const groupData: Omit<Group, 'id'> = {
      name: groupName,
      admins: [adminData.userID],
      createdOn: now,
      updatedOn: now,
      itineraryID: adminData.itineraryID || '',
      chatID: '', // Will be set when chat is created
      inviteCode: inviteCode,
      members: [adminMember]
    };

    const docRef = await db.collection('groups').add(groupData);
    return { groupId: docRef.id, inviteCode };
  } catch (error) {
    console.error('Error creating group:', error);
    throw new Error('Failed to create group');
  }
}

// Join a group (pending approval) using invite code
export async function joinGroup(inviteCode: string, userData: JoinGroupData): Promise<void> {
  try {
    // Find the group by invite code
    const groupsSnapshot = await db.collection('groups').where('inviteCode', '==', inviteCode).get();
    
    if (groupsSnapshot.empty) {
      throw new Error('Invalid invite code');
    }

    const groupDoc = groupsSnapshot.docs[0];
    const groupData = groupDoc.data() as Group;
    
    // Check if user is already a member
    const existingMember = groupData.members.find(member => member.userID === userData.userID);
    if (existingMember) {
      throw new Error('User is already a member of this group');
    }

    const newMember: GroupMember = {
      userID: userData.userID,
      username: userData.username,
      name: userData.name,
      bio: userData.bio,
      isApproved: false,
      joinedOn: admin.firestore.Timestamp.now()
    };

    await groupDoc.ref.update({
      members: admin.firestore.FieldValue.arrayUnion(newMember),
      updatedOn: admin.firestore.Timestamp.now()
    });
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
}

// Approve user to join group
export async function approveUserToGroup(groupID: string, userID: string, adminID: string): Promise<void> {
  try {
    const groupRef = db.collection('groups').doc(groupID);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      throw new Error('Group not found');
    }

    const groupData = groupDoc.data() as Group;
    
    // Check if the requester is an admin
    if (!groupData.admins.includes(adminID)) {
      throw new Error('Only group admins can approve members');
    }

    // Find the member to approve
    const memberIndex = groupData.members.findIndex(member => member.userID === userID);
    if (memberIndex === -1) {
      throw new Error('User is not a member of this group');
    }

    if (groupData.members[memberIndex].isApproved) {
      throw new Error('User is already approved');
    }

    // Update the member's approval status
    const updatedMembers = [...groupData.members];
    updatedMembers[memberIndex] = {
      ...updatedMembers[memberIndex],
      isApproved: true
    };

    await groupRef.update({
      members: updatedMembers,
      updatedOn: admin.firestore.Timestamp.now()
    });
  } catch (error) {
    console.error('Error approving user to group:', error);
    throw error;
  }
}