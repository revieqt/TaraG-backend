import admin from 'firebase-admin';

const db = admin.firestore();

export interface GroupMember {
  userID: string;
  username: string;
  name: string;
  profileImage: string;
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
  profileImage: string;
  itineraryID?: string;
}

export interface JoinGroupData {
  userID: string;
  username: string;
  name: string;
  profileImage: string;
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
      profileImage: adminData.profileImage,
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
      profileImage: userData.profileImage,
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

// Respond to join request (approve or reject)
export async function respondJoinRequest(groupID: string, userID: string, adminID: string, response: boolean): Promise<void> {
  try {
    const groupRef = db.collection('groups').doc(groupID);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      throw new Error('Group not found');
    }

    const groupData = groupDoc.data() as Group;
    
    // Check if the requester is an admin
    if (!groupData.admins.includes(adminID)) {
      throw new Error('Only group admins can respond to join requests');
    }

    // Find the member
    const memberIndex = groupData.members.findIndex(member => member.userID === userID);
    if (memberIndex === -1) {
      throw new Error('User is not a member of this group');
    }

    if (groupData.members[memberIndex].isApproved) {
      throw new Error('User is already approved');
    }

    let updatedMembers = [...groupData.members];

    if (response) {
      // Approve: Update the member's approval status
      updatedMembers[memberIndex] = {
        ...updatedMembers[memberIndex],
        isApproved: true
      };
    } else {
      // Reject: Remove the user from members array
      updatedMembers = updatedMembers.filter(member => member.userID !== userID);
    }

    await groupRef.update({
      members: updatedMembers,
      updatedOn: admin.firestore.Timestamp.now()
    });
  } catch (error) {
    console.error('Error responding to join request:', error);
    throw error;
  }
}

// Promote user to admin
export async function promoteUserToAdmin(groupID: string, userID: string, adminID: string): Promise<void> {
  try {
    const groupRef = db.collection('groups').doc(groupID);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      throw new Error('Group not found');
    }

    const groupData = groupDoc.data() as Group;
    
    // Check if the requester is an admin
    if (!groupData.admins.includes(adminID)) {
      throw new Error('Only group admins can promote users');
    }

    // Check if user is already an admin
    if (groupData.admins.includes(userID)) {
      throw new Error('User is already an admin');
    }

    // Check if user is an approved member
    const member = groupData.members.find(member => member.userID === userID);
    if (!member) {
      throw new Error('User is not a member of this group');
    }

    if (!member.isApproved) {
      throw new Error('User must be an approved member to become admin');
    }

    // Add user to admins array
    const updatedAdmins = [...groupData.admins, userID];

    await groupRef.update({
      admins: updatedAdmins,
      updatedOn: admin.firestore.Timestamp.now()
    });
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    throw error;
  }
}

// Kick user from group
export async function kickUserFromGroup(groupID: string, userID: string, adminID: string): Promise<void> {
  try {
    const groupRef = db.collection('groups').doc(groupID);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      throw new Error('Group not found');
    }

    const groupData = groupDoc.data() as Group;
    
    // Check if the requester is an admin
    if (!groupData.admins.includes(adminID)) {
      throw new Error('Only group admins can kick users');
    }

    // Check if user exists in the group
    const memberExists = groupData.members.some(member => member.userID === userID);
    if (!memberExists) {
      throw new Error('User is not a member of this group');
    }

    // Allow admin to kick themselves (for leave group functionality)
    // Removed the restriction that prevented admins from kicking themselves

    // Remove user from members array
    const updatedMembers = groupData.members.filter(member => member.userID !== userID);
    
    // Remove user from admins array if they are an admin
    const updatedAdmins = groupData.admins.filter(admin => admin !== userID);

    await groupRef.update({
      members: updatedMembers,
      admins: updatedAdmins,
      updatedOn: admin.firestore.Timestamp.now()
    });
  } catch (error) {
    console.error('Error kicking user from group:', error);
    throw error;
  }
}

// Link itinerary to group
export async function linkGroupItinerary(groupID: string, itineraryID: string, adminID: string): Promise<void> {
  try {
    const groupRef = db.collection('groups').doc(groupID);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      throw new Error('Group not found');
    }

    const groupData = groupDoc.data() as Group;
    
    // Check if the requester is an admin
    if (!groupData.admins.includes(adminID)) {
      throw new Error('Only group admins can link itineraries');
    }

    await groupRef.update({
      itineraryID: itineraryID,
      updatedOn: admin.firestore.Timestamp.now()
    });
  } catch (error) {
    console.error('Error linking itinerary to group:', error);
    throw error;
  }
}

// Delete/unlink itinerary from group
export async function deleteGroupItinerary(groupID: string, adminID: string): Promise<void> {
  try {
    const groupRef = db.collection('groups').doc(groupID);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      throw new Error('Group not found');
    }

    const groupData = groupDoc.data() as Group;
    
    // Check if the requester is an admin
    if (!groupData.admins.includes(adminID)) {
      throw new Error('Only group admins can unlink itineraries');
    }

    await groupRef.update({
      itineraryID: '',
      updatedOn: admin.firestore.Timestamp.now()
    });
  } catch (error) {
    console.error('Error unlinking itinerary from group:', error);
    throw error;
  }
}

// Delete entire group
export async function deleteGroup(groupID: string, adminID: string): Promise<void> {
  try {
    const groupRef = db.collection('groups').doc(groupID);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      throw new Error('Group not found');
    }

    const groupData = groupDoc.data() as Group;
    
    // Check if the requester is an admin
    if (!groupData.admins.includes(adminID)) {
      throw new Error('Only group admins can delete groups');
    }

    // Delete the group document
    await groupRef.delete();
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
}