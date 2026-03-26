# Multi-Organization Architecture Plan

## Overview

Transform the Intern Management System from single-tenant to multi-tenant to support a **Training Institute** model where:
- Super Admin manages multiple organizations (batches, colleges, programs)
- Each Organization Admin manages their own departments, mentors, and interns
- Data is isolated per organization, with super admin having global visibility

---

## Role Hierarchy

```
Super Admin (Institute Owner)
    |
    +-- Organization 1: "Spring 2024 Batch"
    |       +-- Org Admin: John Doe
    |       +-- Departments: [AI, Java, Mobile]
    |       +-- Mentors: 5
    |       +-- Interns: 25
    |
    +-- Organization 2: "MIT Partnership"
    |       +-- Org Admin: Jane Smith
    |       +-- Departments: [PHP, SAP, QC]
    |       +-- Mentors: 3
    |       +-- Interns: 15
    |
    +-- Organization 3: "Corporate Training - TechCorp"
            +-- Org Admin: Bob Wilson
            +-- Departments: [RPA, AI, ODOO]
            +-- Mentors: 4
            +-- Interns: 20
```

---

## Database Schema Changes

### New Tables

```sql
-- Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, archived
    settings JSONB DEFAULT '{}',          -- org-specific settings
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Organization Departments (custom per org, replaces hardcoded DEPARTMENTS)
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,            -- short code like "AI", "PHP"
    color VARCHAR(7) DEFAULT '#6366f1',   -- hex color for badges
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- Organization Admins (many-to-many: user can admin multiple orgs)
CREATE TABLE organization_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'admin',     -- admin, viewer (future)
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);
```

### Modified Tables

```sql
-- Users: Add super admin flag and default organization
ALTER TABLE users
    ADD COLUMN is_super_admin BOOLEAN DEFAULT false,
    ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Create index for org-based queries
CREATE INDEX idx_users_organization ON users(organization_id);

-- Interns: Add organization context
ALTER TABLE interns
    ADD COLUMN organization_id UUID REFERENCES organizations(id),
    ADD COLUMN department_id UUID REFERENCES departments(id);

-- Reports: Add organization for analytics
ALTER TABLE reports
    ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Tasks: Add organization context
ALTER TABLE tasks
    ADD COLUMN organization_id UUID REFERENCES organizations(id);
```

### Data Migration

```sql
-- Step 1: Create default organization for existing data
INSERT INTO organizations (id, name, slug, description)
VALUES ('default-org-uuid', 'Default Organization', 'default', 'Legacy data');

-- Step 2: Create departments from existing hardcoded list
INSERT INTO departments (organization_id, name, code, color) VALUES
('default-org-uuid', 'Artificial Intelligence', 'AI', '#3b82f6'),
('default-org-uuid', 'Odoo Development', 'ODOO', '#8b5cf6'),
('default-org-uuid', 'Java Development', 'JAVA', '#ef4444'),
('default-org-uuid', 'Mobile Development', 'MOBILE', '#22c55e'),
('default-org-uuid', 'SAP', 'SAP', '#f59e0b'),
('default-org-uuid', 'Quality Control', 'QC', '#06b6d4'),
('default-org-uuid', 'PHP Development', 'PHP', '#6366f1'),
('default-org-uuid', 'RPA', 'RPA', '#ec4899');

-- Step 3: Migrate existing users to default org
UPDATE users SET organization_id = 'default-org-uuid' WHERE organization_id IS NULL;

-- Step 4: Migrate interns
UPDATE interns SET organization_id = 'default-org-uuid' WHERE organization_id IS NULL;

-- Step 5: Designate first admin as super admin (or create new)
UPDATE users SET is_super_admin = true WHERE role = 'admin' LIMIT 1;
```

---

## API Changes

### New Endpoints

```
# Organization Management (Super Admin only)
GET    /api/organizations              - List all organizations
POST   /api/organizations              - Create organization
GET    /api/organizations/:id          - Get organization details
PUT    /api/organizations/:id          - Update organization
DELETE /api/organizations/:id          - Archive organization

# Department Management (Org Admin)
GET    /api/organizations/:id/departments    - List departments
POST   /api/organizations/:id/departments    - Create department
PUT    /api/departments/:id                   - Update department
DELETE /api/departments/:id                   - Delete department

# Organization Admins
GET    /api/organizations/:id/admins         - List org admins
POST   /api/organizations/:id/admins         - Add org admin
DELETE /api/organizations/:id/admins/:userId - Remove org admin
```

### Modified Endpoints

All existing endpoints need organization context:

```typescript
// Before
GET /api/interns → returns all interns

// After
GET /api/interns → returns interns for current user's organization
GET /api/interns?org=uuid → (super admin) returns interns for specific org

// Auth middleware extracts organization from session
const session = await auth();
const organizationId = session.user.organizationId;
const isSuperAdmin = session.user.isSuperAdmin;
```

### GraphQL Query Changes

```graphql
# Add organization filter to all queries
query GetInterns($orgId: uuid!) {
  interns(where: { organization_id: { _eq: $orgId } }) {
    id
    name
    department {
      id
      name
      color
    }
  }
}

# Super admin: aggregate across orgs
query GetGlobalStats {
  organizations_aggregate {
    aggregate { count }
  }
  interns_aggregate {
    aggregate { count }
  }
  users_aggregate(where: { role: { _eq: "mentor" } }) {
    aggregate { count }
  }
}
```

