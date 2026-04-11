import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col lg:flex-row min-h-screen">
            <AdminSidebar />
            <div className="flex-grow p-6 lg:p-10 overflow-x-hidden">
                {children}
            </div>
        </div>
    )
}
