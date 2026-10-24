   import { Routes, Route, Link, NavLink } from "react-router";
   import Dashboard from "./pages/Dashboard";
   import Upload from "./pages/Upload";
   import MeetingDetail from "./pages/MeetingDetail";

   function App() {
     return (
       <>
         <header className="navbar">
           <Link to="/" className="brand">
             AI Meeting Intelligence
           </Link>
           <nav>
             <NavLink to="/" end>
               Dashboard
             </NavLink>
             <NavLink to="/upload">Upload</NavLink>
           </nav>
         </header>

         <main className="container">
           <Routes>
             <Route path="/" element={<Dashboard />} />
             <Route path="/upload" element={<Upload />} />
             <Route path="/meetings/:id" element={<MeetingDetail />} />
           </Routes>
         </main>
       </>
     );
   }

   export default App;