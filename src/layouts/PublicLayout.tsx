import React from 'react';
import Footer from './Footer';

interface PublicLayoutProps {
  children?: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* You can add a public header/navbar here if you have one */}
      {/* <PublicHeader /> */}

      <main className="flex-grow">
        {/* This is correct. 'children' will be the <Outlet /> from App.tsx */}
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default PublicLayout;