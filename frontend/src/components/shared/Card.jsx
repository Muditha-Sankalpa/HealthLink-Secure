const Card = ({ children, className = "", style = {} }) => {
  return (
    <div
      className={`bg-surface rounded-xl border border-secondary p-6 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};
export default Card;