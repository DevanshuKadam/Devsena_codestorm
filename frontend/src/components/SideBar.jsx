import { Link, useLocation } from "react-router-dom";

export default function SideBar() {
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Schedule", path: "/schedule" },
    { name: "Payroll", path: "/payroll" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <div className="h-screen w-60 bg-twine-700 text-white flex flex-col p-4">
      <h2 className="text-2xl font-bold mb-8">Employee Portal</h2>
      <nav className="flex flex-col gap-4">
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`p-2 rounded-lg transition-colors ${
              location.pathname === link.path
                ? "bg-twine-500"
                : "hover:bg-twine-600"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
