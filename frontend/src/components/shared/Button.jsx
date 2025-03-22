// src/components/shared/Button.jsx
const Button = ({ children, className = '', ...props }) => {
    return (
      <button
        className={`transition duration-300 ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  };
  
  export default Button;