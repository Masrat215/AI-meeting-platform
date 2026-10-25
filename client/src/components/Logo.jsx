   function Logo({ size = 36, showText = true }) {
     return (
       <span className="logo">
         <svg
           width={size}
           height={size}
           viewBox="0 0 64 64"
           fill="none"
           xmlns="http://www.w3.org/2000/svg"
           aria-hidden="true"
         >
           <defs>
             <linearGradient
               id="scribwave-bg"
               x1="8"
               y1="4"
               x2="56"
               y2="60"
               gradientUnits="userSpaceOnUse"
             >
               <stop offset="0" stopColor="#1D4ED8" />
               <stop offset="1" stopColor="#0B1F4B" />
             </linearGradient>
           </defs>
           <rect width="64" height="64" rx="16" fill="url(#scribwave-bg)" />
           <rect x="11" y="27" width="4.5" height="10" rx="2.25" fill="#FFFFFF" />
           <rect x="18.5" y="21" width="4.5" height="22" rx="2.25" fill="#FFFFFF" />
           <rect x="26" y="15" width="4.5" height="34" rx="2.25" fill="#FFFFFF" />
           <rect x="33.5" y="22" width="4.5" height="20" rx="2.25" fill="#FFFFFF" />
           <rect x="42" y="23" width="12" height="4.5" rx="2.25" fill="#22D3EE" />
           <rect x="42" y="30" width="12" height="4.5" rx="2.25" fill="#22D3EE" />
           <rect x="42" y="37" width="7" height="4.5" rx="2.25" fill="#22D3EE" />
         </svg>

         {showText && (
           <span className="logo-text">
             Scrib<span className="logo-wave">Wave</span>
           </span>
         )}
       </span>
     );
   }

   export default Logo;