---

## Frontend Changes

### New Pages

```
/super-admin
    /super-admin/organizations           - List/manage organizations
    /super-admin/organizations/[id]      - Org details & stats
    /super-admin/organizations/new       - Create organization
    /super-admin/analytics               - Global analytics
    /super-admin/users                   - All users across orgs

/dashboard/admin/departments             - Manage custom departments (NEW)
```

### Modified Components

#### Sidebar.tsx
```typescript
// Add role check for super admin
if (isSuperAdmin) {
  return [
    { href: "/super-admin", label: "Organizations", icon: Building2 },
    { href: "/super-admin/analytics", label: "Global Analytics", icon: BarChart3 },
    { href: "/super-admin/users", label: "All Users", icon: Users },
    // ... existing admin links with org context
  ];
}
```

#### Organization Switcher Component
```typescript
// Header dropdown for super admin to switch org context
<OrgSwitcher
  currentOrg={selectedOrg}
  organizations={allOrgs}
  onSwitch={(orgId) => setCurrentOrgContext(orgId)}
/>
```

#### Department Management Page
```typescript
// Dynamic department CRUD instead of hardcoded
const [departments, setDepartments] = useState<Department[]>([]);

// Fetch from API
useEffect(() => {
  fetch(`/api/organizations/${orgId}/departments`)
    .then(res => res.json())
    .then(setDepartments);
}, [orgId]);

// Use in dropdowns
<select>
  {departments.map(d => (
    <option key={d.id} value={d.id}>{d.name}</option>
  ))}
</select>
```

---

## Authentication Changes

### Session Structure

```typescript
// Current
interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "mentor" | "intern";
  }
}

// New
interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    role: "super_admin" | "org_admin" | "mentor" | "intern";
    isSuperAdmin: boolean;
    organizationId: string | null;      // null for super admin
    organizationName: string | null;
  }
}
```

### Auth Middleware

```typescript
// lib/auth/orgContext.ts
export async function withOrgContext(handler: Handler) {
  return async (req: Request) => {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Super admin can specify org via query param
    const url = new URL(req.url);
    let orgId = session.user.organizationId;

    if (session.user.isSuperAdmin && url.searchParams.has('org')) {
      orgId = url.searchParams.get('org');
    }

    // Inject org context
    req.orgContext = { organizationId: orgId, isSuperAdmin: session.user.isSuperAdmin };

    return handler(req);
  };
}
```

---

## Implementation Phases

### Phase 1: Database Foundation (Week 1)
- [ ] Create organization tables
- [ ] Create department tables
- [ ] Add organization_id to existing tables
- [ ] Write migration scripts
- [ ] Update Hasura permissions

### Phase 2: API Layer (Week 2)
- [ ] Organization CRUD endpoints
- [ ] Department CRUD endpoints
- [ ] Update existing APIs with org context
- [ ] Auth middleware for org context
- [ ] GraphQL query updates

### Phase 3: Super Admin UI (Week 3)
- [ ] Super admin dashboard
- [ ] Organization management pages
- [ ] Global analytics view
- [ ] Organization switcher component

### Phase 4: Org Admin Features (Week 4)
- [ ] Department management page
- [ ] Update mentor/intern forms to use dynamic departments
- [ ] Organization settings page
- [ ] Onboarding flow for new orgs

### Phase 5: Testing & Migration (Week 5)
- [ ] Migrate existing data to default org
- [ ] Test org isolation
- [ ] Test super admin access
- [ ] Performance testing
- [ ] Documentation

---

## Security Considerations

1. **Row-Level Security (RLS)**
   - All queries must filter by organization_id
   - Super admin bypasses org filter
   - Hasura permissions enforce this at GraphQL layer

2. **API Authorization**
   - Validate org membership before any operation
   - Prevent cross-org data access
   - Audit logs for sensitive operations

3. **URL Security**
   - Organization slugs in URLs (not UUIDs) for readability
   - Validate slug ownership on each request

---

## Future Enhancements

1. **Billing per Organization** - Track usage, subscription tiers
2. **Custom Branding** - Logo, colors per organization
3. **SSO Integration** - SAML/OIDC per organization
4. **Organization Templates** - Pre-configured department sets
5. **Cross-Org Transfers** - Move interns between organizations
6. **Organization Hierarchy** - Parent/child orgs for large institutes

---

## Files to Modify

| File | Change |
|------|--------|
| `sql/schema.sql` | Add organization tables |
| `lib/graphql/queries.ts` | Add org filters to all queries |
| `lib/graphql/mutations.ts` | Add org context to mutations |
| `lib/auth.ts` | Include org info in session |
| `app/api/*` | Add org context middleware |
| `app/components/Sidebar.tsx` | Super admin nav + org switcher |
| `app/dashboard/admin/*` | Dynamic departments |
| `app/super-admin/*` | New super admin pages |

---

## Estimated Effort

| Phase | Duration | Complexity |
|-------|----------|------------|
| Database | 3-4 days | Medium |
| API Changes | 4-5 days | High |
| Super Admin UI | 4-5 days | Medium |
| Org Admin Features | 3-4 days | Medium |
| Testing & Migration | 3-4 days | High |
| **Total** | **~4 weeks** | - |
