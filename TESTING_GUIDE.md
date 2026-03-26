# 🧪 Schema Migration Testing Guide

This guide helps you systematically test the new UUID-based normalized schema after migration.

## 📋 Pre-Testing Setup

### 1. Database Migration
```bash
# Backup existing database (if any)
pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql

# Apply new schema
psql -d your_database -f sql/schema.sql

# Verify tables were created
psql -d your_database -c "\dt"
```

### 2. Verify Environment Variables
Ensure these are set in your `.env.local`:
```env
# Database
DATABASE_URL=your_hasura_graphql_endpoint

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Email (for credential delivery testing)
EMAIL_PROVIDER=nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-test-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Start Application
```bash
npm run dev
```

---

## 🔐 Phase 1: Authentication System Testing

### Test 1.1: Admin Login
**Purpose**: Verify seeded admin account works with new schema

**Steps**:
1. Navigate to `http://localhost:3000/auth/login`
2. Login with:
   - **Email**: `admin@internship.com`
   - **Password**: `admin123` (default from seed)

**Expected Result**: ✅ Successful login, redirects to admin dashboard

**Verify**:
- Admin UUID is displayed correctly
- Role-based navigation works
- No console errors

---

### Test 1.2: User Creation by ID
**Purpose**: Test login with UUID instead of email

**Steps**:
1. After creating a user in later tests, note their UUID
2. Logout and try logging in with:
   - **Identifier**: `[UUID from created user]`
   - **Password**: `[user's password]`

**Expected Result**: ✅ Login successful with UUID identifier

---

## 👥 Phase 2: User Management Testing

### Test 2.1: Create Mentor User
**Purpose**: Test mentor creation with new schema + email delivery

**Steps**:
1. Login as admin
2. Navigate to mentor management page
3. Click "Add Mentor"
4. Fill form:
   - **Name**: `Test Mentor`
   - **Email**: `testmentor@example.com`
   - **Department**: `AI`
   - **Phone**: `+1234567890` (optional)
5. Submit form

**Expected Results**:
- ✅ Mentor created with UUID ID
- ✅ Success message shows email status
- ✅ Generated credentials displayed to admin
- ✅ Email sent with login credentials + reset link
- ✅ New mentor appears in mentor list

**Verify Database**:
```sql
-- Check users table
SELECT id, email, role FROM users WHERE email = 'testmentor@example.com';

-- Check profiles table
SELECT user_id, name, department, phone FROM profiles
WHERE user_id = '[mentor_uuid]';

-- Verify no entry in interns table
SELECT * FROM interns WHERE user_id = '[mentor_uuid]';
```

---

### Test 2.2: Create Intern User
**Purpose**: Test intern creation with new 3-table structure

**Steps**:
1. Navigate to intern management page
2. Click "Add Intern"
3. Fill form:
   - **Name**: `Test Intern`
   - **Email**: `testintern@example.com`
   - **Department**: `JAVA`
   - **Phone**: `+1987654321`
   - **Mentor**: Select the mentor created in Test 2.1
   - **College**: `Test University`
   - **Start Date**: Today's date

**Expected Results**:
- ✅ Intern created with UUID ID
- ✅ Email credentials sent successfully
- ✅ Intern linked to mentor correctly
- ✅ College info stored properly

**Verify Database**:
```sql
-- Check all three tables are populated
SELECT u.id, u.email, u.role, p.name, p.department
FROM users u
JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'testintern@example.com';

SELECT user_id, mentor_id, college_name, status
FROM interns WHERE user_id = '[intern_uuid]';
```

---

### Test 2.3: Create Admin User
**Purpose**: Test admin user creation

**Steps**:
1. Navigate to user management (if available) or use mentor creation
2. Create user with role `admin`:
   - **Name**: `Test Admin`
   - **Email**: `testadmin@example.com`
   - **Role**: `admin`
   - **Department**: `AI`

**Expected Results**:
- ✅ Admin user created successfully
- ✅ Only exists in users + profiles (not interns)
- ✅ Can login and access admin functions

---

## 📧 Phase 3: Email Credential Delivery Testing

### Test 3.1: Email Contents Verification
**Purpose**: Verify email templates work correctly

**Steps**:
1. Create a new user (mentor or intern)
2. Check the email received

**Expected Email Contents**:
- ✅ Welcome message with user type (Mentor/Intern)
- ✅ Login credentials (UUID + password)
- ✅ Direct reset password link
- ✅ Login page URL
- ✅ Professional formatting

---

### Test 3.2: Email Failure Handling
**Purpose**: Test graceful email failure handling

