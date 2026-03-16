import { Stethoscope, Heart } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#F8F9FA' }}
    >
      {/* Background Pattern */}
      <div
        className="fixed inset-0 z-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231B4F72' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Medical Cross Decorations */}
      <div className="fixed top-10 left-10 z-0 opacity-10">
        <Stethoscope size={80} style={{ color: '#1B4F72' }} />
      </div>
      <div className="fixed bottom-10 right-10 z-0 opacity-10">
        <Heart size={80} style={{ color: '#148F77' }} />
      </div>
      <div className="fixed top-1/4 right-20 z-0 opacity-5">
        <Stethoscope size={120} style={{ color: '#148F77' }} />
      </div>
      <div className="fixed bottom-1/4 left-20 z-0 opacity-5">
        <Heart size={120} style={{ color: '#1B4F72' }} />
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg"
            style={{ backgroundColor: '#1B4F72' }}
          >
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1
            className="text-3xl font-bold"
            style={{ color: '#1B4F72' }}
          >
            Shifa-Connect
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Gestion de cabinet medical
          </p>
        </div>

        {/* Card Container */}
        <div
          className="rounded-xl shadow-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
        >
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-400">
          <p>Shifa-Connect &copy; {new Date().getFullYear()}</p>
          <p className="mt-1">Tous droits reserves</p>
        </div>
      </div>
    </div>
  );
}
