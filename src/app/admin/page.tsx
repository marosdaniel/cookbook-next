import { redirect } from 'next/navigation';
import { ADMIN_ROUTES } from '@/types/routes';

const AdminIndexPage = () => {
  redirect(ADMIN_ROUTES.METADATA);
};

export default AdminIndexPage;
