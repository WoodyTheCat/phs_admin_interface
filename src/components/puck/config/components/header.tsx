const NavItem = ({ label, href }: { label: string; href: string }) => {
  const navPath = window.location.pathname.replace("/edit", "") || "/";

  const isActive = navPath === (href.replace("/edit", "") || "/");

  const El = href ? "a" : "span";

  return (
    <El
      href={href || "/"}
      style={{
        textDecoration: "none",
        color: isActive
          ? "var(--puck-color-grey-02)"
          : "var(--puck-color-grey-06)",
        fontWeight: isActive ? "600" : "400",
      }}
    >
      {label}
    </El>
  );
};

const Header = ({ editMode }: { editMode: boolean }) => (
  <header className="items-center flex mx-auto max-w-7xl py-6 px-4 md:p-6">
    <div className="font-semibold opacity-80">LOGO</div>
    <nav className="flex gap-6 ml-auto lg:gap-8">
      <NavItem label="Home" href={`${editMode ? "" : "/"}`} />
      <NavItem label="Pricing" href={editMode ? "" : "/pricing"} />
      <NavItem label="About" href={editMode ? "" : "/about"} />
    </nav>
  </header>
);

export { Header };
