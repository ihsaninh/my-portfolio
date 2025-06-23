export default function Footer() {
  return (
    <div className="container mt-12 lg:mt-24 mb-8 flex gap-4 flex-col">
      <div className="border border-white/20"></div>
      <p className="text-white text-center text-sm lg:text-base">
        Copyright &copy; {new Date().getFullYear()} Ihsan Nurul Habib
      </p>
    </div>
  );
}