**Steps**:
1. Temporarily break email config (wrong SMTP_PASS)
2. Create a new user
3. Observe admin response

**Expected Results**:
- ✅ User still created successfully
- ✅ Admin sees "email failed" message
- ✅ Credentials still displayed to admin
- ✅ No application crash

---

## 👤 Phase 4: Profile Management Testing

### Test 4.1: Profile Access Control
**Purpose**: Verify admin users can't access profile management

**Steps**:
1. Login as admin
2. Navigate to `http://localhost:3000/profile`

**Expected Result**: ✅ 403 Forbidden error or redirect with appropriate message

---

### Test 4.2: Non-Admin Profile Access
**Purpose**: Test profile page access for mentors/interns

**Steps**:
1. Login as mentor (created in Test 2.1)
2. Navigate to `http://localhost:3000/profile`

**Expected Results**:
- ✅ Profile page loads successfully
- ✅ User information displayed correctly:
  - UUID (read-only)
  - Name (read-only)
  - Role (read-only)
  - Department (read-only)
  - Email (editable)
- ✅ Password change form available

---

### Test 4.3: Email Update
**Purpose**: Test email updating through profile

**Steps**:
1. On profile page, update email to `newemail@example.com`
2. Submit email update form

**Expected Results**:
- ✅ Email updated successfully
- ✅ Success message shown
- ✅ New email immediately reflected in UI
- ✅ Can login with new email

**Verify Database**:
```sql
SELECT email FROM users WHERE id = '[user_uuid]';
```

---

### Test 4.4: Password Change
**Purpose**: Test password change functionality

**Steps**:
1. On profile page, change password:
   - **Current Password**: `[user's current password]`
   - **New Password**: `NewSecure123!`
   - **Confirm Password**: `NewSecure123!`
2. Submit password change form

**Expected Results**:
- ✅ Password changed successfully
- ✅ Success message displayed
- ✅ Form fields cleared
- ✅ Can login with new password

---

### Test 4.5: Password Validation
**Purpose**: Test password strength requirements

**Steps**:
1. Try weak passwords:
   - `weak` (too short)
   - `weakpassword` (no uppercase/numbers)
   - `WEAKPASSWORD` (no lowercase/numbers)
   - `WeakPassword` (no numbers)

**Expected Results**: ✅ Appropriate validation errors for each case

---

## 🔄 Phase 5: Password Reset Flow Testing

### Test 5.1: Forgot Password (OTP Generation)
**Purpose**: Test OTP generation and email delivery

**Steps**:
1. Logout from application
2. Navigate to `http://localhost:3000/auth/forgot-password`
3. Enter mentor's email from Test 2.1
4. Submit form

