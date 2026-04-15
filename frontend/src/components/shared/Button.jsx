const variants = {
  primary: "bg-accent text-white hover:opacity-90",
  secondary: "bg-secondary text-accent hover:opacity-90",
  danger: "bg-danger text-white hover:opacity-90",
  outline: "border border-accent text-accent hover:bg-accent hover:text-white",
};

const Button = ({ children, variant = "primary", onClick, type = "button", disabled = false, className = "" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;