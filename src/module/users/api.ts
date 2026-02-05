import { db, User } from "@/db";

export async function searchUsers(query: string): Promise<User[]> {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase().trim();

  // Search across multiple fields
  return await db.users
    .filter((user: User): boolean => {
      return !!(
        user.user_id?.toLowerCase().includes(lowerQuery) ||
        user.unique_code?.toLowerCase().includes(lowerQuery) ||
        user.email?.toLowerCase().includes(lowerQuery) ||
        user.mobile_number?.toLowerCase().includes(lowerQuery) ||
        user.name?.toLowerCase().includes(lowerQuery)
      );
    })
    .limit(50)
    .toArray();
}