**Expected Results**:
- ✅ Success message (doesn't reveal if email exists)
- ✅ OTP email sent to mentor
- ✅ 6-digit numeric code in email
- ✅ 10-minute expiry mentioned

**Verify Database**:
```sql
SELECT email, otp_code, type, expires_at FROM password_reset_tokens
WHERE email = 'testmentor@example.com' AND type = 'otp'
ORDER BY created_at DESC LIMIT 1;
```

---

### Test 5.2: OTP Verification
**Purpose**: Test OTP code verification

**Steps**:
1. Navigate to `http://localhost:3000/auth/verify-otp`
2. Enter:
   - **Email**: mentor email
   - **OTP**: code from email
3. Submit verification

**Expected Results**:
- ✅ OTP verified successfully
- ✅ Redirect to password reset page with token
- ✅ Reset token URL parameter present

**Verify Database**:
```sql
-- OTP should be marked as used
SELECT used_at FROM password_reset_tokens
WHERE email = 'testmentor@example.com' AND type = 'otp'
ORDER BY created_at DESC LIMIT 1;

-- Reset token should be created
SELECT token, type, expires_at FROM password_reset_tokens
WHERE email = 'testmentor@example.com' AND type = 'reset'
ORDER BY created_at DESC LIMIT 1;
```

---

### Test 5.3: Password Reset Completion
**Purpose**: Test final password reset step

**Steps**:
1. On reset password page with valid token
2. Set new password: `ResetPassword123!`
3. Confirm password: `ResetPassword123!`
4. Submit form

**Expected Results**:
- ✅ Password reset successfully
- ✅ Success message displayed
- ✅ Can login with new password
- ✅ Old password no longer works

---

### Test 5.4: Rate Limiting
**Purpose**: Test OTP rate limiting (3 requests per hour)

**Steps**:
1. Request OTP for same email 4 times quickly

**Expected Results**:
- ✅ First 3 requests succeed
- ✅ 4th request returns rate limit error

---

## 🔗 Phase 6: Data Relationship Testing

### Test 6.1: Mentor-Intern Relationships
**Purpose**: Verify foreign key relationships work correctly

**Steps**:
1. Use mentor and intern created in Phase 2
2. Verify intern is assigned to mentor
3. Check mentor's dashboard shows assigned intern

**Expected Results**:
- ✅ Mentor sees assigned intern in their dashboard
- ✅ Intern profile shows correct mentor assignment
- ✅ Relationship data consistent across views

---

### Test 6.2: Cascade Delete Behavior
**Purpose**: Test what happens when mentor is deleted

**⚠️ Warning**: This will delete data - use test accounts only!

**Steps**:
1. Delete the mentor user created in Test 2.1
2. Check what happens to assigned intern

**Expected Results**:
- ✅ Mentor deleted from users and profiles tables
- ✅ Intern's mentor_id set to NULL (not deleted)
- ✅ Intern can still login and function
- ✅ No orphaned data or foreign key errors

**Verify Database**:
```sql
SELECT mentor_id FROM interns WHERE user_id = '[intern_uuid]';
-- Should be NULL
```

---

## 📊 Phase 7: API Endpoint Testing

### Test 7.1: Direct API Testing
**Purpose**: Test API endpoints directly

**Tools**: Use browser dev tools, Postman, or curl

#### Test Users API
```bash
# Get all users (admin only)
curl -X GET http://localhost:3000/api/auth/users \
  -H "Cookie: next-auth.session-token=[your_session_token]"
```

#### Test Interns API
```bash
# Get all interns (admin only)
curl -X GET http://localhost:3000/api/interns \
  -H "Cookie: next-auth.session-token=[your_session_token]"
```

#### Test Profile API
```bash
# Get current user profile
curl -X GET http://localhost:3000/api/profile \
  -H "Cookie: next-auth.session-token=[your_session_token]"
```

**Expected Results**:
- ✅ All APIs return proper UUID-formatted data
- ✅ Profile information uses normalized structure
- ✅ No legacy TEXT ID formats returned

---

## ✅ Phase 8: Validation Checklist

After completing all tests, verify these points:

### Database Structure ✅
- [ ] All tables use UUID primary keys
- [ ] No TEXT primary keys remain
- [ ] Foreign key relationships work correctly
- [ ] Indexes are properly created
- [ ] Admin seed account works

### Authentication ✅
- [ ] Login works with email
- [ ] Login works with UUID
- [ ] Role-based access control functions
- [ ] Session management works properly

### User Management ✅
- [ ] Admin can create mentors
- [ ] Admin can create interns
- [ ] Admin can create other admins
- [ ] Email credentials delivered successfully
- [ ] Generated passwords meet requirements

### Profile Management ✅
- [ ] Non-admin users can access profile page
- [ ] Admin users blocked from profile page
- [ ] Email updates work correctly
- [ ] Password changes work correctly
- [ ] Validation rules enforced

### Password Reset ✅
- [ ] OTP generation and delivery works
- [ ] OTP verification works
- [ ] Password reset completion works
- [ ] Rate limiting prevents abuse
- [ ] All tokens expire properly

### Data Integrity ✅
- [ ] No data duplication between tables
- [ ] Foreign key constraints prevent orphans
- [ ] Cascade behaviors work as expected
- [ ] All UUIDs properly formatted

---

## 🐛 Common Issues & Solutions

### Issue: "User not found" during profile access
**Solution**: Ensure user has profile record in profiles table

### Issue: Email delivery fails silently
**Solution**: Check SMTP configuration and test email credentials

### Issue: Foreign key constraint errors
**Solution**: Verify all referenced UUIDs exist and are properly formatted

### Issue: GraphQL field errors
**Solution**: Ensure Hasura metadata is updated for new schema structure

---

## 🎯 Success Criteria

**Migration is successful when**:
- ✅ All 25+ tests pass without errors
- ✅ No legacy TEXT IDs remain in use
- ✅ Email credential delivery works reliably
- ✅ Profile management functions correctly
- ✅ Password reset flow completes successfully
- ✅ Database relationships maintain integrity
- ✅ Performance is acceptable with new schema

---

**Next Steps After Testing**:
1. Run performance benchmarks with larger datasets
2. Test concurrent user operations
3. Validate backup/restore procedures with new schema
4. Update any remaining frontend code for new data structure
5. Plan production deployment strategy