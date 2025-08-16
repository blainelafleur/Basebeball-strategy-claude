import { useSession } from 'next-auth/react';

export type UserRole = 'FREE' | 'PRO' | 'TEAM' | 'ADMIN';

export function useRole() {
  const { data: session } = useSession();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = ((session?.user as any)?.role as UserRole) || 'FREE';

  const hasRole = (requiredRole: UserRole | UserRole[]) => {
    if (!session?.user) return false;

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(role);
  };

  const isAdmin = () => hasRole('ADMIN');
  const isPro = () => hasRole(['PRO', 'TEAM', 'ADMIN']);
  const isTeam = () => hasRole(['TEAM', 'ADMIN']);
  const isFree = () => role === 'FREE';

  const getRoleDisplayName = () => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'TEAM':
        return 'Team Plan';
      case 'PRO':
        return 'Pro Plan';
      case 'FREE':
      default:
        return 'Free Plan';
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'ADMIN':
        return 'text-purple-600';
      case 'TEAM':
        return 'text-blue-600';
      case 'PRO':
        return 'text-gold-600';
      case 'FREE':
      default:
        return 'text-gray-600';
    }
  };

  return {
    role,
    hasRole,
    isAdmin,
    isPro,
    isTeam,
    isFree,
    getRoleDisplayName,
    getRoleColor,
  };
}
