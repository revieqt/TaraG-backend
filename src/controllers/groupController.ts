import { Request, Response } from 'express';
import * as groupService from '../services/groupService';

interface AuthRequest extends Request {
  user?: any;
}

interface GetGroupsRequest extends AuthRequest {
  body: {
    userID: string;
  };
}

interface GetGroupDataRequest extends AuthRequest {
  body: {
    groupID: string;
  };
}

interface CreateGroupRequest extends AuthRequest {
  body: {
    groupName: string;
    userID: string;
    username: string;
    name: string;
    bio: string;
    itineraryID?: string;
  };
}

interface JoinGroupRequest extends AuthRequest {
  body: {
    inviteCode: string;
    userID: string;
    username: string;
    name: string;
    bio: string;
  };
}

interface ApproveUserRequest extends AuthRequest {
  body: {
    groupID: string;
    userID: string;
    adminID: string;
  };
}

// Get all groups where user is a member
export const getGroups = async (req: GetGroupsRequest, res: Response) => {
  try {
    console.log('🔍 Getting groups for user:', req.body.userID);
    
    const { userID } = req.body;
    
    if (!userID) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const groups = await groupService.getGroups(userID);
    
    console.log('✅ Successfully retrieved groups:', groups.length);
    
    res.status(200).json({
      success: true,
      data: groups,
      message: 'Groups retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error getting groups:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get groups'
    });
  }
};

// Get specific group data
export const getGroupData = async (req: GetGroupDataRequest, res: Response) => {
  try {
    console.log('🔍 Getting group data for ID:', req.body.groupID);
    
    const { groupID } = req.body;
    
    if (!groupID) {
      return res.status(400).json({ 
        success: false, 
        message: 'Group ID is required' 
      });
    }

    const group = await groupService.getGroupData(groupID);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    console.log('✅ Successfully retrieved group data');
    
    res.status(200).json({
      success: true,
      data: group,
      message: 'Group data retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error getting group data:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get group data'
    });
  }
};

// Create a new group
export const createGroup = async (req: CreateGroupRequest, res: Response) => {
  try {
    console.log('🆕 Creating new group:', req.body.groupName);
    
    const { groupName, userID, username, name, bio, itineraryID } = req.body;
    
    if (!groupName || !userID || !username || !name || !bio) {
      return res.status(400).json({ 
        success: false, 
        message: 'Group name, userID, username, name, and bio are required' 
      });
    }

    const adminData: groupService.CreateGroupData = {
      userID,
      username,
      name,
      bio,
      itineraryID
    };

    const result = await groupService.createGroup(groupName, adminData);
    
    console.log('✅ Successfully created group with ID:', result.groupId, 'and invite code:', result.inviteCode);
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Group created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating group:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create group'
    });
  }
};

// Join a group
export const joinGroup = async (req: JoinGroupRequest, res: Response) => {
  try {
    console.log('👥 User joining group with invite code:', req.body.inviteCode);
    
    const { inviteCode, userID, username, name, bio } = req.body;
    
    if (!inviteCode || !userID || !username || !name || !bio) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invite code, userID, username, name, and bio are required' 
      });
    }

    const userData: groupService.JoinGroupData = {
      userID,
      username,
      name,
      bio
    };

    await groupService.joinGroup(inviteCode, userData);
    
    console.log('✅ Successfully joined group (pending approval)');
    
    res.status(200).json({
      success: true,
      message: 'Successfully joined group. Waiting for admin approval.'
    });
  } catch (error) {
    console.error('❌ Error joining group:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to join group'
    });
  }
};

// Approve user to join group
export const approveUserToGroup = async (req: ApproveUserRequest, res: Response) => {
  try {
    console.log('✅ Approving user to group:', req.body.groupID);
    
    const { groupID, userID, adminID } = req.body;
    
    if (!groupID || !userID || !adminID) {
      return res.status(400).json({ 
        success: false, 
        message: 'Group ID, userID, and adminID are required' 
      });
    }

    await groupService.approveUserToGroup(groupID, userID, adminID);
    
    console.log('✅ Successfully approved user to group');
    
    res.status(200).json({
      success: true,
      message: 'User approved successfully'
    });
  } catch (error) {
    console.error('❌ Error approving user:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to approve user'
    });
  }
};