# GREEN MAX API Documentation

Complete API reference for the GREEN MAX investment platform.

## Base URL

```
Development: http://localhost:5000/api
Production: https://api.greenmax.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [ ... ]
}
```

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "referralCode": "ABC123XYZ"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Registration successful! $1 bonus added to your account.",
  "data": {
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "balance": 1.0,
      "referralCode": "JOHNDOE123"
    },
    "token": "jwt_token_here"
  }
}
```

### Login

**POST** `/auth/login`

Login to existing account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

### Get Profile

**GET** `/auth/profile`

Get current user profile (Protected).

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "balance": 150.50,
      "investmentBalance": 500,
      "totalEarnings": 75.25,
      "referralCode": "JOHNDOE123",
      "directReferrals": [ ... ]
    }
  }
}
```

### Update Profile

**PUT** `/auth/profile`

Update user profile (Protected).

**Request Body:**
```json
{
  "fullName": "John Updated Doe",
  "phone": "+1234567890",
  "walletAddress": "0x1234...5678"
}
```

---

## Investment Endpoints

### Get All Plans

**GET** `/investments/plans`

Get all available investment plans.

**Response:**
```json
{
  "status": "success",
  "count": 7,
  "data": {
    "plans": [
      {
        "planNumber": 1,
        "name": "Starter",
        "amount": 5,
        "dailyProfit": 0.30,
        "totalReturn": 9,
        "duration": 30,
        "type": "regular",
        "roiPercentage": "80.00",
        "dailyRoiPercentage": "6.00"
      },
      ...
    ]
  }
}
```

### Create Investment

**POST** `/investments/create`

Create a new investment (Protected).

**Request Body:**
```json
{
  "planId": "plan_id_here",
  "amount": 50
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Investment created successfully",
  "data": {
    "investment": {
      "id": "investment_id",
      "userId": "user_id",
      "planId": "plan_id",
      "amount": 50,
      "dailyProfit": 3.00,
      "totalReturn": 90,
      "earnedProfit": 0,
      "remainingProfit": 90,
      "duration": 30,
      "daysCompleted": 0,
      "daysRemaining": 30,
      "status": "active",
      "transactionId": "INV1234567890ABC"
    }
  }
}
```

### Get User Investments

**GET** `/investments/user`

Get all investments for current user (Protected).

**Response:**
```json
{
  "status": "success",
  "data": {
    "investments": [ ... ],
    "stats": {
      "total": 5,
      "active": 3,
      "completed": 2,
      "totalInvested": 250,
      "totalEarned": 125.50
    }
  }
}
```

### Get Investment Details

**GET** `/investments/:id`

Get specific investment details (Protected).

### Get Earnings Summary

**GET** `/investments/earnings`

Get user earnings summary (Protected).

**Response:**
```json
{
  "status": "success",
  "data": {
    "earnings": {
      "totalBalance": 150.50,
      "investmentBalance": 500,
      "totalEarnings": 225.75,
      "investmentEarnings": 125.50,
      "referralEarnings": 85.25,
      "weeklySalary": 15,
      "activeInvestments": 3,
      "totalInvestments": 5
    }
  }
}
```

---

## Withdrawal Endpoints

### Request Withdrawal

**POST** `/withdrawals/request`

Request a withdrawal (Protected).

**Request Body:**
```json
{
  "amount": 50,
  "walletAddress": "0x1234...5678"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Withdrawal request submitted successfully. Pending admin approval.",
  "data": {
    "withdrawal": {
      "id": "withdrawal_id",
      "userId": "user_id",
      "amount": 50,
      "tax": 2.50,
      "netAmount": 47.50,
      "walletAddress": "0x1234...5678",
      "status": "pending",
      "transactionId": "WD1234567890ABC"
    }
  }
}
```

### Get User Withdrawals

**GET** `/withdrawals/user`

Get all withdrawals for current user (Protected).

### Check Withdrawal Eligibility

**GET** `/withdrawals/check-eligibility`

Check if user is eligible to withdraw (Protected).

**Response:**
```json
{
  "status": "success",
  "data": {
    "isEligible": true,
    "message": "You are eligible to withdraw",
    "daysUntilEligible": 0,
    "withdrawalCount": 1,
    "balance": 150.50,
    "minimumWithdrawal": 5,
    "withdrawalTax": 5
  }
}
```

### Cancel Withdrawal

**DELETE** `/withdrawals/:id`

Cancel pending withdrawal request (Protected).

---

## Referral Endpoints

### Get Referral Tree

**GET** `/referrals/tree`

Get user's referral tree (3 levels) (Protected).

**Response:**
```json
{
  "status": "success",
  "data": {
    "tree": {
      "level1": [ ... ],
      "level2": [ ... ],
      "level3": [ ... ]
    },
    "stats": {
      "totalReferrals": 15,
      "level1Count": 8,
      "level2Count": 5,
      "level3Count": 2
    }
  }
}
```

### Get Commission History

**GET** `/referrals/commissions`

Get user's commission history (Protected).

**Response:**
```json
{
  "status": "success",
  "data": {
    "commissions": [ ... ],
    "stats": {
      "total": 25,
      "totalEarned": 125.50,
      "level1Earnings": 100,
      "level2Earnings": 20,
      "level3Earnings": 5.50
    }
  }
}
```

### Get Referral Stats

**GET** `/referrals/stats`

Get referral statistics (Protected).

**Response:**
```json
{
  "status": "success",
  "data": {
    "stats": {
      "referralCode": "JOHNDOE123",
      "totalReferrals": 15,
      "activeReferrals": 10,
      "totalReferralEarnings": 125.50,
      "directSales": 2500,
      "weeklySalary": 15,
      "referralLink": "https://greenmax.com/register?ref=JOHNDOE123"
    }
  }
}
```

---

## Admin Endpoints

All admin endpoints require admin privileges.

### Get Dashboard Stats

**GET** `/admin/dashboard`

Get platform statistics (Admin only).

### Get All Users

**GET** `/admin/users?page=1&limit=20`

Get all users with pagination (Admin only).

### Get User Details

**GET** `/admin/users/:id`

Get specific user details (Admin only).

### Toggle User Status

**PUT** `/admin/users/:id/toggle-status`

Activate/deactivate user account (Admin only).

### Get All Deposits

**GET** `/admin/deposits`

Get all deposit requests (Admin only).

### Confirm Deposit

**PUT** `/admin/deposits/:id/confirm`

Confirm a deposit request (Admin only).

### Get All Withdrawals

**GET** `/admin/withdrawals`

Get all withdrawal requests (Admin only).

### Approve Withdrawal

**PUT** `/admin/withdrawals/:id/approve`

Approve a withdrawal request (Admin only).

**Request Body:**
```json
{
  "transactionHash": "0xabc...def"
}
```

### Reject Withdrawal

**PUT** `/admin/withdrawals/:id/reject`

Reject a withdrawal request (Admin only).

**Request Body:**
```json
{
  "reason": "Insufficient verification"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## Rate Limiting

- 100 requests per 15 minutes per IP
- Applies to all `/api/` endpoints

## Webhooks (Future Feature)

Webhook notifications for:
- New investments
- Withdrawal requests
- Daily profit distribution
- Referral commissions

---

For support: support@greenmax.com
