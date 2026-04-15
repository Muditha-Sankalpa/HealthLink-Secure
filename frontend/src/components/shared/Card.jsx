const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-surface rounded-xl border border-secondary p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;