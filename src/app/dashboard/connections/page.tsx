import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';

export default function ConnectionsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-[#0a0a0a]"></div>
      </div>
      <div className="relative z-10">
        <DashboardHeader user={{ id: 'placeholder', email: 'user@example.com', app_metadata: {}, user_metadata: {}, aud: '', created_at: '' }} profile={{}} />
        <div className="flex">
          <DashboardSidebar />
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold mb-4">Connections</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">Manage your integrations and data connections here.</p>
              <div className="bg-gray-100 dark:bg-[#1f1f1f] rounded-xl p-8 text-center border border-gray-200 dark:border-[#333]">
                <span className="text-lg text-gray-500 dark:text-gray-400">No connections yet. This is a placeholder page.</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 