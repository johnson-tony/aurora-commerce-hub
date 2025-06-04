import React from 'react';
// No need to import Outlet here, as it will be passed as children from App.tsx
import Footer from './Footer'; // Import the Footer component

// Define the props interface for PublicLayout
// This tells TypeScript that PublicLayout can accept a 'children' prop
interface PublicLayoutProps {
  children?: React.ReactNode; // 'children' can be any valid React node (elements, strings, numbers, etc.)
}

// Use React.FC (Functional Component) and destructure 'children' from props
const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* You can add a public header/navbar here if you have one */}
      {/* <PublicHeader /> */}

      <main className="flex-grow">
        {/* Render the children passed to PublicLayout.
            In App.tsx, this 'children' will be the <Outlet /> component,
            which then renders the specific matched page component. */}
        {children}
      </main>

      {/* The Footer will appear on all pages using this layout */}
      <Footer />
    </div>
  );
};

export default PublicLayout;
