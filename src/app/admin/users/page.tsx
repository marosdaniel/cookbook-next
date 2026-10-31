import { getSessionSafely } from '@/lib/auth/safeSession';
import { UserInsightsService } from '@/server/modules/admin/userInsightsService';
import UsersView from './UsersView';

type SearchParamValue = string | string[] | undefined;

type AdminUsersPageProps = {
  searchParams: Promise<Record<string, SearchParamValue>>;
};

const firstValue = (value: SearchParamValue): string | undefined =>
  Array.isArray(value) ? value[0] : value;

// The admin layout already guards the route; the service checks the role again
// and sanitizes the search, role and page parameters.
const AdminUsersPage = async ({ searchParams }: AdminUsersPageProps) => {
  const params = await searchParams;
  const page = firstValue(params.page);
  const session = await getSessionSafely();

  const result = await UserInsightsService.listUsers(session?.user?.role, {
    search: firstValue(params.q),
    role: firstValue(params.role),
    page: page ? Number(page) : undefined,
  });

  return <UsersView result={result} currentUserId={session?.user?.id ?? ''} />;
};

export default AdminUsersPage;
