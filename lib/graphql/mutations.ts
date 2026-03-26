import { gql } from "@apollo/client/core";

export const CREATE_USER = gql`
  mutation CreateUser(
    $id: uuid!
    $email: String!
    $password: String!
    $role: user_role!
    $name: String!
    $department: String!
    $phone: String
  ) {
    insert_users_one(
      object: {
        id: $id
        email: $email
        password_hash: $password
        role: $role
      }
    ) {
      id
      email
      password_hash
      role
    }
    insert_profiles_one(
      object: {
        user_id: $id
        name: $name
        department: $department
        phone: $phone
      }
    ) {
      user_id
      name
      department
      phone
    }
  }
`;

export const CREATE_INTERN_AND_USER = gql`
  mutation CreateInternAndUser(
    $id: uuid!
    $name: String!
    $email: String!
    $password: String!
    $role: user_role!
    $department: String!
    $phone: String
    $mentorId: uuid
    $startDate: date
    $internStatus: intern_status!
    $collegeName: String
    $university: String
    $adminId: uuid
  ) {
    insert_users_one(
      object: {
        id: $id
        email: $email
        password_hash: $password
        role: $role
      }
    ) {
      id
    }
    insert_profiles_one(
      object: {
        user_id: $id
        name: $name
        department: $department
        phone: $phone
      }
    ) {
      user_id
      name
      department
      phone
    }
    insert_interns_one(
      object: {
        user_id: $id
        mentor_id: $mentorId
        admin_id: $adminId
        start_date: $startDate
        status: $internStatus
        college_name: $collegeName
        university: $university
      }
    ) {
      user_id
      mentor_id
      admin_id
      start_date
      end_date
      status
      college_name
      university
    }
  }
`;

export const UPDATE_INTERN_AND_USER = gql`
  mutation UpdateInternAndUser(
    $id: uuid!
    $name: String!
    $email: String!
    $department: String
    $phone: String
    $mentorId: uuid
    $adminId: uuid
    $startDate: date
    $endDate: date
    $status: intern_status
    $collegeName: String
    $university: String
  ) {
    update_users_by_pk(
      pk_columns: { id: $id }
      _set: {
        email: $email
      }
    ) {
      id
    }
    update_profiles_by_pk(
      pk_columns: { user_id: $id }
      _set: {
        name: $name
        department: $department
        phone: $phone
      }
    ) {
      user_id
    }
    update_interns_by_pk(
      pk_columns: { user_id: $id }
      _set: {
        mentor_id: $mentorId
        admin_id: $adminId
        start_date: $startDate
        end_date: $endDate
        status: $status
        college_name: $collegeName
        university: $university
      }
    ) {
      user_id
    }
  }
`;

export const DELETE_INTERN_AND_USER = gql`
  mutation DeleteInternAndUser($id: uuid!) {
    delete_interns_by_pk(user_id: $id) {
      user_id
    }
    delete_profiles_by_pk(user_id: $id) {
      user_id
    }
    delete_users_by_pk(id: $id) {
      id
    }
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask(
    $id: uuid!
    $title: String!
    $description: String
    $assignedBy: uuid!
    $assignedToAll: Boolean!
    $deadline: date
    $priority: task_priority!
    $status: task_status!
  ) {
    insert_tasks_one(
      object: {
        id: $id
        title: $title
        description: $description
        assigned_by: $assignedBy
        assigned_to_all: $assignedToAll
        deadline: $deadline
        priority: $priority
        status: $status
      }
    ) {
      id
      title
      description
      assigned_by
      assigned_to_all
      deadline
      priority
      status
      created_at
    }
  }
`;

export const UPDATE_TASK_STATUS = gql`
  mutation UpdateTaskStatus($id: uuid!, $status: task_status!) {
    update_tasks_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
      id
    }
  }
`;

export const UPDATE_TASK_BY_CREATOR = gql`
  mutation UpdateTaskByCreator(
    $id: uuid!
    $title: String
    $description: String
    $deadline: date
    $priority: task_priority
    $status: task_status
    $assignedToAll: Boolean
  ) {
    update_tasks_by_pk(
      pk_columns: { id: $id }
      _set: {
        title: $title
        description: $description
        deadline: $deadline
        priority: $priority
        status: $status
        assigned_to_all: $assignedToAll
      }
    ) {
      id
    }
  }
`;

