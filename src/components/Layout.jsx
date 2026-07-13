import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="w-full max-w-[1200px] mx-auto p-2 sm:p-3 md:p-4 lg:p-8">
        <Outlet />
      </main>
    </>
  );
}
