import { getSessionSafely } from '@/lib/auth/safeSession';
import { UserInsightsService } from '@/server/modules/admin/userInsightsService';
import DashboardView from './DashboardView';

// The admin layout already guards the route; the service checks the role again.
const AdminDashboardPage = async () => {
  const session = await getSessionSafely();
  const overview = await UserInsightsService.getOverview(session?.user?.role);

  return <DashboardView overview={overview} />;
};

export default AdminDashboardPage;
