const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-200 text-danger text-sm rounded-lg px-4 py-3">
      {message}
    </div>
  );
};

export default ErrorMessage;