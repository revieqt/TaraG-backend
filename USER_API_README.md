# User API Documentation

This document describes the user-related API endpoints for the TaraG backend.

## Base URL
```
http://localhost:5000/api/user
```

## Endpoints

### 1. Update Profile Image
**POST** `/update-profile-image`

Updates the user's profile image by uploading it to Firebase Storage and updating the Firestore document.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `userID` (string, required): The user's ID
  - `image` (file, required): The image file to upload

**Response:**
```json
{
  "message": "Profile image updated successfully",
  "imageUrl": "https://storage.googleapis.com/bucket-name/profileImages/userID_uuid.jpg"
}
```

**Error Responses:**
- `400`: Missing userID or image file
- `400`: File is not an image
- `400`: File size too large (max 5MB)
- `500`: Server error

### 2. Update Bio
**PUT** `/update-bio`

Updates the user's bio in the Firestore database.

**Request:**
- Content-Type: `application/json`
- Body:
```json
{
  "userID": "string",
  "bio": "string"
}
```

**Response:**
```json
{
  "message": "Bio updated successfully",
  "bio": "Updated bio text"
}
```

**Error Responses:**
- `400`: Missing userID or bio
- `400`: Bio is empty or invalid
- `500`: Server error

### 3. Get User Profile
**GET** `/profile/:userID`

Retrieves the user's profile data from Firestore.

**Request:**
- URL Parameter: `userID` (string, required)

**Response:**
```json
{
  "message": "User profile retrieved successfully",
  "user": {
    "bio": "User's bio",
    "profileImage": "https://storage.googleapis.com/bucket-name/profileImages/userID_uuid.jpg",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    // ... other user fields
  }
}
```

**Error Responses:**
- `400`: Missing userID
- `404`: User not found
- `500`: Server error

## Firebase Storage Structure

Profile images are stored in Firebase Storage under the following structure:
```
profileImages/
├── userID_uuid1.jpg
├── userID_uuid2.png
└── ...
```

## Firestore Collection Structure

User data is stored in the `users` collection with the following structure:
```json
{
  "userID": "string",
  "bio": "string",
  "profileImage": "string (URL)",
  "updatedAt": "timestamp",
  // ... other user fields
}
```

## Environment Variables Required

Make sure the following environment variables are set:
- `FIREBASE_STORAGE_BUCKET`: Your Firebase Storage bucket name
- Firebase service account credentials (either via service account file or environment variables)

## Usage Examples

### Frontend JavaScript Example (Update Profile Image)
```javascript
const formData = new FormData();
formData.append('userID', 'user123');
formData.append('image', imageFile);

fetch('/api/user/update-profile-image', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

### Frontend JavaScript Example (Update Bio)
```javascript
fetch('/api/user/update-bio', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userID: 'user123',
    bio: 'This is my new bio!'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Frontend JavaScript Example (Get Profile)
```javascript
fetch('/api/user/profile/user123')
.then(response => response.json())
.then(data => console.log(data));
``` 