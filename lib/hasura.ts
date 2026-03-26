import { print, DocumentNode } from 'graphql';

/**
 * Interface representing the structure of a Hasura GraphQL response.
 * @template T - The expected type of the data returned by the query.
 */
interface HasuraResponse<T> {
  data?: T;
  errors?: any[];
}

/**
 * The core utility for making requests to the Hasura GraphQL API.
 * This function handles authentication headers, error reporting, and 
 * data formatting for both server-side and client-side (if configured) calls.
 * 
 * @template T - The expected data structure returned by the GraphQL operation.
 * @param query - The GraphQL query or mutation, either as a string or a DocumentNode.
 * @param variables - An optional object containing variables to be passed to the GraphQL operation.
 * @param operationName - An optional name for the GraphQL operation, useful for debugging.
 * @returns A Promise that resolves to the data returned by the operation.
 * @throws An error if the Hasura endpoint is not configured or if the request fails.
 */
export async function hasuraCall<T = any>(
  query: string | DocumentNode,
  variables: Record<string, any> = {},
  operationName?: string
): Promise<T> {
  // Use project-specific env vars with sensible defaults for local development
  const endpoint = process.env.HASURA_PROJECT_ENDPOINT || 
                   `http://localhost:${process.env.HASURA_PORT || '8081'}/v1/graphql`;
  const adminSecret = process.env.HASURA_ADMIN_SECRET || 
                      process.env.HASURA_GRAPHQL_ADMIN_SECRET || 
                      'hasura';

  if (!endpoint) {
    throw new Error('Hasura endpoint not configured.');
  }

  // Convert DocumentNode to string (via GraphQL 'print') for transmission over HTTP
  const queryString = typeof query === 'string' ? query : print(query);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(adminSecret ? { 'x-hasura-admin-secret': adminSecret } : {}),
      },
      body: JSON.stringify({
        query: queryString,
        variables,
        operationName,
      }),
    });

    if (!response.ok) {
      console.error(`[Hasura HTTP Error]: ${response.status} ${response.statusText} at ${endpoint}`);
      throw new Error(`Hasura connection failed with status ${response.status}`);
    }

    const result: HasuraResponse<T> = await response.json();

    if (result.errors) {
      console.error('[Hasura GraphQL Error]:', JSON.stringify(result.errors, null, 2));
      throw new Error(result.errors[0]?.message || 'GraphQL operation failed');
    }

    return result.data as T;
  } catch (error) {
    console.error(`[Hasura Request Failed]: ${endpoint}`);
    console.error('Error detail:', error instanceof Error ? error.message : error);
    throw error;
  }
}

/**
 * A convenience wrapper for executing GraphQL queries.
 * @type {typeof hasuraCall}
 */
export const hasuraQuery = hasuraCall;

/**
 * A convenience wrapper for executing GraphQL mutations.
 * @type {typeof hasuraCall}
 */
export const hasuraMutation = hasuraCall;

/**
 * Generates the standard Hasura authentication headers based on the current user session.
 * Used for client-side API calls when not using the admin secret on the server.
 * 
 * @param session - The NextAuth session object containing the user's access token and role.
 * @returns An object containing the Authorization and role-related headers.
 */
export function getHasuraHeaders(session: any) {
  return {
    Authorization: `Bearer ${session?.accessToken || ""}`,
    "x-hasura-role": session?.role || session?.user?.role || "user",
  };
}