export const REPLACE_TASK_ASSIGNMENTS = gql`
  mutation ReplaceTaskAssignments($taskId: uuid!) {
    delete_task_assignments(where: { task_id: { _eq: $taskId } }) {
      affected_rows
    }
  }
`;

export const INSERT_TASK_ASSIGNMENTS = gql`
  mutation InsertTaskAssignments($objects: [task_assignments_insert_input!]!) {
    insert_task_assignments(objects: $objects) {
      affected_rows
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: uuid!) {
    delete_tasks_by_pk(id: $id) {
      id
    }
  }
`;

export const CREATE_REPORT = gql`
  mutation CreateReport(
    $id: uuid!
    $internId: uuid!
    $reportDate: date!
    $workDescription: String!
    $hoursWorked: numeric!
  ) {
    insert_reports_one(
      object: {
        id: $id
        intern_id: $internId
        report_date: $reportDate
        work_description: $workDescription
        hours_worked: $hoursWorked
      }
    ) {
      id
      intern_id
      report_date
      work_description
      hours_worked
      mentor_feedback
      submitted_at
    }
  }
`;

export const UPDATE_REPORT = gql`
  mutation UpdateReport(
    $id: uuid!
    $reportDate: date
    $workDescription: String
    $hoursWorked: numeric
    $mentorFeedback: String
  ) {
    update_reports_by_pk(
      pk_columns: { id: $id }
      _set: {
        report_date: $reportDate
        work_description: $workDescription
        hours_worked: $hoursWorked
        mentor_feedback: $mentorFeedback
      }
    ) {
      id
      intern_id
      report_date
      work_description
      hours_worked
      mentor_feedback
      submitted_at
    }
  }
`;

export const UPDATE_MENTOR_USER = gql`
  mutation UpdateMentorUser(
    $id: uuid!
    $name: String!
    $email: String!
    $department: String
  ) {
    update_users_by_pk(
      pk_columns: { id: $id }
      _set: {
        email: $email
      }
    ) {
      id
      email
      role
    }
    update_profiles_by_pk(
      pk_columns: { user_id: $id }
      _set: {
        name: $name
        department: $department
      }
    ) {
      user_id
      name
      department
    }
  }
`;

export const DELETE_MENTOR_USER = gql`
  mutation DeleteMentorUser($id: uuid!) {
    delete_profiles_by_pk(user_id: $id) {
      user_id
      name
    }
    delete_users_by_pk(id: $id) {
      id
      email
      role
    }
  }
`;

export const CREATE_PASSWORD_RESET_TOKEN = gql`
  mutation CreatePasswordResetToken(
    $id: uuid!
    $email: String!
    $token: String
    $otp_code: String
    $type: String!
    $expires_at: timestamptz!
    $attempts: Int
  ) {
    insert_password_reset_tokens_one(
      object: {
        id: $id
        email: $email
        token: $token
        otp_code: $otp_code
        type: $type
        expires_at: $expires_at
        attempts: $attempts
      }
    ) {
      id
      email
      token
      otp_code
      type
      expires_at
      attempts
      created_at
    }
  }
`;

export const UPDATE_PASSWORD_RESET_TOKEN = gql`
  mutation UpdatePasswordResetToken(
    $id: uuid!
    $attempts: Int
    $used_at: timestamptz
  ) {
    update_password_reset_tokens_by_pk(
      pk_columns: { id: $id }
      _set: {
        attempts: $attempts
        used_at: $used_at
      }
    ) {
      id
      email
      attempts
      used_at
    }
  }
`;

export const DELETE_PASSWORD_RESET_TOKEN = gql`
  mutation DeletePasswordResetToken($id: uuid!) {
    delete_password_reset_tokens_by_pk(id: $id) {
      id
    }
  }
`;

export const DELETE_EXPIRED_TOKENS = gql`
  mutation DeleteExpiredTokens($now: timestamptz!) {
    delete_password_reset_tokens(where: { expires_at: { _lt: $now } }) {
      affected_rows
    }
  }
`;

export const UPDATE_USER_PASSWORD = gql`
  mutation UpdateUserPassword($id: uuid!, $passwordHash: String!) {
    update_users_by_pk(
      pk_columns: { id: $id }
      _set: { password_hash: $passwordHash }
    ) {
      id
      email
    }
  }
`;

export const UPDATE_USER_EMAIL = gql`
  mutation UpdateUserEmail($id: uuid!, $email: String!) {
    update_users_by_pk(
      pk_columns: { id: $id }
      _set: { email: $email }
    ) {
      id
      email
    }
  }
`;
