export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 dark:focus:ring-slate-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    ghost: 'bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500 dark:text-blue-300 dark:hover:bg-blue-600/20 dark:focus:ring-blue-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-none p-6 border border-transparent dark:border-slate-700 ${className}`} {...props}>
    {children}
  </div>
);

export const Badge = ({ children, variant = 'gray', className = '' }) => {
  const variants = {
    gray: 'bg-gray-100 text-gray-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Input = ({
  label,
  error,
  required = false,
  className = '',
  ...props
}) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'} ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

export const Select = ({
  label,
  error,
  required = false,
  options = [],
  className = '',
  ...props
}) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'} ${className}`}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

export const Textarea = ({
  label,
  error,
  required = false,
  className = '',
  ...props
}) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <textarea
      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'} ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

export const Modal = ({
  open = false,
  onClose,
  title,
  children,
  footer,
  className = '',
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <Card className={`relative w-full max-w-md ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-slate-300 hover:text-gray-700 dark:hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="mb-6">{children}</div>
        {footer && <div className="flex gap-2 justify-end">{footer}</div>}
      </Card>
    </div>
  );
};

export const Alert = ({ variant = 'info', title, message, className = '' }) => {
  const variants = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className={`border-l-4 p-4 rounded ${variants[variant]} ${className}`}>
      {title && <h4 className="font-bold mb-1">{title}</h4>}
      <p>{message}</p>
    </div>
  );
};
