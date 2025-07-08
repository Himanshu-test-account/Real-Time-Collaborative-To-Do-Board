import React from "react";

const UserAvatar = ({ user }) => {
  if (!user) return (
    <div className="w-8 h-8 rounded-full bg-secondary-300 flex items-center justify-center text-white text-sm font-semibold">
      ?
    </div>
  );
  
  const initials = user.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : user.email[0].toUpperCase();
    
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-semibold shadow-md">
      {initials}
    </div>
  );
};

export default UserAvatar; 